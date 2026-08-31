import { redirect } from "next/navigation";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "./supabase/config";
import { createSupabaseAdminClient } from "./supabase/admin";
import { createSupabaseServerClient } from "./supabase/server";

export type UserRole = "admin" | "user";
export type AccessStatus = "active" | "blocked";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  access_status: AccessStatus;
  created_at: string;
  updated_at: string;
};

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
    .select("id,email,full_name,role,access_status,created_at,updated_at")
    .eq("id", user.id)
    .single<UserProfile>();

  return { user, profile, configured: true };
}

export async function requireUser() {
  const session = await getCurrentUserProfile();

  if (!session.configured) {
    redirect("/login?erro=configuracao");
  }

  if (!session.user) {
    redirect("/login");
  }

  if (session.profile?.access_status === "blocked") {
    redirect("/login?erro=bloqueado");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    redirect("/gerador");
  }

  return session;
}
