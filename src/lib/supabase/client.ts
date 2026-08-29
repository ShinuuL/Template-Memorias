"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

// Cliente destinado a Client Components (navegador).
// Usa cookies gerenciados automaticamente pelo navegador.
export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
