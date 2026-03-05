import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OauthDialog } from "@/features/accounts/components/oauth-dialog";

const idleState = {
  status: "idle" as const,
  method: null,
  authorizationUrl: null,
  callbackUrl: null,
  verificationUrl: null,
  userCode: null,
  deviceAuthId: null,
  intervalSeconds: null,
  expiresInSeconds: null,
  errorMessage: null,
};

const devicePendingState = {
  status: "pending" as const,
  method: "device" as const,
  authorizationUrl: null,
  callbackUrl: null,
  verificationUrl: "https://auth.example.com/device",
  userCode: "AAAA-BBBB",
  deviceAuthId: "device-auth-id",
  intervalSeconds: 5,
  expiresInSeconds: 120,
  errorMessage: null,
};

const successState = {
  ...idleState,
  status: "success" as const,
};

const errorState = {
  ...idleState,
  status: "error" as const,
  errorMessage: "OAuth failed unexpectedly",
};

describe("OauthDialog", () => {
  it("renders intro stage with accessible method selection and starts flow", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn().mockResolvedValue(undefined);

    render(
      <OauthDialog
        open
        state={idleState}
        onOpenChange={vi.fn()}
        onStart={onStart}
        onComplete={vi.fn().mockResolvedValue(undefined)}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Krok 1 z 3")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Metoda logowania" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Przeglądarka \(PKCE\)/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Kod urządzenia/ })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Rozpocznij logowanie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Kod urządzenia/ }));
    expect(screen.getByRole("radio", { name: /Kod urządzenia/ })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Rozpocznij logowanie" }));
    expect(onStart).toHaveBeenCalledWith("device");
  });

  it("renders device stage with user code, verification URL, and live status", () => {
    render(
      <OauthDialog
        open
        state={devicePendingState}
        onOpenChange={vi.fn()}
        onStart={vi.fn().mockResolvedValue(undefined)}
        onComplete={vi.fn().mockResolvedValue(undefined)}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Krok 2 z 3")).toBeInTheDocument();
    expect(screen.getByText("AAAA-BBBB")).toBeInTheDocument();
    expect(screen.getByText("https://auth.example.com/device")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Oczekiwanie na autoryzację");
    expect(screen.getByRole("button", { name: "Zmień metodę" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skopiuj kod użytkownika" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skopiuj URL weryfikacji" })).toBeInTheDocument();
  });

  it("renders success stage", () => {
    render(
      <OauthDialog
        open
        state={successState}
        onOpenChange={vi.fn()}
        onStart={vi.fn().mockResolvedValue(undefined)}
        onComplete={vi.fn().mockResolvedValue(undefined)}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Krok 3 z 3")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Konto zostało pomyślnie dodane.");
    expect(screen.getByRole("button", { name: "Gotowe" })).toBeInTheDocument();
  });

  it("renders error stage with message and retry option", () => {
    render(
      <OauthDialog
        open
        state={errorState}
        onOpenChange={vi.fn()}
        onStart={vi.fn().mockResolvedValue(undefined)}
        onComplete={vi.fn().mockResolvedValue(undefined)}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("OAuth failed unexpectedly");
    expect(screen.getByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
    const closeButtons = screen.getAllByRole("button", { name: "Zamknij" });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});
