import Link from "next/link";
import { ArrowRight, Shield, UserCheck, UserCog, UserX, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  access_status: "active" | "blocked";
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

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : await createSupabaseServerClient();
  const { data } = await supabase
    .from("file_generator_profiles")
    .select("id,email,full_name,role,access_status,created_at")
    .order("created_at", { ascending: false });

  const profiles = (data || []) as Profile[];
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter((profile) => profile.access_status === "active").length;
  const blockedUsers = profiles.filter((profile) => profile.access_status === "blocked").length;
  const admins = profiles.filter((profile) => profile.role === "admin").length;
  const commonUsers = profiles.filter((profile) => profile.role === "user").length;
  const recentProfiles = profiles.slice(0, 8);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Administracao</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Painel admin</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/gerador" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Area interna
            </Link>
            <Link href="/admin/usuarios" className="bg-civic px-4 py-2 text-sm font-semibold text-white">
              Gerenciar usuarios
            </Link>
            <Link href="/logout" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Sair
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Usuarios" value={totalUsers} helper="Contas cadastradas" icon={Users} />
          <StatCard label="Ativos" value={activeUsers} helper="Podem acessar" icon={UserCheck} />
          <StatCard label="Bloqueados" value={blockedUsers} helper="Sem acesso" icon={UserX} />
          <StatCard label="Admins" value={admins} helper="Gestao liberada" icon={Shield} />
          <StatCard label="Comuns" value={commonUsers} helper="Uso do gerador" icon={UserCog} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-bold">Usuarios recentes</h2>
                <p className="mt-1 text-sm text-muted">Amostra dos perfis cadastrados no Supabase.</p>
              </div>
              <Link href="/admin/usuarios" className="flex items-center gap-2 text-sm font-semibold text-civic">
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-line">
              {recentProfiles.map((profile) => (
                <div key={profile.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="font-semibold">{profile.full_name || "Sem nome"}</p>
                    <p className="text-sm text-muted">{profile.email}</p>
                  </div>
                  <span className="w-fit border border-line px-2 py-1 text-xs font-semibold">
                    {profile.role === "admin" ? "Admin" : "Usuario"}
                  </span>
                  <span className="w-fit border border-line px-2 py-1 text-xs font-semibold">
                    {profile.access_status === "active" ? "Ativo" : "Bloqueado"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-line bg-white p-4">
            <h2 className="text-sm font-bold">Operacao</h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>Use este painel para conferir a base de usuarios e validar se o controle de acesso esta funcionando.</p>
              <p>O usuario admin consegue liberar, bloquear e promover contas pela tela de gerenciamento.</p>
            </div>
            <Link
              href="/admin/usuarios"
              className="mt-5 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-white"
            >
              Abrir usuarios <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
