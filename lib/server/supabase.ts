import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseReadEnv() {
  return Boolean(url && (serviceKey || anonKey));
}

export function hasSupabaseWriteEnv() {
  return Boolean(url && serviceKey);
}

export function hasSupabaseEnv() {
  return hasSupabaseReadEnv();
}

export function createSupabaseReadClient() {
  const key = serviceKey ?? anonKey;

  if (!url || !key) {
    throw new Error("Missing Supabase read environment variables.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createSupabaseAdminClient() {
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
