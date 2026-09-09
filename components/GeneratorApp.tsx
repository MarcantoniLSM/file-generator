"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Clipboard,
  Download,
  FileDown,
  FileSearch,
  FileText,
  FolderKanban,
  Gavel,
  Home,
  Landmark,
  Loader2,
  LogOut,
  Shield,
  Wand2
} from "lucide-react";
import DocumentEditor from "@/components/DocumentEditor";
import { exportDocx } from "@/lib/docx-export";
import {
  DocumentCategory,
  DocumentKind,
  DocumentModule,
  FormField,
  canAccessDocumentKind,
  documentCatalog,
  documentDefinitions
} from "@/lib/document-types";

type Mode = "generate" | "review";
type ProcessModalState = "closed" | "validating" | "generating" | "compliance" | "insufficient" | "error";
type DebugInfo = {
  reason?: string;
  model?: string;
  status?: number;
  errorCode?: string;
  errorMessage?: string;
  responseId?: string;
};
type ReadinessResult = {
  status: "suficiente" | "insuficiente";
  risco: "baixo" | "medio" | "alto";
  resumo: string;
  perguntas: Array<{
    campo: string;
    pergunta: string;
    motivo: string;
  }>;
  alertas: string[];
  source: "local" | "openai" | "mixed" | "unavailable";
  debug?: DebugInfo;
};
type ComplianceResult = {
  status: "conforme" | "conforme_com_ressalvas" | "nao_conforme";
  summary: string;
  findings: Array<{
    item: string;
    severity: "baixa" | "media" | "alta";
    issue: string;
    recommendation: string;
  }>;
  mustRegenerate: boolean;
  confidence: "baixa" | "media" | "alta";
  adjusted: boolean;
};
type NavItem = {
  label: string;
  description: string;
  kind: DocumentKind;
  maturity: "stable" | "beta";
};

const defaultKind: DocumentKind = "etp";
const institutionalFields: FormField[] = [
  {
    key: "municipio_uf",
    label: "Município/UF",
    placeholder: "Ex.: Sobral/CE"
  },
  {
    key: "orgao_entidade",
    label: "Órgão ou entidade",
    placeholder: "Ex.: Prefeitura Municipal / Camara Municipal / Fundo Municipal"
  },
  {
    key: "responsavel_cargo",
    label: "Responsavel e cargo",
    placeholder: "Ex.: Maria Silva, Secretaria Municipal de Administração"
  }
];

const groupIcons: Record<DocumentCategory, typeof FolderKanban> = {
  "Compras e licitações": FolderKanban,
  "Atos administrativos": Landmark,
  Legislativo: Gavel
};

