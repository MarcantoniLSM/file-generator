import { redirect } from "next/navigation";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "./supabase/config";
import { createSupabaseAdminClient } from "./supabase/admin";
import { createSupabaseServerClient } from "./supabase/server";
import type { DocumentModule } from "./document-types";

export type UserRole = "admin" | "user";
export type AccessStatus = "active" | "blocked";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  access_status: AccessStatus;
  allowed_modules: DocumentModule[];
  created_at: string;
  updated_at: string;
};

export function getProfileAllowedModules(profile: Pick<UserProfile, "role"> & { allowed_modules?: DocumentModule[] | null }) {
  if (profile.allowed_modules?.length) return profile.allowed_modules;

  return profile.role === "admin"
    ? (["compras_licitacoes", "atos_administrativos", "legislativo"] satisfies DocumentModule[])
    : (["compras_licitacoes"] satisfies DocumentModule[]);
}

export async function getCurrentUserProfile() {
  if (!hasSupabaseConfig()) {
    return { user: null, profile: null, configured: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, configured: true };
  }

  const profileClient = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : supabase;
  const { data: profile } = await profileClient
    .from("file_generator_profiles")
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  const normalizedProfile = profile ? { ...profile, allowed_modules: getProfileAllowedModules(profile) } : null;

  return { user, profile: normalizedProfile, configured: true };
}

export async function requireUser() {
  const session = await getCurrentUserProfile();

  if (!session.configured) {
    console.warn("[auth:require-user] Supabase não configurado.");
    redirect("/login?erro=configuracao");
  }

  if (!session.user) {
    console.warn("[auth:require-user] Usuário ausente na sessão.");
    redirect("/login");
  }

  if (session.profile?.access_status === "blocked") {
    console.warn("[auth:require-user] Usuário bloqueado.", {
      userId: session.user?.id,
      email: session.user?.email
    });
    redirect("/login?erro=bloqueado");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    console.warn("[auth:require-admin] Usuário sem papel admin.", {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.profile?.role
    });
    redirect("/gerador");
  }

  return session;
}
