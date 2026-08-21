"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Clipboard,
  Download,
  FileSearch,
  FileText,
  FolderKanban,
  Gavel,
  Home,
  Landmark,
  Loader2,
  PlugZap,
  Settings2,
  Wand2
} from "lucide-react";
import DocumentEditor from "@/components/DocumentEditor";
import { DocumentCategory, DocumentKind, documentCatalog, documentDefinitions } from "@/lib/document-types";

type Mode = "generate" | "review";
type DebugInfo = {
  reason?: string;
  model?: string;
  status?: number;
  errorCode?: string;
  errorMessage?: string;
  responseId?: string;
};
type AIStatus = {
  ok: boolean;
  model: string;
  keyConfigured: boolean;
  reason: string;
  status?: number;
  errorCode?: string;
  errorMessage?: string;
};
type NavItem = {
  label: string;
  description: string;
  kind: DocumentKind;
  maturity: "stable" | "beta";
};

const initialKind: DocumentKind = "etp";
const institutionFields = [
  ["prefeitura", "Prefeitura", "Prefeitura Municipal de Exemplo"],
  ["secretaria", "Secretaria/Orgao", "Secretaria Municipal de Administracao"],
  ["municipioUf", "Municipio/UF", "Exemplo/CE"],
  ["cnpj", "CNPJ", "00.000.000/0001-00"],
  ["responsavel", "Responsavel", "Nome do responsavel pela demanda"],
  ["cargo", "Cargo", "Secretario Municipal / Diretor / Coordenador"]
];

const groupIcons: Record<DocumentCategory, typeof FolderKanban> = {
  "Compras e licitacoes": FolderKanban,
  "Atos administrativos": Landmark,
  Legislativo: Gavel
};

const documentGroups = (["Compras e licitacoes", "Atos administrativos", "Legislativo"] as DocumentCategory[]).map(
  (category) => ({
    title: category,
    icon: groupIcons[category],
    items: documentCatalog
      .filter((document) => document.category === category)
      .map((document) => ({
        label: document.shortName,
        description: document.name,
        kind: document.kind,
        maturity: document.maturity
      }))
  })
);

