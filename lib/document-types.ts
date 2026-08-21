export type DocumentKind =
  | "etp"
  | "tr"
  | "edital_licitacao"
  | "mapa_riscos"
  | "processo_dispensa"
  | "pesquisa_precos"
  | "parecer_juridico"
  | "decreto_portaria"
  | "minuta_contrato"
  | "projeto_lei"
  | "requerimento_legislativo"
  | "parecer_comissao"
  | "emenda_parlamentar"
  | "justificativa_projeto_lei";

export type DocumentCategory = "Compras e licitacoes" | "Atos administrativos" | "Legislativo";
export type DocumentMaturity = "stable" | "beta";

export type FormField = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
  required?: boolean;
};

export type DocumentDefinition = {
  kind: DocumentKind;
  slug: string;
  shortName: string;
  name: string;
  description: string;
  category: DocumentCategory;
  maturity: DocumentMaturity;
  context: string;
  promptFocus: string[];
  fields: FormField[];
  sections: string[];
};

const legalCare = [
  "Nao declarar legalidade definitiva, aprovacao juridica, regularidade fiscal ou enquadramento conclusivo.",
  "Sinalizar pendencias tecnicas, orcamentarias, juridicas e de governanca com [PENDENTE: ...].",
  "Usar linguagem institucional de Prefeitura ou Camara, com revisao humana obrigatoria."
];

const purchaseBaseFields: FormField[] = [
  { key: "orgao", label: "Orgao ou setor demandante", placeholder: "Secretaria Municipal de Administracao", required: true },
  { key: "objeto", label: "Objeto", placeholder: "Aquisicao de bens, contratacao de servicos ou execucao pretendida", required: true },
  {
    key: "problema",
    label: "Necessidade publica ou problema administrativo",
    placeholder: "Descreva a situacao concreta, impactos no servico publico e motivo da demanda.",
    type: "textarea",
    required: true
  },
  { key: "beneficiarios", label: "Publico ou unidades beneficiadas", placeholder: "Servidores, secretarias, escolas, unidades de saude, cidadaos atendidos." },
  { key: "quantidade", label: "Quantidade ou dimensao estimada", placeholder: "Ex.: 60 cadeiras, 12 meses de servico, 8 unidades escolares." },
  { key: "prazo", label: "Prazo ou periodo esperado", placeholder: "Ex.: entrega em ate 60 dias; execucao por 12 meses." },
  { key: "valor", label: "Valor estimado ou limite", placeholder: "Ex.: estimativa total de R$ 60.000,00." },
  {
    key: "observacoes",
    label: "Informacoes complementares",
    placeholder: "Contratos anteriores, restricoes, dotacao, padroes tecnicos, documentos relacionados.",
    type: "textarea"
  }
];

