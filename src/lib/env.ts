// Pembacaan env terpusat. Semua nilai opsional supaya mode lokal jalan tanpa konfigurasi.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  appSecret: process.env.APP_SECRET || "dev-secret-ganti-di-produksi",
  adminEmail: (process.env.ADMIN_EMAIL || "admin@magangdiary.local").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const isSupabaseMode = () => !!(env.supabaseUrl && env.supabaseServiceKey);