export default function GeneratorApp() {
  const [kind, setKind] = useState<DocumentKind>(initialKind);
  const [mode, setMode] = useState<Mode>("generate");
  const [values, setValues] = useState<Record<string, string>>({});
  const [institution, setInstitution] = useState<Record<string, string>>({});
  const [reviewText, setReviewText] = useState("");
  const [output, setOutput] = useState("");
  const [source, setSource] = useState<"openai" | "local" | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [checkingAI, setCheckingAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const definition = documentDefinitions[kind];

  const missingRequired = useMemo(
    () => definition.fields.filter((field) => field.required && !values[field.key]?.trim()),
    [definition.fields, values]
  );

  function selectDocument(item: NavItem) {
    setKind(item.kind);
    setOutput("");
    setSource(null);
    setDebug(null);
  }

  function updateValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateInstitution(key: string, value: string) {
    setInstitution((current) => ({ ...current, [key]: value }));
  }

  async function generate() {
    setLoading(true);
    setOutput("");
    setDebug(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, values, institution })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel gerar a minuta.");
      }

      setOutput(data.text);
      setSource(data.source);
      setDebug(data.debug || null);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function review() {
    setLoading(true);
    setOutput("");
    setDebug(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text: reviewText, institution })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel revisar o documento.");
      }

      setOutput(data.text);
      setSource(data.source);
      setDebug(data.debug || null);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function checkAI() {
    setCheckingAI(true);

    try {
      const response = await fetch("/api/ai-status", { cache: "no-store" });
      const data = await response.json();
      setAiStatus(data);
    } catch (error) {
      setAiStatus({
        ok: false,
        model: "desconhecido",
        keyConfigured: false,
        reason: error instanceof Error ? error.message : "Nao foi possivel testar a IA."
      });
    } finally {
      setCheckingAI(false);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadOutput() {
    if (!output) return;

    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${definition.shortName.toLowerCase()}-minuta.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="border-r border-line bg-white text-ink">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-line p-5">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center text-civic">
                  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                    <path d="M0 26 L18 0 L18 82 L76 82 L76 100 L0 100 Z" fill="#4A2E7F" />
                    <rect x="34" y="16" width="66" height="11" fill="#171A21" />
                    <rect x="34" y="42" width="42" height="11" fill="#171A21" />
                  </svg>
                </span>
                <span>
                  <span className="block font-serif text-lg font-semibold leading-5">Gerador</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    Documentos Publicos
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <Link
                href="/"
                className="mb-4 flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm text-muted hover:text-ink"
              >
                <Home size={16} />
                Landing page
              </Link>

              <div className="space-y-5">
                {documentGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title}>
                      <div className="mb-2 flex items-center gap-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        <Icon size={14} />
                        {group.title}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const active = item.kind === kind;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => selectDocument(item)}
                              className={`w-full border px-3 py-2 text-left transition ${
                                active
                                  ? "border-civic bg-paper text-ink"
                                  : "border-transparent text-muted hover:border-line hover:bg-paper hover:text-ink"
                              }`}
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold">{item.label}</span>
                                {item.maturity === "beta" ? (
                                  <span className="border border-line bg-white px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
                                    Beta
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block text-xs opacity-70">{item.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-line bg-white">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Area interna</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-semibold leading-tight">{definition.name}</h1>
                  {definition.maturity === "beta" ? (
                    <span className="border border-line bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                      Beta
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{definition.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={checkAI}
                  disabled={checkingAI}
                  className="flex h-10 items-center gap-2 border border-line bg-white px-3 text-sm font-semibold disabled:cursor-wait disabled:text-muted"
                >
                  {checkingAI ? <Loader2 className="animate-spin" size={16} /> : <PlugZap size={16} />}
                  Testar IA
                </button>
                <div className="border border-line bg-paper px-3 py-2 text-sm text-muted">
                  Minuta preliminar. Revisao humana obrigatoria.
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[430px_1fr]">
            <div className="space-y-5">
              <section className="border border-line bg-white">
                <div className="border-b border-line px-4 py-3">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Settings2 size={17} />
                    Prefeitura e cabecalho
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Dados institucionais usados no cabecalho e no contexto da minuta.
                  </p>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
                  {institutionFields.map(([key, label, placeholder]) => (
                    <label key={key} className="block">
                      <span className="text-sm font-semibold">{label}</span>
                      <input
                        value={institution[key] || ""}
                        onChange={(event) => updateInstitution(key, event.target.value)}
                        placeholder={placeholder}
                        className="mt-2 w-full border border-line px-3 py-2 text-sm outline-none focus:border-civic"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="border border-line bg-white">
                <div className="grid grid-cols-2 gap-2 border-b border-line p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("generate");
                      setOutput("");
                    }}
                    className={`flex h-10 items-center justify-center gap-2 px-3 text-sm font-semibold ${
                      mode === "generate" ? "bg-civic text-white" : "text-muted hover:bg-paper"
                    }`}
                  >
                    <FileText size={16} />
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("review");
                      setOutput("");
                    }}
                    className={`flex h-10 items-center justify-center gap-2 px-3 text-sm font-semibold ${
                      mode === "review" ? "bg-civic text-white" : "text-muted hover:bg-paper"
                    }`}
                  >
                    <FileSearch size={16} />
                    Revisar
                  </button>
                </div>

                {mode === "generate" ? (
                  <div className="space-y-4 p-4">
                    {definition.fields.map((field) => (
                      <label key={field.key} className="block">
                        <span className="text-sm font-semibold">
                          {field.label}
                          {field.required ? <span className="text-accent"> *</span> : null}
                        </span>
                        {field.type === "textarea" ? (
                          <textarea
                            value={values[field.key] || ""}
                            onChange={(event) => updateValue(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className="mt-2 w-full border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-civic"
                          />
                        ) : (
                          <input
                            value={values[field.key] || ""}
                            onChange={(event) => updateValue(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            className="mt-2 w-full border border-line px-3 py-2 text-sm outline-none focus:border-civic"
                          />
                        )}
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={generate}
                      disabled={loading || missingRequired.length > 0}
                      className="flex h-11 w-full items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                      Gerar minuta
                    </button>
                    {missingRequired.length > 0 ? (
                      <p className="text-sm text-accent">Preencha os campos obrigatorios para gerar.</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="p-4">
                    <label className="block">
                      <span className="text-sm font-semibold">Texto para revisao</span>
                      <textarea
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                        placeholder="Cole aqui a minuta existente para receber uma revisao preliminar."
                        rows={16}
                        className="mt-2 w-full border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-civic"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={review}
                      disabled={loading || !reviewText.trim()}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <FileSearch size={18} />}
                      Revisar documento
                    </button>
                  </div>
                )}
              </section>
            </div>

            <section className="min-h-[720px] border border-line bg-white">
              <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Documento em edicao</h2>
                  <p className="text-sm text-muted">
                    {source === "openai"
                      ? "Gerado com provedor de IA configurado."
                      : source === "local"
                        ? "Gerado pelo template local. Veja o diagnostico abaixo."
                        : "Selecione um documento na sidebar e preencha os dados para gerar."}
                  </p>
                  {aiStatus ? (
                    <p className={`mt-2 text-sm ${aiStatus.ok ? "text-success" : "text-accent"}`}>
                      IA: {aiStatus.ok ? "conectada" : "indisponivel"} | Modelo: {aiStatus.model} | Chave:{" "}
                      {aiStatus.keyConfigured ? "sim" : "nao"}
                    </p>
                  ) : null}
                  {debug ? (
                    <div className="mt-2 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-semibold">Diagnostico da IA</p>
                      {debug.model ? <p>Modelo: {debug.model}</p> : null}
                      {debug.responseId ? <p>Resposta: {debug.responseId}</p> : null}
                      {debug.reason ? <p>Motivo: {debug.reason}</p> : null}
                      {debug.status ? <p>Status HTTP: {debug.status}</p> : null}
                      {debug.errorCode ? <p>Codigo: {debug.errorCode}</p> : null}
                      {debug.errorMessage ? <p>Erro: {debug.errorMessage}</p> : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyOutput}
                    disabled={!output}
                    className="flex h-10 items-center gap-2 border border-line px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadOutput}
                    disabled={!output}
                    className="flex h-10 items-center gap-2 border border-line px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <Download size={16} />
                    TXT
                  </button>
                </div>
              </div>

              <DocumentEditor value={output} onChange={setOutput} placeholder="A minuta gerada aparecera aqui." />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
