import { create } from "zustand";

export const REFRESH_INTERVAL_VALUES = [120_000, 300_000, 600_000] as const;
export type RefreshIntervalValue = (typeof REFRESH_INTERVAL_VALUES)[number];

export const REFRESH_INTERVAL_OPTIONS: Array<{ value: RefreshIntervalValue; label: string }> = [
  { value: 120_000, label: "Co 2 min" },
  { value: 300_000, label: "Co 5 min" },
  { value: 600_000, label: "Co 10 min" },
];

const REFRESH_INTERVAL_STORAGE_KEY = "codex-lb-refresh-interval";
const DEFAULT_REFRESH_INTERVAL: RefreshIntervalValue = 120_000;

export function isRefreshIntervalValue(value: number): value is RefreshIntervalValue {
  return REFRESH_INTERVAL_VALUES.includes(value as RefreshIntervalValue);
}

function parseInterval(value: string | null): RefreshIntervalValue | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return isRefreshIntervalValue(parsed) ? parsed : null;
}

function readStoredInterval(): RefreshIntervalValue | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parseInterval(window.localStorage.getItem(REFRESH_INTERVAL_STORAGE_KEY));
}

type RefreshIntervalState = {
  interval: RefreshIntervalValue;
  setInterval: (interval: RefreshIntervalValue) => void;
};

const initialInterval = readStoredInterval() ?? DEFAULT_REFRESH_INTERVAL;

export const useRefreshIntervalStore = create<RefreshIntervalState>((set) => ({
  interval: initialInterval,
  setInterval: (interval) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFRESH_INTERVAL_STORAGE_KEY, String(interval));
    }
    set({ interval });
  },
}));
