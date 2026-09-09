import { DocumentKind, documentDefinitions } from "./document-types";

export type ReadinessStatus = "suficiente" | "insuficiente";
export type ReadinessRisk = "baixo" | "medio" | "alto";

export type ReadinessQuestion = {
  campo: string;
  pergunta: string;
  motivo: string;
};

export type ReadinessResult = {
  status: ReadinessStatus;
  risco: ReadinessRisk;
  resumo: string;
  perguntas: ReadinessQuestion[];
  alertas: string[];
  source: "local" | "openai" | "mixed";
};

type ReadinessInput = {
  kind: DocumentKind;
  values: Record<string, string>;
  institution?: Record<string, string>;
};

const criticalFieldsByKind: Record<DocumentKind, string[]> = {
  etp: ["objeto", "problema", "requisitos", "alternativas", "solucao", "quantidade"],
  tr: ["objeto", "problema", "especificacoes", "execucao", "gestao"],
  edital_licitacao: ["objeto", "problema", "modalidade", "julgamento"],
  mapa_riscos: ["objeto", "problema", "etapas", "riscos"],
  processo_dispensa: ["objeto", "problema", "fundamento", "fornecedor", "preco"],
  pesquisa_precos: ["objeto", "fontes", "metodologia", "resultado"],
  parecer_juridico: ["objeto", "processo", "documentos", "duvidas"],
  decreto_portaria: ["orgao", "tipo_ato", "assunto", "fundamentos", "conteudo"],
  minuta_contrato: ["objeto", "problema", "contratada", "regime", "pagamento", "valor", "prazo"],
  projeto_lei: ["autor", "tema", "objetivo", "impacto"],
  requerimento_legislativo: ["autor", "tipo", "destinatario", "pedido", "justificativa"],
  parecer_comissao: ["comissao", "proposicao", "ementa", "posicao"],
  emenda_parlamentar: ["autor", "tipo_emenda", "proposicao", "dispositivo", "redacao"],
  justificativa_projeto_lei: ["autor", "tema", "objetivo", "beneficiarios", "argumentos"],
  trt: ["orgao", "contrato", "contratada", "responsavel_tecnico", "objeto", "escopo_responsabilidade"]
};

