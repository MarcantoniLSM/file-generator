import Link from "next/link";
import { updateUserAccess } from "@/app/auth/actions";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user } = await requireAdmin();
  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : await createSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("file_generator_profiles")
    .select("id,email,full_name,role,access_status,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Administração</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Usuários e acessos</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Painel
            </Link>
            <Link href="/gerador" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Área interna
            </Link>
            <Link href="/logout" className="bg-civic px-4 py-2 text-sm font-semibold text-white">
              Sair
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold">Usuários cadastrados</h2>
            <p className="mt-1 text-sm text-muted">Altere papel e status de acesso dos usuários da plataforma.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-paper text-muted">
                <tr>
                  <th className="border-b border-line px-4 py-3 font-semibold">Usuário</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Papel</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Acesso</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Cadastro</th>
                  <th className="border-b border-line px-4 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {(profiles || []).map((profile) => {
                  const isSelf = profile.id === user?.id;

                  return (
                    <tr key={profile.id} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{profile.full_name || "Sem nome"}</p>
                        <p className="text-muted">{profile.email}</p>
                        {isSelf ? <p className="mt-1 text-xs text-civic">Você</p> : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize">{profile.role === "admin" ? "Admin" : "Usuário"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize">{profile.access_status === "active" ? "Ativo" : "Bloqueado"}</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{new Date(profile.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <form action={updateUserAccess} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={profile.id} />
                          <select
                            name="role"
                            defaultValue={profile.role}
                            disabled={isSelf}
                            className="border border-line bg-white px-2 py-2 disabled:bg-paper disabled:text-muted"
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                          <select
                            name="access_status"
                            defaultValue={profile.access_status}
                            disabled={isSelf}
                            className="border border-line bg-white px-2 py-2 disabled:bg-paper disabled:text-muted"
                          >
                            <option value="active">Ativo</option>
                            <option value="blocked">Bloqueado</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isSelf}
                            className="bg-civic px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Salvar
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
