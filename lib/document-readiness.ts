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
  justificativa_projeto_lei: ["autor", "tema", "objetivo", "beneficiarios", "argumentos"]
};

const fieldQuestions: Record<string, string> = {
  objeto: "Qual e o objeto exato do documento ou da contratacao?",
  problema: "Qual necessidade publica, problema administrativo ou contexto concreto justifica este documento?",
  requisitos: "Quais requisitos minimos a solucao precisa atender?",
  alternativas: "Quais alternativas foram consideradas ou devem ser comparadas?",
  solucao: "Qual solucao parece mais adequada e por qual motivo?",
  quantidade: "Qual a quantidade estimada e como ela foi calculada?",
  especificacoes: "Quais especificacoes tecnicas ou funcionais devem constar no documento?",
  execucao: "Como sera a entrega ou execucao do objeto?",
  gestao: "Como sera feita a gestao, fiscalizacao, recebimento ou atesto?",
  modalidade: "Qual modalidade de licitacao sera usada?",
  julgamento: "Qual criterio de julgamento sera adotado?",
  etapas: "Quais etapas do processo ou da contratacao merecem analise de risco?",
  riscos: "Quais riscos ja sao conhecidos pela equipe?",
  fundamento: "Qual hipotese ou fundamento esta sendo considerado para a contratacao direta?",
  fornecedor: "Ha fornecedor pretendido? Qual a razao preliminar da escolha?",
  preco: "Como o preco foi justificado ou pesquisado?",
  fontes: "Quais fontes de pesquisa de precos foram consultadas?",
  metodologia: "Qual metodologia sera usada para compor o preco estimado?",
  resultado: "Quais valores encontrados ou qual resultado preliminar da pesquisa?",
  processo: "Qual e o numero ou identificacao do processo administrativo?",
  documentos: "Quais documentos foram analisados ou instruem o processo?",
  duvidas: "Quais pontos juridicos, riscos ou documentos ausentes devem ser avaliados?",
  orgao: "Qual orgao ou autoridade emitira o ato?",
  tipo_ato: "O ato sera decreto ou portaria?",
  assunto: "Qual assunto o ato deve regular ou formalizar?",
  fundamentos: "Quais fundamentos legais, competencia ou processo embasam o ato?",
  conteudo: "Quais comandos o ato deve estabelecer?",
  contratada: "Quem e a contratada ou essa informacao ainda esta pendente?",
  regime: "Qual sera o regime ou forma de execucao contratual?",
  pagamento: "Quais condicoes de pagamento, medicao e atesto devem constar?",
  valor: "Qual valor estimado, limite ou valor contratual?",
  prazo: "Qual prazo de entrega, execucao ou vigencia?",
  autor: "Quem e o autor ou proponente?",
  tema: "Qual e o tema central da proposicao?",
  objetivo: "Qual objetivo concreto a proposicao pretende alcancar?",
  impacto: "Ha impacto financeiro, administrativo ou social previsto?",
  tipo: "A peca sera requerimento, indicacao ou pedido de informacao?",
  destinatario: "A quem o pedido ou indicacao sera encaminhado?",
  pedido: "Qual providencia, informacao ou encaminhamento esta sendo solicitado?",
  justificativa: "Qual justificativa sustenta o pedido?",
  comissao: "Qual comissao emitira o parecer?",
  proposicao: "Qual proposicao original sera analisada ou alterada?",
  ementa: "Qual e a ementa ou resumo da materia?",
  posicao: "O voto tende a ser favoravel, contrario ou com ressalvas?",
  tipo_emenda: "Qual tipo de emenda sera apresentada?",
  dispositivo: "Qual dispositivo sera alterado, acrescido ou suprimido?",
  redacao: "Qual redacao proposta deve constar na emenda?",
  beneficiarios: "Quem sera beneficiado pela proposta?",
  argumentos: "Quais argumentos principais devem sustentar a justificativa?"
};

function hasValue(values: Record<string, string>, key: string) {
  return Boolean(values[key]?.trim());
}

function questionFor(field: string): ReadinessQuestion {
  return {
    campo: field,
    pergunta: fieldQuestions[field] || `Informe o dado referente a ${field}.`,
    motivo: "Informacao importante para reduzir lacunas e evitar que a IA complete o documento com suposicoes."
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
    ...requiredMissing.map((field) => `Campo obrigatorio nao informado: ${field.label}.`),
    ...criticalMissing.map((field) => `Dado critico ausente: ${field}.`),
    ...(hasInstitution ? [] : ["Nao ha identificacao institucional estruturada nem cabecalho informado."])
  ];
  const highRisk = requiredMissing.length > 0 || criticalMissing.length >= 3;
  const mediumRisk = criticalMissing.length > 0 || !hasInstitution;
  const risco: ReadinessRisk = highRisk ? "alto" : mediumRisk ? "medio" : "baixo";

  return {
    status: highRisk ? "insuficiente" : "suficiente",
    risco,
    resumo:
      highRisk
        ? "As informacoes ainda nao sao suficientes para gerar uma minuta confiavel."
        : mediumRisk
          ? "E possivel gerar, mas existem lacunas que podem resultar em pendencias no texto."
          : "As informacoes parecem suficientes para uma minuta preliminar.",
    perguntas: uniqueMissing.map(questionFor),
    alertas,
    source: "local"
  };
}

export function buildReadinessPrompt(input: ReadinessInput) {
  const definition = documentDefinitions[input.kind];

  return [
    "Voce e um revisor de entrada de dados para geracao de documentos publicos brasileiros.",
    "Nao gere a minuta. Avalie apenas se ha informacoes suficientes para gerar com baixo risco de alucinacao.",
    "Responda somente em JSON valido, sem markdown.",
    "",
    "Formato obrigatorio:",
    '{"status":"suficiente|insuficiente","risco":"baixo|medio|alto","resumo":"texto curto","perguntas":[{"campo":"nome","pergunta":"texto","motivo":"texto"}],"alertas":["texto"]}',
    "",
    `Tipo documental: ${definition.name}`,
    `Secoes esperadas: ${definition.sections.join("; ")}`,
    `Campos do formulario: ${definition.fields.map((field) => `${field.key}${field.required ? " (obrigatorio)" : ""}`).join("; ")}`,
    `Dados criticos locais: ${criticalFieldsByKind[input.kind].join("; ")}`,
    "",
    "Regras:",
    "- Se faltarem dados essenciais para o tipo documental, status deve ser insuficiente.",
    "- Se for possivel gerar apenas com varias pendencias, risco deve ser medio ou alto.",
    "- Faca perguntas objetivas que o usuario consiga responder no formulario.",
    "- Nao peça documentos impossiveis; peça informacoes praticas.",
    "- Nao invente fatos, valores, leis locais, fontes ou fundamentos.",
    "",
    "Configuracao/cabecalho:",
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
        campo: typeof question.campo === "string" ? question.campo : "informacao",
        pergunta: question.pergunta,
        motivo: typeof question.motivo === "string" ? question.motivo : "Informacao necessaria para reduzir lacunas."
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
      resumo: typeof parsed.resumo === "string" ? parsed.resumo : "Validacao concluida.",
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
