import { randomBytes } from "crypto";

// Kode lisensi: AB-XXXX-XXXX-XXXX (tanpa huruf yang mirip angka). Autentikasi manusia sepenuhnya lewat Supabase Auth.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeLicenseKey() {
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `AB-${out}`;
}
