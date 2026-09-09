import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const users = [
  {
    email: "admin@withnocode.com",
    password: "Admin@123",
    fullName: "Administrador With No Code",
    role: "admin",
    allowedModules: ["compras_licitacoes", "atos_administrativos", "legislativo", "execucao_contratual"]
  },
  {
    email: "teste@withnocode.com",
    password: "Senha@123",
    fullName: "Usuário de Teste With No Code",
    role: "user",
    allowedModules: ["compras_licitacoes"]
  }
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
  const url = `${SUPABASE_URL}${path}`;
  const response = await fetch(url, {
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

async function findUserByEmail(email) {
  const result = await request(`/auth/v1/admin/users?page=1&per_page=100`);
  const usersList = Array.isArray(result?.users) ? result.users : [];

  return usersList.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function createOrUpdateAuthUser(seedUser) {
  const existing = await findUserByEmail(seedUser.email);

  if (existing) {
    await request(`/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        password: seedUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: seedUser.fullName
        }
      })
    });

    return existing.id;
  }

  const created = await request("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: seedUser.email,
      password: seedUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: seedUser.fullName
      }
    })
  });

  return created.id;
}

async function upsertProfile(id, seedUser) {
  await request("/rest/v1/file_generator_profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      id,
      email: seedUser.email,
      full_name: seedUser.fullName,
      role: seedUser.role,
      access_status: seedUser.accessStatus || "active",
      allowed_modules: seedUser.allowedModules || ["compras_licitacoes"]
    })
  });
}

loadLocalEnv();

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.");
  process.exit(1);
}

for (const user of users) {
  const id = await createOrUpdateAuthUser(user);
  await upsertProfile(id, user);
  console.log(`${user.email} criado/atualizado como ${user.role}.`);
}

console.log("Usuários iniciais prontos.");
