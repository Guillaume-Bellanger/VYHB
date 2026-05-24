import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Client dédié à l'auth uniquement — gère le refresh automatique des tokens
// et la persistance localStorage au format attendu par baseHeaders() dans les autres hooks
const authClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Store ─────────────────────────────────────────────────────

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
    const { error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // La mise à jour du state se fait via onAuthStateChange (SIGNED_IN)
  },

  signOut: async () => {
    await authClient.auth.signOut();
    // La mise à jour du state se fait via onAuthStateChange (SIGNED_OUT)
  },

  fetchProfile: async (userId) => {
    const { data: { session } } = await authClient.auth.getSession();
    const token = session?.access_token ?? SUPABASE_KEY;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      set({ profile: null });
      return;
    }

    const data: Profile[] = await res.json();
    set({ profile: data[0] ?? null });
  },

  _init: () => {
    const safetyTimer = setTimeout(() => {
      if (get().isLoading) set({ isLoading: false });
    }, 3000);

    const { data: { subscription } } = authClient.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(safetyTimer);

        if (event === "SIGNED_OUT") {
          set({ user: null, profile: null, isLoading: false });
          return;
        }

        if (session?.user) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            await get().fetchProfile(session.user.id);
          }
          set({ user: session.user, isLoading: false });
        } else {
          set({ user: null, profile: null, isLoading: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  },
}));

export type { UserRole };
