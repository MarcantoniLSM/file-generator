import { NextResponse } from "next/server";
import { documentKinds, type DocumentKind } from "@/lib/document-types";
import { generateDraft } from "@/lib/ai";
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

  const values = typeof body.values === "object" && body.values ? body.values : {};
  const institution = typeof body.institution === "object" && body.institution ? body.institution : {};
  const result = await generateDraft({ kind, values, institution });

  if (result.source === "unavailable") {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}
