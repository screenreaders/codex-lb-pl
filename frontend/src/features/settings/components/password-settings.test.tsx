import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  changePassword,
  removePassword,
  setupPassword,
} from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/hooks/use-auth";
import { PasswordSettings } from "@/features/settings/components/password-settings";

vi.mock("@/features/auth/api", () => ({
  setupPassword: vi.fn(),
  changePassword: vi.fn(),
  removePassword: vi.fn(),
}));

describe("PasswordSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      passwordRequired: false,
      refreshSession: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("shows setup button when no password is set", () => {
    render(<PasswordSettings />);
    expect(screen.getByRole("button", { name: "Ustaw hasło" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zmień" })).not.toBeInTheDocument();
  });

  it("shows change/remove buttons when password is configured", () => {
    useAuthStore.setState({ passwordRequired: true });
    render(<PasswordSettings />);
    expect(screen.getByRole("button", { name: "Zmień" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usuń" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ustaw hasło" })).not.toBeInTheDocument();
  });

  it("handles setup flow via dialog", async () => {
    const user = userEvent.setup();
    vi.mocked(setupPassword).mockResolvedValue({} as never);

    render(<PasswordSettings />);

    await user.click(screen.getByRole("button", { name: "Ustaw hasło" }));
    // Dialog opens
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Hasło"), "new-password-1");
    await user.click(screen.getAllByRole("button", { name: "Ustaw hasło" }).find((btn) => btn.getAttribute("type") === "submit")!);
    expect(setupPassword).toHaveBeenCalledWith({ password: "new-password-1" });
  });

  it("handles change flow via dialog", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ passwordRequired: true });
    vi.mocked(changePassword).mockResolvedValue({} as never);

    render(<PasswordSettings />);

    await user.click(screen.getByRole("button", { name: "Zmień" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Obecne hasło"), "current-password");
    await user.type(screen.getByLabelText("Nowe hasło"), "changed-password");
    await user.click(screen.getByRole("button", { name: "Zmień hasło" }));
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "current-password",
      newPassword: "changed-password",
    });
  });

  it("handles remove flow via dialog", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ passwordRequired: true });
    vi.mocked(removePassword).mockResolvedValue({} as never);

    render(<PasswordSettings />);

    await user.click(screen.getByRole("button", { name: "Usuń" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Obecne hasło"), "changed-password");
    await user.click(screen.getByRole("button", { name: "Usuń hasło" }));
    expect(removePassword).toHaveBeenCalledWith({ password: "changed-password" });
  });

  it("shows error message on request failure", async () => {
    const user = userEvent.setup();
    vi.mocked(setupPassword).mockRejectedValue(new Error("setup failed"));

    render(<PasswordSettings />);

    await user.click(screen.getByRole("button", { name: "Ustaw hasło" }));
    await user.type(screen.getByLabelText("Hasło"), "new-password-1");
    await user.click(screen.getAllByRole("button", { name: "Ustaw hasło" }).find((btn) => btn.getAttribute("type") === "submit")!);

    expect(await screen.findByText("setup failed")).toBeInTheDocument();
  });
});
