import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { AppHeader } from "@/components/layout/app-header";
import { StatusBar } from "@/components/layout/status-bar";
import { Toaster } from "@/components/ui/sonner";
import { SpinnerBlock } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuthStore } from "@/features/auth/hooks/use-auth";

const DashboardPage = lazy(async () => {
  const module = await import("@/features/dashboard/components/dashboard-page");
  return { default: module.DashboardPage };
});
const AccountsPage = lazy(async () => {
  const module = await import("@/features/accounts/components/accounts-page");
  return { default: module.AccountsPage };
});
const SettingsPage = lazy(async () => {
  const module = await import("@/features/settings/components/settings-page");
  return { default: module.SettingsPage };
});

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <SpinnerBlock />
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const passwordRequired = useAuthStore((state) => state.passwordRequired);
  const mainRef = useRef<HTMLElement | null>(null);

  const routeAnnouncement = useMemo(() => {
    switch (location.pathname) {
      case "/dashboard":
        return "Przejście do strony: Panel";
      case "/accounts":
        return "Przejście do strony: Konta";
      case "/settings":
        return "Przejście do strony: Ustawienia";
      default:
        return "Przejście do strony";
    }
  }, [location.pathname]);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-10">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Przejdź do treści
      </a>
      <p key={location.pathname} className="sr-only" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </p>
      <AppHeader
        onLogout={() => {
          void logout();
        }}
        showLogout={passwordRequired}
      />
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-none sm:px-6"
      >
        <Outlet />
      </main>
      <StatusBar />
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <Toaster richColors />
      <AuthGate>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="/accounts"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AccountsPage />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </AuthGate>
    </TooltipProvider>
  );
}
