// Pembacaan env terpusat. Supabase wajib: auth, data, dan admin semuanya lewat Supabase.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function assertSupabaseEnv() {
  const missing = [["NEXT_PUBLIC_SUPABASE_URL", env.supabaseUrl], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.supabaseAnonKey], ["SUPABASE_SERVICE_ROLE_KEY", env.supabaseServiceKey]].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error("Env Supabase belum diisi: " + missing.join(", ") + ". Salin .env.example ke .env.local.");
}
