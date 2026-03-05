import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import App from "@/App";
import {
  createDashboardOverview,
  createDefaultRequestLogs,
  createRequestLogFilterOptions,
  createRequestLogsResponse,
} from "@/test/mocks/factories";
import { server } from "@/test/mocks/server";
import { renderWithProviders } from "@/test/utils";

describe("dashboard flow integration", () => {
  it("loads dashboard, refetches request logs on filter/pagination, and avoids overview refetch", async () => {
    const user = userEvent.setup({ delay: null });
    const logs = createDefaultRequestLogs();

    let overviewCalls = 0;
    let requestLogCalls = 0;

    server.use(
      http.get("/api/dashboard/overview", () => {
        overviewCalls += 1;
        return HttpResponse.json(createDashboardOverview());
      }),
      http.get("/api/request-logs", ({ request }) => {
        requestLogCalls += 1;
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") ?? "25");
        const offset = Number(url.searchParams.get("offset") ?? "0");
        const page = logs.slice(offset, Math.min(logs.length, offset + limit));
        return HttpResponse.json(createRequestLogsResponse(page, 100, true));
      }),
      http.get("/api/request-logs/options", () =>
        HttpResponse.json(createRequestLogFilterOptions()),
      ),
    );

    window.history.pushState({}, "", "/dashboard");
    renderWithProviders(<App />);

    expect(await screen.findByText("Przegląd, stan kont i ostatnie logi żądań.", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText("Logi żądań", {}, { timeout: 5000 })).toBeInTheDocument();

    await waitFor(() => {
      expect(overviewCalls).toBeGreaterThan(0);
      expect(requestLogCalls).toBeGreaterThan(0);
    });

    const overviewAfterLoad = overviewCalls;
    const logsAfterLoad = requestLogCalls;

    await user.type(
      screen.getByPlaceholderText("Szukaj ID żądania, konta, modelu, błędu..."),
      "quota",
    );

    await waitFor(() => {
      expect(requestLogCalls).toBeGreaterThan(logsAfterLoad);
    });
    expect(overviewCalls).toBe(overviewAfterLoad);

    const logsAfterFilter = requestLogCalls;
    await user.click(screen.getByRole("button", { name: "Następna strona" }));

    await waitFor(() => {
      expect(requestLogCalls).toBeGreaterThan(logsAfterFilter);
    });
    expect(overviewCalls).toBe(overviewAfterLoad);
  });
});
