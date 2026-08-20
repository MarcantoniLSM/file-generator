import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Settings2, ShieldCheck } from "lucide-react";
import type { MarketingPage } from "@/lib/site-pages";

export default function MarketingDetail({ page }: { page: MarketingPage }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="fixed left-0 top-0 z-20 h-full w-2 bg-civic md:w-3" aria-hidden="true" />
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="font-serif text-xl font-semibold">
            Gerador de Documentos Publicos
          </Link>
          <Link href="/gerador" className="bg-civic px-4 py-2 text-sm font-semibold text-white">
            Abrir gerador
          </Link>
        </div>
      </header>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:py-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">{page.category}</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.04]">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{page.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/gerador" className="bg-civic px-5 py-3 text-sm font-bold text-white">
                {page.cta}
              </Link>
              <Link href="/#como-funciona" className="border border-line px-5 py-3 text-sm font-bold text-ink">
                Como funciona
              </Link>
            </div>
          </div>
          <aside className="border border-line bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-civic">Fluxo da minuta</p>
            <div className="mt-5 space-y-4">
              {[
                ["Configurar orgao", "Cabecalho, secretaria, municipio, responsavel e cargo."],
                ["Informar demanda", "Dados estruturados para reduzir texto generico."],
                ["Gerar documento", "Minuta em secoes, com pendencias quando faltar informacao."],
                ["Revisar", "Validacao humana pela area competente."]
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <CheckCircle2 className="mt-1 text-civic" size={18} />
                  <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="border border-line bg-white p-5">
          <FileText className="text-civic" size={22} />
          <h2 className="mt-5 text-lg font-semibold">Documento desenvolvido</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            A IA e orientada a produzir texto institucional mais robusto, com justificativa, contexto e encaminhamento.
          </p>
        </div>
        <div className="border border-line bg-white p-5">
          <Settings2 className="text-civic" size={22} />
          <h2 className="mt-5 text-lg font-semibold">Adaptado ao orgao</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            A configuracao da Prefeitura entra no cabecalho e no contexto de redacao da minuta.
          </p>
        </div>
        <div className="border border-line bg-white p-5">
          <ShieldCheck className="text-civic" size={22} />
          <h2 className="mt-5 text-lg font-semibold">Revisao obrigatoria</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            O sistema nao substitui parecer tecnico ou juridico. Ele organiza a primeira versao para conferencia.
          </p>
        </div>
      </section>

      <section className="bg-ink py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lilac">Comecar agora</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Abra o gerador e produza a primeira minuta.</h2>
          </div>
          <Link href="/gerador" className="flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-ink">
            Abrir gerador <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
