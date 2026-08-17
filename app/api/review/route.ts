import { NextResponse } from "next/server";
import { documentKinds, type DocumentKind } from "@/lib/document-types";
import { reviewDraft } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const kind = body.kind as DocumentKind;

  if (!documentKinds.includes(kind)) {
    return NextResponse.json({ error: "Tipo documental invalido." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Informe um texto para revisar." }, { status: 400 });
  }

  const result = await reviewDraft({ kind, text });

  return NextResponse.json(result);
}
