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
  | "justificativa_projeto_lei"
  | "trt";

export type DocumentCategory = "Compras e licitações" | "Atos administrativos" | "Legislativo" | "Execução contratual";
export type DocumentModule = "compras_licitacoes" | "atos_administrativos" | "legislativo" | "execucao_contratual";
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
  "Não declarar legalidade definitiva, aprovação jurídica, regularidade fiscal ou enquadramento conclusivo.",
  "Sinalizar pendências técnicas, orçamentárias, jurídicas e de governança com [PENDENTE: ...].",
  "Usar linguagem institucional de Prefeitura ou Câmara, com revisão humana obrigatória."
];

const purchaseBaseFields: FormField[] = [
  { key: "orgao", label: "Órgão ou setor demandante", placeholder: "Secretaria Municipal de Administração", required: true },
  { key: "objeto", label: "Objeto", placeholder: "Aquisição de bens, contratação de serviços ou execução pretendida", required: true },
  {
    key: "problema",
    label: "Necessidade pública ou problema administrativo",
    placeholder: "Descreva a situação concreta, impactos no serviço público e motivo da demanda.",
    type: "textarea",
    required: true
  },
  { key: "beneficiarios", label: "Público ou unidades beneficiadas", placeholder: "Servidores, secretarias, escolas, unidades de saúde, cidadãos atendidos." },
  { key: "quantidade", label: "Quantidade ou dimensão estimada", placeholder: "Ex.: 60 cadeiras, 12 meses de serviço, 8 unidades escolares." },
  { key: "prazo", label: "Prazo ou período esperado", placeholder: "Ex.: entrega em até 60 dias; execução por 12 meses." },
  { key: "valor", label: "Valor estimado ou limite", placeholder: "Ex.: estimativa total de R$ 60.000,00." },
  {
    key: "observacoes",
    label: "Informações complementares",
    placeholder: "Contratos anteriores, restrições, dotação, padrões técnicos, documentos relacionados.",
    type: "textarea"
  }
];

