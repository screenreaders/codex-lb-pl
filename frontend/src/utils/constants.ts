export const STATUS_LABELS = {
  active: "Aktywne",
  paused: "Wstrzymane",
  limited: "Ograniczone",
  exceeded: "Przekroczony limit",
  deactivated: "Dezaktywowane",
} as const;

export const ERROR_LABELS = {
  rate_limit: "limit",
  quota: "limit",
  timeout: "timeout",
  upstream: "upstream",
  rate_limit_exceeded: "limit",
  usage_limit_reached: "limit",
  insufficient_quota: "limit",
  usage_not_included: "limit",
  quota_exceeded: "limit",
  upstream_error: "upstream",
} as const;

export const ROUTING_LABELS = {
  usage_weighted: "ważone użyciem",
  round_robin: "round robin",
  sticky: "sticky",
} as const;

export const KNOWN_PLAN_TYPES = new Set([
  "free",
  "plus",
  "pro",
  "team",
  "business",
  "enterprise",
  "edu",
]);

export const DONUT_COLORS_LIGHT = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
] as const;

export const DONUT_COLORS_DARK = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
  "#0891b2",
] as const;

export const DONUT_COLORS = DONUT_COLORS_LIGHT;

export const MESSAGE_TONE_META = {
  success: {
    label: "Sukces",
    className: "active",
    defaultTitle: "Import zakończony",
  },
  error: {
    label: "Błąd",
    className: "deactivated",
    defaultTitle: "Import nieudany",
  },
  warning: {
    label: "Ostrzeżenie",
    className: "limited",
    defaultTitle: "Uwaga",
  },
  info: {
    label: "Informacja",
    className: "limited",
    defaultTitle: "Wiadomość",
  },
  question: {
    label: "Pytanie",
    className: "limited",
    defaultTitle: "Potwierdź",
  },
} as const;

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  ok: "OK",
  rate_limit: "Limit",
  quota: "Limit",
  error: "Błąd",
};

export const RESET_ERROR_LABEL = "--";
