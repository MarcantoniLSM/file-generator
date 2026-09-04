import { DocumentKind } from "./document-types";
import {
  buildCompliancePrompt,
  buildComplianceRevisionPrompt,
  buildGeneratePrompt,
  buildReviewPrompt,
  type ComplianceFinding
} from "./document-prompts";
import { formatChecklistMarkdown } from "./document-checklists";
import {
  assessLocalReadiness,
  buildReadinessPrompt,
  mergeReadiness,
  parseAIReadiness
} from "./document-readiness";

type GenerateInput = {
  kind: DocumentKind;
  values: Record<string, string>;
  institution?: Record<string, string>;
};

type ReviewInput = {
  kind: DocumentKind;
  text: string;
  institution?: Record<string, string>;
};

type ReadinessInput = GenerateInput;

export type ComplianceResult = {
  status: "conforme" | "conforme_com_ressalvas" | "nao_conforme";
  summary: string;
  findings: ComplianceFinding[];
  mustRegenerate: boolean;
  confidence: "baixa" | "media" | "alta";
  adjusted: boolean;
  debug?: {
    model: string;
    responseId?: string;
  };
};

type AIResult =
  | {
      text: string;
      source: "openai";
      debug: {
        model: string;
        responseId?: string;
      };
    }
  | {
      text: null;
      source: "unavailable";
      debug: {
        reason: string;
        model?: string;
        status?: number;
        errorCode?: string;
        errorMessage?: string;
      };
    };

function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

function extractOpenAIText(data: unknown) {
  if (!data || typeof data !== "object") return null;

  const responseData = data as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        text?: unknown;
      }>;
    }>;
  };

  const directText = responseData.output_text;
  if (typeof directText === "string" && directText.trim()) {
    return directText;
  }

  const output = responseData.output;
  if (!Array.isArray(output)) return null;

  const parts = output.flatMap((item) => {
    if (!Array.isArray(item.content)) {
      return [];
    }

    return item.content
      .map((content) => {
        return typeof content.text === "string" ? content.text : null;
      })
      .filter((text): text is string => Boolean(text?.trim()));
  });

  return parts.length ? parts.join("\n\n") : null;
}

async function callOpenAI(prompt: string): Promise<AIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = getOpenAIModel();

  if (!apiKey) {
    return {
      text: null,
      source: "unavailable",
      debug: {
        reason: "OPENAI_API_KEY ausente no ambiente do servidor.",
        model
      }
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt,
        temperature: 0.2
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        text: null,
        source: "unavailable",
        debug: {
          reason: "A OpenAI retornou erro HTTP.",
          model,
          status: response.status,
          errorCode: data?.error?.code,
          errorMessage: data?.error?.message || response.statusText
        }
      };
    }

    const text = extractOpenAIText(data);

    if (typeof text !== "string" || !text.trim()) {
      return {
        text: null,
        source: "unavailable",
        debug: {
          reason: "A resposta da OpenAI não trouxe output_text útilizavel.",
          model,
          errorMessage: data ? JSON.stringify(data).slice(0, 600) : "Resposta vazia ou invalida."
        }
      };
    }

    return {
      text,
      source: "openai",
      debug: {
        model,
        responseId: data?.id
      }
    };
  } catch (error) {
    return {
      text: null,
      source: "unavailable",
      debug: {
        reason: "Falha ao conectar com a OpenAI.",
        model,
        errorMessage: error instanceof Error ? error.message : "Erro desconhecido."
      }
    };
  }
}

