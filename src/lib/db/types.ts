// Kontrak data. Implementasi: Supabase (src/lib/db/supabase.ts).

export type Role = "user" | "admin";
export type Plan = "trial" | "pro" | "tim";
export type LicenseStatus = "active" | "revoked" | "expired";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  authId?: string | null; // id di Supabase Auth
}

export interface License {
  id: string;
  key: string;
  userId: string | null;
  email: string;
  plan: Plan;
  status: LicenseStatus;
  dailyQuota: number;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  deviceId: string | null;
  deviceName: string | null;
  note: string;
}

export interface UsageEntry {
  id: string;
  licenseId: string;
  email: string;
  createdAt: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  ok: boolean;
  error: string;
  templateId: string;
  briefLength: number;
  offline: boolean;
}

export interface TelemetryEntry {
  id: string;
  createdAt: string;
  event: string;      // mis. "detect-failed", "generate-error", "device-change", "update-required"
  detail: string;
  version: string;
  licenseId: string | null;
  email: string;
}

export interface BetaSignup {
  id: string;
  createdAt: string;
  email: string;
  kampus: string;
  note: string;
}

export interface PublicStats { users: number; generates: number; licenses: number }

export interface RemoteConfig {
  model: string;
  defaultDailyQuota: number;
  maxBriefChars: number;
  systemPromptExtra: string;
  announcement: string;
  minExtensionVersion: string;
  trialDays: number;
  updatedAt: string;
}

export interface Stats {
  users: number;
  activeLicenses: number;
  generatesToday: number;
  generates30d: number;
  tokens30d: number;
  errors7d: number;
  perDay: { date: string; count: number; errors: number }[];
}

export interface DB {
  // users
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getUserByAuthId(authId: string): Promise<User | null>;
  linkAuthId(id: string, authId: string): Promise<void>;
  createUser(u: Omit<User, "id" | "createdAt">): Promise<User>;
  listUsers(): Promise<User[]>;
  setUserRole(id: string, role: Role): Promise<void>;
  // licenses
  getLicenseByKey(key: string): Promise<License | null>;
  listLicenses(filter?: { userId?: string; email?: string }): Promise<License[]>;
  createLicense(l: Omit<License, "id" | "createdAt" | "lastUsedAt">): Promise<License>;
  updateLicense(id: string, patch: Partial<License>): Promise<License | null>;
  // usage
  logUsage(u: Omit<UsageEntry, "id" | "createdAt">): Promise<void>;
  countUsageToday(licenseId: string): Promise<number>;
  listUsage(opts: { licenseId?: string; limit?: number }): Promise<UsageEntry[]>;
  // telemetri (anonim, opt-in dari ekstensi)
  logTelemetry(t: Omit<TelemetryEntry, "id" | "createdAt">): Promise<void>;
  listTelemetry(limit?: number): Promise<TelemetryEntry[]>;
  // daftar beta tester
  addBeta(b: Omit<BetaSignup, "id" | "createdAt">): Promise<{ ok: boolean; dup: boolean }>;
  listBeta(): Promise<BetaSignup[]>;
  publicStats(): Promise<PublicStats>;
  // config
  getConfig(): Promise<RemoteConfig>;
  setConfig(patch: Partial<RemoteConfig>): Promise<RemoteConfig>;
  // stats
  stats(): Promise<Stats>;
}

export const DEFAULT_CONFIG: RemoteConfig = {
  model: "gpt-4o-mini",
  defaultDailyQuota: 6,
  maxBriefChars: 1200,
  systemPromptExtra: "",
  announcement: "",
  minExtensionVersion: "0.2.0",
  trialDays: 7,
  updatedAt: new Date(0).toISOString(),
};
