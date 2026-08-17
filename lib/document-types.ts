export type DocumentKind = "dfd" | "etp";

export type FormField = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
  required?: boolean;
};

export type DocumentDefinition = {
  kind: DocumentKind;
  shortName: string;
  name: string;
  description: string;
  fields: FormField[];
  sections: string[];
};

export const documentDefinitions: Record<DocumentKind, DocumentDefinition> = {
  dfd: {
    kind: "dfd",
    shortName: "DFD",
    name: "Documento de Formalizacao da Demanda",
    description: "Minuta inicial para registrar a necessidade administrativa antes do planejamento da contratacao.",
    fields: [
      {
        key: "orgao",
        label: "Orgao ou setor solicitante",
        placeholder: "Secretaria Municipal de Administracao",
        required: true
      },
      {
        key: "objeto",
        label: "Objeto da demanda",
        placeholder: "Aquisicao de notebooks para unidades administrativas",
        required: true
      },
      {
        key: "problema",
        label: "Problema a resolver",
        placeholder: "Descreva a necessidade concreta que motivou a demanda.",
        type: "textarea",
        required: true
      },
      {
        key: "beneficiarios",
        label: "Publico beneficiado",
        placeholder: "Servidores, unidades, cidadaos ou servicos impactados."
      },
      {
        key: "quantidade",
        label: "Quantidade estimada",
        placeholder: "Ex.: 30 notebooks"
      },
      {
        key: "prazo",
        label: "Prazo desejado",
        placeholder: "Ex.: contratacao em ate 90 dias"
      },
      {
        key: "observacoes",
        label: "Informacoes complementares",
        placeholder: "Restricoes, contratos anteriores, dotacao ou dados relevantes.",
        type: "textarea"
      }
    ],
    sections: [
      "Identificacao da demanda",
      "Justificativa da necessidade",
      "Resultados esperados",
      "Estimativa preliminar",
      "Encaminhamento"
    ]
  },
  etp: {
    kind: "etp",
    shortName: "ETP",
    name: "Estudo Tecnico Preliminar",
    description: "Minuta estruturada para demonstrar a necessidade, alternativas e solucao proposta.",
    fields: [
      {
        key: "orgao",
        label: "Orgao ou setor responsavel",
        placeholder: "Secretaria Municipal de Saude",
        required: true
      },
      {
        key: "necessidade",
        label: "Necessidade da contratacao",
        placeholder: "Explique a situacao que precisa ser atendida.",
        type: "textarea",
        required: true
      },
      {
        key: "requisitos",
        label: "Requisitos essenciais",
        placeholder: "Caracteristicas minimas, qualidade esperada, prazos, condicoes.",
        type: "textarea"
      },
      {
        key: "alternativas",
        label: "Solucoes consideradas",
        placeholder: "Liste alternativas avaliadas ou informe que ainda serao pesquisadas.",
        type: "textarea"
      },
      {
        key: "solucao",
        label: "Solucao proposta",
        placeholder: "Descreva a alternativa recomendada.",
        type: "textarea"
      },
      {
        key: "quantidade",
        label: "Estimativa de quantidades",
        placeholder: "Ex.: 12 meses de servico, 40 licencas, 2 veiculos"
      },
      {
        key: "resultados",
        label: "Resultados pretendidos",
        placeholder: "Melhoria operacional, atendimento ao cidadao, continuidade do servico.",
        type: "textarea"
      },
      {
        key: "riscos",
        label: "Riscos ou restricoes",
        placeholder: "Dependencias, prazos criticos, limitacoes tecnicas ou administrativas.",
        type: "textarea"
      }
    ],
    sections: [
      "Descricao da necessidade",
      "Requisitos da contratacao",
      "Levantamento de alternativas",
      "Descricao da solucao proposta",
      "Estimativa de quantidades",
      "Resultados pretendidos",
      "Riscos e providencias",
      "Conclusao"
    ]
  }
};

export const documentKinds = Object.keys(documentDefinitions) as DocumentKind[];
