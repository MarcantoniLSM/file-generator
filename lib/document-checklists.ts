import { DocumentKind, documentDefinitions } from "./document-types";

export type ChecklistStatus = "OK" | "ATENCAO" | "PENDENTE";

export type ChecklistFinding = {
  status: ChecklistStatus;
  title: string;
  detail: string;
};

type ChecklistRule = {
  title: string;
  okDetail: string;
  missingDetail: string;
  terms: string[];
};

const forbiddenClaims = [
  "aprovado jurídicamente",
  "legalidade comprovada",
  "regularidade comprovada",
  "sem ressalvas",
  "dispensa cabivel",
  "inexigibilidade cabivel",
  "está apto para publicação",
  "preço de mercado comprovado"
];

const rulesByKind: Record<DocumentKind, ChecklistRule[]> = {
  etp: [
    rule("Necessidade pública", ["necessidade", "problema", "demanda"], "A necessidade pública foi tratada.", "A necessidade pública ainda não aparece com clareza."),
    rule("Alternativas avaliadas", ["alternativa", "levantamento de mercado", "soluções"], "Há indicação de alternativas ou levantamento de mercado.", "O ETP precisa tratar alternativas e levantamento de mercado."),
    rule("Solução recomendada", ["solucao", "recomenda"], "A solução pretendida foi abordada.", "Falta explicitar a solução recomendada ou sua justificativa."),
    rule("Quantidades e valor", ["quantidade", "valor", "estimativa"], "Quantidade ou valor aparecem no texto.", "Quantidade, memória de cálculo ou valor estimado precisam ser complementados."),
    rule("Riscos e viabilidade", ["risco", "viabilidade", "conclusão"], "Riscos ou conclusão de viabilidade foram mencionados.", "O ETP precisa fechar com riscos e conclusão de viabilidade condicionada.")
  ],
  tr: [
    rule("Objeto e justificativa", ["objeto", "justificativa"], "Objeto e justificativa aparecem.", "O TR precisa apresentar objeto e justificativa da contratação."),
    rule("Especificacoes técnicas", ["específicacao", "requisito", "tecnico"], "Há requisitos ou específicações.", "Faltam específicações técnicas ou requisitos verificáveis."),
    rule("Execução e entrega", ["execucao", "entrega", "prazo", "local"], "Forma de execução ou entrega foi tratada.", "O TR precisa detalhar execução, entrega, local ou prazo."),
    rule("Recebimento e aceitação", ["recebimento", "aceitação", "atésto"], "Critérios de recebimento aparecem.", "Faltam critérios de recebimento, aceite ou atésto."),
    rule("Fiscalizacao", ["fiscalização", "gestor", "fiscal"], "Gestáo/fiscalização foi abordada.", "Falta tratar gestão e fiscalização contratual.")
  ],
  edital_licitacao: [
    rule("Modalidade e julgamento", ["modalidade", "julgamento", "pregao", "concorrência"], "Modalidade ou julgamento aparecem.", "Edital sem modalidade ou criterio de julgamento e incompleto."),
    rule("Participação e propostas", ["participação", "proposta", "credenciamento"], "Há regras de participação/proposta.", "Faltam regras de participação, credenciamento ou proposta."),
    rule("Hábilitacao", ["habilitação", "documentacao", "regularidade"], "Hábilitacao foi mencionada.", "Faltam regras de habilitação/documentacao."),
    rule("Impugnacao e recursos", ["impugnacao", "recurso", "esclarecimento"], "Impugnacao, esclarecimentos ou recursos aparecem.", "Faltam regras de impugnacao, esclarecimentos ou recursos."),
    rule("Anexos", ["anexo", "termo de referencia", "minuta de contrato"], "Anexos foram previstos.", "O edital deve listar anexos e indicar pendências.")
  ],
  mapa_riscos: [
    rule("Matriz de riscos", ["matriz", "risco", "probabilidade", "impacto"], "A matriz de riscos foi tratada.", "Falta matriz com probabilidade e impacto."),
    rule("Causas e consequências", ["causa", "consequência"], "Causas ou consequências aparecem.", "Cada risco deve ter causa e consequência."),
    rule("Medidas preventivas", ["preventiva", "prevenção", "mitigação"], "Há medidas preventivas.", "Faltam medidas preventivas ou mitigadoras."),
    rule("Contingência", ["contingência", "corretiva", "resposta"], "Há resposta ou contingência.", "Faltam medidas de contingência/resposta."),
    rule("Responsaveis", ["responsável", "fiscal", "gestor", "setor"], "Responsaveis foram indicados.", "Faltam responsáveis por monitoramento.")
  ],
  processo_dispensa: [
    rule("Hipótese informada", ["dispensa", "inexigibilidade", "fundamento", "hipotese"], "A hipotese foi mencionada.", "Falta indicar a hipotese ou fundamento informado."),
    rule("Necessidade", ["necessidade", "justificativa", "demanda"], "Necessidade/justificativa foi tratada.", "Falta justificar a necessidade da contratação direta."),
    rule("Fornecedor", ["fornecedor", "escolha", "contratada"], "Fornecedor ou razão de escolha foi abordado.", "Falta razão da escolha do fornecedor ou pendencia expressa."),
    rule("Preco", ["preco", "valor", "pesquisa"], "Preco ou pesquisa foram mencionados.", "Falta justificativa de preço ou pesquisa de preços."),
    rule("Documentos pendentes", ["pendente", "habilitação", "parecer", "autorização"], "Pendências/documentos foram indicados.", "Faltam documentos instrutórios e pendências para validação.")
  ],
  pesquisa_precos: [
    rule("Fontes", ["fonte", "cotacao", "pncp", "painel de preços", "contrato similar"], "Fontes de pesquisa aparecem.", "Faltam fontes de pesquisa ou sua identificacao."),
    rule("Metodologia", ["metodologia", "media", "mediana", "outlier"], "Metodologia foi tratada.", "Falta explicar metodologia de composicao do preço."),
    rule("Tabela ou comparativo", ["tabela", "comparativo", "valor"], "Há tabela/comparativo ou valores.", "Falta tabela ou comparativo com dados informados."),
    rule("Analise critica", ["análise critica", "justificativa", "limitacao"], "Analise critica foi mencionada.", "Falta análise critica dos preços e limitacoes."),
    rule("Preco estimado", ["preço estimado", "valor estimado", "estimativa"], "Preco estimado aparece.", "Falta conclusão sobre preço estimado ou pendencia equivalente.")
  ],
  parecer_juridico: [
    rule("Relatório", ["relatorio", "processo", "documentos"], "Relatório/documentos aparecem.", "Falta relatorio ou identificacao dos documentos analisados."),
    rule("Delimitação", ["delimitacao", "limites da análise", "análise"], "Delimitação da análise foi mencionada.", "Falta delimitar o alcance da análise jurídica."),
    rule("Fundamentação cautelosa", ["fundamentacao", "lei", "jurídica"], "Fundamentação aparece.", "Falta fundamentacao preliminar ou referencia jurídica geral."),
    rule("Pendências", ["pendente", "ressalva", "condicionante"], "Pendências/ressalvas aparecem.", "Parecer sem pendências ou ressalvas pode transmitir segurança indevida."),
    rule("Conclusao condicionada", ["conclusão", "condicionada", "ressalva"], "Conclusao condicionada aparece.", "Falta conclusão cautelosa e condicionada.")
  ],
  decreto_portaria: [
    rule("Tipo de ato", ["decreto", "portaria"], "Tipo de ato foi identificado.", "Falta identificar se o ato e decreto ou portaria."),
    rule("Ementa", ["ementa", "dispoe", "institui", "nomeia"], "Ementa ou comando inicial aparece.", "Falta ementa objetiva."),
    rule("Fundamentos", ["considerando", "fundamento", "competência"], "Fundamentos/considerandos aparecem.", "Faltam fundamentos ou competência da autoridade."),
    rule("Dispositivos", ["art.", "artigo", "resolve", "decreta"], "Dispositivos normativos aparecem.", "Faltam artigos ou comandos normativos."),
    rule("Vigencia e publicação", ["vigência", "publicação", "entra em vigor"], "Vigencia/publicação aparecem.", "Falta cláusula de vigência e publicação.")
  ],
  minuta_contrato: [
    rule("Partes e objeto", ["contratante", "contratada", "objeto"], "Partes/objeto aparecem.", "Falta identificar partes ou objeto."),
    rule("Valor, prazo e vigência", ["valor", "prazo", "vigência"], "Valor/prazo/vigência aparecem.", "Faltam valor, prazo ou vigência."),
    rule("Obrigacoes", ["obrigações", "contratada", "contratante"], "Obrigacoes foram tratadas.", "Faltam obrigações da contratada e contratante."),
    rule("Fiscalizacao e pagamento", ["fiscalização", "pagamento", "atésto"], "Fiscalizacao ou pagamento aparecem.", "Faltam regras de fiscalização e pagamento."),
    rule("Sanções e rescisão", ["sanções", "rescisão", "penalidade"], "Sanções/rescisão aparecem.", "Faltam sanções, penalidades ou rescisão.")
  ],
  projeto_lei: [
    rule("Ementa", ["ementa", "dispoe", "institui"], "Ementa aparece.", "Falta ementa do projeto."),
    rule("Articulado", ["art.", "artigo"], "Articulado aparece.", "Faltam artigos do projeto de lei."),
    rule("Vigencia", ["vigência", "entra em vigor"], "Clausula de vigência aparece.", "Falta cláusula de vigência."),
    rule("Justificativa", ["justificativa", "interesse público"], "Justificativa aparece.", "Falta justificativa legislativa."),
    rule("Impacto/competência", ["impacto", "competência", "iniciativa", "pendente"], "Impacto/competência foram considerados.", "Avaliar competência, iniciativa e impacto orçamentário.")
  ],
  requerimento_legislativo: [
    rule("Autor e destinatário", ["autor", "vereador", "destinatario", "senhor"], "Autor/destinatário aparecem.", "Falta autor ou destinatário."),
    rule("Pedido claro", ["requer", "indica", "solicita"], "Pedido legislativo aparece.", "Falta pedido claro."),
    rule("Justificativa", ["justificativa", "considerando", "interesse público"], "Justificativa aparece.", "Falta justificativa do pedido."),
    rule("Encaminhamento", ["encaminhe", "oficie", "mesa diretora", "prefeito"], "Encaminhamento aparece.", "Falta encaminhamento adequado."),
    rule("Tipo da peça", ["requerimento", "indicação"], "Tipo da peça aparece.", "Falta identificar se e requerimento ou indicação.")
  ],
  parecer_comissao: [
    rule("Comissão e proposição", ["comissao", "projeto", "proposicao"], "Comissão/proposição aparecem.", "Falta comissão ou proposição analisada."),
    rule("Relatório", ["relatorio"], "Relatório aparece.", "Falta relatorio da matéria."),
    rule("Analise", ["análise", "mérito", "constitucionalidade"], "Analise aparece.", "Falta análise da comissao."),
    rule("Voto", ["voto", "relator"], "Voto do relator aparece.", "Falta voto do relator ou pendencia equivalente."),
    rule("Conclusao", ["conclusão", "favoravel", "contrário"], "Conclusao aparece.", "Falta conclusão do parecer.")
  ],
  emenda_parlamentar: [
    rule("Tipo de emenda", ["modificativa", "aditiva", "supressiva", "substitutiva"], "Tipo de emenda aparece.", "Falta tipo da emenda."),
    rule("Proposição original", ["projeto", "proposicao"], "Proposição original aparece.", "Falta proposição original."),
    rule("Dispositivo afetado", ["art.", "artigo", "inciso", "parágrafo", "dispositivo"], "Dispositivo afetado aparece.", "Falta dispositivo afetado."),
    rule("Redação proposta", ["redacao", "passa a vigorar", "acrescente-se", "suprima-se"], "Redação proposta aparece.", "Falta redação proposta."),
    rule("Justificativa", ["justificativa"], "Justificativa aparece.", "Falta justificativa da emenda.")
  ],
  justificativa_projeto_lei: [
    rule("Problema publico", ["problema", "necessidade", "contexto"], "Problema/contexto aparece.", "Falta contextualizar o problema publico."),
    rule("Finalidade", ["finalidade", "objetivo", "proposta"], "Finalidade aparece.", "Falta explicar a finalidade da proposta."),
    rule("Beneficiarios", ["beneficiario", "populacao", "município", "cidadao"], "Beneficiarios aparecem.", "Falta indicar beneficiários ou impacto social."),
    rule("Interesse publico", ["interesse público", "relevancia", "beneficio"], "Interesse publico aparece.", "Falta demonstrar interesse público."),
    rule("Pedido de apoio", ["aprovação", "apoio", "apreciacao"], "Pedido de apoio aparece.", "Falta fechamento pedindo apreciacao ou apoio.")
  ],
  trt: [
    rule("Contrato ou processo", ["contrato", "processo", "empenho"], "Contrato ou processo aparecem.", "Falta identificar contrato, ata, empenho ou processo."),
    rule("Contratada", ["contratada", "cnpj", "representante"], "Contratada aparece.", "Falta identificar a contratada ou representante."),
    rule("Responsável técnico", ["responsável técnico", "registro profissional", "crea", "cau", "conselho"], "Responsável técnico aparece.", "Falta responsável técnico, registro ou conselho profissional."),
    rule("Escopo técnico", ["responsabilidade técnica", "escopo", "atividade", "execução"], "Escopo da responsabilidade aparece.", "Falta delimitar o escopo da responsabilidade técnica."),
    rule("Ressalvas de aceite", ["pendente", "fiscal", "gestor", "recebimento", "validação"], "Ressalvas ou validação administrativa aparecem.", "Falta diferenciar responsabilidade técnica de aceite pela Administração.")
  ]
};