const fieldQuestions: Record<string, string> = {
  objeto: "Qual é o objeto exato do documento ou da contratação?",
  problema: "Qual necessidade pública, problema administrativo ou contexto concreto justifica este documento?",
  requisitos: "Quais requisitos mínimos a solução precisa atender?",
  alternativas: "Quais alternativas foram consideradas ou devem ser comparadas?",
  solucao: "Qual solução parece mais adequada e por qual motivo?",
  quantidade: "Qual a quantidade estimada e como ela foi calculada?",
  especificacoes: "Quais especificações técnicas ou funcionais devem constar no documento?",
  execucao: "Como será a entrega ou execução do objeto?",
  gestao: "Como será feita a gestão, fiscalização, recebimento ou atesto?",
  modalidade: "Qual modalidade de licitação será usada?",
  julgamento: "Qual critério de julgamento será adotado?",
  etapas: "Quais etapas do processo ou da contratação merecem análise de risco?",
  riscos: "Quais riscos já são conhecidos pela equipe?",
  fundamento: "Qual hipótese ou fundamento está sendo considerado para a contratação direta?",
  fornecedor: "Há fornecedor pretendido? Qual a razão preliminar da escolha?",
  preco: "Como o preço foi justificado ou pesquisado?",
  fontes: "Quais fontes de pesquisa de preços foram consultadas?",
  metodologia: "Qual metodologia será usada para compor o preço estimado?",
  resultado: "Quais valores encontrados ou qual resultado preliminar da pesquisa?",
  processo: "Qual é o número ou identificação do processo administrativo?",
  documentos: "Quais documentos foram analisados ou instruem o processo?",
  duvidas: "Quais pontos jurídicos, riscos ou documentos ausentes devem ser avaliados?",
  orgao: "Qual órgão ou autoridade emitirá o ato?",
  tipo_ato: "O ato será decreto ou portaria?",
  assunto: "Qual assunto o ato deve regular ou formalizar?",
  fundamentos: "Quais fundamentos legais, competência ou processo embasam o ato?",
  conteudo: "Quais comandos o ato deve estabelecer?",
  contratada: "Quem é a contratada ou essa informação ainda está pendente?",
  regime: "Qual será o regime ou forma de execução contratual?",
  pagamento: "Quais condições de pagamento, medição e atesto devem constar?",
  valor: "Qual valor estimado, limite ou valor contratual?",
  prazo: "Qual prazo de entrega, execução ou vigência?",
  autor: "Quem é o autor ou proponente?",
  tema: "Qual é o tema central da proposição?",
  objetivo: "Qual objetivo concreto a proposição pretende alcançar?",
  impacto: "Há impacto financeiro, administrativo ou social previsto?",
  tipo: "A peça será requerimento, indicação ou pedido de informação?",
  destinatario: "A quem o pedido ou indicação será encaminhado?",
  pedido: "Qual providência, informação ou encaminhamento está sendo solicitado?",
  justificativa: "Qual justificativa sustenta o pedido?",
  comissao: "Qual comissão emitirá o parecer?",
  proposicao: "Qual proposição original será analisada ou alterada?",
  ementa: "Qual é a ementa ou resumo da matéria?",
  posicao: "O voto tende a ser favorável, contrário ou com ressalvas?",
  tipo_emenda: "Qual tipo de emenda será apresentada?",
  dispositivo: "Qual dispositivo será alterado, acrescido ou suprimido?",
  redacao: "Qual redação proposta deve constar na emenda?",
  beneficiarios: "Quem será beneficiado pela proposta?",
  argumentos: "Quais argumentos principais devem sustentar a justificativa?",
  contrato: "Qual contrato, ata, empenho ou processo administrativo será relacionado ao termo?",
  responsavel_tecnico: "Quem é o responsável técnico e qual registro profissional ou vínculo deve constar?",
  escopo_responsabilidade: "Qual atividade, entrega ou serviço fica sob responsabilidade técnica?",
  periodo_execucao: "Qual período, etapa, medição ou vigência o termo deve abranger?",
  evidencias: "Quais evidências, laudos, relatórios, ART/RRT ou documentos comprovam a execução?",
  declaracoes: "Quais declarações devem ser assumidas pelo responsável técnico ou pela contratada?",
  validacao_administracao: "Como a Administração fará ciência, fiscalização, validação ou recebimento relacionado ao termo?"
};

function hasValue(values: Record<string, string>, key: string) {
  return Boolean(values[key]?.trim());
}

function questionFor(field: string): ReadinessQuestion {
  return {
    campo: field,
    pergunta: fieldQuestions[field] || `Informe o dado referente a ${field}.`,
    motivo: "Informação importante para reduzir lacunas e evitar que a IA complete o documento com suposições."
  };
}

export function assessLocalReadiness({ kind, values, institution }: ReadinessInput): ReadinessResult {
  const definition = documentDefinitions[kind];
  const requiredMissing = definition.fields.filter((field) => field.required && !hasValue(values, field.key));
  const criticalMissing = criticalFieldsByKind[kind].filter((field) => !hasValue(values, field));
  const uniqueMissing = Array.from(new Set([...requiredMissing.map((field) => field.key), ...criticalMissing]));
  const hasInstitution = Boolean(
    values.municipio_uf?.trim() ||
      values.orgao_entidade?.trim() ||
      values.responsavel_cargo?.trim() ||
      institution?.headerTemplate?.trim()
  );
  const alertas = [
    ...requiredMissing.map((field) => `Campo obrigatório não informado: ${field.label}.`),
    ...criticalMissing.map((field) => `Dado crítico ausente: ${field}.`),
    ...(hasInstitution ? [] : ["Não há identificação institucional estruturada nem cabeçalho informado."])
  ];
  const highRisk = requiredMissing.length > 0 || criticalMissing.length >= 3;
  const mediumRisk = criticalMissing.length > 0 || !hasInstitution;
  const risco: ReadinessRisk = highRisk ? "alto" : mediumRisk ? "medio" : "baixo";

  return {
    status: highRisk ? "insuficiente" : "suficiente",
    risco,
    resumo:
      highRisk
        ? "As informações ainda não são suficientes para gerar uma minuta confiável."
        : mediumRisk
          ? "É possível gerar, mas existem lacunas que podem resultar em pendências no texto."
          : "As informações parecem suficientes para uma minuta preliminar.",
    perguntas: uniqueMissing.map(questionFor),
    alertas,
    source: "local"
  };
}

