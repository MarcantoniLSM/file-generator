import { DocumentKind } from "./document-types";
import { buildGeneratePrompt, buildReviewPrompt } from "./document-prompts";
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
          reason: "A resposta da OpenAI nao trouxe output_text utilizavel.",
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

export async function generateDraft(input: GenerateInput) {
  const prompt = buildGeneratePrompt(input);
  const generated = await callOpenAI(prompt);

  if (!generated.text) {
    return {
      text: null,
      source: "unavailable",
      error: "A IA esta indisponivel no momento. Tente novamente mais tarde.",
      debug: generated.debug
    };
  }

  return {
    text: generated.text,
    source: "openai",
    debug: generated.debug
  };
}

export async function assessReadiness(input: ReadinessInput) {
  const local = assessLocalReadiness(input);
  const generated = await callOpenAI(buildReadinessPrompt(input));

  if (!generated.text) {
    return {
      status: "insuficiente" as const,
      risco: "alto" as const,
      resumo: "A IA esta indisponivel no momento. Tente novamente mais tarde.",
      perguntas: [],
      alertas: ["Nao foi possivel validar as informacoes porque a IA nao respondeu."],
      source: "unavailable" as const,
      error: "A IA esta indisponivel no momento. Tente novamente mais tarde.",
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
    error: "A IA esta indisponivel no momento. Tente novamente mais tarde.",
    debug: generated.debug
  };
}
