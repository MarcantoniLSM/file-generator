import { DocumentKind, documentDefinitions } from "./document-types";
import { buildGeneratePrompt, buildReviewPrompt } from "./document-prompts";
import { formatChecklistMarkdown } from "./document-checklists";
import { generateLocalDraft, reviewLocalText } from "./local-generator";

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
      source: "local";
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
      source: "local",
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
        source: "local",
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
        source: "local",
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
      source: "local",
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

  return {
    text: generated.text || generateLocalDraft(input),
    source: generated.source,
    debug: generated.debug
  };
}

export async function reviewDraft(input: ReviewInput) {
  const definition = documentDefinitions[input.kind];
  const prompt = buildReviewPrompt(input);
  const generated = await callOpenAI(prompt);

  if (generated.text) {
    return {
      text: [generated.text, "", "---", "", formatChecklistMarkdown(input.kind, input.text)].join("\n"),
      source: "openai",
      debug: generated.debug
    };
  }

  const review = reviewLocalText(input.kind, input.text);
  const text = [
    `# Revisao - ${definition.shortName}`,
    "",
    ...review.findings.flatMap((finding) => [
      `## [${finding.status}] ${finding.title}`,
      finding.detail,
      ""
    ]),
    "## Sugestoes",
    ...review.suggestions.map((suggestion) => `- ${suggestion}`),
    "",
    "_Revisao automatica preliminar. Validacao humana obrigatoria._"
  ].join("\n");

  return { text, source: "local", debug: generated.debug };
}

export async function checkAIStatus() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = getOpenAIModel();

  if (!apiKey) {
    return {
      ok: false,
      provider: "openai",
      model,
      keyConfigured: false,
      reason: "OPENAI_API_KEY nao esta disponivel no ambiente do servidor."
    };
  }

  const result = await callOpenAI("Responda apenas: OK");

  return {
    ok: result.source === "openai",
    provider: "openai",
    model,
    keyConfigured: true,
    responseId: result.source === "openai" ? result.debug.responseId : undefined,
    reason: result.source === "openai" ? "Chamada concluida com sucesso." : result.debug.reason,
    status: result.source === "local" ? result.debug.status : undefined,
    errorCode: result.source === "local" ? result.debug.errorCode : undefined,
    errorMessage: result.source === "local" ? result.debug.errorMessage : undefined
  };
}
