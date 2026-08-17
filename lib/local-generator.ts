import { DocumentKind, documentDefinitions } from "./document-types";

type GenerateInput = {
  kind: DocumentKind;
  values: Record<string, string>;
};

const getValue = (values: Record<string, string>, key: string, fallback = "Nao informado") => {
  const value = values[key]?.trim();
  return value ? value : fallback;
};

export function generateLocalDraft({ kind, values }: GenerateInput) {
  if (kind === "dfd") {
    return [
      "# Documento de Formalizacao da Demanda",
      "",
      "## 1. Identificacao da demanda",
      `Orgao/setor solicitante: ${getValue(values, "orgao")}`,
      `Objeto: ${getValue(values, "objeto")}`,
      "",
      "## 2. Justificativa da necessidade",
      getValue(values, "problema"),
      "",
      "## 3. Publico beneficiado e resultados esperados",
      `A demanda beneficiara: ${getValue(values, "beneficiarios")}. Espera-se apoiar a continuidade, melhoria ou ampliacao dos servicos publicos relacionados ao objeto informado.`,
      "",
      "## 4. Estimativa preliminar",
      `Quantidade estimada: ${getValue(values, "quantidade")}.`,
      `Prazo desejado: ${getValue(values, "prazo")}.`,
      "",
      "## 5. Informacoes complementares",
      getValue(values, "observacoes", "Nao foram registradas informacoes complementares nesta etapa."),
      "",
      "## 6. Encaminhamento",
      "Diante da necessidade apresentada, recomenda-se o encaminhamento da demanda para avaliacao da area competente e, se cabivel, elaboracao dos estudos tecnicos e demais artefatos preparatorios.",
      "",
      "_Minuta gerada para revisao do agente publico responsavel._"
    ].join("\n");
  }

  return [
    "# Estudo Tecnico Preliminar",
    "",
    "## 1. Descricao da necessidade",
    `Orgao/setor responsavel: ${getValue(values, "orgao")}`,
    "",
    getValue(values, "necessidade"),
    "",
    "## 2. Requisitos da contratacao",
    getValue(values, "requisitos", "Os requisitos deverao ser detalhados pela area demandante antes da formalizacao definitiva da contratacao."),
    "",
    "## 3. Levantamento de alternativas",
    getValue(values, "alternativas", "Nao foram registradas alternativas nesta versao inicial. Recomenda-se complementar o estudo com pesquisa de solucoes disponiveis."),
    "",
    "## 4. Descricao da solucao proposta",
    getValue(values, "solucao", "A solucao proposta devera ser consolidada apos a avaliacao das alternativas e da viabilidade administrativa."),
    "",
    "## 5. Estimativa de quantidades",
    getValue(values, "quantidade"),
    "",
    "## 6. Resultados pretendidos",
    getValue(values, "resultados", "Espera-se atender a necessidade administrativa descrita, com ganhos de eficiencia, continuidade e qualidade na prestacao do servico publico."),
    "",
    "## 7. Riscos e providencias",
    getValue(values, "riscos", "Nao foram identificados riscos especificos nesta etapa. Recomenda-se revisao pela area tecnica."),
    "",
    "## 8. Conclusao",
    "Com base nas informacoes apresentadas, a contratacao mostra-se potencialmente pertinente, condicionada a revisao tecnica, validacao juridica quando aplicavel e complementacao dos dados ausentes.",
    "",
    "_Minuta gerada para revisao do agente publico responsavel._"
  ].join("\n");
}

export function reviewLocalText(kind: DocumentKind, text: string) {
  const definition = documentDefinitions[kind];
  const normalized = text.toLowerCase();
  const findings = definition.sections.map((section) => {
    const keyWords = section
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 3);
    const found = keyWords.some((word) => normalized.includes(word));

    return {
      status: found ? "OK" : "PENDENTE",
      title: section,
      detail: found
        ? "Foi identificado conteudo relacionado a esta secao."
        : "Nao foi identificado conteudo claro para esta secao do template minimo."
    };
  });

  const suggestions = [
    "Confirmar se todos os fatos administrativos foram informados pelo setor responsavel.",
    "Evitar conclusoes juridicas definitivas na minuta gerada por IA.",
    "Registrar justificativas objetivas para quantidades, prazos e escolha da solucao."
  ];

  return { findings, suggestions };
}
