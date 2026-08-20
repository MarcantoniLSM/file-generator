export type DocumentKind = "dfd" | "etp" | "tr" | "projeto_basico" | "dispensa" | "oficio" | "requerimento";

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
  context: string;
  fields: FormField[];
  sections: string[];
};

const commonPurchaseFields: FormField[] = [
  {
    key: "orgao",
    label: "Orgao ou setor demandante",
    placeholder: "Secretaria Municipal de Administracao",
    required: true
  },
  {
    key: "objeto",
    label: "Objeto",
    placeholder: "Aquisicao de mobiliario ergonomico para unidades administrativas",
    required: true
  },
  {
    key: "problema",
    label: "Necessidade publica ou problema administrativo",
    placeholder: "Descreva a situacao concreta, impactos no servico publico e motivo da demanda.",
    type: "textarea",
    required: true
  },
  {
    key: "beneficiarios",
    label: "Publico ou unidades beneficiadas",
    placeholder: "Servidores, secretarias, escolas, unidades de saude, cidadaos atendidos."
  },
  {
    key: "quantidade",
    label: "Quantidade ou dimensao estimada",
    placeholder: "Ex.: 60 cadeiras, 12 meses de servico, 8 unidades escolares."
  },
  {
    key: "prazo",
    label: "Prazo ou periodo esperado",
    placeholder: "Ex.: entrega em ate 60 dias; execucao por 12 meses."
  },
  {
    key: "valor",
    label: "Valor estimado ou limite",
    placeholder: "Ex.: ate R$ 1.000,00 por unidade; estimativa total de R$ 60.000,00."
  },
  {
    key: "justificativa_quantidade",
    label: "Justificativa da quantidade",
    placeholder: "Explique como a quantidade foi estimada.",
    type: "textarea"
  },
  {
    key: "observacoes",
    label: "Informacoes complementares",
    placeholder: "Contratos anteriores, restricoes, dotacao, padroes tecnicos, documentos relacionados.",
    type: "textarea"
  }
];

