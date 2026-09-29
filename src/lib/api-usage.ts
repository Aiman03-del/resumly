import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/api-error";

/**
 * Persistent per-user daily quota, backed by the `api_usage` table (see
 * supabase/migrations/xxxx_api_usage.sql). Atomically increments today's
 * counter for this route and throws HttpError(429) once the caller's limit
 * is exceeded. Durable across cold starts and multiple server instances,
 * unlike the in-memory rate limiter.
 */
export async function enforceDailyQuota(
  supabase: SupabaseClient,
  route: string,
  limit: number,
): Promise<void> {
  const { data, error } = await supabase.rpc("increment_api_usage", { p_route: route });
  if (error) {
    // Fail closed on unexpected DB errors so quota can't be silently bypassed.
    throw new HttpError(503, "Could not verify your usage quota. Please try again shortly.");
  }
  const count = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(count) || count > limit) {
    throw new HttpError(429, `You've reached today's limit for this feature (${limit}/day). Please try again tomorrow.`);
  }
}
