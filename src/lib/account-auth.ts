import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Checks a password with a throwaway client that does not touch the caller's session. */
export async function verifyCurrentPassword(email: string, password: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !email) return false;

  const client = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}

/** JSON-only bodies require a CORS preflight from cross-site HTML forms. */
export function isJsonRequest(request: Request): boolean {
  return request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() === "application/json";
}