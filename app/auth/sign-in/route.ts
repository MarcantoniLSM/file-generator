import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    console.warn("[auth:sign-in] Supabase config ausente.");
    return NextResponse.redirect(new URL("/login?erro=configuracao", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    console.warn("[auth:sign-in] Email ou senha ausentes.");
    return NextResponse.redirect(new URL("/login?erro=credenciais", request.url), { status: 303 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.warn("[auth:sign-in] Falha no login.", {
      email,
      message: error?.message
    });
    return NextResponse.redirect(new URL("/login?erro=credenciais", request.url), { status: 303 });
  }

  const profileClient = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : supabase;
  const { data: profile, error: profileError } = await profileClient
    .from("file_generator_profiles")
    .select("id,email,full_name,role,access_status,created_at,updated_at")
    .eq("id", data.user.id)
    .single<UserProfile>();

  console.info("[auth:sign-in] Login validado.", {
    email,
    userId: data.user.id,
    hasProfile: Boolean(profile),
    role: profile?.role,
    accessStatus: profile?.access_status,
    profileError: profileError?.message
  });

  if (profile?.access_status === "blocked") {
    return NextResponse.redirect(new URL("/login?erro=bloqueado", request.url), { status: 303 });
  }

  const redirectTo = profile?.role === "admin" ? "/admin" : "/gerador";
  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}
