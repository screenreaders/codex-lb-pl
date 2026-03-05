import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/mocks/server";

describe("auth flow integration", () => {
  it("flows from login to totp to dashboard", async () => {
    const user = userEvent.setup({ delay: null });

    server.use(
      http.get("/api/dashboard-auth/session", () =>
        HttpResponse.json({
          authenticated: false,
          passwordRequired: true,
          totpRequiredOnLogin: false,
          totpConfigured: true,
        }),
      ),
      http.post("/api/dashboard-auth/password/login", () =>
        HttpResponse.json({
          authenticated: false,
          passwordRequired: true,
          totpRequiredOnLogin: true,
          totpConfigured: true,
        }),
      ),
      http.post("/api/dashboard-auth/totp/verify", () =>
        HttpResponse.json({
          authenticated: true,
          passwordRequired: true,
          totpRequiredOnLogin: false,
          totpConfigured: true,
        }),
      ),
    );

    window.history.pushState({}, "", "/dashboard");
    renderWithProviders(<App />);

    expect(await screen.findByRole("heading", { name: "Zaloguj się" }, { timeout: 5000 })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Hasło"), "secret-password");
    await user.click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(await screen.findByText("Weryfikacja dwuetapowa")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Kod TOTP"), "123456");
    const verifyButton = screen.queryByRole("button", { name: "Zweryfikuj" });
    if (verifyButton) {
      await user.click(verifyButton);
    }

    expect(await screen.findByText("Przegląd, stan kont i ostatnie logi żądań.", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
