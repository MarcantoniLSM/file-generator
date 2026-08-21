export type MarketingPage = {
  slug: string;
  title: string;
  category: "Executivo" | "Legislativo" | "Modelos" | "Ferramentas";
  description: string;
  cta: string;
};

export const executivePages: MarketingPage[] = [
  {
    slug: "gerador-etp",
    title: "Gerador de Estudo Tecnico Preliminar (ETP) Lei 14.133",
    category: "Executivo",
    description: "Estruture necessidades, alternativas, riscos e conclusao de viabilidade para compras municipais.",
    cta: "Gerar ETP"
  },
  {
    slug: "gerador-termo-de-referencia",
    title: "Gerador de Termo de Referencia (TR) Automatico",
    category: "Executivo",
    description: "Transforme a demanda em requisitos, condicoes de entrega, fiscalizacao e criterios de aceitacao.",
    cta: "Gerar TR"
  },
  {
    slug: "gerador-edital-licitacao",
    title: "Gerador de Minutas de Edital de Licitacao",
    category: "Executivo",
    description: "Prepare uma base inicial de edital com campos controlados e pendencias para revisao tecnica.",
    cta: "Preparar edital"
  },
  {
    slug: "gerador-mapa-de-riscos",
    title: "Gerador de Mapa e Matriz de Riscos para Licitacoes",
    category: "Executivo",
    description: "Mapeie riscos, probabilidade, impacto, medidas preventivas e responsaveis.",
    cta: "Mapear riscos"
  },
  {
    slug: "gerador-pesquisa-de-precos",
    title: "Automacao de Relatorio de Pesquisa de Precos Publicos",
    category: "Executivo",
    description: "Organize fontes, metodologia, analise critica e justificativa de preco para o processo.",
    cta: "Montar relatorio"
  },
  {
    slug: "gerador-minuta-de-contrato",
    title: "Gerador de Minutas de Contratos Administrativos",
    category: "Executivo",
    description: "Crie uma primeira minuta de contrato com objeto, prazos, obrigacoes e gestao contratual.",
    cta: "Gerar contrato"
  },
  {
    slug: "gerador-parecer-juridico",
    title: "Gerador de Minuta de Parecer Juridico de Compras",
    category: "Executivo",
    description: "Elabore uma minuta preliminar para revisao da assessoria juridica responsavel.",
    cta: "Preparar parecer"
  },
  {
    slug: "gerador-processo-dispensa",
    title: "Gerador de Processo de Dispensa e Inexigibilidade",
    category: "Executivo",
    description: "Organize justificativa, fornecedor, preco, riscos e encaminhamentos da contratacao direta.",
    cta: "Gerar processo"
  },
  {
    slug: "gerador-decreto-executivo",
    title: "Gerador de Decretos Municipais e Portarias",
    category: "Executivo",
    description: "Apoie a construcao de atos normativos municipais com estrutura revisavel.",
    cta: "Gerar ato"
  }
];

export const legislativePages: MarketingPage[] = [
  {
    slug: "gerador-projeto-de-lei",
    title: "Gerador de Projetos de Lei (PL) com IA",
    category: "Legislativo",
    description: "Crie minutas de proposicoes com ementa, articulado, clausulas finais e justificativa.",
    cta: "Gerar PL"
  },
  {
    slug: "gerador-justificativa-projeto-de-lei",
    title: "Gerador de Justificativa para Projeto de Lei",
    category: "Legislativo",
    description: "Transforme objetivos e impacto publico em justificativa formal para proposicoes legislativas.",
    cta: "Gerar justificativa"
  },
  {
    slug: "gerador-parecer-comissao",
    title: "Gerador de Parecer de Comissao Legislativa",
    category: "Legislativo",
    description: "Estruture relatorio, analise preliminar, voto e conclusao para comissoes.",
    cta: "Gerar parecer"
  },
  {
    slug: "gerador-emenda-parlamentar",
    title: "Gerador de Emendas Modificativas e Aditivas",
    category: "Legislativo",
    description: "Prepare emendas com identificacao do dispositivo, nova redacao e justificativa.",
    cta: "Gerar emenda"
  },
  {
    slug: "gerador-requerimento-legislativo",
    title: "Gerador de Requerimentos e Indicacoes Parlamentares",
    category: "Legislativo",
    description: "Redija pedidos, indicacoes e encaminhamentos em linguagem parlamentar objetiva.",
    cta: "Gerar requerimento"
  }
];

export const modelPages: MarketingPage[] = [
  {
    slug: "etp-compra-merenda-escolar",
    title: "Modelo de ETP para Aquisicao de Merenda Escolar",
    category: "Modelos",
    description: "Modelo editavel para planejamento de aquisicao de generos alimenticios da rede municipal.",
    cta: "Usar modelo"
  },
  {
    slug: "tr-servicos-de-limpeza",
    title: "Modelo de Termo de Referencia para Servicos de Limpeza",
    category: "Modelos",
    description: "Estrutura inicial para servicos continuados de limpeza em predios publicos.",
    cta: "Usar modelo"
  },
  {
    slug: "tr-locacao-de-veiculos",
    title: "Modelo de TR para Locacao de Veiculos Municipais",
    category: "Modelos",
    description: "Base editavel para locacao de veiculos destinados a secretarias e unidades municipais.",
    cta: "Usar modelo"
  },
  {
    slug: "projeto-de-lei-utilidade-publica",
    title: "Modelo de Projeto de Lei de Utilidade Publica",
    category: "Modelos",
    description: "Estrutura de proposicao legislativa para declaracao de utilidade publica.",
    cta: "Usar modelo"
  }
];

export const toolPages: MarketingPage[] = [
  {
    slug: "calculadora-limite-dispensa",
    title: "Calculadora de Limites de Dispensa de Licitacao Atualizados",
    category: "Ferramentas",
    description: "Ferramenta planejada para apoiar conferencias preliminares de limites e enquadramentos.",
    cta: "Abrir calculadora"
  },
  {
    slug: "consultador-prazos-lei-14133",
    title: "Calculadora de Prazos Processuais da Lei 14.133/21",
    category: "Ferramentas",
    description: "Planejada para organizar prazos, marcos e alertas de processos de contratacao.",
    cta: "Consultar prazos"
  },
  {
    slug: "validador-redacao-legislativa",
    title: "Validador Gratuito de Regras da Lei Complementar 95/98",
    category: "Ferramentas",
    description: "Planejado para apontar problemas formais de tecnica legislativa em minutas.",
    cta: "Validar redacao"
  }
];

export const allTopLevelPages = [...executivePages, ...legislativePages];
export const allMarketingPages = [...allTopLevelPages, ...modelPages, ...toolPages];

export function findTopLevelPage(slug: string) {
  return allTopLevelPages.find((page) => page.slug === slug);
}

export function findModelPage(slug: string) {
  return modelPages.find((page) => page.slug === slug);
}

export function findToolPage(slug: string) {
  return toolPages.find((page) => page.slug === slug);
}
