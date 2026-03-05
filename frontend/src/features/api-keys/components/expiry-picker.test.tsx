import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, format } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import { ExpiryPicker } from "./expiry-picker";

describe("ExpiryPicker", () => {
  it("shows 'Bez wygaśnięcia' when value is null", () => {
    render(<ExpiryPicker value={null} onChange={vi.fn()} />);

    expect(screen.getByText("Bez wygaśnięcia")).toBeInTheDocument();
  });

  it("shows formatted date for a custom value", () => {
    const customDate = addDays(new Date(), 15);
    customDate.setHours(23, 59, 59, 0);

    render(<ExpiryPicker value={customDate} onChange={vi.fn()} />);

    expect(screen.getByText(format(customDate, "yyyy-MM-dd"))).toBeInTheDocument();
  });

  it("calls onChange with null when 'Bez wygaśnięcia' is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const date = addDays(new Date(), 15);
    render(<ExpiryPicker value={date} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("Bez wygaśnięcia"));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with a date when preset is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ExpiryPicker value={null} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("30 dni"));

    expect(onChange).toHaveBeenCalledOnce();
    const called = onChange.mock.calls[0][0] as Date;
    expect(called).toBeInstanceOf(Date);
    expect(called.getHours()).toBe(23);
    expect(called.getMinutes()).toBe(59);
  });

  it("shows preset options list by default (not calendar)", async () => {
    const user = userEvent.setup();
    render(<ExpiryPicker value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("1 dzień")).toBeInTheDocument();
    expect(screen.getByText("7 dni")).toBeInTheDocument();
    expect(screen.getByText("30 dni")).toBeInTheDocument();
    expect(screen.getByText("90 dni")).toBeInTheDocument();
    expect(screen.getByText("1 rok")).toBeInTheDocument();
    expect(screen.getByText("Data niestandardowa...")).toBeInTheDocument();
  });

  it("shows calendar when 'Data niestandardowa...' is clicked", async () => {
    const user = userEvent.setup();
    render(<ExpiryPicker value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("Data niestandardowa..."));

    expect(await screen.findByText(/Wróć do presetów/)).toBeInTheDocument();
  });

  it("goes back to presets from calendar view", async () => {
    const user = userEvent.setup();
    render(<ExpiryPicker value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByText("Data niestandardowa..."));
    await user.click(await screen.findByText(/Wróć do presetów/));

    expect(await screen.findByText("1 dzień")).toBeInTheDocument();
  });

  it("shows multiple Bez wygaśnięcia elements when popover open and value is null", async () => {
    const user = userEvent.setup();
    render(<ExpiryPicker value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button"));

    // "Bez wygaśnięcia" appears in both the trigger and the popover option
    const allMatches = await screen.findAllByText("Bez wygaśnięcia");
    expect(allMatches.length).toBeGreaterThanOrEqual(2);
  });
});