function parseJsonBlock(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

function normalizeComplianceSeverity(value: unknown): ComplianceFinding["severity"] {
  return value === "baixa" || value === "alta" ? value : "media";
}

function normalizeComplianceStatus(value: unknown): ComplianceResult["status"] {
  if (value === "conforme" || value === "conforme_com_ressalvas" || value === "nao_conforme") {
    return value;
  }

  return "conforme_com_ressalvas";
}

function normalizeComplianceConfidence(value: unknown): ComplianceResult["confidence"] {
  return value === "baixa" || value === "alta" ? value : "media";
}

function parseCompliance(text: string): Omit<ComplianceResult, "adjusted" | "debug"> {
  try {
    const parsed = parseJsonBlock(text);
    const rawFindings = Array.isArray(parsed.findings) ? parsed.findings : [];
    const findings = rawFindings
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const finding = item as Record<string, unknown>;

        return {
          item: typeof finding.item === "string" && finding.item.trim() ? finding.item : "Item de conformidade",
          severity: normalizeComplianceSeverity(finding.severity),
          issue: typeof finding.issue === "string" && finding.issue.trim() ? finding.issue : "Ponto de atenção identificado.",
          recommendation:
            typeof finding.recommendation === "string" && finding.recommendation.trim()
              ? finding.recommendation
              : "Revisar antes do uso oficial."
        };
      })
      .filter((item): item is ComplianceFinding => Boolean(item));

    return {
      status: normalizeComplianceStatus(parsed.status),
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary
          : "Verificação preliminar concluída.",
      findings,
      mustRegenerate: Boolean(parsed.mustRegenerate),
      confidence: normalizeComplianceConfidence(parsed.confidence)
    };
  } catch {
    return {
      status: "conforme_com_ressalvas",
      summary: "A verificação preliminar não retornou JSON válido. A minuta deve ser revisada com atenção.",
      findings: [
        {
          item: "Retorno da verificação",
          severity: "media",
          issue: "A IA não devolveu a análise de conformidade no formato esperado.",
          recommendation: "Submeter a minuta à revisão humana antes de uso oficial."
        }
      ],
      mustRegenerate: false,
      confidence: "baixa"
    };
  }
}

async function verifyCompliance(input: GenerateInput & { text: string }): Promise<ComplianceResult | null> {
  const checked = await callOpenAI(buildCompliancePrompt(input));

  if (!checked.text) {
    return null;
  }

  return {
    ...parseCompliance(checked.text),
    adjusted: false,
    debug: checked.debug
  };
}

export async function generateDraft(input: GenerateInput) {
  const prompt = buildGeneratePrompt(input);
  const generated = await callOpenAI(prompt);

  if (!generated.text) {
    return {
      text: null,
      source: "unavailable",
      error: "A IA está indisponível no momento. Tente novamente mais tarde.",
      debug: generated.debug
    };
  }

  let text = generated.text;
  let compliance = await verifyCompliance({ ...input, text });

  if (compliance?.mustRegenerate && compliance.findings.some((finding) => finding.severity === "alta")) {
    const revised = await callOpenAI(
      buildComplianceRevisionPrompt({
        ...input,
        text,
        findings: compliance.findings
      })
    );

    if (revised.text) {
      text = revised.text;
      const secondCheck = await verifyCompliance({ ...input, text });
      compliance = secondCheck
        ? {
            ...secondCheck,
            adjusted: true
          }
        : {
            ...compliance,
            adjusted: true,
            summary:
              "A minuta foi ajustada automaticamente, mas a segunda verificação não foi concluída. Revise antes do uso oficial."
          };
    }
  }

  return {
    text,
    source: "openai",
    debug: generated.debug,
    compliance
  };
}

export async function assessReadiness(input: ReadinessInput) {
  const local = assessLocalReadiness(input);
  const generated = await callOpenAI(buildReadinessPrompt(input));

  if (!generated.text) {
    return {
      status: "insuficiente" as const,
      risco: "alto" as const,
      resumo: "A IA está indisponível no momento. Tente novamente mais tarde.",
      perguntas: [],
      alertas: ["Não foi possível validar as informações porque a IA não respondeu."],
      source: "unavailable" as const,
      error: "A IA está indisponível no momento. Tente novamente mais tarde.",
      debug: generated.debug
    };
  }

  return {
    ...mergeReadiness(local, parseAIReadiness(generated.text)),
    debug: generated.debug
  };
}

export async function reviewDraft(input: ReviewInput) {
  const prompt = buildReviewPrompt(input);
  const generated = await callOpenAI(prompt);

  if (generated.text) {
    return {
      text: [generated.text, "", "---", "", formatChecklistMarkdown(input.kind, input.text)].join("\n"),
      source: "openai",
      debug: generated.debug
    };
  }

  return {
    text: null,
    source: "unavailable",
    error: "A IA está indisponível no momento. Tente novamente mais tarde.",
    debug: generated.debug
  };
}
