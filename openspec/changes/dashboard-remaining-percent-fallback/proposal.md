## Why

When account plans lack a defined credit capacity (e.g., free plans), the dashboard donut charts show remaining credits as 0, even though remaining percent is available. This makes the UI look broken and hides real usage data.

## What Changes

- If a usage window has no defined total capacity, render donut charts using remaining percent instead of credits.
- Show a percent summary (average remaining) in the donut center when percent mode is active.
- Keep existing credit-based rendering when capacity is defined.

## Capabilities

### Modified Capabilities

- `dashboard-usage-visualization`: add percent fallback for unknown capacities.

## Impact

- **Frontend**: `frontend/src/components/donut-chart.tsx`, `frontend/src/features/dashboard/components/usage-donuts.tsx`
- **Tests**: none (optional)
