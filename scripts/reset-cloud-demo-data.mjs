import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const keepUsers = [
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

async function listAuthUsers(page = 1, users = []) {
  const result = await request(`/auth/v1/admin/users?page=${page}&per_page=100`);
  const pageUsers = Array.isArray(result?.users) ? result.users : [];
  const allUsers = [...users, ...pageUsers];
  const hasNextPage = pageUsers.length === 100;

  return hasNextPage ? listAuthUsers(page + 1, allUsers) : allUsers;
}

async function createOrUpdateAuthUser(seedUser) {
  const authUsers = await listAuthUsers();
  const existing = authUsers.find((user) => user.email?.toLowerCase() === seedUser.email.toLowerCase());

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
      access_status: "active",
      allowed_modules: seedUser.allowedModules
    })
  });
}

loadLocalEnv();

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar a limpeza.");
  process.exit(1);
}

const keepEmails = new Set(keepUsers.map((user) => user.email.toLowerCase()));
const keepIds = new Set();

for (const user of keepUsers) {
  const id = await createOrUpdateAuthUser(user);
  keepIds.add(id);
  await upsertProfile(id, user);
  console.log(`${user.email} pronto como ${user.role}.`);
}

await request("/rest/v1/file_generator_document_generations?id=not.is.null", {
  method: "DELETE"
});
console.log("Histórico de gerações removido.");

const profiles = await request("/rest/v1/file_generator_profiles?select=id,email");
const removableProfiles = Array.isArray(profiles)
  ? profiles.filter((profile) => !keepEmails.has(profile.email?.toLowerCase()))
  : [];

for (const profile of removableProfiles) {
  await request(`/rest/v1/file_generator_profiles?id=eq.${profile.id}`, {
    method: "DELETE"
  });
}
console.log(`${removableProfiles.length} perfis falsos removidos.`);

const authUsers = await listAuthUsers();
const removableAuthUsers = authUsers.filter((user) => user.id && !keepIds.has(user.id));

for (const user of removableAuthUsers) {
  await request(`/auth/v1/admin/users/${user.id}`, {
    method: "DELETE"
  });
}
console.log(`${removableAuthUsers.length} usuários falsos removidos do Auth.`);

console.log("Banco limpo e usuários definitivos prontos.");
