// Data layer Supabase. Jalankan supabase/schema.sql di project kamu, lalu isi env SUPABASE_*.
// Semua akses dari server memakai service role (tidak pernah dikirim ke browser).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BetaSignup, DB, License, RemoteConfig, Stats, TelemetryEntry, UsageEntry, User } from "./types";
import { DEFAULT_CONFIG } from "./types";
import { env } from "../env";

let client: SupabaseClient | null = null;
function sb() {
  if (!client) client = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } });
  return client;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const userRow = (r: any): User => ({ id: r.id, email: r.email, name: r.name || "", role: r.role || "user", createdAt: r.created_at, authId: r.auth_id || null });
const licRow = (r: any): License => ({
  id: r.id, key: r.key, userId: r.user_id, email: r.email, plan: r.plan, status: r.status, dailyQuota: r.daily_quota,
  expiresAt: r.expires_at, createdAt: r.created_at, lastUsedAt: r.last_used_at, deviceId: r.device_id, deviceName: r.device_name, note: r.note || "",
});
const usageRow = (r: any): UsageEntry => ({
  id: r.id, licenseId: r.license_id, email: r.email, createdAt: r.created_at, model: r.model, promptTokens: r.prompt_tokens,
  completionTokens: r.completion_tokens, ok: r.ok, error: r.error || "", templateId: r.template_id || "", briefLength: r.brief_length || 0, offline: !!r.offline,
});
const licToRow = (l: Partial<License>) => {
  const o: Record<string, unknown> = {};
  if (l.key !== undefined) o.key = l.key;
  if (l.userId !== undefined) o.user_id = l.userId;
  if (l.email !== undefined) o.email = l.email;
  if (l.plan !== undefined) o.plan = l.plan;
  if (l.status !== undefined) o.status = l.status;
  if (l.dailyQuota !== undefined) o.daily_quota = l.dailyQuota;
  if (l.expiresAt !== undefined) o.expires_at = l.expiresAt;
  if (l.lastUsedAt !== undefined) o.last_used_at = l.lastUsedAt;
  if (l.deviceId !== undefined) o.device_id = l.deviceId;
  if (l.deviceName !== undefined) o.device_name = l.deviceName;
  if (l.note !== undefined) o.note = l.note;
  return o;
};

