import GeneratorApp from "@/components/GeneratorApp";
import { isDocumentKind } from "@/lib/document-types";

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;

  return <GeneratorApp initialKind={isDocumentKind(tipo) ? tipo : undefined} />;
}
