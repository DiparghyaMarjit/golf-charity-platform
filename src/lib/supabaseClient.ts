import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

/** Placeholders only so `next build` / prerender can run when env is missing (e.g. misconfigured Vercel project). */
const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.build-placeholder-not-a-real-key";

const usingFallback = !supabaseUrl || !supabaseAnonKey;

if (usingFallback) {
  console.warn(
    "[golf-charity-platform] Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel → Settings → Environment Variables). Data features will fail until then."
  );
}

export const supabase = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_KEY
);

export const isSupabaseConfigured = !usingFallback;
