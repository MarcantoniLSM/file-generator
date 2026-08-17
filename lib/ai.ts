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

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel gerar a resposta com IA.");
  }

  const data = await response.json();
  const text = data.output_text;

  return typeof text === "string" ? text : null;
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
    text: generated || generateLocalDraft(input),
    source: generated ? "openai" : "local"
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

  if (generated) {
    return {
      text: generated,
      source: "openai"
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

  return { text, source: "local" };
}
