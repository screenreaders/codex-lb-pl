## Why

Operators need a way to distribute traffic evenly across available accounts. The current usage-weighted selection can repeatedly pick the same account when usage values are similar, which makes it hard to validate load balancing and can overwork a single account. A round-robin option should be configurable without changing database schemas.

## What Changes

- Add `CODEX_LB_ROUTING_STRATEGY` to select `usage_weighted` (default) or `round_robin`.
- Use a shared pointer in `sticky_sessions` to persist the round-robin index across requests.
- Wire the routing strategy into proxy request selection so it is honored for both compact and streaming responses.

## Capabilities

### Modified Capabilities

- `proxy-routing`: allow operator-configured round-robin routing.

## Impact

- **Code**: `app/core/config/settings.py`, `app/core/balancer/logic.py`, `app/modules/proxy/load_balancer.py`, `app/modules/proxy/service.py`
- **Config**: `.env.example`
- **Tests**: unit or integration coverage for round-robin selection
