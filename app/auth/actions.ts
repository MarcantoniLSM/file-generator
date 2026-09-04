"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/supabase/config";
import { requireAdmin, type AccessStatus, type UserProfile, type UserRole } from "@/lib/auth";

type AuthState = {
  message?: string;
};

function requireSupabaseConfig(): AuthState | null {
  if (hasSupabaseConfig()) return null;

  return {
    message: "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY."
  };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const configError = requireSupabaseConfig();
  if (configError) return configError;

  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    return { message: "Informe email e senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { message: "Não foi possível entrar. Verifique email e senha." };
  }

  const profileClient = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : supabase;
  const { data: profile } = await profileClient
    .from("file_generator_profiles")
    .select("id,email,full_name,role,access_status,created_at,updated_at")
    .eq("id", data.user.id)
    .single<UserProfile>();

  if (profile?.access_status === "blocked") {
    redirect("/login?erro=bloqueado");
  }

  redirect(profile?.role === "admin" ? "/admin" : "/gerador");
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const configError = requireSupabaseConfig();
  if (configError) return configError;

  const fullName = getString(formData, "full_name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!fullName || !email || password.length < 8) {
    return { message: "Informe nome, email e senha com pelo menos 8 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return { message: "Não foi possível criar a conta. Verifique os dados informados." };
  }

  redirect("/gerador");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateUserAccess(formData: FormData) {
  const { user } = await requireAdmin();
  const id = getString(formData, "id");
  const role = getString(formData, "role") as UserRole;
  const accessStatus = getString(formData, "access_status") as AccessStatus;

  if (!id || !["admin", "user"].includes(role) || !["active", "blocked"].includes(accessStatus)) {
    return;
  }

  if (id === user?.id && (role !== "admin" || accessStatus !== "active")) {
    return;
  }

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : await createSupabaseServerClient();
  await supabase
    .from("file_generator_profiles")
    .update({
      role,
      access_status: accessStatus
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}
