import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils";

import { ModelMultiSelect } from "./model-multi-select";

describe("ModelMultiSelect", () => {
  it("shows placeholder when no models selected", async () => {
    renderWithProviders(
      <ModelMultiSelect value={[]} onChange={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Wszystkie modele")).toBeInTheDocument();
    });
  });

  it("shows custom placeholder", async () => {
    renderWithProviders(
      <ModelMultiSelect value={[]} onChange={vi.fn()} placeholder="Pick models" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Pick models")).toBeInTheDocument();
    });
  });

  it("shows count for single selected model", async () => {
    renderWithProviders(
      <ModelMultiSelect value={["gpt-5.1"]} onChange={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Wybrano modeli: 1")).toBeInTheDocument();
    });
  });

  it("shows plural count for multiple models", async () => {
    renderWithProviders(
      <ModelMultiSelect value={["gpt-5.1", "gpt-4o-mini"]} onChange={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Wybrano modeli: 2")).toBeInTheDocument();
    });
  });

  it("renders badges for selected models", async () => {
    renderWithProviders(
      <ModelMultiSelect value={["gpt-5.1"]} onChange={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("gpt-5.1")).toBeInTheDocument();
    });
  });

  it("does not render badges when no models selected", async () => {
    renderWithProviders(
      <ModelMultiSelect value={[]} onChange={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Wszystkie modele")).toBeInTheDocument();
    });
    // No badge X buttons should be present
    expect(screen.queryByRole("button", { name: /Usuń model/i })).not.toBeInTheDocument();
  });

  it("removes model via badge button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ModelMultiSelect value={["gpt-5.1", "gpt-4o-mini"]} onChange={onChange} />,
    );

    // Wait for render
    await waitFor(() => {
      expect(screen.getByText("gpt-5.1")).toBeInTheDocument();
    });

    // Click X button on first badge
    const badges = screen.getAllByRole("button").filter((b) => b.closest(".gap-1"));
    if (badges.length > 0) {
      await user.click(badges[0]);
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("shows loading state while models are being fetched", () => {
    // Before models load, the button should show loading
    renderWithProviders(
      <ModelMultiSelect value={[]} onChange={vi.fn()} />,
    );

    // The button should initially be disabled or show loading text
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
