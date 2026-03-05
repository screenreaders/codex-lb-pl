import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SetupPasswordForm } from "@/features/auth/components/setup-password-form";
import { useAuthStore } from "@/features/auth/hooks/use-auth";

describe("SetupPasswordForm", () => {
  beforeEach(() => {
    useAuthStore.setState({
      loading: false,
      error: null,
    });
  });

  it("renders and submits admin password setup", async () => {
    const user = userEvent.setup();
    const clearError = vi.fn();
    const setupPassword = vi.fn().mockResolvedValue(undefined);

    useAuthStore.setState({
      clearError,
      setupPassword,
      loading: false,
      error: null,
    });

    render(<SetupPasswordForm />);

    await user.type(screen.getByLabelText("Hasło"), "secret-pass-123");
    await user.type(screen.getByLabelText("Powtórz hasło"), "secret-pass-123");
    await user.click(screen.getByRole("button", { name: "Zapisz hasło" }));

    expect(clearError).toHaveBeenCalledTimes(1);
    expect(setupPassword).toHaveBeenCalledWith("secret-pass-123");
  });

  it("shows error message when present", () => {
    useAuthStore.setState({
      error: "Password setup failed",
      loading: false,
    });

    render(<SetupPasswordForm />);
    expect(screen.getByText("Password setup failed")).toBeInTheDocument();
  });
});
