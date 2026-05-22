import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Clé localStorage : sb-{project-ref}-auth-token
const STORAGE_KEY = (() => {
  try {
    return `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
  } catch {
    return "sb-auth-token";
  }
})();

// ── Session localStorage ──────────────────────────────────────

interface RawSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: User;
}

interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s: StoredSession = JSON.parse(raw);
    if (s.expires_at < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSession(raw: RawSession): StoredSession {
  const stored: StoredSession = {
    access_token: raw.access_token,
    refresh_token: raw.refresh_token,
    expires_at: raw.expires_at ?? Math.floor(Date.now() / 1000) + raw.expires_in,
    user: raw.user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

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
    set({ isLoading: true, user: null, profile: null });

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description ?? err.message ?? "Identifiants incorrects.");
    }

    const session = saveSession((await res.json()) as RawSession);
    await get().fetchProfile(session.user.id);
    set({ user: session.user, isLoading: false });
  },

  signOut: async () => {
    const session = readSession();
    if (session) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      } catch {}
    }
    clearSession();
    set({ user: null, profile: null, isLoading: false });
  },

  fetchProfile: async (userId) => {
    const session = readSession();
    const token = session?.access_token ?? SUPABASE_KEY;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      set({ profile: null });
      return;
    }

    const data: Profile[] = await res.json();
    set({ profile: data[0] ?? null });
  },

  _init: () => {
    const session = readSession();

    if (session) {
      get()
        .fetchProfile(session.user.id)
        .then(() => set({ user: session.user, isLoading: false }))
        .catch(() => {
          clearSession();
          set({ user: null, profile: null, isLoading: false });
        });
    } else {
      set({ isLoading: false });
    }

    const safetyTimer = setTimeout(() => {
      if (get().isLoading) set({ isLoading: false });
    }, 2000);

    return () => {
      clearTimeout(safetyTimer);
    };
  },
}));

export type { UserRole };
