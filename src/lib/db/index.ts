import { isSupabaseMode } from "../env";
import { localDb } from "./local";
import { supabaseDb } from "./supabase";
import type { DB } from "./types";

export * from "./types";

export function getDb(): DB {
  return isSupabaseMode() ? supabaseDb : localDb;
}
