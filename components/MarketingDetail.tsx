import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import type { MarketingPage } from "@/lib/site-pages";
import { allTopLevelPages } from "@/lib/site-pages";
import { documentDefinitions } from "@/lib/document-types";

function getGeneratorHref(page: MarketingPage) {
  return page.documentKind ? `/gerador?tipo=${page.documentKind}` : "/gerador";
}

function getDocumentIntro(page: MarketingPage) {
  if (!page.documentKind) return page.description;
  const definition = documentDefinitions[page.documentKind];
  return `${page.description} A geracao usa campos, estrutura, checklist e prompt especificos para ${definition.name.toLowerCase()}, com pendencias destacadas quando faltar informacao.`;
}

function getFaq(page: MarketingPage) {
  const documentName = page.documentKind ? documentDefinitions[page.documentKind].name : "documento";
  const institution = page.category === "Legislativo" ? "Camara Municipal" : "Prefeitura";

  return [
    [
      `O ${documentName} sai pronto para uso oficial?`,
      `Nao. O sistema gera uma minuta estruturada para acelerar o trabalho, mas a revisao final deve ser feita pela equipe responsavel da ${institution}.`
    ],
    [
      "A IA inventa dados quando faltam informacoes?",
      "A orientacao do sistema e nao inventar dados sensiveis. Quando faltar processo, valor, fundamento, fonte, autoridade ou documento, a minuta deve marcar como pendencia."
    ],
    [
      "A pagina abre o documento correto no gerador?",
      "Sim. O botao principal abre a area interna com o tipo documental correspondente ja selecionado."
    ]
  ];
}

export default function MarketingDetail({ page }: { page: MarketingPage }) {
  const definition = page.documentKind ? documentDefinitions[page.documentKind] : null;
  const generatorHref = getGeneratorHref(page);
  const relatedPages = allTopLevelPages
    .filter((related) => related.slug !== page.slug && related.category === page.category)
    .slice(0, 3);
  const requiredFields = definition?.fields.filter((field) => field.required).slice(0, 5) || [];
  const elements = definition?.sections.slice(0, 8) || [];
  const focusItems = definition?.promptFocus.slice(0, 4) || [];
  const faq = getFaq(page);

  return (
    <main className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0">
              <path d="M0 26 L18 0 L18 82 L76 82 L76 100 L0 100 Z" fill="#4A2E7F" />
              <rect x="34" y="16" width="66" height="11" fill="#171A21" />
              <rect x="34" y="42" width="42" height="11" fill="#171A21" />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Gerador de
              </span>
              <span className="font-serif text-base font-semibold text-ink">Documentos Publicos</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            <Link className="text-[15px] font-medium hover:text-civic" href="/#como-funciona">
              Como funciona
            </Link>
            <Link className="text-[15px] font-medium hover:text-civic" href="/#documentos">
              Documentos
            </Link>
            <Link className="text-[15px] font-medium hover:text-civic" href="/gerador">
              Area interna
            </Link>
          </nav>
          <Link href={generatorHref} className="hidden rounded-lg bg-civic px-5 py-3 text-sm font-semibold text-white lg:block">
            {page.cta}
          </Link>
        </div>
      </header>

      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:px-10 lg:grid-cols-[1fr_360px] lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{page.category}</p>
              {definition?.maturity === "beta" ? (
                <span className="border border-line bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  Beta
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 max-w-4xl text-balance font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-muted sm:text-lg">{getDocumentIntro(page)}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={generatorHref} className="rounded-lg bg-civic px-7 py-3 text-center text-base font-semibold text-white">
                {page.cta}
              </Link>
              <Link href="#elementos" className="rounded-lg border border-ink px-7 py-3 text-center text-base font-semibold text-ink">
                Ver estrutura
              </Link>
            </div>
          </div>

          <aside className="border border-line bg-white p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-civic">No gerador</p>
            <div className="mt-5 space-y-4">
              {[
                ["Documento selecionado", definition?.shortName || "Minuta"],
                ["Campos obrigatorios", requiredFields.length ? requiredFields.map((field) => field.label).join(", ") : "Dados basicos"],
                ["Revisao automatica", "Checklist proprio do documento"],
                ["Resultado", "Minuta editavel com pendencias"]
              ].map(([title, text]) => (
                <div key={title} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="elementos" className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-civic">Estrutura</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Elementos que a minuta deve cobrir</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              Cada pagina usa a estrutura esperada do proprio documento para orientar a geracao, revisar lacunas e evitar
              respostas genericas.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {elements.map((section) => (
              <li key={section} className="border-t border-line pt-4">
                <h3 className="text-[15px] font-semibold">{section}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">Tratado no prompt e conferido no checklist automatico.</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:px-10 sm:grid-cols-3">
          {[
            ["01", "Informe o contexto", "Preencha os dados essenciais do orgao, objeto, necessidade e campos especificos."],
            ["02", "Gere a minuta", "A IA usa o prompt especializado daquele documento, sem tratar tudo como formulario unico."],
            ["03", "Revise e edite", "O editor permite ajustes e a revisao aponta pendencias antes do uso oficial."]
          ].map(([number, title, text]) => (
            <div key={number} className="border-t-2 border-civic bg-white p-5">
              <span className="font-mono text-sm font-semibold text-civic">{number}</span>
              <h2 className="mt-5 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:px-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-civic">Acuracia</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Orientacoes especificas para este documento</h2>
            <div className="mt-6 space-y-4">
              {focusItems.map((item) => (
                <div key={item} className="flex gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <CheckCircle2 className="mt-1 shrink-0 text-civic" size={18} />
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-line bg-paper p-6">
            <FileText className="text-civic" size={24} />
            <h3 className="mt-5 text-lg font-semibold">Minuta com cautela institucional</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              O sistema evita conclusoes definitivas e sinaliza dados ausentes como pendencia, especialmente em pontos
              juridicos, orcamentarios, tecnicos e legislativos.
            </p>
            <div className="mt-5 flex items-start gap-3 border-t border-line pt-5">
              <ShieldCheck className="mt-1 shrink-0 text-civic" size={20} />
              <p className="text-sm leading-6 text-muted">
                Ferramenta de apoio. Nao substitui revisao da assessoria juridica, area tecnica, controle interno ou
                autoridade competente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14 md:px-10">
          <h2 className="font-serif text-3xl font-semibold">Perguntas frequentes</h2>
          <dl className="mt-6">
            {faq.map(([question, answer], index) => (
              <div key={question} className={`py-5 ${index === faq.length - 1 ? "" : "border-b border-line"}`}>
                <dt className="font-semibold">{question}</dt>
                <dd className="mt-2 text-[15px] leading-7 text-muted">{answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {relatedPages.length ? (
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
            <h2 className="font-serif text-3xl font-semibold">Outros geradores relacionados</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {relatedPages.map((related) => (
                <Link key={related.slug} href={`/${related.slug}`} className="group border border-line bg-white p-5 hover:border-civic">
                  <h3 className="text-base font-semibold group-hover:text-civic">{related.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{related.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-civic">
                    Ver gerador <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-civic py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-6 md:px-10 lg:flex-row lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lilac">Comecar agora</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Abra o gerador com este documento selecionado.</h2>
          </div>
          <Link href={generatorHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-ink">
            {page.cta} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
