import GeneratorApp from "@/components/GeneratorApp";
import { requireUser } from "@/lib/auth";
import { canAccessDocumentKind, documentCatalog, getDocumentModule, isDocumentKind } from "@/lib/document-types";

export const dynamic = "force-dynamic";

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { profile } = await requireUser();
  const { tipo } = await searchParams;
  const allowedModules = profile?.allowed_modules || [];
  const firstAllowedKind = documentCatalog.find((document) =>
    allowedModules.includes(getDocumentModule(document.category))
  )?.kind;
  const requestedKind = isDocumentKind(tipo) && canAccessDocumentKind(tipo, allowedModules) ? tipo : undefined;

  return <GeneratorApp initialKind={requestedKind || firstAllowedKind} allowedModules={allowedModules} />;
}
