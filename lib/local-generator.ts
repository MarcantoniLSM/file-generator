import { DocumentKind, documentDefinitions } from "./document-types";
import { runDocumentChecklist } from "./document-checklists";

type GenerateInput = {
  kind: DocumentKind;
  values: Record<string, string>;
  institution?: Record<string, string>;
};

const getValue = (values: Record<string, string> | undefined, key: string, fallback = "Nao informado") => {
  const value = values?.[key]?.trim();
  return value ? value : fallback;
};

function header(institution?: Record<string, string>) {
  const lines = [
    getValue(institution, "prefeitura", ""),
    getValue(institution, "secretaria", ""),
    getValue(institution, "municipioUf", ""),
    getValue(institution, "cnpj", "")
  ].filter(Boolean);

  return lines.length ? ["**" + lines.join("**\n**") + "**", ""].join("\n") : "";
}

export function generateLocalDraft({ kind, values, institution }: GenerateInput) {
  const definition = documentDefinitions[kind];

  return [
    header(institution),
    `# ${definition.name}`,
    "",
    "## 1. Identificacao",
    `Orgao/setor: ${getValue(values, "orgao", getValue(institution, "secretaria"))}`,
    `Objeto/assunto: ${getValue(values, "objeto", getValue(values, "assunto", getValue(values, "pedido")))}`,
    "",
    "## 2. Contextualizacao",
    getValue(values, "problema", getValue(values, "conteudo", getValue(values, "justificativa"))),
    "",
    "## 3. Desenvolvimento",
    `A presente minuta registra demanda de interesse da Administracao Municipal relacionada a ${getValue(
      values,
      "objeto",
      "materia informada"
    )}. Os elementos apresentados deverao ser conferidos pela area competente, especialmente quanto a quantidades, prazos, valores, disponibilidade orcamentaria e adequacao tecnica.`,
    "",
    "## 4. Dados preliminares",
    `Quantidade/dimensao: ${getValue(values, "quantidade")}`,
    `Prazo: ${getValue(values, "prazo")}`,
    `Valor estimado: ${getValue(values, "valor")}`,
    "",
    "## 5. Pendencias para revisao",
    "- Complementar informacoes tecnicas especificas, quando aplicavel.",
    "- Confirmar disponibilidade orcamentaria e responsaveis pela validacao.",
    "- Revisar a minuta pela area demandante e pela assessoria competente.",
    "",
    "## 6. Encaminhamento",
    "Encaminhe-se a presente minuta para analise, complementacao e providencias cabiveis no ambito da Prefeitura.",
    "",
    "_Minuta preliminar gerada para revisao do agente publico responsavel._"
  ].join("\n");
}

export function reviewLocalText(kind: DocumentKind, text: string) {
  const checklist = runDocumentChecklist(kind, text);

  const suggestions = [
    `Status geral do checklist: ${checklist.status}.`,
    "Priorizar os itens marcados como PENDENTE antes de usar a minuta oficialmente.",
    "Revisar itens ATENCAO para evitar conclusoes indevidas ou dados sensiveis sem comprovacao.",
    "Complementar dados tecnicos, orcamentarios, juridicos ou legislativos conforme a natureza do documento.",
    "Manter revisao humana obrigatoria pela area competente."
  ];

  return { findings: checklist.findings, suggestions };
}
