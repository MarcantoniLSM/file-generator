import { NextResponse } from "next/server";
import { assessReadiness } from "@/lib/ai";
import { documentKinds, type DocumentKind } from "@/lib/document-types";

export async function POST(request: Request) {
  const body = await request.json();
  const kind = body.kind as DocumentKind;

  if (!documentKinds.includes(kind)) {
    return NextResponse.json({ error: "Tipo documental invalido." }, { status: 400 });
  }

  const values = typeof body.values === "object" && body.values ? body.values : {};
  const institution = typeof body.institution === "object" && body.institution ? body.institution : {};
  const result = await assessReadiness({ kind, values, institution });

  if (result.source === "unavailable") {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}
