import { assertSupabaseEnv } from "../env";
import { supabaseDb } from "./supabase";
import type { DB } from "./types";

export * from "./types";

export function getDb(): DB {
  assertSupabaseEnv();
  return supabaseDb;
}