const documentGroups = (["Compras e licitações", "Atos administrativos", "Legislativo"] as DocumentCategory[]).map(
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

export default function GeneratorApp({
  initialKind = defaultKind,
  allowedModules
}: {
  initialKind?: DocumentKind;
  allowedModules: DocumentModule[];
}) {
  const accessibleInitialKind = canAccessDocumentKind(initialKind, allowedModules)
    ? initialKind
    : documentCatalog.find((document) => canAccessDocumentKind(document.kind, allowedModules))?.kind || defaultKind;
  const [kind, setKind] = useState<DocumentKind>(accessibleInitialKind);
  const [mode, setMode] = useState<Mode>("generate");
  const [values, setValues] = useState<Record<string, string>>({});
  const [headerTemplate, setHeaderTemplate] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [output, setOutput] = useState("");
  const [source, setSource] = useState<"openai" | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [processModal, setProcessModal] = useState<ProcessModalState>("closed");
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const definition = documentDefinitions[kind];
  const institutionPayload = { headerTemplate };
  const requiredFields = definition.fields.filter((field) => field.required);
  const optionalFields = definition.fields.filter((field) => !field.required);
  const visibleDocumentGroups = documentGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessDocumentKind(item.kind, allowedModules))
    }))
    .filter((group) => group.items.length > 0);

  const missingRequired = useMemo(
    () => definition.fields.filter((field) => field.required && !values[field.key]?.trim()),
    [definition.fields, values]
  );

  function selectDocument(item: NavItem) {
    setKind(item.kind);
    setOutput("");
    setSource(null);
    setDebug(null);
    setReadiness(null);
    setCompliance(null);
    setProcessModal("closed");
    setFormCollapsed(false);
  }

  function updateValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function generateDraftRequest() {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, values, institution: institutionPayload })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível gerar a minuta.");
    }

    setOutput(data.text);
    setSource("openai");
    setDebug(data.debug || null);
    setCompliance(data.compliance || null);
    setFormCollapsed(true);

    return data.compliance as ComplianceResult | null;
  }

  async function forceGenerate() {
    setLoading(true);
    setOutput("");
    setDebug(null);
    setCompliance(null);
    setProcessModal("generating");

    try {
      const complianceResult = await generateDraftRequest();
      setProcessModal(complianceResult ? "compliance" : "closed");
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
      setProcessModal("error");
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setLoading(true);
    setOutput("");
    setDebug(null);
    setReadiness(null);
    setCompliance(null);
    setProcessModal("validating");

    try {
      const readinessResponse = await fetch("/api/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, values, institution: institutionPayload })
      });
      const readinessData = await readinessResponse.json();

      if (!readinessResponse.ok) {
        setReadiness(readinessData);
        setDebug(readinessData.debug || null);
        setProcessModal("error");
        throw new Error(readinessData.error || "A IA está indisponível no momento. Tente novamente mais tarde.");
      }

      setReadiness(readinessData);
      setDebug(readinessData.debug || null);

      if (readinessData.status === "insuficiente" || readinessData.risco === "alto") {
        setProcessModal("insufficient");
        return;
      }

      setProcessModal("generating");
      const complianceResult = await generateDraftRequest();
      setProcessModal(complianceResult ? "compliance" : "closed");
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
      setProcessModal("error");
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
        body: JSON.stringify({ kind, text: reviewText, institution: institutionPayload })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível revisar o documento.");
      }

      setOutput(data.text);
      setSource("openai");
      setDebug(data.debug || null);
      setFormCollapsed(true);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function reviewCurrentOutput() {
    if (!output.trim()) return;
    setMode("review");
    setReviewText(output);
    setLoading(true);
    setDebug(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text: output, institution: institutionPayload })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível revisar o documento.");
      }

      setOutput(data.text);
      setSource("openai");
      setDebug(data.debug || null);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
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

  async function downloadDocx() {
    if (!output) return;

    await exportDocx({
      title: definition.name,
      filename: `${definition.shortName.toLowerCase()}-minuta.docx`,
      body: output,
      header: headerTemplate
    });
  }

  function complianceStatusLabel(status: ComplianceResult["status"]) {
    const labels: Record<ComplianceResult["status"], string> = {
      conforme: "Conforme preliminarmente",
      conforme_com_ressalvas: "Conforme com ressalvas",
      nao_conforme: "Não conforme"
    };

    return labels[status];
  }

  function processStepStatus(step: "readiness" | "generation" | "compliance") {
    if (processModal === "validating") {
      return step === "readiness" ? "active" : "pending";
    }

    if (processModal === "generating") {
      if (step === "readiness") return "done";
      return step === "generation" || step === "compliance" ? "active" : "pending";
    }

    if (processModal === "compliance") {
      return "done";
    }

    return "pending";
  }

  function renderProcessStep(step: "readiness" | "generation" | "compliance", label: string, description: string) {
    const status = processStepStatus(step);

    return (
      <div className="flex gap-3">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold ${
            status === "done"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : status === "active"
                ? "border-civic bg-paper text-civic"
                : "border-line bg-white text-muted"
          }`}
        >
          {status === "done" ? <Check size={15} /> : status === "active" ? <Loader2 className="animate-spin" size={15} /> : null}
        </span>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-muted">{description}</p>
        </div>
      </div>
    );
  }

  function renderField(field: (typeof definition.fields)[number]) {
    return (
      <label key={field.key} className="block">
        <span className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span>
            {field.label}
            {field.required ? <span className="text-accent"> *</span> : null}
          </span>
          {values[field.key]?.trim() ? <Check size={14} className="text-success" /> : null}
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
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="border-r border-line bg-white text-ink">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-line p-5">
              <Link href="/gerador" className="flex items-center gap-3">
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
                    Documentos Públicos
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <Link
                href="/login"
                className="mb-4 flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm text-muted hover:text-ink"
              >
                <Home size={16} />
                Login
              </Link>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-2 border border-line bg-white px-3 py-2 text-sm font-semibold text-muted hover:bg-paper hover:text-ink"
                >
                  <Shield size={15} />
                  Admin
                </Link>
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 border border-line bg-white px-3 py-2 text-sm font-semibold text-muted hover:bg-paper hover:text-ink"
                  >
                    <LogOut size={15} />
                    Sair
                  </button>
                </form>
              </div>

              <div className="space-y-5">
                {visibleDocumentGroups.map((group) => {
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
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Área interna</p>
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
                {source ? (
                  <span className="border border-line bg-paper px-3 py-2 text-sm text-muted">
                    IA conectada
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={reviewCurrentOutput}
                  disabled={!output || loading}
                  className="flex h-10 items-center gap-2 border border-line bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <FileSearch size={16} />}
                  Revisar
                </button>
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  className="flex h-10 items-center gap-2 border border-line bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button
                  type="button"
                  onClick={downloadOutput}
                  disabled={!output}
                  className="flex h-10 items-center gap-2 border border-line bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <Download size={16} />
                  TXT
                </button>
                <button
                  type="button"
                  onClick={downloadDocx}
                  disabled={!output}
                  className="flex h-10 items-center gap-2 border border-line bg-civic px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-white disabled:text-slate-300"
                >
                  <FileDown size={16} />
                  DOCX
                </button>
              </div>
            </div>
          </header>

          {debug ? (
            <div className="border-b border-line bg-white px-4 py-3 sm:px-6">
              <div className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                <p className="font-semibold">Diagnostico da IA</p>
                {debug.model ? <p>Modelo: {debug.model}</p> : null}
                {debug.responseId ? <p>Resposta: {debug.responseId}</p> : null}
                {debug.reason ? <p>Motivo: {debug.reason}</p> : null}
                {debug.status ? <p>Status HTTP: {debug.status}</p> : null}
                {debug.errorCode ? <p>Codigo: {debug.errorCode}</p> : null}
                {debug.errorMessage ? <p>Erro: {debug.errorMessage}</p> : null}
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[430px_1fr]">
            <div className="space-y-5">
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

                {formCollapsed && mode === "generate" ? (
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-sm font-bold">Informações recolhidas</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        O documento está aberto ao lado. Reabra o formulário para ajustar os dados e gerar uma nova
                        versão.
                      </p>
                    </div>
                    {readiness ? (
                      <div
                        className={`border px-3 py-2 text-sm ${
                          readiness.status === "suficiente"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                            : "border-amber-200 bg-amber-50 text-amber-950"
                        }`}
                      >
                        <span className="font-semibold">Validacao: {readiness.status}</span>
                        <span className="mx-2">|</span>
                        <span>Risco: {readiness.risco}</span>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setFormCollapsed(false)}
                      className="flex h-10 w-full items-center justify-center gap-2 border border-line bg-white px-4 text-sm font-bold text-ink hover:bg-paper"
                    >
                      <FileText size={16} />
                      Editar informações
                    </button>
                    <button
                      type="button"
                      onClick={generate}
                      disabled={loading}
                      className="flex h-10 w-full items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />}
                      Validar novamente
                    </button>
                  </div>
                ) : mode === "generate" ? (
                  <div className="space-y-4 p-4">
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2">
                        <h3 className="text-sm font-bold">Identificação institucional</h3>
                        <span className="text-xs text-muted">opcional</span>
                      </div>
                      <div className="space-y-4">{institutionalFields.map(renderField)}</div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2">
                        <h3 className="text-sm font-bold">Dados essenciais</h3>
                        <span className="text-xs text-muted">{requiredFields.length} obrigatórios</span>
                      </div>
                      <div className="space-y-4">{requiredFields.map(renderField)}</div>
                    </div>

                    {optionalFields.length ? (
                      <details className="border-t border-line pt-4" open>
                        <summary className="cursor-pointer text-sm font-bold">Dados complementares</summary>
                        <div className="mt-4 space-y-4">{optionalFields.map(renderField)}</div>
                      </details>
                    ) : null}

                    <button
                      type="button"
                      onClick={generate}
                      disabled={loading}
                      className="flex h-11 w-full items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                      Validar e gerar
                    </button>
                    {missingRequired.length > 0 ? (
                      <p className="text-sm text-accent">
                        Há campos obrigatórios vazios. A validação vai listar as informações necessárias antes da geração.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="p-4">
                    <label className="block">
                      <span className="text-sm font-semibold">Texto para revisão</span>
                      <textarea
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                        placeholder="Cole aqui a minuta existente para receber uma revisão preliminar."
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
              <div className="border-b border-line bg-paper px-4 py-4">
                <div className="mx-auto max-w-[794px] border border-line bg-white">
                  <div className="border-b border-line px-4 py-3">
                    <h3 className="text-sm font-bold">Cabecalho do documento</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Cole ou edite aqui o cabeçalho da Prefeitura/Camara. Ele será usado pela IA e exportado no DOCX.
                    </p>
                  </div>
                  <DocumentEditor
                    value={headerTemplate}
                    onChange={setHeaderTemplate}
                    placeholder="Ex.: Prefeitura Municipal, brasao textual, secretaria, endereco, CNPJ..."
                    minHeightClass="min-h-[120px]"
                    paperClassName="min-h-[150px] bg-white px-4 py-4"
                    toolbarCompact
                  />
                </div>
              </div>

              {output ? (
                <DocumentEditor value={output} onChange={setOutput} placeholder="A minuta gerada aparecera aqui." />
              ) : (
                <div className="flex min-h-[520px] items-center justify-center px-6 py-12">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center border border-line bg-paper text-civic">
                      {loading ? <Loader2 className="animate-spin" size={22} /> : <FileText size={22} />}
                    </div>
                    <h2 className="mt-4 font-serif text-2xl font-semibold">Documento pronto para nascer</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Preencha os dados do formulário e valide com a IA. Quando a minuta for gerada, ela aparece aqui
                      em formato editável.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>

      {processModal !== "closed" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
          <div className="w-full max-w-xl border border-line bg-white shadow-2xl">
            <div className="border-b border-line px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">IA documental</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                {processModal === "validating"
                  ? "Validando informações"
                  : processModal === "generating"
                    ? "Gerando e verificando"
                    : processModal === "compliance"
                      ? "Verificação concluída"
                      : processModal === "insufficient"
                        ? "Dados insuficientes"
                        : "Não foi possível concluir"}
              </h2>
            </div>

            <div className="space-y-4 px-5 py-5 text-sm leading-6">
              {processModal === "validating" || processModal === "generating" ? (
                <div className="space-y-4">
                  <div className="border border-line bg-paper p-3">
                    <p className="font-semibold">
                      {processModal === "validating"
                        ? "A IA está verificando se existem dados suficientes."
                        : "A IA está redigindo a minuta e fazendo uma verificação preliminar de conformidade."}
                    </p>
                    <p className="mt-1 text-muted">
                      Esta etapa reduz o risco de lacunas relevantes antes de liberar o documento para edição.
                    </p>
                  </div>
                  {renderProcessStep("readiness", "1. Validação dos dados", "Confere se há informação suficiente para gerar sem depender de suposições.")}
                  {renderProcessStep("generation", "2. Geração da minuta", "Redige o documento com o prompt específico do tipo selecionado.")}
                  {renderProcessStep("compliance", "3. Verificação preliminar", "Analisa estrutura, pendências e aderência normativa quando aplicável.")}
                </div>
              ) : null}

              {processModal === "compliance" && compliance ? (
                <>
                  <div
                    className={`border p-3 ${
                      compliance.status === "conforme"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                        : compliance.status === "nao_conforme"
                          ? "border-red-200 bg-red-50 text-red-950"
                          : "border-amber-200 bg-amber-50 text-amber-950"
                    }`}
                  >
                    <p className="font-semibold">{complianceStatusLabel(compliance.status)}</p>
                    <p className="mt-1">{compliance.summary}</p>
                    {compliance.adjusted ? (
                      <p className="mt-2 font-semibold">A minuta recebeu uma rodada automática de ajustes.</p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {renderProcessStep("readiness", "1. Validação dos dados", "Concluída antes da geração.")}
                    {renderProcessStep("generation", "2. Geração da minuta", "Documento criado no editor.")}
                    {renderProcessStep("compliance", "3. Verificação preliminar", "Relatório de conformidade gerado.")}
                  </div>

                  {compliance.findings.length ? (
                    <div>
                      <p className="font-semibold">Pontos de atenção</p>
                      <ul className="mt-2 space-y-2">
                        {compliance.findings.map((finding) => (
                          <li key={`${finding.item}-${finding.issue}`} className="border border-line p-3">
                            <p className="font-semibold">
                              {finding.item} <span className="text-muted">({finding.severity})</span>
                            </p>
                            <p className="mt-1 text-muted">{finding.issue}</p>
                            <p className="mt-1">{finding.recommendation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}

              {processModal === "insufficient" && readiness ? (
                <>
                  <div className="border border-amber-200 bg-amber-50 p-3 text-amber-950">
                    <p className="font-semibold">
                      Validação: {readiness.status} | Risco: {readiness.risco}
                    </p>
                    <p className="mt-1">{readiness.resumo}</p>
                  </div>

                  {readiness.alertas.length ? (
                    <div>
                      <p className="font-semibold">Pontos de atenção</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                        {readiness.alertas.map((alert) => (
                          <li key={alert}>{alert}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {readiness.perguntas.length ? (
                    <div>
                      <p className="font-semibold">Antes de gerar, esclareça</p>
                      <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted">
                        {readiness.perguntas.map((question) => (
                          <li key={`${question.campo}-${question.pergunta}`}>
                            <span className="font-medium text-ink">{question.pergunta}</span>
                            <span className="mt-1 block">{question.motivo}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  <p className="border-t border-line pt-4 text-muted">
                    Se optar por gerar mesmo assim, a minuta poderá conter pendências e deverá ser revisada com
                    cuidado antes de qualquer uso oficial.
                  </p>
                </>
              ) : null}

              {processModal === "error" ? (
                <div className="border border-amber-200 bg-amber-50 p-3 text-amber-950">
                  <p className="font-semibold">A IA não concluiu a operação.</p>
                  <p className="mt-1">{output || "Tente novamente mais tarde."}</p>
                </div>
              ) : null}
            </div>

            {processModal === "compliance" ? (
              <div className="flex justify-end border-t border-line p-4">
                <button
                  type="button"
                  onClick={() => setProcessModal("closed")}
                  className="h-10 bg-civic px-4 text-sm font-bold text-white"
                >
                  Abrir documento
                </button>
              </div>
            ) : processModal === "insufficient" ? (
              <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setProcessModal("closed");
                    setFormCollapsed(false);
                  }}
                  className="h-10 border border-line bg-white px-4 text-sm font-bold text-ink hover:bg-paper"
                >
                  Voltar e complementar
                </button>
                <button
                  type="button"
                  onClick={forceGenerate}
                  disabled={loading}
                  className="flex h-10 items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />}
                  Gerar mesmo assim
                </button>
              </div>
            ) : processModal === "error" ? (
              <div className="flex justify-end border-t border-line p-4">
                <button
                  type="button"
                  onClick={() => setProcessModal("closed")}
                  className="h-10 bg-civic px-4 text-sm font-bold text-white"
                >
                  Entendi
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
