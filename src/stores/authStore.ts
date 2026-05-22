import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  _init: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  signIn: async (email, password) => {
    set({ isLoading: true, user: null, profile: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await get().fetchProfile(data.user.id);
      set({ user: data.user, isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      set({ profile: null });
      return;
    }
    set({ profile: data });
  },

  _init: () => {
    // Retire les tokens Supabase expirés ou corrompus du localStorage
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) ?? "{}");
            const expired =
              parsed?.expires_at && parsed.expires_at < Math.floor(Date.now() / 1000);
            if (expired) localStorage.removeItem(key);
          } catch {
            localStorage.removeItem(key); // token corrompu
          }
        }
      });
    } catch {
      // localStorage indisponible (SSG, iframe sandboxé)
    }

    const safetyTimer = setTimeout(() => {
      if (get().isLoading) set({ isLoading: false });
    }, 2000);

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) await get().fetchProfile(user.id);
      else set({ profile: null });
      set({ user, isLoading: false });
    });

    return () => {
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  },
}));

export type { UserRole };
