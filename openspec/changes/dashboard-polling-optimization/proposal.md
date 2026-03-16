## Why

The dashboard polls multiple endpoints every 30 seconds. On busy or remote deployments, this increases load on the server and database without materially improving operator workflows. We should reduce polling pressure while keeping the UI responsive to manual refreshes.

## What Changes

- Increase dashboard polling intervals from 30s to 120s.
- Add a refresh interval selector (2/5/10 min) persisted locally and shared across dashboard, logs, accounts, and status bar queries.
- Add `staleTime` so window focus does not trigger redundant refetches inside the polling window.
- Disable `refetchOnWindowFocus` for high-churn endpoints (dashboard overview, request logs, accounts list).

## Capabilities

### Modified Capabilities

- `dashboard-refresh`: reduce background polling to lower server load.
- `dashboard-refresh-interval`: allow operators to tune refresh cadence without redeploying.

## Impact

- **Frontend**: `frontend/src/features/dashboard/hooks/use-dashboard.ts`, `frontend/src/features/dashboard/hooks/use-request-logs.ts`, `frontend/src/features/accounts/hooks/use-accounts.ts`
- **Tests**: update dashboard hook refetch expectation
