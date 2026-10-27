import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { env } from "./env";

// Hash password untuk mode lokal (scrypt + salt). Supabase punya auth sendiri.
export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Kode lisensi: MD-XXXX-XXXX-XXXX (tanpa huruf yang mirip angka).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeLicenseKey() {
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `MD-${out}`;
}

// Token sesi sederhana: payload base64url + HMAC.
export function sign(payload: object, ttlSec = 60 * 60 * 24 * 14) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })).toString("base64url");
  const mac = createHmac("sha256", env.appSecret).update(body).digest("base64url");
  return `${body}.${mac}`;
}
export function verify<T = Record<string, unknown>>(token: string | undefined): (T & { exp: number }) | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expect = createHmac("sha256", env.appSecret).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}
