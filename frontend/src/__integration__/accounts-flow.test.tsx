import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { renderWithProviders } from "@/test/utils";

describe("accounts flow integration", () => {
  it("supports account selection and pause/resume actions", async () => {
    const user = userEvent.setup({ delay: null });

    window.history.pushState({}, "", "/accounts");
    renderWithProviders(<App />);

    expect(await screen.findByText("Zarządzaj zaimportowanymi kontami i metodami uwierzytelniania.", {}, { timeout: 5000 })).toBeInTheDocument();
    expect((await screen.findAllByText("primary@example.com", {}, { timeout: 5000 })).length).toBeGreaterThan(0);
    expect(screen.getByText("secondary@example.com")).toBeInTheDocument();

    await user.click(screen.getByText("secondary@example.com"));
    expect(await screen.findByText("Status tokenów")).toBeInTheDocument();

    const resumeButton = screen.queryByRole("button", { name: "Wznów" });
    if (resumeButton) {
      await user.click(resumeButton);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Wstrzymaj" })).toBeInTheDocument();
      });
    } else {
      await user.click(screen.getByRole("button", { name: "Wstrzymaj" }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Wznów" })).toBeInTheDocument();
      });
    }
  });
});