export function buildReadinessPrompt(input: ReadinessInput) {
  const definition = documentDefinitions[input.kind];

  return [
    "Você é um revisor de entrada de dados para geração de documentos públicos brasileiros.",
    "Não gere a minuta. Avalie apenas se há informações suficientes para gerar com baixo risco de alucinação.",
    "Responda somente em JSON válido, sem markdown.",
    "",
    "Formato obrigatório:",
    '{"status":"suficiente|insuficiente","risco":"baixo|medio|alto","resumo":"texto curto","perguntas":[{"campo":"nome","pergunta":"texto","motivo":"texto"}],"alertas":["texto"]}',
    "",
    `Tipo documental: ${definition.name}`,
    `Seções esperadas: ${definition.sections.join("; ")}`,
    `Campos do formulário: ${definition.fields.map((field) => `${field.key}${field.required ? " (obrigatório)" : ""}`).join("; ")}`,
    `Dados críticos locais: ${criticalFieldsByKind[input.kind].join("; ")}`,
    "",
    "Regras:",
    "- Se faltarem dados essenciais para o tipo documental, status deve ser insuficiente.",
    "- Se for possível gerar apenas com várias pendências, risco deve ser médio ou alto.",
    "- Faça perguntas objetivas que o usuário consiga responder no formulário.",
    "- Não peça documentos impossíveis; peça informações práticas.",
    "- Não invente fatos, valores, leis locais, fontes ou fundamentos.",
    "",
    "Configuração/cabeçalho:",
    JSON.stringify(input.institution || {}, null, 2),
    "",
    "Dados informados:",
    JSON.stringify(input.values || {}, null, 2)
  ].join("\n");
}

function normalizeRisk(value: unknown): ReadinessRisk {
  return value === "baixo" || value === "medio" || value === "alto" ? value : "medio";
}

function normalizeStatus(value: unknown): ReadinessStatus {
  return value === "suficiente" ? "suficiente" : "insuficiente";
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeQuestions(value: unknown): ReadinessQuestion[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = item as Partial<ReadinessQuestion>;

      if (typeof question.pergunta !== "string" || !question.pergunta.trim()) return null;

      return {
        campo: typeof question.campo === "string" ? question.campo : "informação",
        pergunta: question.pergunta,
        motivo: typeof question.motivo === "string" ? question.motivo : "Informação necessária para reduzir lacunas."
      };
    })
    .filter((item): item is ReadinessQuestion => Boolean(item));
}

export function parseAIReadiness(text: string): Omit<ReadinessResult, "source"> | null {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    return {
      status: normalizeStatus(parsed.status),
      risco: normalizeRisk(parsed.risco),
      resumo: typeof parsed.resumo === "string" ? parsed.resumo : "Validação concluída.",
      perguntas: normalizeQuestions(parsed.perguntas),
      alertas: asStringArray(parsed.alertas)
    };
  } catch {
    return null;
  }
}

export function mergeReadiness(local: ReadinessResult, ai: Omit<ReadinessResult, "source"> | null): ReadinessResult {
  if (!ai) return local;

  const riskOrder: ReadinessRisk[] = ["baixo", "medio", "alto"];
  const risco = riskOrder.indexOf(ai.risco) > riskOrder.indexOf(local.risco) ? ai.risco : local.risco;
  const status = local.status === "insuficiente" || ai.status === "insuficiente" || risco === "alto" ? "insuficiente" : "suficiente";
  const questions = [...local.perguntas, ...ai.perguntas].filter(
    (question, index, all) => all.findIndex((item) => item.pergunta === question.pergunta) === index
  );

  return {
    status,
    risco,
    resumo: ai.resumo || local.resumo,
    perguntas: questions.slice(0, 8),
    alertas: Array.from(new Set([...local.alertas, ...ai.alertas])).slice(0, 10),
    source: "mixed"
  };
}
