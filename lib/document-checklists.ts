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
  "aprovado juridicamente",
  "legalidade comprovada",
  "regularidade comprovada",
  "sem ressalvas",
  "dispensa cabivel",
  "inexigibilidade cabivel",
  "esta apto para publicacao",
  "preco de mercado comprovado"
];

const rulesByKind: Record<DocumentKind, ChecklistRule[]> = {
  etp: [
    rule("Necessidade publica", ["necessidade", "problema", "demanda"], "A necessidade publica foi tratada.", "A necessidade publica ainda nao aparece com clareza."),
    rule("Alternativas avaliadas", ["alternativa", "levantamento de mercado", "solucoes"], "Ha indicacao de alternativas ou levantamento de mercado.", "O ETP precisa tratar alternativas e levantamento de mercado."),
    rule("Solucao recomendada", ["solucao", "recomenda"], "A solucao pretendida foi abordada.", "Falta explicitar a solucao recomendada ou sua justificativa."),
    rule("Quantidades e valor", ["quantidade", "valor", "estimativa"], "Quantidade ou valor aparecem no texto.", "Quantidade, memoria de calculo ou valor estimado precisam ser complementados."),
    rule("Riscos e viabilidade", ["risco", "viabilidade", "conclusao"], "Riscos ou conclusao de viabilidade foram mencionados.", "O ETP precisa fechar com riscos e conclusao de viabilidade condicionada.")
  ],
  tr: [
    rule("Objeto e justificativa", ["objeto", "justificativa"], "Objeto e justificativa aparecem.", "O TR precisa apresentar objeto e justificativa da contratacao."),
    rule("Especificacoes tecnicas", ["especificacao", "requisito", "tecnico"], "Ha requisitos ou especificacoes.", "Faltam especificacoes tecnicas ou requisitos verificaveis."),
    rule("Execucao e entrega", ["execucao", "entrega", "prazo", "local"], "Forma de execucao ou entrega foi tratada.", "O TR precisa detalhar execucao, entrega, local ou prazo."),
    rule("Recebimento e aceitacao", ["recebimento", "aceitacao", "atesto"], "Criterios de recebimento aparecem.", "Faltam criterios de recebimento, aceite ou atesto."),
    rule("Fiscalizacao", ["fiscalizacao", "gestor", "fiscal"], "Gestao/fiscalizacao foi abordada.", "Falta tratar gestao e fiscalizacao contratual.")
  ],
  edital_licitacao: [
    rule("Modalidade e julgamento", ["modalidade", "julgamento", "pregao", "concorrencia"], "Modalidade ou julgamento aparecem.", "Edital sem modalidade ou criterio de julgamento e incompleto."),
    rule("Participacao e propostas", ["participacao", "proposta", "credenciamento"], "Ha regras de participacao/proposta.", "Faltam regras de participacao, credenciamento ou proposta."),
    rule("Habilitacao", ["habilitacao", "documentacao", "regularidade"], "Habilitacao foi mencionada.", "Faltam regras de habilitacao/documentacao."),
    rule("Impugnacao e recursos", ["impugnacao", "recurso", "esclarecimento"], "Impugnacao, esclarecimentos ou recursos aparecem.", "Faltam regras de impugnacao, esclarecimentos ou recursos."),
    rule("Anexos", ["anexo", "termo de referencia", "minuta de contrato"], "Anexos foram previstos.", "O edital deve listar anexos e indicar pendencias.")
  ],
  mapa_riscos: [
    rule("Matriz de riscos", ["matriz", "risco", "probabilidade", "impacto"], "A matriz de riscos foi tratada.", "Falta matriz com probabilidade e impacto."),
    rule("Causas e consequencias", ["causa", "consequencia"], "Causas ou consequencias aparecem.", "Cada risco deve ter causa e consequencia."),
    rule("Medidas preventivas", ["preventiva", "prevencao", "mitigacao"], "Ha medidas preventivas.", "Faltam medidas preventivas ou mitigadoras."),
    rule("Contingencia", ["contingencia", "corretiva", "resposta"], "Ha resposta ou contingencia.", "Faltam medidas de contingencia/resposta."),
    rule("Responsaveis", ["responsavel", "fiscal", "gestor", "setor"], "Responsaveis foram indicados.", "Faltam responsaveis por monitoramento.")
  ],
  processo_dispensa: [
    rule("Hipotese informada", ["dispensa", "inexigibilidade", "fundamento", "hipotese"], "A hipotese foi mencionada.", "Falta indicar a hipotese ou fundamento informado."),
    rule("Necessidade", ["necessidade", "justificativa", "demanda"], "Necessidade/justificativa foi tratada.", "Falta justificar a necessidade da contratacao direta."),
    rule("Fornecedor", ["fornecedor", "escolha", "contratada"], "Fornecedor ou razao de escolha foi abordado.", "Falta razao da escolha do fornecedor ou pendencia expressa."),
    rule("Preco", ["preco", "valor", "pesquisa"], "Preco ou pesquisa foram mencionados.", "Falta justificativa de preco ou pesquisa de precos."),
    rule("Documentos pendentes", ["pendente", "habilitacao", "parecer", "autorizacao"], "Pendencias/documentos foram indicados.", "Faltam documentos instrutorios e pendencias para validacao.")
  ],
  pesquisa_precos: [
    rule("Fontes", ["fonte", "cotacao", "pncp", "painel de precos", "contrato similar"], "Fontes de pesquisa aparecem.", "Faltam fontes de pesquisa ou sua identificacao."),
    rule("Metodologia", ["metodologia", "media", "mediana", "outlier"], "Metodologia foi tratada.", "Falta explicar metodologia de composicao do preco."),
    rule("Tabela ou comparativo", ["tabela", "comparativo", "valor"], "Ha tabela/comparativo ou valores.", "Falta tabela ou comparativo com dados informados."),
    rule("Analise critica", ["analise critica", "justificativa", "limitacao"], "Analise critica foi mencionada.", "Falta analise critica dos precos e limitacoes."),
    rule("Preco estimado", ["preco estimado", "valor estimado", "estimativa"], "Preco estimado aparece.", "Falta conclusao sobre preco estimado ou pendencia equivalente.")
  ],
  parecer_juridico: [
    rule("Relatorio", ["relatorio", "processo", "documentos"], "Relatorio/documentos aparecem.", "Falta relatorio ou identificacao dos documentos analisados."),
    rule("Delimitacao", ["delimitacao", "limites da analise", "analise"], "Delimitacao da analise foi mencionada.", "Falta delimitar o alcance da analise juridica."),
    rule("Fundamentacao cautelosa", ["fundamentacao", "lei", "juridica"], "Fundamentacao aparece.", "Falta fundamentacao preliminar ou referencia juridica geral."),
    rule("Pendencias", ["pendente", "ressalva", "condicionante"], "Pendencias/ressalvas aparecem.", "Parecer sem pendencias ou ressalvas pode transmitir seguranca indevida."),
    rule("Conclusao condicionada", ["conclusao", "condicionada", "ressalva"], "Conclusao condicionada aparece.", "Falta conclusao cautelosa e condicionada.")
  ],
  decreto_portaria: [
    rule("Tipo de ato", ["decreto", "portaria"], "Tipo de ato foi identificado.", "Falta identificar se o ato e decreto ou portaria."),
    rule("Ementa", ["ementa", "dispoe", "institui", "nomeia"], "Ementa ou comando inicial aparece.", "Falta ementa objetiva."),
    rule("Fundamentos", ["considerando", "fundamento", "competencia"], "Fundamentos/considerandos aparecem.", "Faltam fundamentos ou competencia da autoridade."),
    rule("Dispositivos", ["art.", "artigo", "resolve", "decreta"], "Dispositivos normativos aparecem.", "Faltam artigos ou comandos normativos."),
    rule("Vigencia e publicacao", ["vigencia", "publicacao", "entra em vigor"], "Vigencia/publicacao aparecem.", "Falta clausula de vigencia e publicacao.")
  ],
  minuta_contrato: [
    rule("Partes e objeto", ["contratante", "contratada", "objeto"], "Partes/objeto aparecem.", "Falta identificar partes ou objeto."),
    rule("Valor, prazo e vigencia", ["valor", "prazo", "vigencia"], "Valor/prazo/vigencia aparecem.", "Faltam valor, prazo ou vigencia."),
    rule("Obrigacoes", ["obrigacoes", "contratada", "contratante"], "Obrigacoes foram tratadas.", "Faltam obrigacoes da contratada e contratante."),
    rule("Fiscalizacao e pagamento", ["fiscalizacao", "pagamento", "atesto"], "Fiscalizacao ou pagamento aparecem.", "Faltam regras de fiscalizacao e pagamento."),
    rule("Sancoes e rescisao", ["sancoes", "rescisao", "penalidade"], "Sancoes/rescisao aparecem.", "Faltam sancoes, penalidades ou rescisao.")
  ],
  projeto_lei: [
    rule("Ementa", ["ementa", "dispoe", "institui"], "Ementa aparece.", "Falta ementa do projeto."),
    rule("Articulado", ["art.", "artigo"], "Articulado aparece.", "Faltam artigos do projeto de lei."),
    rule("Vigencia", ["vigencia", "entra em vigor"], "Clausula de vigencia aparece.", "Falta clausula de vigencia."),
    rule("Justificativa", ["justificativa", "interesse publico"], "Justificativa aparece.", "Falta justificativa legislativa."),
    rule("Impacto/competencia", ["impacto", "competencia", "iniciativa", "pendente"], "Impacto/competencia foram considerados.", "Avaliar competencia, iniciativa e impacto orcamentario.")
  ],
  requerimento_legislativo: [
    rule("Autor e destinatario", ["autor", "vereador", "destinatario", "senhor"], "Autor/destinatario aparecem.", "Falta autor ou destinatario."),
    rule("Pedido claro", ["requer", "indica", "solicita"], "Pedido legislativo aparece.", "Falta pedido claro."),
    rule("Justificativa", ["justificativa", "considerando", "interesse publico"], "Justificativa aparece.", "Falta justificativa do pedido."),
    rule("Encaminhamento", ["encaminhe", "oficie", "mesa diretora", "prefeito"], "Encaminhamento aparece.", "Falta encaminhamento adequado."),
    rule("Tipo da peca", ["requerimento", "indicacao"], "Tipo da peca aparece.", "Falta identificar se e requerimento ou indicacao.")
  ],
  parecer_comissao: [
    rule("Comissao e proposicao", ["comissao", "projeto", "proposicao"], "Comissao/proposicao aparecem.", "Falta comissao ou proposicao analisada."),
    rule("Relatorio", ["relatorio"], "Relatorio aparece.", "Falta relatorio da materia."),
    rule("Analise", ["analise", "merito", "constitucionalidade"], "Analise aparece.", "Falta analise da comissao."),
    rule("Voto", ["voto", "relator"], "Voto do relator aparece.", "Falta voto do relator ou pendencia equivalente."),
    rule("Conclusao", ["conclusao", "favoravel", "contrario"], "Conclusao aparece.", "Falta conclusao do parecer.")
  ],
  emenda_parlamentar: [
    rule("Tipo de emenda", ["modificativa", "aditiva", "supressiva", "substitutiva"], "Tipo de emenda aparece.", "Falta tipo da emenda."),
    rule("Proposicao original", ["projeto", "proposicao"], "Proposicao original aparece.", "Falta proposicao original."),
    rule("Dispositivo afetado", ["art.", "artigo", "inciso", "paragrafo", "dispositivo"], "Dispositivo afetado aparece.", "Falta dispositivo afetado."),
    rule("Redacao proposta", ["redacao", "passa a vigorar", "acrescente-se", "suprima-se"], "Redacao proposta aparece.", "Falta redacao proposta."),
    rule("Justificativa", ["justificativa"], "Justificativa aparece.", "Falta justificativa da emenda.")
  ],
  justificativa_projeto_lei: [
    rule("Problema publico", ["problema", "necessidade", "contexto"], "Problema/contexto aparece.", "Falta contextualizar o problema publico."),
    rule("Finalidade", ["finalidade", "objetivo", "proposta"], "Finalidade aparece.", "Falta explicar a finalidade da proposta."),
    rule("Beneficiarios", ["beneficiario", "populacao", "municipio", "cidadao"], "Beneficiarios aparecem.", "Falta indicar beneficiarios ou impacto social."),
    rule("Interesse publico", ["interesse publico", "relevancia", "beneficio"], "Interesse publico aparece.", "Falta demonstrar interesse publico."),
    rule("Pedido de apoio", ["aprovacao", "apoio", "apreciacao"], "Pedido de apoio aparece.", "Falta fechamento pedindo apreciacao ou apoio.")
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
      ? "Foi identificado conteudo relacionado a esta secao."
      : "Nao foi identificado conteudo claro para esta secao esperada."
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
      detail: `O texto contem expressao que pode transmitir conclusao indevida: "${claim}". Revise a cautela da redacao.`
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
    "_Checklist automatico por regras. Nao substitui revisao tecnica, juridica ou legislativa._"
  ].join("\n");
}
