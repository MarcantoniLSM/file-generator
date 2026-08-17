import { NextResponse } from "next/server";
import { documentKinds, type DocumentKind } from "@/lib/document-types";
import { generateDraft } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const kind = body.kind as DocumentKind;

  if (!documentKinds.includes(kind)) {
    return NextResponse.json({ error: "Tipo documental invalido." }, { status: 400 });
  }

  const values = typeof body.values === "object" && body.values ? body.values : {};
  const result = await generateDraft({ kind, values });

  return NextResponse.json(result);
}
