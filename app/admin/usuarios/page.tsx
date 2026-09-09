import Link from "next/link";
import { AdminUsersTable } from "@/components/AdminUsersTable";
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
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Administração</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Gestão de usuários</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Painel
            </Link>
            <Link href="/gerador" className="border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-paper">
              Área interna
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

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AdminUsersTable profiles={profiles || []} currentUserId={user?.id} />
      </section>
    </main>
  );
}
