import { documentDefinitions, type DocumentKind } from "@/lib/document-types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";

type GenerationHistoryInput = {
  userId: string;
  kind: DocumentKind;
  source: string;
  status?: string;
  risk?: string;
  output?: string;
  institution?: Record<string, unknown>;
  values?: Record<string, unknown>;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveGenerationHistory(input: GenerationHistoryInput) {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const definition = documentDefinitions[input.kind];
  const municipality = asText(input.institution?.municipio_uf);
  const organization = asText(input.institution?.orgao_entidade) || asText(input.values?.orgao);
  const promptTokens = JSON.stringify({
    institution: input.institution,
    values: input.values
  }).length;

  const { error } = await supabase.from("file_generator_document_generations").insert({
    user_id: input.userId,
    document_kind: input.kind,
    document_name: definition.name,
    source: input.source,
    risk: input.risk || null,
    status: input.status || "generated",
    municipality: municipality || null,
    organization: organization || null,
    prompt_tokens: promptTokens,
    output_length: input.output?.length || 0
  });

  if (error) {
    console.warn("[generation-history] Nao foi possivel salvar historico.", {
      userId: input.userId,
      kind: input.kind,
      message: error.message
    });
  }
}
