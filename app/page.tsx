import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Landmark, Scale, ShieldCheck } from "lucide-react";
import { executivePages, legislativePages, modelPages, toolPages } from "@/lib/site-pages";

const generatedExamples = [
  "Documento de Formalizacao da Demanda",
  "Estudo Tecnico Preliminar",
  "Termo de Referencia",
  "Mapa de Riscos",
  "Minuta de Edital",
  "Minuta de Contrato",
  "Projeto de Lei",
  "Parecer de Comissao",
  "Oficio Administrativo"
];

const steps = [
  {
    title: "Configure o orgao",
    text: "Informe Prefeitura, secretaria, municipio, CNPJ e responsaveis para adaptar cabecalho e linguagem institucional."
  },
  {
    title: "Escolha o documento",
    text: "Selecione o artefato administrativo ou legislativo e responda perguntas estruturadas sobre a demanda."
  },
  {
    title: "Gere a minuta",
    text: "A IA organiza o conteudo em secoes, aponta pendencias e evita inventar dados nao fornecidos."
  },
  {
    title: "Revise e aprove",
    text: "O servidor confere, ajusta e encaminha a minuta para as areas tecnica, juridica ou administrativa competentes."
  }
];

function PageGroup({
  title,
  eyebrow,
  pages,
  basePath = ""
}: {
  title: string;
  eyebrow: string;
  pages: Array<{ slug: string; title: string; description: string; cta: string }>;
  basePath?: string;
}) {
  return (
    <section className="border-t border-line py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 grid gap-3 md:grid-cols-[320px_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">{eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-ink">{title}</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted">
            Paginas preparadas para captar demandas especificas, explicar o documento e levar o usuario ao gerador
            com contexto adequado.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`${basePath}/${page.slug}`}
              className="group flex min-h-[190px] flex-col justify-between border border-line bg-white p-5 transition hover:border-civic"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{page.cta}</p>
                <h3 className="mt-3 text-base font-semibold leading-6 text-ink">{page.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{page.description}</p>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-civic">
                Abrir pagina <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="fixed left-0 top-0 z-20 h-full w-2 bg-civic md:w-3" aria-hidden="true" />

      <header className="border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="font-serif text-xl font-semibold">
            Gerador de Documentos Publicos
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <Link href="/modelos">Modelos</Link>
            <Link href="/gerador" className="border border-white/25 px-4 py-2 font-semibold text-white">
              Abrir gerador
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-lilac">IA para gestao publica municipal</p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Minutas publicas mais completas, conferiveis e adaptadas a cada Prefeitura.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
              Gere documentos de compras, licitacoes, contratos, atos administrativos e proposicoes legislativas com
              formularios guiados, cabecalho institucional e revisao humana obrigatoria.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/gerador" className="bg-white px-5 py-3 text-sm font-bold text-ink">
                Abrir gerador
              </Link>
              <a href="#documentos" className="border border-white/25 px-5 py-3 text-sm font-bold text-white">
                Ver documentos
              </a>
            </div>
          </div>

          <div className="border border-white/15 bg-white p-5 text-ink">
            <div className="border-b border-line pb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-civic">Minuta gerada</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">Documento de Formalizacao da Demanda</h2>
            </div>
            <div className="space-y-4 py-5 font-serif text-sm leading-7 text-muted">
              <p className="text-center font-semibold uppercase tracking-wide text-ink">
                Prefeitura Municipal
                <br />
                Secretaria Municipal de Administracao
              </p>
              <p>
                <b className="text-ink">1. Descricao da necessidade.</b> A presente demanda decorre da necessidade de
                garantir condicoes adequadas de trabalho aos servidores municipais, com impacto direto na continuidade
                das atividades administrativas.
              </p>
              <p>
                <b className="text-ink">2. Interesse publico.</b> A contratacao pretendida devera ser analisada pela
                area competente, considerando economicidade, padronizacao, disponibilidade orcamentaria e aderencia ao
                planejamento do orgao.
              </p>
            </div>
            <div className="border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Minuta sujeita a revisao do agente publico responsavel
            </div>
          </div>
        </div>
      </section>

      <section id="documentos" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">Documentos gerados</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight">
                Um centro de redacao assistida para rotinas municipais.
              </h2>
              <p className="mt-4 leading-7 text-muted">
                O produto deve atender tanto o Executivo quanto o Legislativo, mantendo a promessa central: a IA redige
                a minuta, mas a decisao continua com o servidor.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {generatedExamples.map((item) => (
                <div key={item} className="flex min-h-[92px] items-start gap-3 border border-line bg-white p-4">
                  <CheckCircle2 className="mt-1 text-civic" size={18} />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-line bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">Como funciona</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold">Da demanda ate a minuta revisavel.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="border border-line bg-paper p-5">
                <span className="font-mono text-xs text-civic">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageGroup title="Licitacoes e compras publicas" eyebrow="Executivo municipal" pages={executivePages} />
      <PageGroup title="Projetos de lei e atos normativos" eyebrow="Legislativo municipal" pages={legislativePages} />
      <PageGroup title="Modelos prontos e captura" eyebrow="Biblioteca" pages={modelPages} basePath="/modelos" />
      <PageGroup title="Ferramentas gratuitas" eyebrow="Trafego e validacao" pages={toolPages} basePath="/ferramentas" />

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lilac">Limite institucional</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight">
              O sistema apoia a redacao. Quem revisa, valida e assina continua sendo o agente publico.
            </h2>
          </div>
          <div className="grid gap-3 text-sm leading-6 text-white/75">
            <p className="flex gap-3">
              <ShieldCheck className="mt-1 text-lilac" size={18} />
              Nao promete legalidade automatica.
            </p>
            <p className="flex gap-3">
              <Landmark className="mt-1 text-lilac" size={18} />
              Deve evoluir para normas e templates de cada orgao.
            </p>
            <p className="flex gap-3">
              <Scale className="mt-1 text-lilac" size={18} />
              Pareceres e atos juridicos ficam como minutas para revisao competente.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted sm:px-6">
        <FileText className="mx-auto mb-3 text-civic" size={22} />
        Gerador de Documentos Publicos
      </footer>
    </main>
  );
}
