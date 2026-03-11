import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const REMEMBER_ME_KEY = "africafx-remember-me";

const isRememberEnabled = () => {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
};

const getPreferredStorage = (): BrowserStorage | null => {
  if (typeof window === "undefined") return null;
  return isRememberEnabled() ? window.localStorage : window.sessionStorage;
};

const getFallbackStorage = (): BrowserStorage | null => {
  if (typeof window === "undefined") return null;
  return isRememberEnabled() ? window.sessionStorage : window.localStorage;
};

const authStorage: BrowserStorage = {
  getItem: (key) => {
    const preferred = getPreferredStorage();
    const preferredValue = preferred?.getItem(key);
    if (preferredValue !== null && preferredValue !== undefined) {
      return preferredValue;
    }
    return getFallbackStorage()?.getItem(key) ?? null;
  },
  setItem: (key, value) => {
    getPreferredStorage()?.setItem(key, value);
    getFallbackStorage()?.removeItem(key);
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const setRememberSessionPreference = (remember: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_ME_KEY, remember ? "true" : "false");
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Some features may not work.");
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: true,
        storage: authStorage,
      },
    })
  : null;
