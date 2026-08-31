import { NextResponse } from "next/server";
import { documentKinds, type DocumentKind } from "@/lib/document-types";
import { reviewDraft } from "@/lib/ai";
import { getCurrentUserProfile } from "@/lib/auth";

export async function POST(request: Request) {
  const { user, profile, configured } = await getCurrentUserProfile();

  if (!configured || !user || profile?.access_status === "blocked") {
    return NextResponse.json({ error: "Acesso nao autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const kind = body.kind as DocumentKind;

  if (!documentKinds.includes(kind)) {
    return NextResponse.json({ error: "Tipo documental invalido." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  const institution = typeof body.institution === "object" && body.institution ? body.institution : {};

  if (!text.trim()) {
    return NextResponse.json({ error: "Informe um texto para revisar." }, { status: 400 });
  }

  const result = await reviewDraft({ kind, text, institution });

  if (result.source === "unavailable") {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}
