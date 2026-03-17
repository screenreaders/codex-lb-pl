import { create } from "zustand";

export const DASHBOARD_ACCOUNTS_VIEW_VALUES = ["tabs", "table", "card"] as const;
export type DashboardAccountsView = (typeof DASHBOARD_ACCOUNTS_VIEW_VALUES)[number];

export const DASHBOARD_ACCOUNTS_VIEW_OPTIONS: Array<{
  value: DashboardAccountsView;
  label: string;
  description: string;
}> = [
  {
    value: "tabs",
    label: "Zakladki (tabela i karta)",
    description: "Pozwalaja przelaczac miedzy tabela a karta konta.",
  },
  {
    value: "table",
    label: "Tylko tabela",
    description: "Wyswietlaj podsumowanie kont w tabeli.",
  },
  {
    value: "card",
    label: "Tylko karta",
    description: "Wyswietlaj pojedyncza karte z menu kont po lewej.",
  },
];

const DASHBOARD_ACCOUNTS_VIEW_STORAGE_KEY = "codex-lb-dashboard-accounts-view";
const DEFAULT_ACCOUNTS_VIEW: DashboardAccountsView = "tabs";

export function isDashboardAccountsView(value: string): value is DashboardAccountsView {
  return (DASHBOARD_ACCOUNTS_VIEW_VALUES as readonly string[]).includes(value);
}

function readStoredAccountsView(): DashboardAccountsView | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(DASHBOARD_ACCOUNTS_VIEW_STORAGE_KEY);
  if (stored && isDashboardAccountsView(stored)) {
    return stored;
  }
  return null;
}

type DashboardDisplayState = {
  accountsView: DashboardAccountsView;
  setAccountsView: (view: DashboardAccountsView) => void;
};

const initialAccountsView = readStoredAccountsView() ?? DEFAULT_ACCOUNTS_VIEW;

export const useDashboardDisplayStore = create<DashboardDisplayState>((set) => ({
  accountsView: initialAccountsView,
  setAccountsView: (view) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DASHBOARD_ACCOUNTS_VIEW_STORAGE_KEY, view);
    }
    set({ accountsView: view });
  },
}));
