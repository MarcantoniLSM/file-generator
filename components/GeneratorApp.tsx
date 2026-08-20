"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, FileSearch, FileText, Loader2, PlugZap, Wand2 } from "lucide-react";
import { DocumentKind, documentDefinitions, documentKinds } from "@/lib/document-types";

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
  responseId?: string;
};

const initialKind: DocumentKind = "dfd";
const institutionFields = [
  {
    key: "prefeitura",
    label: "Prefeitura",
    placeholder: "Prefeitura Municipal de Exemplo"
  },
  {
    key: "secretaria",
    label: "Secretaria/Orgao",
    placeholder: "Secretaria Municipal de Administracao"
  },
  {
    key: "municipioUf",
    label: "Municipio/UF",
    placeholder: "Exemplo/CE"
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0001-00"
  },
  {
    key: "responsavel",
    label: "Responsavel",
    placeholder: "Nome do responsavel pela demanda"
  },
  {
    key: "cargo",
    label: "Cargo",
    placeholder: "Secretario Municipal / Diretor / Coordenador"
  }
];

export default function Home() {
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
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-civic">Gestao Publica</p>
            <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Gerador de minutas com IA</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={checkAI}
              disabled={checkingAI}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink disabled:cursor-wait disabled:text-slate-400"
              title="Testar conexao com a OpenAI"
            >
              {checkingAI ? <Loader2 className="animate-spin" size={16} /> : <PlugZap size={16} />}
              Testar IA
            </button>
            <div className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-slate-700">
              Minuta preliminar. Revisao humana obrigatoria.
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-md border border-line bg-white p-4">
            <div>
              <h2 className="text-base font-bold text-ink">Configuracao da Prefeitura</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Estes dados entram no cabecalho e ajudam a IA a adaptar a minuta ao orgao municipal.
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {institutionFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-sm font-semibold text-ink">{field.label}</span>
                  <input
                    value={institution[field.key] || ""}
                    onChange={(event) => updateInstitution(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-civic"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-line bg-white p-4">
            {aiStatus ? (
              <div
                className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                  aiStatus.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-950"
                }`}
              >
                <p className="font-semibold">{aiStatus.ok ? "IA conectada" : "IA indisponivel"}</p>
                <p className="mt-1">Modelo: {aiStatus.model}</p>
                <p>Chave no servidor: {aiStatus.keyConfigured ? "sim" : "nao"}</p>
                <p>{aiStatus.reason}</p>
                {aiStatus.status ? <p>Status HTTP: {aiStatus.status}</p> : null}
                {aiStatus.errorCode ? <p>Codigo: {aiStatus.errorCode}</p> : null}
                {aiStatus.errorMessage ? <p>Erro: {aiStatus.errorMessage}</p> : null}
              </div>
            ) : null}
            <label className="text-sm font-semibold text-ink" htmlFor="kind">
              Tipo documental
            </label>
            <select
              id="kind"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value as DocumentKind);
                setOutput("");
                setSource(null);
              }}
              className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-civic"
            >
              {documentKinds.map((item) => (
                <option key={item} value={item}>
                  {documentDefinitions[item].shortName} - {documentDefinitions[item].name}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm leading-6 text-slate-600">{definition.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-md border border-line bg-white p-2">
            <button
              type="button"
              onClick={() => {
                setMode("generate");
                setOutput("");
              }}
              className={`flex h-10 items-center justify-center gap-2 rounded px-3 text-sm font-semibold ${
                mode === "generate" ? "bg-civic text-white" : "text-slate-700 hover:bg-paper"
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
              className={`flex h-10 items-center justify-center gap-2 rounded px-3 text-sm font-semibold ${
                mode === "review" ? "bg-civic text-white" : "text-slate-700 hover:bg-paper"
              }`}
            >
              <FileSearch size={16} />
              Revisar
            </button>
          </div>

          {mode === "generate" ? (
            <div className="rounded-md border border-line bg-white p-4">
              <div className="space-y-4">
                {definition.fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm font-semibold text-ink">
                      {field.label}
                      {field.required ? <span className="text-accent"> *</span> : null}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={values[field.key] || ""}
                        onChange={(event) => updateValue(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-civic"
                      />
                    ) : (
                      <input
                        value={values[field.key] || ""}
                        onChange={(event) => updateValue(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-civic"
                      />
                    )}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={generate}
                disabled={loading || missingRequired.length > 0}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                Gerar minuta
              </button>
              {missingRequired.length > 0 ? (
                <p className="mt-3 text-sm text-accent">Preencha os campos obrigatorios para gerar.</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-line bg-white p-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Texto para revisao</span>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Cole aqui a minuta existente para receber uma revisao preliminar."
                  rows={14}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-civic"
                />
              </label>
              <button
                type="button"
                onClick={review}
                disabled={loading || !reviewText.trim()}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <FileSearch size={18} />}
                Revisar documento
              </button>
            </div>
          )}
        </aside>

        <section className="min-h-[640px] rounded-md border border-line bg-white">
          <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Resultado</h2>
              <p className="text-sm text-slate-600">
                {source === "openai"
                  ? "Gerado com provedor de IA configurado."
                  : source === "local"
                    ? "Gerado pelo template local. Veja o diagnostico abaixo para entender o motivo."
                    : "A minuta aparecera aqui."}
              </p>
              {debug ? (
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
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
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-slate-300"
                title="Copiar resultado"
              >
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={downloadOutput}
                disabled={!output}
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-slate-300"
                title="Baixar em TXT"
              >
                <Download size={16} />
                TXT
              </button>
            </div>
          </div>

          <textarea
            value={output}
            onChange={(event) => setOutput(event.target.value)}
            placeholder="Preencha o formulario ou cole um texto para revisao."
            className="h-[calc(100%-81px)] min-h-[560px] w-full border-0 bg-white p-5 font-mono text-sm leading-6 text-ink outline-none"
          />
        </section>
      </section>
    </main>
  );
}
