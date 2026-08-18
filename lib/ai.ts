import { DocumentKind, documentDefinitions } from "./document-types";
import { generateLocalDraft, reviewLocalText } from "./local-generator";

type GenerateInput = {
  kind: DocumentKind;
  values: Record<string, string>;
};

type ReviewInput = {
  kind: DocumentKind;
  text: string;
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

    const text = data?.output_text;

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
  const definition = documentDefinitions[input.kind];
  const prompt = [
    "Voce e um assistente de redacao administrativa para gestao publica brasileira.",
    "Gere uma minuta, nao uma analise juridica conclusiva.",
    "Nao invente fatos, valores, datas, normas locais ou informacoes que o usuario nao forneceu.",
    "Quando faltar informacao, sinalize de forma objetiva no proprio documento.",
    "",
    `Tipo documental: ${definition.name}`,
    `Secoes esperadas: ${definition.sections.join("; ")}`,
    "",
    "Dados informados:",
    JSON.stringify(input.values, null, 2),
    "",
    "Escreva em portugues do Brasil, com linguagem formal, clara e pronta para revisao humana."
  ].join("\n");

  const generated = await callOpenAI(prompt);

  return {
    text: generated.text || generateLocalDraft(input),
    source: generated.source,
    debug: generated.debug
  };
}

export async function reviewDraft(input: ReviewInput) {
  const definition = documentDefinitions[input.kind];
  const prompt = [
    "Voce e um assistente de revisao administrativa para documentos publicos.",
    "Revise o texto como minuta. Nao afirme ilegalidade; aponte riscos, ausencias e melhorias.",
    "Retorne uma lista objetiva com status OK, ATENCAO ou PENDENTE, seguida de sugestoes praticas.",
    "",
    `Tipo documental esperado: ${definition.name}`,
    `Secoes minimas: ${definition.sections.join("; ")}`,
    "",
    "Texto para revisar:",
    input.text
  ].join("\n");

  const generated = await callOpenAI(prompt);

  if (generated.text) {
    return {
      text: generated.text,
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
