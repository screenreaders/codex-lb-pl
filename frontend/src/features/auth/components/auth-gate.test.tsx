import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuthStore } from "@/features/auth/hooks/use-auth";

function setAuthState(
  patch: Partial<ReturnType<typeof useAuthStore.getState>>,
): void {
  useAuthStore.setState({
    initialized: true,
    loading: false,
    passwordConfigured: true,
    passwordRequired: true,
    authenticated: false,
    totpRequiredOnLogin: false,
    error: null,
    ...patch,
  });
}

describe("AuthGate", () => {
  beforeEach(() => {
    setAuthState({
      refreshSession: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("shows login form when unauthenticated", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);
    setAuthState({
      refreshSession,
      passwordRequired: true,
      authenticated: false,
      totpRequiredOnLogin: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>,
    );

    expect(screen.getByRole("heading", { name: "Zaloguj się" })).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));
  });

  it("shows children when authenticated", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);
    setAuthState({
      refreshSession,
      passwordRequired: true,
      authenticated: true,
      totpRequiredOnLogin: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));
  });

  it("shows initial setup form when password is not configured", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);
    setAuthState({
      refreshSession,
      passwordConfigured: false,
      passwordRequired: false,
      authenticated: false,
      totpRequiredOnLogin: false,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>,
    );

    expect(screen.getByRole("heading", { name: "Skonfiguruj hasło administratora" })).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));
  });

  it("shows totp dialog when verification is pending", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);
    setAuthState({
      refreshSession,
      passwordRequired: true,
      authenticated: false,
      totpRequiredOnLogin: true,
    });

    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>,
    );

    expect(screen.getByText("Weryfikacja dwuetapowa")).toBeInTheDocument();
    expect(screen.queryByText("Zaloguj się")).not.toBeInTheDocument();
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));
  });
});
