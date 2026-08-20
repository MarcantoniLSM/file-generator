import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { modelPages } from "@/lib/site-pages";

export default function ModelsHubPage() {
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
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-civic">Biblioteca</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-tight">
          Biblioteca de Modelos de Documentos Publicos Editaveis
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Hub inicial para modelos prontos, captura de demanda e reaproveitamento no gerador de minutas.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modelPages.map((page) => (
            <Link
              key={page.slug}
              href={`/modelos/${page.slug}`}
              className="group flex min-h-[190px] flex-col justify-between border border-line bg-white p-5"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Modelo editavel</p>
                <h2 className="mt-3 text-base font-semibold leading-6">{page.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{page.description}</p>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-civic">
                Abrir modelo <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