function rule(title: string, terms: string[], okDetail: string, missingDetail: string): ChecklistRule {
  return { title, terms, okDetail, missingDetail };
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function sectionFinding(text: string, section: string): ChecklistFinding {
  const normalizedSection = normalize(section);
  const words = normalizedSection.split(/\s+/).filter((word) => word.length > 3);
  const found = hasAny(text, [normalizedSection, ...words]);

  return {
    status: found ? "OK" : "PENDENTE",
    title: `Secao: ${section}`,
    detail: found
      ? "Foi identificado conteúdo relacionado a está seção."
      : "Não foi identificado conteúdo claro para está seção esperada."
  };
}

function ruleFinding(text: string, ruleItem: ChecklistRule): ChecklistFinding {
  const found = hasAny(text, ruleItem.terms);

  return {
    status: found ? "OK" : "PENDENTE",
    title: ruleItem.title,
    detail: found ? ruleItem.okDetail : ruleItem.missingDetail
  };
}

function forbiddenFindings(text: string): ChecklistFinding[] {
  return forbiddenClaims
    .filter((claim) => text.includes(normalize(claim)))
    .map((claim) => ({
      status: "ATENCAO" as const,
      title: "Conclusao sensivel",
      detail: `O texto contem expressao que pode transmitir conclusão indevida: "${claim}". Revise a cautela da redação.`
    }));
}

export function runDocumentChecklist(kind: DocumentKind, text: string) {
  const normalized = normalize(text);
  const definition = documentDefinitions[kind];
  const sectionFindings = definition.sections.map((section) => sectionFinding(normalized, section));
  const specificFindings = rulesByKind[kind].map((ruleItem) => ruleFinding(normalized, ruleItem));
  const warnings = forbiddenFindings(normalized);
  const findings = [...specificFindings, ...sectionFindings, ...warnings];
  const pending = findings.filter((finding) => finding.status === "PENDENTE").length;
  const attention = findings.filter((finding) => finding.status === "ATENCAO").length;
  const ok = findings.filter((finding) => finding.status === "OK").length;
  const status: ChecklistStatus = pending > 0 ? "PENDENTE" : attention > 0 ? "ATENCAO" : "OK";

  return {
    status,
    ok,
    attention,
    pending,
    findings
  };
}

export function formatChecklistMarkdown(kind: DocumentKind, text: string) {
  const checklist = runDocumentChecklist(kind, text);

  return [
    "# Checklist automatico",
    "",
    `Status geral: ${checklist.status}`,
    `Itens OK: ${checklist.ok} | Atencao: ${checklist.attention} | Pendentes: ${checklist.pending}`,
    "",
    ...checklist.findings.map((finding) => `- [${finding.status}] ${finding.title}: ${finding.detail}`),
    "",
    "_Checklist automatico por regras. Não substitui revisão técnica, jurídica ou legislativa._"
  ].join("\n");
}
