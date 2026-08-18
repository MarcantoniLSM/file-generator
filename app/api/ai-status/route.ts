import { NextResponse } from "next/server";
import { checkAIStatus } from "@/lib/ai";

export async function GET() {
  const result = await checkAIStatus();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
