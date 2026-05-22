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
    const safetyTimer = setTimeout(() => {
      if (get().isLoading) set({ isLoading: false });
    }, 5000);

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