export const documentDefinitions: Record<DocumentKind, DocumentDefinition> = {
  etp: {
    kind: "etp",
    slug: "gerador-etp",
    shortName: "ETP",
    name: "Estudo Tecnico Preliminar",
    description: "Estrutura necessidade, alternativas, riscos, viabilidade e solucao mais adequada.",
    category: "Compras e licitacoes",
    maturity: "stable",
    context: "Elabore ETP robusto conforme fase preparatoria da Lei 14.133/21, com conclusao condicionada aos dados.",
    promptFocus: [
      "Tratar necessidade, alinhamento ao planejamento, requisitos, levantamento de mercado e alternativas.",
      "Analisar parcelamento, resultados pretendidos, providencias previas, riscos e viabilidade.",
      ...legalCare
    ],
    fields: [
      ...purchaseBaseFields,
      { key: "requisitos", label: "Requisitos essenciais", placeholder: "Caracteristicas minimas, qualidade esperada, prazos, condicoes de entrega ou execucao.", type: "textarea" },
      { key: "alternativas", label: "Solucoes consideradas", placeholder: "Manter situacao atual, comprar, locar, aderir a ata, contratar servico etc.", type: "textarea" },
      { key: "solucao", label: "Solucao proposta", placeholder: "Descreva a alternativa recomendada e por que ela atende melhor a necessidade.", type: "textarea" }
    ],
    sections: [
      "Descricao da necessidade",
      "Area requisitante",
      "Requisitos da contratacao",
      "Levantamento de mercado",
      "Descricao da solucao como um todo",
      "Estimativa de quantidades",
      "Estimativa preliminar de valor",
      "Justificativa para parcelamento ou nao",
      "Resultados pretendidos",
      "Providencias previas",
      "Riscos relevantes",
      "Conclusao sobre a viabilidade"
    ]
  },
  tr: {
    kind: "tr",
    slug: "gerador-termo-de-referencia",
    shortName: "TR",
    name: "Termo de Referencia",
    description: "Define objeto, requisitos, execucao, gestao, fiscalizacao e condicoes da contratacao.",
    category: "Compras e licitacoes",
    maturity: "stable",
    context: "Elabore TR municipal detalhado, operacional e pronto para revisao tecnica.",
    promptFocus: [
      "Descrever objeto, especificacoes, entrega/execucao, recebimento, obrigacoes e fiscalizacao.",
      "Nao substituir edital ou contrato; focar no detalhamento tecnico-operacional.",
      ...legalCare
    ],
    fields: [
      ...purchaseBaseFields,
      { key: "especificacoes", label: "Especificacoes tecnicas", placeholder: "Caracteristicas, desempenho minimo, garantia, materiais, padroes de qualidade.", type: "textarea" },
      { key: "execucao", label: "Forma de entrega ou execucao", placeholder: "Local, prazo, etapas, recebimento, instalacao, treinamento, cronograma.", type: "textarea" },
      { key: "gestao", label: "Fiscalizacao e gestao contratual", placeholder: "Setor fiscal, criterios de recebimento, medicao, responsabilidades.", type: "textarea" }
    ],
    sections: [
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
  edital_licitacao: {
    kind: "edital_licitacao",
    slug: "gerador-edital-licitacao",
    shortName: "Edital",
    name: "Edital de Licitacao",
    description: "Minuta-base do instrumento convocatorio, com regras do certame e anexos pendentes.",
    category: "Compras e licitacoes",
    maturity: "beta",
    context: "Gerar minuta de edital com cautela, sem afirmar conformidade juridica final.",
    promptFocus: ["Organizar preambulo, objeto, modalidade, julgamento, participacao, propostas, habilitacao, recursos, sancoes e anexos.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "modalidade", label: "Modalidade", placeholder: "Pregao eletronico, concorrencia, credenciamento etc." },
      { key: "julgamento", label: "Criterio de julgamento", placeholder: "Menor preco, tecnica e preco, maior desconto etc." },
      { key: "disputa", label: "Modo/plataforma de disputa", placeholder: "Eletronico em plataforma informada pelo municipio." }
    ],
    sections: ["Preambulo", "Objeto", "Condicoes de participacao", "Credenciamento e propostas", "Julgamento", "Habilitacao", "Impugnacoes", "Recursos", "Contratacao", "Sancoes", "Anexos"]
  },
  mapa_riscos: {
    kind: "mapa_riscos",
    slug: "gerador-mapa-de-riscos",
    shortName: "Riscos",
    name: "Mapa de Riscos",
    description: "Identifica riscos, causas, probabilidade, impacto, resposta e responsaveis.",
    category: "Compras e licitacoes",
    maturity: "beta",
    context: "Criar mapa e matriz de riscos para contratacoes publicas municipais.",
    promptFocus: ["Gerar matriz textual com risco, causa, consequencia, probabilidade, impacto, nivel, resposta e responsavel.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "etapas", label: "Etapas criticas", placeholder: "Planejamento, licitacao, entrega, fiscalizacao.", type: "textarea" },
      { key: "riscos", label: "Riscos conhecidos", placeholder: "Atraso de entrega, preco inexequivel, falha de especificacao.", type: "textarea" }
    ],
    sections: ["Identificacao", "Metodologia", "Matriz de riscos", "Riscos da fase preparatoria", "Riscos da selecao", "Riscos da execucao", "Medidas preventivas", "Responsaveis"]
  },
  processo_dispensa: {
    kind: "processo_dispensa",
    slug: "gerador-processo-dispensa",
    shortName: "Dispensa",
    name: "Processo de Dispensa e Inexigibilidade",
    description: "Organiza justificativa, fornecedor, preco, riscos e encaminhamentos da contratacao direta.",
    category: "Compras e licitacoes",
    maturity: "stable",
    context: "Elaborar minuta administrativa de contratacao direta, sem enquadramento juridico definitivo automatico.",
    promptFocus: ["Tratar justificativa da necessidade, razao da escolha, justificativa de preco e documentos pendentes.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "fundamento", label: "Hipotese ou fundamento informado", placeholder: "Pequeno valor, emergencia, fornecedor exclusivo etc." },
      { key: "fornecedor", label: "Fornecedor pretendido", placeholder: "Nome, CNPJ e razao da escolha, se houver.", type: "textarea" },
      { key: "preco", label: "Justificativa do preco", placeholder: "Fontes consultadas, propostas, contratos similares.", type: "textarea" }
    ],
    sections: ["Objeto", "Necessidade", "Hipotese informada", "Razao da escolha", "Justificativa do preco", "Disponibilidade orcamentaria", "Riscos", "Documentos pendentes", "Encaminhamento"]
  },
  pesquisa_precos: {
    kind: "pesquisa_precos",
    slug: "gerador-pesquisa-de-precos",
    shortName: "Precos",
    name: "Pesquisa de Precos",
    description: "Relatorio com fontes, metodologia, analise critica e justificativa do preco estimado.",
    category: "Compras e licitacoes",
    maturity: "beta",
    context: "Estruturar relatorio de pesquisa de precos para processo municipal.",
    promptFocus: ["Organizar fontes, parametros, metodologia, tratamento de precos, media/mediana e justificativa.", "Nao inventar fontes; marcar como pendente quando nao forem informadas.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "fontes", label: "Fontes de pesquisa", placeholder: "Painel de precos, PNCP, cotacoes, contratos similares.", type: "textarea" },
      { key: "metodologia", label: "Metodologia", placeholder: "Media, mediana, exclusao de outliers, criterios adotados.", type: "textarea" },
      { key: "resultado", label: "Resultado da pesquisa", placeholder: "Valores encontrados e preco estimado final.", type: "textarea" }
    ],
    sections: ["Objeto pesquisado", "Fontes consultadas", "Metodologia", "Tabela resumida", "Analise critica", "Preco estimado", "Justificativas e limitacoes", "Conclusao"]
  },
  parecer_juridico: {
    kind: "parecer_juridico",
    slug: "gerador-parecer-juridico",
    shortName: "Parecer",
    name: "Parecer Juridico de Compras",
    description: "Minuta cautelosa de parecer para revisao da assessoria juridica responsavel.",
    category: "Compras e licitacoes",
    maturity: "beta",
    context: "Produzir minuta de apoio ao parecer juridico, sem substituir advogado publico ou procuradoria.",
    promptFocus: ["Estruturar relatorio, delimitacao da analise, fundamentos gerais, ressalvas, pendencias e conclusao condicionada.", "Evitar linguagem de aprovacao definitiva.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "processo", label: "Processo administrativo", placeholder: "Numero do processo, se houver." },
      { key: "documentos", label: "Documentos analisados", placeholder: "DFD, ETP, TR, pesquisa de precos, minuta de edital etc.", type: "textarea" },
      { key: "duvidas", label: "Pontos de atencao", placeholder: "Riscos, duvidas juridicas ou documentos ausentes.", type: "textarea" }
    ],
    sections: ["Relatorio", "Delimitacao da analise", "Fundamentacao preliminar", "Analise da instrucao", "Pendencias e condicionantes", "Conclusao opinativa"]
  },
  decreto_portaria: {
    kind: "decreto_portaria",
    slug: "gerador-decreto-executivo",
    shortName: "Ato",
    name: "Decreto Executivo e Portaria",
    description: "Minuta de ato administrativo municipal com ementa, considerandos e dispositivos.",
    category: "Atos administrativos",
    maturity: "beta",
    context: "Redigir decreto ou portaria municipal conforme tecnica normativa basica.",
    promptFocus: ["Usar ementa, considerandos quando cabiveis, artigos, clausula de vigencia e publicacao.", "Nao criar fundamento local inexistente.", ...legalCare],
    fields: [
      { key: "orgao", label: "Orgao emissor", placeholder: "Gabinete do Prefeito / Secretaria Municipal", required: true },
      { key: "tipo_ato", label: "Tipo de ato", placeholder: "Decreto ou Portaria", required: true },
      { key: "assunto", label: "Assunto", placeholder: "Nomeacao, regulamentacao, comissao, expediente etc.", required: true },
      { key: "fundamentos", label: "Fundamentos", placeholder: "Leis, decretos, processo administrativo, competencias.", type: "textarea" },
      { key: "conteudo", label: "Conteudo do ato", placeholder: "O que o ato deve determinar.", type: "textarea", required: true }
    ],
    sections: ["Ementa", "Preambulo", "Considerandos", "Dispositivos", "Vigencia", "Publicacao"]
  },
  minuta_contrato: {
    kind: "minuta_contrato",
    slug: "gerador-minuta-de-contrato",
    shortName: "Contrato",
    name: "Minuta de Contrato Administrativo",
    description: "Base contratual com objeto, valor, prazos, obrigacoes, fiscalizacao e sancoes.",
    category: "Compras e licitacoes",
    maturity: "beta",
    context: "Gerar minuta de contrato administrativo para revisao juridica e administrativa.",
    promptFocus: ["Organizar partes, objeto, regime, valor, prazo, obrigacoes, fiscalizacao, pagamento, sancoes, rescisao e foro.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "contratada", label: "Contratada", placeholder: "Nome/CNPJ, se ja houver." },
      { key: "regime", label: "Regime ou forma de execucao", placeholder: "Fornecimento unico, continuado, empreitada etc." },
      { key: "pagamento", label: "Condicoes de pagamento", placeholder: "Prazo, medicao, nota fiscal, atesto.", type: "textarea" }
    ],
    sections: ["Partes", "Objeto", "Fundamento", "Valor e dotacao", "Vigencia", "Execucao", "Obrigacoes", "Fiscalizacao", "Pagamento", "Sancoes", "Rescisao", "Foro"]
  },
  projeto_lei: {
    kind: "projeto_lei",
    slug: "gerador-projeto-de-lei",
    shortName: "PL",
    name: "Projeto de Lei",
    description: "Minuta de proposicao legislativa com ementa, articulado, vigencia e justificativa.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir projeto de lei municipal com tecnica legislativa preliminar.",
    promptFocus: ["Criar ementa, artigos objetivos, disposicoes finais, vigencia e justificativa.", "Marcar duvidas sobre competencia, iniciativa e impacto orcamentario.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor/proponente", placeholder: "Vereador, Mesa Diretora ou Poder Executivo", required: true },
      { key: "tema", label: "Tema do projeto", placeholder: "Utilidade publica, programa municipal, denominacao de via etc.", required: true },
      { key: "objetivo", label: "Objetivo", placeholder: "Explique o que o projeto pretende criar, alterar ou reconhecer.", type: "textarea", required: true },
      { key: "impacto", label: "Impacto esperado", placeholder: "Beneficios, publico afetado, custos ou ausencia de custos.", type: "textarea" }
    ],
    sections: ["Ementa", "Articulado", "Clausula de vigencia", "Justificativa", "Pendencias legislativas"]
  },
  requerimento_legislativo: {
    kind: "requerimento_legislativo",
    slug: "gerador-requerimento-legislativo",
    shortName: "REQ",
    name: "Requerimento e Indicacao Legislativa",
    description: "Redige pedidos, indicacoes e encaminhamentos parlamentares em linguagem objetiva.",
    category: "Legislativo",
    maturity: "beta",
    context: "Gerar requerimento ou indicacao parlamentar municipal.",
    promptFocus: ["Diferenciar pedido de informacao, providencia, indicacao e encaminhamento.", "Usar linguagem parlamentar objetiva.", ...legalCare],
    fields: [
      { key: "autor", label: "Parlamentar/autor", placeholder: "Vereador(a) proponente", required: true },
      { key: "tipo", label: "Tipo", placeholder: "Requerimento ou indicacao", required: true },
      { key: "destinatario", label: "Destinatario", placeholder: "Prefeito, secretaria, mesa diretora etc." },
      { key: "pedido", label: "Pedido ou indicacao", placeholder: "Descreva a providencia solicitada.", type: "textarea", required: true },
      { key: "justificativa", label: "Justificativa", placeholder: "Explique os motivos e o interesse publico.", type: "textarea" }
    ],
    sections: ["Identificacao", "Pedido", "Justificativa", "Encaminhamento", "Fecho"]
  },
  parecer_comissao: {
    kind: "parecer_comissao",
    slug: "gerador-parecer-comissao",
    shortName: "Comissao",
    name: "Parecer de Comissao Legislativa",
    description: "Estrutura relatorio, analise, voto do relator e conclusao de comissao.",
    category: "Legislativo",
    maturity: "beta",
    context: "Gerar minuta de parecer de comissao para camara municipal.",
    promptFocus: ["Separar relatorio, analise de merito ou constitucionalidade, voto e conclusao.", "Nao afirmar constitucionalidade definitiva.", ...legalCare],
    fields: [
      { key: "comissao", label: "Comissao", placeholder: "Comissao de Constituicao e Justica, Financas etc.", required: true },
      { key: "proposicao", label: "Proposicao analisada", placeholder: "Projeto de Lei nº..., Emenda nº...", required: true },
      { key: "ementa", label: "Ementa/resumo", placeholder: "Resumo do conteudo analisado.", type: "textarea" },
      { key: "posicao", label: "Tendencia do voto", placeholder: "Favoravel, contrario ou com emendas, se definido." }
    ],
    sections: ["Relatorio", "Analise", "Voto do relator", "Conclusao", "Ressalvas"]
  },
  emenda_parlamentar: {
    kind: "emenda_parlamentar",
    slug: "gerador-emenda-parlamentar",
    shortName: "Emenda",
    name: "Emenda Parlamentar",
    description: "Prepara emendas modificativas, aditivas, supressivas ou substitutivas.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir emenda parlamentar municipal com nova redacao e justificativa.",
    promptFocus: ["Identificar tipo de emenda, dispositivo afetado, redacao proposta e justificativa.", "Manter tecnica legislativa e coerencia com a proposicao original.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor da emenda", placeholder: "Vereador(a) ou comissao", required: true },
      { key: "tipo_emenda", label: "Tipo de emenda", placeholder: "Modificativa, aditiva, supressiva ou substitutiva", required: true },
      { key: "proposicao", label: "Proposicao original", placeholder: "Projeto de Lei nº...", required: true },
      { key: "dispositivo", label: "Dispositivo afetado", placeholder: "Artigo, paragrafo, inciso ou anexo." },
      { key: "redacao", label: "Nova redacao pretendida", placeholder: "Informe a alteracao desejada.", type: "textarea", required: true },
      { key: "justificativa", label: "Justificativa", placeholder: "Explique a razao da emenda.", type: "textarea" }
    ],
    sections: ["Identificacao da emenda", "Dispositivo afetado", "Redacao proposta", "Justificativa", "Encaminhamento"]
  },
  justificativa_projeto_lei: {
    kind: "justificativa_projeto_lei",
    slug: "gerador-justificativa-projeto-de-lei",
    shortName: "Justificativa PL",
    name: "Justificativa de Projeto de Lei",
    description: "Transforma objetivos e impacto publico em justificativa formal para proposicao legislativa.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir justificativa legislativa clara, persuasiva e institucional.",
    promptFocus: ["Explicar problema, finalidade publica, beneficiarios, adequacao da medida e pedido de aprovacao.", "Marcar impacto orcamentario pendente quando aplicavel.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor/proponente", placeholder: "Vereador(a), Mesa Diretora ou Poder Executivo", required: true },
      { key: "tema", label: "Tema do projeto", placeholder: "Assunto central da proposicao", required: true },
      { key: "objetivo", label: "Objetivo", placeholder: "O que a proposta busca resolver.", type: "textarea", required: true },
      { key: "beneficiarios", label: "Beneficiarios", placeholder: "Publico afetado ou beneficiado." },
      { key: "argumentos", label: "Argumentos principais", placeholder: "Razoes politicas, sociais, administrativas ou juridicas.", type: "textarea" }
    ],
    sections: ["Contextualizacao", "Finalidade publica", "Beneficiarios", "Adequacao da proposta", "Conclusao e pedido de apoio"]
  }
};

export const documentKinds = Object.keys(documentDefinitions) as DocumentKind[];
export const documentCatalog = documentKinds.map((kind) => documentDefinitions[kind]);
