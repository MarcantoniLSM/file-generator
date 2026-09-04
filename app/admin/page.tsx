import Link from "next/link";
import { ArrowRight, BarChart3, FileText, Shield, UserCheck, UserCog, UserX, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { documentDefinitions, type DocumentKind } from "@/lib/document-types";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  access_status: "active" | "blocked";
  created_at: string;
};

type Generation = {
  id: string;
  user_id: string | null;
  document_kind: DocumentKind;
  document_name: string;
  source: string;
  risk: string | null;
  status: string;
  municipality: string | null;
  organization: string | null;
  output_length: number | null;
  created_at: string;
};

function StatCard({
  label,
  value,
  helper,
  icon: Icon
}: {
  label: string;
  value: number;
  helper: string;
  icon: typeof Users;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-ink">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center bg-paper text-civic">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{helper}</p>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    generated: "Gerado",
    reviewed: "Revisado",
    forced_generation: "Forçado"
  };

  return labels[status] || status;
}

function CountBar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total > 0 ? Math.max(5, Math.round((value / total) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <div className="h-2 bg-paper">
        <div className="h-2 bg-civic" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : await createSupabaseServerClient();
  const { data } = await supabase
    .from("file_generator_profiles")
    .select("id,email,full_name,role,access_status,created_at")
    .order("created_at", { ascending: false });
  const { data: generationData, error: generationsError } = await supabase
    .from("file_generator_document_generations")
    .select("id,user_id,document_kind,document_name,source,risk,status,municipality,organization,output_length,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const profiles = (data || []) as Profile[];
  const generations = (generationData || []) as Generation[];
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter((profile) => profile.access_status === "active").length;
  const blockedUsers = profiles.filter((profile) => profile.access_status === "blocked").length;
  const admins = profiles.filter((profile) => profile.role === "admin").length;
  const commonUsers = profiles.filter((profile) => profile.role === "user").length;
  const recentProfiles = profiles.slice(0, 8);
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const generationsThisWeek = generations.filter((generation) => new Date(generation.created_at) >= sevenDaysAgo).length;
  const reviewedGenerations = generations.filter((generation) => generation.status === "reviewed").length;
  const forcedGenerations = generations.filter((generation) => generation.status === "forced_generation").length;
  const averageOutputLength = generations.length
    ? Math.round(generations.reduce((sum, generation) => sum + (generation.output_length || 0), 0) / generations.length)
    : 0;
  const generationUsers = new Set(generations.map((generation) => generation.user_id).filter(Boolean)).size;
  const maxGenerationCount = Math.max(
    1,
    ...Object.keys(documentDefinitions).map(
      (kind) => generations.filter((generation) => generation.document_kind === kind).length
    )
  );
  const statusCounts = ["generated", "reviewed", "forced_generation"].map((status) => ({
    status,
    count: generations.filter((generation) => generation.status === status).length
  }));
  const organizationCounts = Object.entries(
    generations.reduce<Record<string, number>>((acc, generation) => {
      const organization = generation.organization || "Órgão não informado";
      acc[organization] = (acc[organization] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Administração</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Painel admin</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/gerador" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Área interna
            </Link>
            <Link href="/admin/usuarios" className="bg-civic px-4 py-2 text-sm font-semibold text-white">
              Gerenciar usuários
            </Link>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Usuários" value={totalUsers} helper="Contas cadastradas" icon={Users} />
          <StatCard label="Ativos" value={activeUsers} helper="Podem acessar" icon={UserCheck} />
          <StatCard label="Bloqueados" value={blockedUsers} helper="Sem acesso" icon={UserX} />
          <StatCard label="Admins" value={admins} helper="Gestão liberada" icon={Shield} />
          <StatCard label="Comuns" value={commonUsers} helper="Uso do gerador" icon={UserCog} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Gerações" value={generations.length} helper="Histórico total" icon={FileText} />
          <StatCard label="7 dias" value={generationsThisWeek} helper="Atividade recente" icon={BarChart3} />
          <StatCard label="Revisados" value={reviewedGenerations} helper="Passaram por revisão" icon={UserCheck} />
          <StatCard label="Forçados" value={forcedGenerations} helper="Com risco assumido" icon={Shield} />
          <StatCard label="Média chars" value={averageOutputLength} helper="Tamanho médio" icon={FileText} />
        </div>

        {generationsError ? (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Histórico de gerações ainda não disponível. Rode a migration de gerações no Supabase e depois o seed do
            dashboard.
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-bold">Distribuição por documento</h2>
                <p className="mt-1 text-sm text-muted">Volume de uso por tipo documental.</p>
              </div>
            </div>

            <div className="space-y-4 p-4">
              {Object.values(documentDefinitions).map((definition) => {
                const count = generations.filter((generation) => generation.document_kind === definition.kind).length;
                return (
                  <CountBar
                    key={definition.kind}
                    label={`${definition.shortName} - ${definition.name}`}
                    value={count}
                    total={maxGenerationCount}
                  />
                );
              })}
            </div>
          </div>

          <aside className="border border-line bg-white p-4">
            <h2 className="text-sm font-bold">Status das gerações</h2>
            <div className="mt-4 space-y-4">
              {statusCounts.map((item) => (
                <CountBar key={item.status} label={statusLabel(item.status)} value={item.count} total={generations.length} />
              ))}
            </div>
            <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
              {generationUsers} usuários ativos já aparecem no histórico de geração.
            </p>
          </aside>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-bold">Órgãos mais ativos</h2>
              <p className="mt-1 text-sm text-muted">Secretarias e unidades com maior volume no período carregado.</p>
            </div>
            <div className="space-y-4 p-4">
              {organizationCounts.map(([organization, count]) => (
                <CountBar key={organization} label={organization} value={count} total={generations.length} />
              ))}
            </div>
          </div>

          <div className="border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-bold">Usuários recentes</h2>
                <p className="mt-1 text-sm text-muted">Controle de acesso da plataforma.</p>
              </div>
              <Link href="/admin/usuarios" className="flex items-center gap-2 text-sm font-semibold text-civic">
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>
            <div className="divide-y divide-line">
              {recentProfiles.slice(0, 5).map((profile) => (
                <div key={profile.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="font-semibold">{profile.full_name || "Sem nome"}</p>
                    <p className="text-sm text-muted">{profile.email}</p>
                  </div>
                  <span className="w-fit border border-line px-2 py-1 text-xs font-semibold">
                    {profile.role === "admin" ? "Admin" : "Usuário"}
                  </span>
                  <span className="w-fit border border-line px-2 py-1 text-xs font-semibold">
                    {profile.access_status === "active" ? "Ativo" : "Bloqueado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold">Atividade recente</h2>
            <p className="mt-1 text-sm text-muted">Últimas minutas registradas no histórico.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-paper text-muted">
                <tr>
                  <th className="border-b border-line px-4 py-3 font-semibold">Documento</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Órgão</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Fonte</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {generations.slice(0, 10).map((generation) => (
                  <tr key={generation.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{generation.document_name}</p>
                      <p className="text-xs text-muted">{generation.risk ? `Risco ${generation.risk}` : "Sem alerta"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{generation.organization || "Não informado"}</td>
                    <td className="px-4 py-3">{statusLabel(generation.status)}</td>
                    <td className="px-4 py-3 uppercase text-muted">{generation.source}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(generation.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