export const documentDefinitions: Record<DocumentKind, DocumentDefinition> = {
  etp: {
    kind: "etp",
    slug: "gerador-etp",
    shortName: "ETP",
    name: "Estudo Técnico Preliminar",
    description: "Estrutura necessidade, alternativas, riscos, viabilidade e solução mais adequada.",
    category: "Compras e licitações",
    maturity: "stable",
    context: "Elabore ETP robusto conforme fase preparatória da Lei 14.133/21, com conclusão condicionada aos dados.",
    promptFocus: [
      "Tratar necessidade, alinhamento ao planejamento, requisitos, levantamento de mercado e alternativas.",
      "Analisar parcelamento, resultados pretendidos, providências prévias, riscos e viabilidade.",
      ...legalCare
    ],
    fields: [
      ...purchaseBaseFields,
      { key: "requisitos", label: "Requisitos essenciais", placeholder: "Características mínimas, qualidade esperada, prazos, condições de entrega ou execução.", type: "textarea" },
      { key: "alternativas", label: "Soluções consideradas", placeholder: "Manter situação atual, comprar, locar, aderir a ata, contratar serviço etc.", type: "textarea" },
      { key: "solucao", label: "Solução proposta", placeholder: "Descreva a alternativa recomendada e por que ela atende melhor a necessidade.", type: "textarea" }
    ],
    sections: [
      "Descrição da necessidade",
      "Área requisitante",
      "Requisitos da contratação",
      "Levantamento de mercado",
      "Descrição da solução como um todo",
      "Estimativa de quantidades",
      "Estimativa preliminar de valor",
      "Justificativa para parcelamento ou não",
      "Resultados pretendidos",
      "Providencias prévias",
      "Riscos relevantes",
      "Conclusão sobre a viabilidade"
    ]
  },
  tr: {
    kind: "tr",
    slug: "gerador-termo-de-referencia",
    shortName: "TR",
    name: "Termo de Referência",
    description: "Define objeto, requisitos, execução, gestão, fiscalização e condições da contratação.",
    category: "Compras e licitações",
    maturity: "stable",
    context: "Elabore TR municipal detalhado, operacional e pronto para revisão técnica.",
    promptFocus: [
      "Descrever objeto, especificações, entrega/execução, recebimento, obrigações e fiscalização.",
      "Não substituir edital ou contrato; focar no detalhamento técnico-operacional.",
      ...legalCare
    ],
    fields: [
      ...purchaseBaseFields,
      { key: "especificacoes", label: "Especificações técnicas", placeholder: "Características, desempenho mínimo, garantia, materiais, padrões de qualidade.", type: "textarea" },
      { key: "execucao", label: "Forma de entrega ou execução", placeholder: "Local, prazo, etapas, recebimento, instalação, treinamento, cronograma.", type: "textarea" },
      { key: "gestao", label: "Fiscalização e gestão contratual", placeholder: "Setor fiscal, critérios de recebimento, medição, responsabilidades.", type: "textarea" }
    ],
    sections: [
      "Objeto",
      "Justificativa da contratação",
      "Especificações e requisitos técnicos",
      "Quantidade e memória de cálculo",
      "Prazo, local e condições de entrega ou execução",
      "Critérios de aceitação e recebimento",
      "Obrigações da contratada",
      "Obrigações da contratante",
      "Gestão e fiscalização",
      "Estimativa de valor",
      "Condições de pagamento",
      "Sanções e disposições gerais"
    ]
  },
  edital_licitacao: {
    kind: "edital_licitacao",
    slug: "gerador-edital-licitacao",
    shortName: "Edital",
    name: "Edital de Licitação",
    description: "Minuta-base do instrumento convocatório, com regras do certame e anexos pendentes.",
    category: "Compras e licitações",
    maturity: "beta",
    context: "Gerar minuta de edital com cautela, sem afirmar conformidade jurídica final.",
    promptFocus: ["Organizar preâmbulo, objeto, modalidade, julgamento, participação, propostas, habilitação, recursos, sanções e anexos.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "modalidade", label: "Modalidade", placeholder: "Pregão eletrônico, concorrência, credenciamento etc." },
      { key: "julgamento", label: "Critério de julgamento", placeholder: "Menor preço, técnica e preço, maior desconto etc." },
      { key: "disputa", label: "Modo/plataforma de disputa", placeholder: "Eletrônico em plataforma informada pelo município." }
    ],
    sections: ["Preâmbulo", "Objeto", "Condições de participação", "Credenciamento e propostas", "Julgamento", "Habilitação", "Impugnações", "Recursos", "Contratação", "Sanções", "Anexos"]
  },
  mapa_riscos: {
    kind: "mapa_riscos",
    slug: "gerador-mapa-de-riscos",
    shortName: "Riscos",
    name: "Mapa de Riscos",
    description: "Identifica riscos, causas, probabilidade, impacto, resposta e responsáveis.",
    category: "Compras e licitações",
    maturity: "beta",
    context: "Criar mapa e matriz de riscos para contratações públicas municipais.",
    promptFocus: ["Gerar matriz textual com risco, causa, consequência, probabilidade, impacto, nível, resposta e responsável.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "etapas", label: "Etapas críticas", placeholder: "Planejamento, licitacao, entrega, fiscalização.", type: "textarea" },
      { key: "riscos", label: "Riscos conhecidos", placeholder: "Atraso de entrega, preço inexequível, falha de especificação.", type: "textarea" }
    ],
    sections: ["Identificação", "Metodologia", "Matriz de riscos", "Riscos da fase preparatória", "Riscos da seleção", "Riscos da execução", "Medidas preventivas", "Responsáveis"]
  },
  processo_dispensa: {
    kind: "processo_dispensa",
    slug: "gerador-processo-dispensa",
    shortName: "Dispensa",
    name: "Processo de Dispensa e Inexigibilidade",
    description: "Organiza justificativa, fornecedor, preço, riscos e encaminhamentos da contratação direta.",
    category: "Compras e licitações",
    maturity: "stable",
    context: "Elaborar minuta administrativa de contratação direta, sem enquadramento jurídico definitivo automático.",
    promptFocus: ["Tratar justificativa da necessidade, razão da escolha, justificativa de preço e documentos pendentes.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "fundamento", label: "Hipótese ou fundamento informado", placeholder: "Pequeno valor, emergência, fornecedor exclusivo etc." },
      { key: "fornecedor", label: "Fornecedor pretendido", placeholder: "Nome, CNPJ e razão da escolha, se houver.", type: "textarea" },
      { key: "preco", label: "Justificativa do preço", placeholder: "Fontes consultadas, propostas, contratos similares.", type: "textarea" }
    ],
    sections: ["Objeto", "Necessidade", "Hipótese informada", "Razão da escolha", "Justificativa do preço", "Disponibilidade orçamentária", "Riscos", "Documentos pendentes", "Encaminhamento"]
  },
  pesquisa_precos: {
    kind: "pesquisa_precos",
    slug: "gerador-pesquisa-de-precos",
    shortName: "Preços",
    name: "Pesquisa de Preços",
    description: "Relatório com fontes, metodologia, análise crítica e justificativa do preço estimado.",
    category: "Compras e licitações",
    maturity: "beta",
    context: "Estruturar relatório de pesquisa de preços para processo municipal.",
    promptFocus: ["Organizar fontes, parâmetros, metodologia, tratamento de preços, média/médiana e justificativa.", "Não inventar fontes; marcar como pendente quando não forem informadas.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "fontes", label: "Fontes de pesquisa", placeholder: "Painel de preços, PNCP, cotações, contratos similares.", type: "textarea" },
      { key: "metodologia", label: "Metodologia", placeholder: "Média, médiana, exclusão de outliers, critérios adotados.", type: "textarea" },
      { key: "resultado", label: "Resultado da pesquisa", placeholder: "Valores encontrados e preço estimado final.", type: "textarea" }
    ],
    sections: ["Objeto pesquisado", "Fontes consultadas", "Metodologia", "Tabela resumida", "Análise crítica", "Preço estimado", "Justificativas e limitações", "Conclusão"]
  },
  parecer_juridico: {
    kind: "parecer_juridico",
    slug: "gerador-parecer-jurídico",
    shortName: "Parecer",
    name: "Parecer Jurídico de Compras",
    description: "Minuta cautelosa de parecer para revisão da assessoria jurídica responsável.",
    category: "Compras e licitações",
    maturity: "beta",
    context: "Produzir minuta de apoio ao parecer jurídico, sem substituir advogado público ou procuradoria.",
    promptFocus: ["Estruturar relatório, delimitação da análise, fundamentos gerais, ressalvas, pendências e conclusão condicionada.", "Evitar linguagem de aprovação definitiva.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "processo", label: "Processo administrativo", placeholder: "Número do processo, se houver." },
      { key: "documentos", label: "Documentos analisados", placeholder: "DFD, ETP, TR, pesquisa de preços, minuta de edital etc.", type: "textarea" },
      { key: "duvidas", label: "Pontos de atenção", placeholder: "Riscos, dúvidas jurídicas ou documentos ausentes.", type: "textarea" }
    ],
    sections: ["Relatório", "Delimitação da análise", "Fundamentação preliminar", "Análise da instrução", "Pendências e condicionantes", "Conclusão opinativa"]
  },
  decreto_portaria: {
    kind: "decreto_portaria",
    slug: "gerador-decreto-executivo",
    shortName: "Ato",
    name: "Decreto Executivo e Portaria",
    description: "Minuta de ato administrativo municipal com ementa, considerandos e dispositivos.",
    category: "Atos administrativos",
    maturity: "beta",
    context: "Redigir decreto ou portaria municipal conforme técnica normativa básica.",
    promptFocus: ["Usar ementa, considerandos quando cabíveis, artigos, cláusula de vigência e publicação.", "Não criar fundamento local inexistente.", ...legalCare],
    fields: [
      { key: "orgao", label: "Órgão emissor", placeholder: "Gabinete do Prefeito / Secretaria Municipal", required: true },
      { key: "tipo_ato", label: "Tipo de ato", placeholder: "Decreto ou Portaria", required: true },
      { key: "assunto", label: "Assunto", placeholder: "Nomeação, regulamentação, comissão, expediente etc.", required: true },
      { key: "fundamentos", label: "Fundamentos", placeholder: "Leis, decretos, processo administrativo, competências.", type: "textarea" },
      { key: "conteudo", label: "Conteúdo do ato", placeholder: "O que o ato deve determinar.", type: "textarea", required: true }
    ],
    sections: ["Ementa", "Preâmbulo", "Considerandos", "Dispositivos", "Vigência", "Publicação"]
  },
  minuta_contrato: {
    kind: "minuta_contrato",
    slug: "gerador-minuta-de-contrato",
    shortName: "Contrato",
    name: "Minuta de Contrato Administrativo",
    description: "Base contratual com objeto, valor, prazos, obrigações, fiscalização e sanções.",
    category: "Compras e licitações",
    maturity: "beta",
    context: "Gerar minuta de contrato administrativo para revisão jurídica e administrativa.",
    promptFocus: ["Organizar partes, objeto, regime, valor, prazo, obrigações, fiscalização, pagamento, sanções, rescisao e foro.", ...legalCare],
    fields: [
      ...purchaseBaseFields,
      { key: "contratada", label: "Contratada", placeholder: "Nome/CNPJ, se ja houver." },
      { key: "regime", label: "Regime ou forma de execução", placeholder: "Fornecimento único, continuado, empreitada etc." },
      { key: "pagamento", label: "Condições de pagamento", placeholder: "Prazo, medição, nota fiscal, atésto.", type: "textarea" }
    ],
    sections: ["Partes", "Objeto", "Fundamento", "Valor e dotação", "Vigência", "Execucao", "Obrigações", "Fiscalização", "Pagamento", "Sanções", "Rescisão", "Foro"]
  },
  projeto_lei: {
    kind: "projeto_lei",
    slug: "gerador-projeto-de-lei",
    shortName: "PL",
    name: "Projeto de Lei",
    description: "Minuta de proposição legislativa com ementa, articulado, vigência e justificativa.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir projeto de lei municipal com técnica legislativa preliminar.",
    promptFocus: ["Criar ementa, artigos objetivos, disposições finais, vigência e justificativa.", "Marcar dúvidas sobre competência, iniciativa e impacto orçamentário.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor/proponente", placeholder: "Vereador, Mesa Diretora ou Poder Executivo", required: true },
      { key: "tema", label: "Tema do projeto", placeholder: "Utilidade pública, programa municipal, denominação de via etc.", required: true },
      { key: "objetivo", label: "Objetivo", placeholder: "Explique o que o projeto pretende criar, alterar ou reconhecer.", type: "textarea", required: true },
      { key: "impacto", label: "Impacto esperado", placeholder: "Benefícios, público afetado, custos ou ausência de custos.", type: "textarea" }
    ],
    sections: ["Ementa", "Articulado", "Cláusula de vigência", "Justificativa", "Pendências legislativas"]
  },
  requerimento_legislativo: {
    kind: "requerimento_legislativo",
    slug: "gerador-requerimento-legislativo",
    shortName: "REQ",
    name: "Requerimento e Indicação Legislativa",
    description: "Redige pedidos, indicações e encaminhamentos parlamentares em linguagem objetiva.",
    category: "Legislativo",
    maturity: "beta",
    context: "Gerar requerimento ou indicação parlamentar municipal.",
    promptFocus: ["Diferenciar pedido de informação, providência, indicação e encaminhamento.", "Usar linguagem parlamentar objetiva.", ...legalCare],
    fields: [
      { key: "autor", label: "Parlamentar/autor", placeholder: "Vereador(a) proponente", required: true },
      { key: "tipo", label: "Tipo", placeholder: "Requerimento ou indicação", required: true },
      { key: "destinatario", label: "Destinatário", placeholder: "Prefeito, secretaria, mesa diretora etc." },
      { key: "pedido", label: "Pedido ou indicação", placeholder: "Descreva a providência solicitada.", type: "textarea", required: true },
      { key: "justificativa", label: "Justificativa", placeholder: "Explique os motivos e o interesse público.", type: "textarea" }
    ],
    sections: ["Identificação", "Pedido", "Justificativa", "Encaminhamento", "Fecho"]
  },
  parecer_comissao: {
    kind: "parecer_comissao",
    slug: "gerador-parecer-comissão",
    shortName: "Comissão",
    name: "Parecer de Comissão Legislativa",
    description: "Estrutura relatório, análise, voto do relator e conclusão de comissão.",
    category: "Legislativo",
    maturity: "beta",
    context: "Gerar minuta de parecer de comissão para camara municipal.",
    promptFocus: ["Separar relatório, análise de mérito ou constitucionalidade, voto e conclusão.", "Não afirmar constitucionalidade definitiva.", ...legalCare],
    fields: [
      { key: "comissão", label: "Comissão", placeholder: "Comissão de Constituição e Justiça, Finanças etc.", required: true },
      { key: "proposicao", label: "Proposição analisada", placeholder: "Projeto de Lei nº..., Emenda nº...", required: true },
      { key: "ementa", label: "Ementa/resumo", placeholder: "Resumo do conteúdo analisado.", type: "textarea" },
      { key: "posicao", label: "Tendência do voto", placeholder: "Favorável, contrário ou com emendas, se definido." }
    ],
    sections: ["Relatório", "Análise", "Voto do relator", "Conclusão", "Ressalvas"]
  },
  emenda_parlamentar: {
    kind: "emenda_parlamentar",
    slug: "gerador-emenda-parlamentar",
    shortName: "Emenda",
    name: "Emenda Parlamentar",
    description: "Prepara emendas modificativas, aditivas, supressivas ou substitutivas.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir emenda parlamentar municipal com nova redação e justificativa.",
    promptFocus: ["Identificar tipo de emenda, dispositivo afetado, redação proposta e justificativa.", "Manter técnica legislativa e coerência com a proposição original.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor da emenda", placeholder: "Vereador(a) ou comissão", required: true },
      { key: "tipo_emenda", label: "Tipo de emenda", placeholder: "Modificativa, aditiva, supressiva ou substitutiva", required: true },
      { key: "proposicao", label: "Proposição original", placeholder: "Projeto de Lei nº...", required: true },
      { key: "dispositivo", label: "Dispositivo afetado", placeholder: "Artigo, parágrafo, inciso ou anexo." },
      { key: "redacao", label: "Nova redação pretendida", placeholder: "Informe a alteração desejada.", type: "textarea", required: true },
      { key: "justificativa", label: "Justificativa", placeholder: "Explique a razão da emenda.", type: "textarea" }
    ],
    sections: ["Identificação da emenda", "Dispositivo afetado", "Redação proposta", "Justificativa", "Encaminhamento"]
  },
  justificativa_projeto_lei: {
    kind: "justificativa_projeto_lei",
    slug: "gerador-justificativa-projeto-de-lei",
    shortName: "Justificativa PL",
    name: "Justificativa de Projeto de Lei",
    description: "Transforma objetivos e impacto público em justificativa formal para proposição legislativa.",
    category: "Legislativo",
    maturity: "beta",
    context: "Redigir justificativa legislativa clara, persuasiva e institucional.",
    promptFocus: ["Explicar problema, finalidade pública, beneficiários, adequação da medida e pedido de aprovação.", "Marcar impacto orçamentário pendente quando aplicável.", ...legalCare],
    fields: [
      { key: "autor", label: "Autor/proponente", placeholder: "Vereador(a), Mesa Diretora ou Poder Executivo", required: true },
      { key: "tema", label: "Tema do projeto", placeholder: "Assunto central da proposição", required: true },
      { key: "objetivo", label: "Objetivo", placeholder: "O que a proposta busca resolver.", type: "textarea", required: true },
      { key: "beneficiarios", label: "Beneficiários", placeholder: "Público afetado ou beneficiado." },
      { key: "argumentos", label: "Argumentos principais", placeholder: "Razões políticas, sociais, administrativas ou jurídicas.", type: "textarea" }
    ],
    sections: ["Contextualização", "Finalidade pública", "Beneficiários", "Adequação da proposta", "Conclusão e pedido de apoio"]
  },
  trt: {
    kind: "trt",
    slug: "gerador-termo-responsabilidade-tecnica",
    shortName: "TRT",
    name: "Termo de Responsabilidade Técnica",
    description: "Minuta para declaração técnica vinculada à execução contratual e às responsabilidades assumidas.",
    category: "Execução contratual",
    maturity: "beta",
    context:
      "Elaborar Termo de Responsabilidade Técnica no contexto de execução contratual municipal, separando declarações do contratado de validações da Administração.",
    promptFocus: [
      "Identificar contrato, objeto, contratado, responsável técnico, atividade executada e escopo da responsabilidade assumida.",
      "Não declarar aceite definitivo, conformidade plena ou quitação pela Administração sem informação expressa do fiscal/gestor.",
      "Distinguir informação declarada pelo contratado, responsabilidade técnica assumida e pendências para validação pelo fiscal do contrato.",
      "Sinalizar documentos comprobatórios pendentes, registro profissional, ART/RRT/TRT equivalente, relatórios, medições e evidências de execução.",
      ...legalCare
    ],
    fields: [
      { key: "orgao", label: "Órgão contratante", placeholder: "Secretaria Municipal responsável pelo contrato", required: true },
      { key: "contrato", label: "Contrato ou processo", placeholder: "Número do contrato, ata, empenho ou processo administrativo", required: true },
      { key: "contratada", label: "Contratada", placeholder: "Razão social, CNPJ e representante, se disponível", required: true },
      { key: "responsavel_tecnico", label: "Responsável técnico", placeholder: "Nome, cargo/função, registro profissional e entidade de classe", required: true },
      { key: "objeto", label: "Objeto contratual", placeholder: "Objeto executado ou em execução", type: "textarea", required: true },
      {
        key: "escopo_responsabilidade",
        label: "Escopo da responsabilidade técnica",
        placeholder: "Atividades, serviços, entregas, laudos, acompanhamento, supervisão ou execução sob responsabilidade técnica.",
        type: "textarea",
        required: true
      },
      {
        key: "periodo_execucao",
        label: "Período de execução",
        placeholder: "Datas, vigência, etapa ou medição relacionada ao termo."
      },
      {
        key: "evidencias",
        label: "Evidências e documentos anexos",
        placeholder: "ART/RRT, relatórios, medições, fotos, notas, laudos, ordens de serviço ou outros comprovantes.",
        type: "textarea"
      },
      {
        key: "declaracoes",
        label: "Declarações do responsável/contratada",
        placeholder: "Declarações que devem constar no termo, limites da responsabilidade e ciência das obrigações.",
        type: "textarea"
      },
      {
        key: "validacao_administracao",
        label: "Validação pela Administração",
        placeholder: "Informe se haverá campo para fiscal, gestor, recebimento provisório ou apenas ciência administrativa.",
        type: "textarea"
      }
    ],
    sections: [
      "Identificação do contrato ou processo",
      "Identificação da contratada",
      "Responsável técnico",
      "Objeto e escopo da responsabilidade",
      "Período ou etapa abrangida",
      "Declarações técnicas",
      "Documentos comprobatórios",
      "Ressalvas e pendências",
      "Ciência do fiscal ou gestor",
      "Assinaturas"
    ]
  }
};

export const documentKinds = Object.keys(documentDefinitions) as DocumentKind[];
export const documentCatalog = documentKinds.map((kind) => documentDefinitions[kind]);
export const documentModules: DocumentModule[] = [
  "compras_licitacoes",
  "atos_administrativos",
  "legislativo",
  "execucao_contratual"
];

export const documentModuleLabels: Record<DocumentModule, DocumentCategory> = {
  compras_licitacoes: "Compras e licitações",
  atos_administrativos: "Atos administrativos",
  legislativo: "Legislativo",
  execucao_contratual: "Execução contratual"
};

export function getDocumentModule(category: DocumentCategory): DocumentModule {
  const documentModule = documentModules.find((item) => documentModuleLabels[item] === category);
  return documentModule || "compras_licitacoes";
}

export function canAccessDocumentKind(kind: DocumentKind, allowedModules: DocumentModule[] | null | undefined) {
  const definition = documentDefinitions[kind];
  if (!definition || !allowedModules?.length) return false;

  return allowedModules.includes(getDocumentModule(definition.category));
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && documentKinds.includes(value as DocumentKind);
}
