import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { documentModules } from "@/lib/document-types";

export const dynamic = "force-dynamic";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUserProfile();

  if (!session.configured || !session.user) {
    console.warn("[admin:update-user] Sessão ausente ao atualizar usuário.");
    return redirectTo(request, "/login");
  }

  if (session.profile?.access_status === "blocked") {
    console.warn("[admin:update-user] Admin bloqueado tentou atualizar usuário.", {
      userId: session.user.id,
      email: session.user.email
    });
    return redirectTo(request, "/login?erro=bloqueado");
  }

  if (session.profile?.role !== "admin") {
    console.warn("[admin:update-user] Usuário sem papel admin tentou atualizar usuário.", {
      userId: session.user.id,
      email: session.user.email,
      role: session.profile?.role
    });
    return redirectTo(request, "/gerador");
  }

  const formData = await request.formData();
  const id = getString(formData, "id");
  const role = getString(formData, "role");
  const accessStatus = getString(formData, "access_status");
  const allowedModules = formData
    .getAll("allowed_modules")
    .filter((value): value is string => typeof value === "string")
    .filter((value) => documentModules.includes(value as (typeof documentModules)[number]));

  if (!id || !["admin", "user"].includes(role) || !["active", "blocked"].includes(accessStatus)) {
    console.warn("[admin:update-user] Dados inválidos na atualização de usuário.", {
      id: Boolean(id),
      role,
      accessStatus
    });
    return redirectTo(request, "/admin/usuarios");
  }

  if (allowedModules.length === 0) {
    console.warn("[admin:update-user] Nenhum módulo selecionado para usuário.", {
      targetUserId: id
    });
    return redirectTo(request, "/admin/usuarios");
  }

  if (id === session.user.id && (role !== "admin" || accessStatus !== "active")) {
    console.warn("[admin:update-user] Admin tentou remover o próprio acesso.", {
      userId: session.user.id,
      email: session.user.email
    });
    return redirectTo(request, "/admin/usuarios");
  }

  const supabase = hasSupabaseAdminConfig() ? createSupabaseAdminClient() : await createSupabaseServerClient();
  const { error } = await supabase
    .from("file_generator_profiles")
    .update({
      role,
      access_status: accessStatus,
      allowed_modules: allowedModules
    })
    .eq("id", id);

  if (error) {
    console.error("[admin:update-user] Erro ao atualizar usuário.", {
      targetUserId: id,
      message: error.message
    });
    return redirectTo(request, "/admin/usuarios");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");

  return redirectTo(request, "/admin/usuarios");
}