export const supabaseDb: DB = {
  async getUserByEmail(email) {
    const { data } = await sb().from("profiles").select("*").eq("email", email.toLowerCase()).maybeSingle();
    return data ? userRow(data) : null;
  },
  async getUserById(id) {
    const { data } = await sb().from("profiles").select("*").eq("id", id).maybeSingle();
    return data ? userRow(data) : null;
  },
  async getUserByAuthId(authId) {
    const { data } = await sb().from("profiles").select("*").eq("auth_id", authId).maybeSingle();
    return data ? userRow(data) : null;
  },
  async linkAuthId(id, authId) {
    await sb().from("profiles").update({ auth_id: authId }).eq("id", id);
  },
  async createUser(u) {
    // Biasanya profil dibuat trigger saat daftar lewat Supabase Auth; ini cadangan kalau belum ada.
    const { data, error } = await sb().from("profiles").upsert({ email: u.email.toLowerCase(), name: u.name, role: u.role, auth_id: u.authId || null }, { onConflict: "email" }).select().single();
    if (error) throw error;
    return userRow(data);
  },
  async listUsers() {
    const { data } = await sb().from("profiles").select("*").order("created_at", { ascending: false });
    return (data || []).map(userRow);
  },
  async setUserRole(id, role) {
    await sb().from("profiles").update({ role }).eq("id", id);
  },
  async getLicenseByKey(key) {
    const { data } = await sb().from("licenses").select("*").eq("key", key.trim().toUpperCase()).maybeSingle();
    return data ? licRow(data) : null;
  },
  async listLicenses(filter) {
    let q = sb().from("licenses").select("*").order("created_at", { ascending: false });
    if (filter?.userId) q = q.eq("user_id", filter.userId);
    if (filter?.email) q = q.eq("email", filter.email.toLowerCase());
    const { data } = await q;
    return (data || []).map(licRow);
  },
  async createLicense(l) {
    const { data, error } = await sb().from("licenses").insert(licToRow({ ...l, email: l.email.toLowerCase() })).select().single();
    if (error) throw error;
    return licRow(data);
  },
  async updateLicense(id, patch) {
    const { data } = await sb().from("licenses").update(licToRow(patch)).eq("id", id).select().maybeSingle();
    return data ? licRow(data) : null;
  },
  async logUsage(u) {
    await sb().from("usage_log").insert({
      license_id: u.licenseId, email: u.email, model: u.model, prompt_tokens: u.promptTokens, completion_tokens: u.completionTokens,
      ok: u.ok, error: u.error, template_id: u.templateId, brief_length: u.briefLength, offline: u.offline,
    });
  },
  async countUsageToday(licenseId) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { count } = await sb().from("usage_log").select("id", { count: "exact", head: true })
      .eq("license_id", licenseId).eq("ok", true).gte("created_at", start.toISOString());
    return count || 0;
  },
  async listUsage({ licenseId, limit = 50 }) {
    let q = sb().from("usage_log").select("*").order("created_at", { ascending: false }).limit(limit);
    if (licenseId) q = q.eq("license_id", licenseId);
    const { data } = await q;
    return (data || []).map(usageRow);
  },
  async logTelemetry(t) {
    await sb().from("telemetry").insert({ event: t.event, detail: t.detail, version: t.version, license_id: t.licenseId, email: t.email });
  },
  async listTelemetry(limit = 50) {
    const { data } = await sb().from("telemetry").select("*").order("created_at", { ascending: false }).limit(limit);
    return (data || []).map((r: any): TelemetryEntry => ({ id: r.id, createdAt: r.created_at, event: r.event, detail: r.detail || "", version: r.version || "", licenseId: r.license_id, email: r.email || "" }));
  },
  async addBeta(b) {
    const { error } = await sb().from("beta_signups").insert({ email: b.email.toLowerCase(), kampus: b.kampus, note: b.note });
    if (error && String(error.code) === "23505") return { ok: true, dup: true };
    if (error) throw error;
    return { ok: true, dup: false };
  },
  async listBeta() {
    const { data } = await sb().from("beta_signups").select("*").order("created_at", { ascending: false });
    return (data || []).map((r: any): BetaSignup => ({ id: r.id, createdAt: r.created_at, email: r.email, kampus: r.kampus || "", note: r.note || "" }));
  },
  async publicStats() {
    const [{ count: users }, { count: generates }, { count: licenses }] = await Promise.all([
      sb().from("profiles").select("id", { count: "exact", head: true }),
      sb().from("usage_log").select("id", { count: "exact", head: true }).eq("ok", true),
      sb().from("licenses").select("id", { count: "exact", head: true }),
    ]);
    return { users: users || 0, generates: generates || 0, licenses: licenses || 0 };
  },
  async getConfig() {
    const { data } = await sb().from("remote_config").select("*").eq("id", 1).maybeSingle();
    if (!data) return DEFAULT_CONFIG;
    return {
      model: data.model, defaultDailyQuota: data.default_daily_quota, maxBriefChars: data.max_brief_chars, systemPromptExtra: data.system_prompt_extra || "",
      announcement: data.announcement || "", minExtensionVersion: data.min_extension_version || "", trialDays: data.trial_days, updatedAt: data.updated_at,
    };
  },
  async setConfig(patch) {
    const cur = await this.getConfig();
    const next: RemoteConfig = { ...cur, ...patch, updatedAt: new Date().toISOString() };
    await sb().from("remote_config").upsert({
      id: 1, model: next.model, default_daily_quota: next.defaultDailyQuota, max_brief_chars: next.maxBriefChars, system_prompt_extra: next.systemPromptExtra,
      announcement: next.announcement, min_extension_version: next.minExtensionVersion, trial_days: next.trialDays, updated_at: next.updatedAt,
    });
    return next;
  },
  async stats(): Promise<Stats> {
    const now = Date.now();
    const since30 = new Date(now - 30 * 86400000).toISOString();
    const [{ count: users }, { data: lic }, { data: usage }] = await Promise.all([
      sb().from("profiles").select("id", { count: "exact", head: true }),
      sb().from("licenses").select("status,expires_at"),
      sb().from("usage_log").select("created_at,ok,prompt_tokens,completion_tokens").gte("created_at", since30),
    ]);
    const rows = (usage || []) as any[];
    const today = new Date().toISOString().slice(0, 10);
    const perDay: Stats["perDay"] = [];
    for (let d = 13; d >= 0; d--) {
      const k = new Date(now - d * 86400000).toISOString().slice(0, 10);
      const r = rows.filter((u) => u.created_at.slice(0, 10) === k);
      perDay.push({ date: k, count: r.filter((u) => u.ok).length, errors: r.filter((u) => !u.ok).length });
    }
    return {
      users: users || 0,
      activeLicenses: (lic || []).filter((l: any) => l.status === "active" && Date.parse(l.expires_at) > now).length,
      generatesToday: rows.filter((u) => u.ok && u.created_at.slice(0, 10) === today).length,
      generates30d: rows.filter((u) => u.ok).length,
      tokens30d: rows.reduce((a, u) => a + (u.prompt_tokens || 0) + (u.completion_tokens || 0), 0),
      errors7d: rows.filter((u) => !u.ok && now - Date.parse(u.created_at) < 7 * 86400000).length,
      perDay,
    };
  },
};
