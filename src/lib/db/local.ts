// Mode lokal: satu file JSON di web/.data/db.json. Untuk testing dan demo, bukan produksi.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { BetaSignup, DB, License, RemoteConfig, Role, Stats, TelemetryEntry, UsageEntry, User } from "./types";
import { DEFAULT_CONFIG } from "./types";
import { env } from "../env";
import { hashPassword, makeLicenseKey } from "../crypto";

interface Store {
  users: User[];
  licenses: License[];
  usage: UsageEntry[];
  config: RemoteConfig;
  telemetry?: TelemetryEntry[];
  beta?: BetaSignup[];
}

const FILE = path.join(process.cwd(), ".data", "db.json");
let cache: Store | null = null;
let writing: Promise<void> = Promise.resolve();

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function seed(): Promise<Store> {
  const now = new Date();
  const admin: User = {
    id: randomUUID(),
    email: env.adminEmail,
    name: "Admin",
    role: "admin",
    createdAt: now.toISOString(),
    passwordHash: hashPassword(env.adminPassword),
  };
  const demo: User = {
    id: randomUUID(),
    email: "demo@absenin.local",
    name: "Peserta Demo",
    role: "user",
    createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    passwordHash: hashPassword("demo123"),
  };
  const lic: License = {
    id: randomUUID(),
    key: makeLicenseKey(),
    userId: demo.id,
    email: demo.email,
    plan: "pro",
    status: "active",
    dailyQuota: 6,
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
    createdAt: demo.createdAt,
    lastUsedAt: null,
    deviceId: null,
    deviceName: null,
    note: "Lisensi demo (seed)",
  };
  // riwayat pemakaian 14 hari terakhir supaya grafik admin ada isinya
  const usage: UsageEntry[] = [];
  for (let d = 13; d >= 0; d--) {
    const n = d % 6 === 0 ? 0 : 1 + ((d * 7) % 4);
    for (let i = 0; i < n; i++) {
      const t = new Date(now.getTime() - d * 86400000 - i * 3600000);
      usage.push({
        id: randomUUID(),
        licenseId: lic.id,
        email: demo.email,
        createdAt: t.toISOString(),
        model: "gpt-4o-mini",
        promptTokens: 420 + i * 15,
        completionTokens: 310 + i * 10,
        ok: !(d === 3 && i === 1),
        error: d === 3 && i === 1 ? "OpenAI 429 rate limit" : "",
        templateId: ["teknis", "data", "admin", "rapat"][i % 4],
        briefLength: 60 + i * 12,
        offline: false,
      });
    }
  }
  return { users: [admin, demo], licenses: [lic], usage, config: { ...DEFAULT_CONFIG, updatedAt: now.toISOString() } };
}

async function load(): Promise<Store> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    cache = JSON.parse(raw) as Store;
  } catch {
    cache = await seed();
    await persist();
  }
  return cache!;
}

async function persist() {
  const data = JSON.stringify(cache, null, 2);
  writing = writing.then(async () => {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, data, "utf8");
  });
  await writing;
}

