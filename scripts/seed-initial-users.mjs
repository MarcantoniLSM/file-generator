import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const users = [
  {
    email: "admin@admin.com",
    password: "Senha@123",
    fullName: "Administrador",
    role: "admin"
  },
  {
    email: "usuario1@teste.com",
    password: "Senha@123",
    fullName: "Usuario Teste 1",
    role: "user"
  },
  {
    email: "usuario2@teste.com",
    password: "Senha@123",
    fullName: "Usuario Teste 2",
    role: "user"
  },
  {
    email: "usuario3@teste.com",
    password: "Senha@123",
    fullName: "Usuario Teste 3",
    role: "user"
  },
  {
    email: "compras@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Ana Paula Rocha - Setor de Compras",
    role: "user"
  },
  {
    email: "licitacao@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Bruno Almeida - Comissao de Licitacao",
    role: "user"
  },
  {
    email: "juridico@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Carla Menezes - Procuradoria Municipal",
    role: "admin"
  },
  {
    email: "controleinterno@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Daniel Freitas - Controle Interno",
    role: "user"
  },
  {
    email: "educacao@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Elaine Sousa - Secretaria de Educacao",
    role: "user"
  },
  {
    email: "saude@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Fabio Martins - Secretaria de Saude",
    role: "user"
  },
  {
    email: "assistencia@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Gabriela Lima - Assistencia Social",
    role: "user"
  },
  {
    email: "obras@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Henrique Costa - Secretaria de Obras",
    role: "user"
  },
  {
    email: "gabinete@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Isabela Nogueira - Gabinete",
    role: "admin"
  },
  {
    email: "camara@legislativo.gov.br",
    password: "Senha@123",
    fullName: "Joao Ribeiro - Camara Municipal",
    role: "user"
  },
  {
    email: "bloqueado@prefeitura.gov.br",
    password: "Senha@123",
    fullName: "Usuario Bloqueado - Demonstracao",
    role: "user",
    accessStatus: "blocked"
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
      access_status: seedUser.accessStatus || "active"
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

console.log("Usuarios iniciais prontos.");
