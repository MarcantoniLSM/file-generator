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
      <div className="mx-auto max-w-6xl px-6 md:px-10">
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
      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M0 26 L18 0 L18 82 L76 82 L76 100 L0 100 Z" fill="#4A2E7F" />
                <rect x="34" y="16" width="66" height="11" fill="#171A21" />
                <rect x="34" y="42" width="42" height="11" fill="#171A21" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Gerador de
              </span>
              <span className="font-serif text-base font-semibold text-ink">Documentos Publicos</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-ink md:flex">
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <Link href="/modelos">Modelos</Link>
            <Link href="/gerador" className="rounded-lg bg-civic px-5 py-2.5 text-sm font-semibold text-white">
              Abrir gerador
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10 md:py-14 lg:py-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Gerador de Documentos Publicos</p>
            <h1 className="mt-5 max-w-3xl font-serif text-[2rem] font-semibold leading-[1.15] text-ink sm:text-4xl lg:text-[2.75rem]">
              Minutas prontas para a revisão do jurídico.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Editais, termos de referência, DFDs, ETPs e proposições legislativas montados a partir de roteiros
              objetivos, com cabeçalho do órgão e pontos de revisão destacados.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/gerador" className="rounded-lg bg-civic px-7 py-3 text-base font-medium text-white">
                Abrir gerador
              </Link>
              <a href="#documentos" className="rounded-lg border border-ink px-7 py-3 text-base font-medium text-ink hover:bg-paper">
                Ver documentos disponíveis
              </a>
            </div>
            <div className="mt-6 flex gap-3 border-l-[3px] border-accent bg-paper p-4">
              <p className="text-sm leading-relaxed text-ink">
                <span className="font-medium">Ferramenta de apoio à elaboração de minutas.</span> Não substitui a
                revisão técnica e jurídica do órgão.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm border border-line bg-white p-6 text-ink sm:p-8 md:max-w-none">
            <div className="flex items-start gap-4 border-b border-ink pb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-dashed border-muted text-center">
                <span className="font-mono text-[8px] font-medium uppercase leading-tight tracking-wide text-muted">
                  Brasão
                  <br />
                  [espaço reservado]
                </span>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="h-2 w-40 bg-ink/80" />
                <div className="h-2 w-28 bg-muted/50" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-2 w-24 bg-lilacLight" />
              <p className="font-serif text-[13px] italic leading-relaxed text-muted">
                Dispõe sobre a abertura de processo administrativo para contratação do objeto especificado no termo de
                referência.
              </p>
            </div>
            <div className="mt-5 space-y-2.5">
              <div className="h-1.5 w-full bg-lilac" />
              <div className="h-1.5 w-full bg-lilac" />
              <div className="h-1.5 w-5/6 bg-lilac" />
              <div className="h-1.5 w-full bg-lilac" />
              <div className="h-1.5 w-3/4 bg-lilac" />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-3">
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted">Minuta — para revisão</span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted">Editável</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="border-b border-line bg-white" aria-label="Resumo da proposta">
        <div className="mx-auto grid max-w-6xl gap-0 px-6 py-6 md:grid-cols-4 md:px-10">
          {[
            ["01", "Documentos gerados"],
            ["02", "Como funciona"],
            ["03", "Executivo municipal"],
            ["04", "Legislativo municipal"]
          ].map(([number, label]) => (
            <a
              key={number}
              href={number === "01" ? "#documentos" : number === "02" ? "#como-funciona" : "#documentos"}
              className="flex gap-4 border-b border-line py-3 md:border-b-0 md:border-r md:px-4 md:last:border-r-0"
            >
              <span className="font-mono text-xs text-civic">{number}</span>
              <span className="font-serif text-lg">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      <section id="documentos" className="py-14">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">Documentos gerados</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight">
                Um catálogo para as duas frentes do órgão.
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
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">Como funciona</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Do roteiro à exportação, em quatro etapas.</h2>
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

      <section className="border-y border-line bg-civic py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:px-10 lg:grid-cols-[1fr_420px]">
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
