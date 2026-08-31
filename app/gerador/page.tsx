import GeneratorApp from "@/components/GeneratorApp";
import { requireUser } from "@/lib/auth";
import { isDocumentKind } from "@/lib/document-types";

export const dynamic = "force-dynamic";

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  await requireUser();
  const { tipo } = await searchParams;

  return <GeneratorApp initialKind={isDocumentKind(tipo) ? tipo : undefined} />;
}