export const documentDefinitions: Record<DocumentKind, DocumentDefinition> = {
  dfd: {
    kind: "dfd",
    shortName: "DFD",
    name: "Documento de Formalizacao da Demanda",
    description: "Registra a necessidade administrativa que inicia o planejamento da contratacao municipal.",
    context:
      "Use linguagem de planejamento da contratacao publica municipal. O documento deve justificar a necessidade, caracterizar o interesse publico e encaminhar para a area competente.",
    fields: commonPurchaseFields,
    sections: [
      "Cabecalho institucional",
      "Identificacao da area demandante",
      "Descricao da necessidade",
      "Objeto pretendido",
      "Justificativa do interesse publico",
      "Publico beneficiado e resultados esperados",
      "Estimativa preliminar de quantidade e valor",
      "Justificativa da quantidade",
      "Vinculacao ao planejamento municipal, quando informada",
      "Informacoes complementares",
      "Encaminhamento"
    ]
  },
  etp: {
    kind: "etp",
    shortName: "ETP",
    name: "Estudo Tecnico Preliminar",
    description: "Estrutura a necessidade, alternativas, viabilidade e solucao mais adequada para a Prefeitura.",
    context:
      "Elabore um ETP municipal robusto, com raciocinio administrativo, alternativas, riscos, resultados pretendidos e conclusao condicionada aos dados informados.",
    fields: [
      ...commonPurchaseFields,
      {
        key: "requisitos",
        label: "Requisitos essenciais",
        placeholder: "Caracteristicas minimas, qualidade esperada, prazos, condicoes de entrega ou execucao.",
        type: "textarea"
      },
      {
        key: "alternativas",
        label: "Solucoes consideradas",
        placeholder: "Liste alternativas avaliadas, inclusive manter a situacao atual, contratar, aderir a ata, locar etc.",
        type: "textarea"
      },
      {
        key: "solucao",
        label: "Solucao proposta",
        placeholder: "Descreva a alternativa recomendada e por que ela atende melhor a necessidade.",
        type: "textarea"
      },
      {
        key: "riscos",
        label: "Riscos ou restricoes",
        placeholder: "Dependencias, prazos criticos, limitacoes tecnicas, riscos de descontinuidade.",
        type: "textarea"
      }
    ],
    sections: [
      "Cabecalho institucional",
      "Descricao da necessidade",
      "Area requisitante",
      "Requisitos da contratacao",
      "Levantamento de mercado e alternativas",
      "Descricao da solucao como um todo",
      "Estimativa de quantidades",
      "Estimativa preliminar de valor",
      "Justificativa para parcelamento ou nao da solucao",
      "Resultados pretendidos",
      "Providencias previas",
      "Contratacoes correlatas ou interdependentes",
      "Riscos relevantes",
      "Conclusao sobre a viabilidade"
    ]
  },
  tr: {
    kind: "tr",
    shortName: "TR",
    name: "Termo de Referencia",
    description: "Define objeto, requisitos, execucao, gestao e condicoes para a futura contratacao.",
    context:
      "Elabore um Termo de Referencia municipal detalhado, pronto para revisao tecnica, com clausulas operacionais claras.",
    fields: [
      ...commonPurchaseFields,
      {
        key: "especificacoes",
        label: "Especificacoes tecnicas",
        placeholder: "Caracteristicas, desempenho minimo, garantia, materiais, padroes de qualidade.",
        type: "textarea"
      },
      {
        key: "execucao",
        label: "Forma de entrega ou execucao",
        placeholder: "Local, prazo, etapas, recebimento, instalacao, treinamento, cronograma.",
        type: "textarea"
      },
      {
        key: "gestao",
        label: "Fiscalizacao e gestao contratual",
        placeholder: "Setor fiscal, criterios de recebimento, medicao, responsabilidades.",
        type: "textarea"
      }
    ],
    sections: [
      "Cabecalho institucional",
      "Objeto",
      "Justificativa da contratacao",
      "Especificacoes e requisitos tecnicos",
      "Quantidade e memoria de calculo",
      "Prazo, local e condicoes de entrega ou execucao",
      "Criterios de aceitacao e recebimento",
      "Obrigacoes da contratada",
      "Obrigacoes da contratante",
      "Gestao e fiscalizacao",
      "Estimativa de valor",
      "Condicoes de pagamento",
      "Sancoes e disposicoes gerais"
    ]
  },
  projeto_basico: {
    kind: "projeto_basico",
    shortName: "PB",
    name: "Projeto Basico",
    description: "Minuta para obras, servicos de engenharia ou solucoes que exigem detalhamento tecnico inicial.",
    context:
      "Elabore Projeto Basico municipal com foco em necessidade, solucao tecnica, escopo, criterios de medicao e responsabilidades.",
    fields: commonPurchaseFields,
    sections: [
      "Cabecalho institucional",
      "Objeto",
      "Justificativa",
      "Caracterizacao da area ou servico",
      "Escopo da solucao",
      "Especificacoes tecnicas preliminares",
      "Metodologia de execucao",
      "Prazos e etapas",
      "Criterios de medicao e recebimento",
      "Responsabilidades",
      "Estimativa de custos",
      "Conclusao"
    ]
  },
  dispensa: {
    kind: "dispensa",
    shortName: "TD",
    name: "Termo de Dispensa",
    description: "Estrutura justificativa administrativa preliminar para contratacao direta por dispensa.",
    context:
      "Elabore minuta administrativa de Termo de Dispensa para Prefeitura, sem afirmar enquadramento juridico definitivo quando os dados forem insuficientes.",
    fields: [
      ...commonPurchaseFields,
      {
        key: "fundamento",
        label: "Hipotese ou fundamento informado",
        placeholder: "Ex.: pequeno valor, emergencia, fornecedor exclusivo, conforme analise juridica posterior."
      },
      {
        key: "fornecedor",
        label: "Fornecedor pretendido, se houver",
        placeholder: "Nome, CNPJ e justificativa de escolha, se ja houver.",
        type: "textarea"
      }
    ],
    sections: [
      "Cabecalho institucional",
      "Objeto",
      "Necessidade da contratacao",
      "Justificativa da dispensa informada",
      "Razao da escolha do fornecedor, quando houver",
      "Justificativa do preco",
      "Disponibilidade orcamentaria, se informada",
      "Riscos e condicionantes",
      "Encaminhamento para analise competente"
    ]
  },
  oficio: {
    kind: "oficio",
    shortName: "Oficio",
    name: "Oficio Administrativo",
    description: "Comunicação formal emitida por secretaria, gabinete ou setor da Prefeitura.",
    context:
      "Redija oficio administrativo municipal com objetividade, respeito institucional, encaminhamento claro e fecho adequado.",
    fields: [
      {
        key: "orgao",
        label: "Orgao ou setor emissor",
        placeholder: "Gabinete do Prefeito / Secretaria Municipal de Educacao",
        required: true
      },
      {
        key: "destinatario",
        label: "Destinatario",
        placeholder: "Ao Senhor Secretario Municipal de Administracao",
        required: true
      },
      {
        key: "assunto",
        label: "Assunto",
        placeholder: "Solicitacao de providencias para manutencao predial",
        required: true
      },
      {
        key: "conteudo",
        label: "Conteudo principal",
        placeholder: "Explique o pedido, contexto, prazo e providencias esperadas.",
        type: "textarea",
        required: true
      }
    ],
    sections: ["Cabecalho institucional", "Destinatario", "Assunto", "Corpo do oficio", "Encaminhamento", "Fecho"]
  },
  requerimento: {
    kind: "requerimento",
    shortName: "REQ",
    name: "Requerimento Administrativo",
    description: "Pedido formal dirigido a autoridade ou setor municipal.",
    context:
      "Redija requerimento administrativo municipal com identificacao do requerente, pedido claro, fundamentos faticos e encaminhamento.",
    fields: [
      {
        key: "requerente",
        label: "Requerente",
        placeholder: "Secretaria, servidor, cidadao ou unidade solicitante",
        required: true
      },
      {
        key: "destinatario",
        label: "Destinatario",
        placeholder: "Ao Secretario Municipal de Administracao",
        required: true
      },
      {
        key: "pedido",
        label: "Pedido",
        placeholder: "Descreva exatamente o que se requer.",
        type: "textarea",
        required: true
      },
      {
        key: "justificativa",
        label: "Justificativa",
        placeholder: "Explique os fatos, finalidade publica e documentos relacionados.",
        type: "textarea",
        required: true
      }
    ],
    sections: ["Cabecalho institucional", "Identificacao", "Destinatario", "Pedido", "Justificativa", "Termos finais"]
  }
};

export const documentKinds = Object.keys(documentDefinitions) as DocumentKind[];
