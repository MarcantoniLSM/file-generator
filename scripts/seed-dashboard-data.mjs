import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const documentTypes = [
  ["etp", "Estudo Técnico Preliminar"],
  ["tr", "Termo de Referência"],
  ["edital_licitacao", "Edital de Licitação"],
  ["mapa_riscos", "Mapa de Riscos"],
  ["processo_dispensa", "Processo de Dispensa e Inexigibilidade"],
  ["pesquisa_precos", "Pesquisa de Preços"],
  ["parecer_juridico", "Parecer Jurídico de Compras"],
  ["decreto_portaria", "Decreto Executivo e Portaria"],
  ["minuta_contrato", "Minuta de Contrato Administrativo"],
  ["projeto_lei", "Projeto de Lei"],
  ["requerimento_legislativo", "Requerimento e Indicação"],
  ["parecer_comissao", "Parecer de Comissão"],
  ["emenda_parlamentar", "Emenda Parlamentar"],
  ["justificativa_projeto_lei", "Justificativa de Projeto de Lei"]
];

const organizations = [
  ["Sobral/CE", "Secretaria Municipal de Administração"],
  ["Sobral/CE", "Secretaria Municipal de Educacao"],
  ["Sobral/CE", "Secretaria Municipal de Saude"],
  ["Sobral/CE", "Procuradoria Geral do Município"],
  ["Sobral/CE", "Camara Municipal"],
  ["Sobral/CE", "Secretaria Municipal de Obras"]
];

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const file = readFileSync(envPath, "utf8");

    for (const line of file.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] ||= valueParts.join("=");
    }
  } catch {
    // .env.local is optional; envs can come from the shell.
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return data;
}

function daysAgo(days, hours = 0) {
  const daté = new Date();
  daté.setDate(daté.getDate() - days);
  daté.setHours(daté.getHours() - hours);
  return daté.toISOString();
}

function buildRows(users) {
  const activeUsers = users.filter((user) => user.access_status === "active");

  return Array.from({ length: 96 }, (_, index) => {
    const [document_kind, document_name] = documentTypes[index % documentTypes.length];
    const [municipality, organization] = organizations[index % organizations.length];
    const user = activeUsers[index % activeUsers.length];
    const isReviewed = index % 5 === 0;
    const isForced = index % 13 === 0;

    return {
      user_id: user.id,
      document_kind,
      document_name,
      source: "demo",
      risk: isForced ? "medio" : index % 7 === 0 ? "baixo" : null,
      status: isReviewed ? "reviewed" : isForced ? "forced_generation" : "generated",
      municipality,
      organization,
      prompt_tokens: 2400 + index * 37,
      output_length: 6500 + index * 113,
      created_at: daysAgo(index % 30, index % 9)
    };
  });
}

loadLocalEnv();

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.");
  process.exit(1);
}

const users = await request(
  "/rest/v1/file_generator_profiles?select=id,email,access_status&access_status=eq.active&order=email.asc"
);

if (!Array.isArray(users) || users.length === 0) {
  throw new Error("Nenhum usuário ativo encontrado. Rode npm run seed:users antes.");
}

await request("/rest/v1/file_generator_document_generations?source=eq.demo", {
  method: "DELETE"
});

const rows = buildRows(users);

await request("/rest/v1/file_generator_document_generations", {
  method: "POST",
  headers: {
    Prefer: "return=minimal"
  },
  body: JSON.stringify(rows)
});

console.log(`${rows.length} gerações de documentos inseridas no dashboard.`);
