import type { DocumentKind } from "./document-types";

export type MarketingPage = {
  slug: string;
  title: string;
  category: "Executivo" | "Legislativo" | "Modelos" | "Ferramentas";
  description: string;
  cta: string;
  documentKind?: DocumentKind;
};

export const executivePages: MarketingPage[] = [
  {
    slug: "gerador-etp",
    title: "Gerador de Estudo Técnico Preliminar (ETP) Lei 14.133",
    category: "Executivo",
    description: "Estruture necessidades, alternativas, riscos e conclusão de viabilidade para compras municipais.",
    cta: "Gerar ETP",
    documentKind: "etp"
  },
  {
    slug: "gerador-termo-de-referencia",
    title: "Gerador de Termo de Referência (TR) Automático",
    category: "Executivo",
    description: "Transforme a demanda em requisitos, condições de entrega, fiscalização e critérios de aceitação.",
    cta: "Gerar TR",
    documentKind: "tr"
  },
  {
    slug: "gerador-edital-licitacao",
    title: "Gerador de Minutas de Edital de Licitação",
    category: "Executivo",
    description: "Prepare uma base inicial de edital com campos controlados e pendências para revisão técnica.",
    cta: "Preparar edital",
    documentKind: "edital_licitacao"
  },
  {
    slug: "gerador-mapa-de-riscos",
    title: "Gerador de Mapa e Matriz de Riscos para Licitações",
    category: "Executivo",
    description: "Mapeie riscos, probabilidade, impacto, medidas preventivas e responsáveis.",
    cta: "Mapear riscos",
    documentKind: "mapa_riscos"
  },
  {
    slug: "gerador-pesquisa-de-precos",
    title: "Automação de Relatório de Pesquisa de Preços Públicos",
    category: "Executivo",
    description: "Organize fontes, metodologia, análise crítica e justificativa de preço para o processo.",
    cta: "Montar relatório",
    documentKind: "pesquisa_precos"
  },
  {
    slug: "gerador-minuta-de-contrato",
    title: "Gerador de Minutas de Contratos Administrativos",
    category: "Executivo",
    description: "Crie uma primeira minuta de contrato com objeto, prazos, obrigações e gestão contratual.",
    cta: "Gerar contrato",
    documentKind: "minuta_contrato"
  },
  {
    slug: "gerador-parecer-juridico",
    title: "Gerador de Minuta de Parecer Jurídico de Compras",
    category: "Executivo",
    description: "Elabore uma minuta preliminar para revisão da assessoria jurídica responsável.",
    cta: "Preparar parecer",
    documentKind: "parecer_juridico"
  },
  {
    slug: "gerador-processo-dispensa",
    title: "Gerador de Processo de Dispensa e Inexigibilidade",
    category: "Executivo",
    description: "Organize justificativa, fornecedor, preço, riscos e encaminhamentos da contratação direta.",
    cta: "Gerar processo",
    documentKind: "processo_dispensa"
  },
  {
    slug: "gerador-decreto-executivo",
    title: "Gerador de Decretos Municipais e Portarias",
    category: "Executivo",
    description: "Apoie a construcao de atos normativos municipais com estrutura revisavel.",
    cta: "Gerar ato",
    documentKind: "decreto_portaria"
  }
];

export const legislativePages: MarketingPage[] = [
  {
    slug: "gerador-projeto-de-lei",
    title: "Gerador de Projetos de Lei (PL) com IA",
    category: "Legislativo",
    description: "Crie minutas de proposicoes com ementa, articulado, cláusulas finais e justificativa.",
    cta: "Gerar PL",
    documentKind: "projeto_lei"
  },
  {
    slug: "gerador-justificativa-projeto-de-lei",
    title: "Gerador de Justificativa para Projeto de Lei",
    category: "Legislativo",
    description: "Transforme objetivos e impacto publico em justificativa formal para proposicoes legislativas.",
    cta: "Gerar justificativa",
    documentKind: "justificativa_projeto_lei"
  },
  {
    slug: "gerador-parecer-comissão",
    title: "Gerador de Parecer de Comissão Legislativa",
    category: "Legislativo",
    description: "Estruture relatório, análise preliminar, voto e conclusão para comissões.",
    cta: "Gerar parecer",
    documentKind: "parecer_comissao"
  },
  {
    slug: "gerador-emenda-parlamentar",
    title: "Gerador de Emendas Modificativas e Aditivas",
    category: "Legislativo",
    description: "Prepare emendas com identificacao do dispositivo, nova redação e justificativa.",
    cta: "Gerar emenda",
    documentKind: "emenda_parlamentar"
  },
  {
    slug: "gerador-requerimento-legislativo",
    title: "Gerador de Requerimentos e Indicacoes Parlamentares",
    category: "Legislativo",
    description: "Redija pedidos, indicacoes e encaminhamentos em linguagem parlamentar objetiva.",
    cta: "Gerar requerimento",
    documentKind: "requerimento_legislativo"
  }
];

export const modelPages: MarketingPage[] = [
  {
    slug: "etp-compra-merenda-escolar",
    title: "Modelo de ETP para Aquisição de Merenda Escolar",
    category: "Modelos",
    description: "Modelo editável para planejamento de aquisição de gêneros alimentícios da rede municipal.",
    cta: "Usar modelo"
  },
  {
    slug: "tr-servicos-de-limpeza",
    title: "Modelo de Termo de Referência para Serviços de Limpeza",
    category: "Modelos",
    description: "Estrutura inicial para serviços continuados de limpeza em prédios públicos.",
    cta: "Usar modelo"
  },
  {
    slug: "tr-locacao-de-veiculos",
    title: "Modelo de TR para Locação de Veículos Municipais",
    category: "Modelos",
    description: "Base editável para locação de veículos destinados a secretarias e unidades municipais.",
    cta: "Usar modelo"
  },
  {
    slug: "projeto-de-lei-utilidade-publica",
    title: "Modelo de Projeto de Lei de Utilidade Pública",
    category: "Modelos",
    description: "Estrutura de proposição legislativa para declaracao de utilidade pública.",
    cta: "Usar modelo"
  }
];

export const toolPages: MarketingPage[] = [
  {
    slug: "calculadora-limite-dispensa",
    title: "Calculadora de Limites de Dispensa de Licitacao Atualizados",
    category: "Ferramentas",
    description: "Ferramenta planejada para apoiar conferências preliminares de limites e enquadramentos.",
    cta: "Abrir calculadora"
  },
  {
    slug: "consultador-prazos-lei-14133",
    title: "Calculadora de Prazos Processuais da Lei 14.133/21",
    category: "Ferramentas",
    description: "Planejada para organizar prazos, marcos e alertas de processos de contratação.",
    cta: "Consultar prazos"
  },
  {
    slug: "validador-redacao-legislativa",
    title: "Validador Gratuito de Regras da Lei Complementar 95/98",
    category: "Ferramentas",
    description: "Planejado para apontar problemas formais de técnica legislativa em minutas.",
    cta: "Validar redação"
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
