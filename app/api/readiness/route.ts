import { NextResponse } from "next/server";
import { assessReadiness } from "@/lib/ai";
import { getCurrentUserProfile } from "@/lib/auth";
import { canAccessDocumentKind, documentKinds, type DocumentKind } from "@/lib/document-types";

export async function POST(request: Request) {
  const { user, profile, configured } = await getCurrentUserProfile();

  if (!configured || !user || profile?.access_status === "blocked") {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const kind = body.kind as DocumentKind;

  if (!documentKinds.includes(kind)) {
    return NextResponse.json({ error: "Tipo documental inválido." }, { status: 400 });
  }

  if (!canAccessDocumentKind(kind, profile?.allowed_modules)) {
    return NextResponse.json({ error: "Você não tem acesso a este módulo." }, { status: 403 });
  }

  const values = typeof body.values === "object" && body.values ? body.values : {};
  const institution = typeof body.institution === "object" && body.institution ? body.institution : {};
  const result = await assessReadiness({ kind, values, institution });

  if (result.source === "unavailable") {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}
