export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

export function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || "";
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}
