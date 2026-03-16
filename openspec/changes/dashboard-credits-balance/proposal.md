## Why

Free/weekly-only accounts report rate-limit usage but have no plan capacity in the dashboard, so remaining credits show as 0. Operators need to see the actual credits balance for these accounts to assess remaining budget.

## What Changes

- Propagate `credits_balance` from usage rows into dashboard usage window responses when plan capacity is unavailable.
- Use the balance as remaining credits (and capacity placeholder) so the dashboard list and totals reflect the balance instead of 0.

## Capabilities

### Modified Capabilities

- `dashboard-usage`: surface credit balance for accounts without a plan capacity.

## Impact

- **Code**: `app/core/usage/types.py`, `app/modules/dashboard/service.py`, `app/modules/usage/builders.py`, `app/modules/usage/service.py`, `app/modules/accounts/mappers.py`, `app/modules/proxy/load_balancer.py`, `app/modules/proxy/service.py`
- **Tests**: add/extend usage builder coverage if needed
