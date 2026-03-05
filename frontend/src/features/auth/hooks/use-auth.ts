import { setUnauthorizedHandler } from "@/lib/api-client";
import { create } from "zustand";

import {
  getAuthSession,
  loginPassword,
  logout as logoutRequest,
  setupPassword as setupPasswordRequest,
  verifyTotp as verifyTotpRequest,
} from "@/features/auth/api";
import type { AuthSession } from "@/features/auth/schemas";

type AuthState = {
  passwordConfigured: boolean;
  passwordRequired: boolean;
  authenticated: boolean;
  totpRequiredOnLogin: boolean;
  totpConfigured: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  refreshSession: () => Promise<AuthSession>;
  setupPassword: (password: string) => Promise<AuthSession>;
  login: (password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  verifyTotp: (code: string) => Promise<AuthSession>;
  clearError: () => void;
};

function applySession(set: (next: Partial<AuthState>) => void, session: AuthSession): AuthSession {
  set({
    passwordConfigured: session.passwordConfigured,
    passwordRequired: session.passwordRequired,
    authenticated: session.authenticated,
    totpRequiredOnLogin: session.totpRequiredOnLogin,
    totpConfigured: session.totpConfigured,
    initialized: true,
    error: null,
  });
  return session;
}

export const useAuthStore = create<AuthState>((set) => ({
  passwordConfigured: false,
  passwordRequired: false,
  authenticated: false,
  totpRequiredOnLogin: false,
  totpConfigured: false,
  loading: false,
  initialized: false,
  error: null,
  refreshSession: async () => {
    set({ loading: true, error: null });
    try {
      const session = await getAuthSession();
      return applySession(set, session);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Nie udało się odświeżyć sesji",
      });
      throw error;
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  setupPassword: async (password) => {
    set({ loading: true, error: null });
    try {
      const session = await setupPasswordRequest({ password });
      return applySession(set, session);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Nie udało się ustawić hasła",
      });
      throw error;
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  login: async (password) => {
    set({ loading: true, error: null });
    try {
      const session = await loginPassword({ password });
      return applySession(set, session);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Logowanie nieudane",
      });
      throw error;
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutRequest();
      set({
        authenticated: false,
        totpRequiredOnLogin: false,
      });
      await useAuthStore.getState().refreshSession();
    } finally {
      set({ loading: false });
    }
  },
  verifyTotp: async (code) => {
    set({ loading: true, error: null });
    try {
      const session = await verifyTotpRequest({ code });
      return applySession(set, session);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Weryfikacja TOTP nieudana",
      });
      throw error;
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  clearError: () => {
    set({ error: null });
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.setState({
    authenticated: false,
    initialized: true,
    error: null,
  });
});
