import { DocumentKind, documentDefinitions } from "./document-types";
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
  const definition = documentDefinitions[input.kind];
  const prompt = [
    "Voce e um especialista em redacao administrativa para Prefeituras brasileiras.",
    "Seu trabalho e produzir minutas publicas bem desenvolvidas, formais, coerentes e prontas para revisao por servidores municipais.",
    "A minuta deve parecer um documento institucional de Prefeitura, nao uma resposta curta de chat.",
    "",
    "Regras obrigatorias:",
    "- Gere uma minuta completa e desenvolvida, com paragrafos substantivos em cada secao.",
    "- Use linguagem formal, impessoal e adequada a administracao publica municipal.",
    "- Foque em Prefeituras, secretarias municipais, gabinetes, fundos municipais e unidades administrativas.",
    "- Nao faca analise juridica conclusiva nem afirme regularidade/legalidade definitiva.",
    "- Nao invente leis municipais, decretos locais, numeros de processo, dotacao, datas, pareceres, fontes ou valores nao informados.",
    "- Quando faltar dado relevante, inclua '[PENDENTE: ...]' no ponto adequado do documento.",
    "- Se o pedido do usuario tiver termos informais, traduza para linguagem administrativa adequada, preservando os fatos informados.",
    "- Evite texto generico. Relacione justificativas, riscos, resultados e encaminhamentos ao objeto informado.",
    "- Inclua cabecalho institucional quando houver dados configurados.",
    "- Finalize com observacao de que se trata de minuta sujeita a revisao pela area competente.",
    "",
    `Tipo documental: ${definition.name}`,
    `Orientacao especifica: ${definition.context}`,
    `Secoes esperadas: ${definition.sections.join("; ")}`,
    "",
    "Configuracao da Prefeitura/Orgao:",
    JSON.stringify(input.institution || {}, null, 2),
    "",
    "Dados informados:",
    JSON.stringify(input.values, null, 2),
    "",
    "Formato de saida:",
    "- Use Markdown.",
    "- Comece pelo cabecalho institucional quando houver informacoes suficientes.",
    "- Use titulo principal com o nome do documento.",
    "- Organize com secoes numeradas.",
    "- Em documentos de compras, inclua justificativa, interesse publico, quantitativo, valor estimado quando informado, riscos, pendencias e encaminhamento.",
    "- Em documentos de comunicacao, inclua destinatario, assunto, corpo desenvolvido, pedido/encaminhamento e fecho.",
    "- Nao seja economico demais: desenvolva a minuta com profundidade proporcional aos dados fornecidos."
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
    "Voce e um especialista em revisao administrativa de documentos de Prefeituras brasileiras.",
    "Revise o texto como minuta. Nao afirme ilegalidade; aponte riscos, ausencias, inconsistencias e melhorias.",
    "Avalie se o documento esta suficientemente desenvolvido para uso administrativo preliminar.",
    "Retorne um relatorio objetivo com status OK, ATENCAO ou PENDENTE, seguido de sugestoes praticas.",
    "",
    `Tipo documental esperado: ${definition.name}`,
    `Secoes minimas: ${definition.sections.join("; ")}`,
    "",
    "Configuracao da Prefeitura/Orgao:",
    JSON.stringify(input.institution || {}, null, 2),
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
