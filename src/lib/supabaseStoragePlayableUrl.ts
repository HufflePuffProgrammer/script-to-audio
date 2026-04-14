import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-playable URL for a Storage object. Signed URLs work for **private** buckets;
 * `getPublicUrl` alone often403s when the bucket is not public.
 */
export async function getPlayableStorageObjectUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): Promise<string | null> {
  const fromEnv = process.env.SUPABASE_AUDIO_SIGNED_URL_EXPIRY_SEC;
  const ttl = Math.min(
    60 * 60 * 24 * 365,
    Math.max(60, fromEnv ? Number(fromEnv) : 60 * 60 * 24 * 7),
  );

  const signed = await supabase.storage.from(bucket).createSignedUrl(path, ttl);
  if (!signed.error && signed.data?.signedUrl) {
    return signed.data.signedUrl;
  }

  console.warn(
    "Storage createSignedUrl failed; falling back to public URL (set bucket public or fix policies):",
    signed.error?.message,
  );
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl ?? null;
}