export const localDb: DB = {
  async getUserByEmail(email) {
    const s = await load();
    return s.users.find((u) => u.email === email.toLowerCase()) || null;
  },
  async getUserById(id) {
    const s = await load();
    return s.users.find((u) => u.id === id) || null;
  },
  async createUser(u) {
    const s = await load();
    const user: User = { ...u, email: u.email.toLowerCase(), id: randomUUID(), createdAt: new Date().toISOString() };
    s.users.push(user);
    await persist();
    return user;
  },
  async listUsers() {
    const s = await load();
    return [...s.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async setUserRole(id, role: Role) {
    const s = await load();
    const u = s.users.find((x) => x.id === id);
    if (u) { u.role = role; await persist(); }
  },
  async getLicenseByKey(key) {
    const s = await load();
    return s.licenses.find((l) => l.key === key.trim().toUpperCase()) || null;
  },
  async listLicenses(filter) {
    const s = await load();
    let list = [...s.licenses];
    if (filter?.userId) list = list.filter((l) => l.userId === filter.userId);
    const email = filter?.email?.toLowerCase();
    if (email) list = list.filter((l) => l.email === email);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createLicense(l) {
    const s = await load();
    const lic: License = { ...l, email: l.email.toLowerCase(), id: randomUUID(), createdAt: new Date().toISOString(), lastUsedAt: null };
    s.licenses.push(lic);
    await persist();
    return lic;
  },
  async updateLicense(id, patch) {
    const s = await load();
    const l = s.licenses.find((x) => x.id === id);
    if (!l) return null;
    Object.assign(l, patch);
    await persist();
    return l;
  },
  async logUsage(u) {
    const s = await load();
    s.usage.push({ ...u, id: randomUUID(), createdAt: new Date().toISOString() });
    if (s.usage.length > 5000) s.usage = s.usage.slice(-5000);
    await persist();
  },
  async countUsageToday(licenseId) {
    const s = await load();
    const today = dayKey(new Date());
    return s.usage.filter((u) => u.licenseId === licenseId && u.ok && u.createdAt.slice(0, 10) === today).length;
  },
  async listUsage({ licenseId, limit = 50 }) {
    const s = await load();
    let list = [...s.usage];
    if (licenseId) list = list.filter((u) => u.licenseId === licenseId);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },
  async logTelemetry(t) {
    const s = await load();
    s.telemetry = s.telemetry || [];
    s.telemetry.push({ ...t, id: randomUUID(), createdAt: new Date().toISOString() });
    if (s.telemetry.length > 2000) s.telemetry = s.telemetry.slice(-2000);
    await persist();
  },
  async listTelemetry(limit = 50) {
    const s = await load();
    return [...(s.telemetry || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },
  async addBeta(b) {
    const s = await load();
    s.beta = s.beta || [];
    const email = b.email.toLowerCase();
    if (s.beta.some((x) => x.email === email)) return { ok: true, dup: true };
    s.beta.push({ ...b, email, id: randomUUID(), createdAt: new Date().toISOString() });
    await persist();
    return { ok: true, dup: false };
  },
  async listBeta() {
    const s = await load();
    return [...(s.beta || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async publicStats() {
    const s = await load();
    return { users: s.users.length, generates: s.usage.filter((u) => u.ok).length, licenses: s.licenses.length };
  },
  async getConfig() {
    const s = await load();
    return { ...DEFAULT_CONFIG, ...s.config };
  },
  async setConfig(patch) {
    const s = await load();
    s.config = { ...DEFAULT_CONFIG, ...s.config, ...patch, updatedAt: new Date().toISOString() };
    await persist();
    return s.config;
  },
  async stats(): Promise<Stats> {
    const s = await load();
    const now = Date.now();
    const today = dayKey(new Date());
    const perDay: Stats["perDay"] = [];
    for (let d = 13; d >= 0; d--) {
      const k = dayKey(new Date(now - d * 86400000));
      const rows = s.usage.filter((u) => u.createdAt.slice(0, 10) === k);
      perDay.push({ date: k, count: rows.filter((r) => r.ok).length, errors: rows.filter((r) => !r.ok).length });
    }
    const last30 = s.usage.filter((u) => now - Date.parse(u.createdAt) < 30 * 86400000);
    return {
      users: s.users.length,
      activeLicenses: s.licenses.filter((l) => l.status === "active" && Date.parse(l.expiresAt) > now).length,
      generatesToday: s.usage.filter((u) => u.ok && u.createdAt.slice(0, 10) === today).length,
      generates30d: last30.filter((u) => u.ok).length,
      tokens30d: last30.reduce((a, u) => a + u.promptTokens + u.completionTokens, 0),
      errors7d: s.usage.filter((u) => !u.ok && now - Date.parse(u.createdAt) < 7 * 86400000).length,
      perDay,
    };
  },
};
