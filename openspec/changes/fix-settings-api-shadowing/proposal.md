## Why

The dashboard settings endpoints crash because the handler shadows the app settings getter. That turns `get_settings()` into a self-referential coroutine call and `/api/settings` returns 500. The settings UI and anything that depends on the routing strategy field fail as a result.

## What Changes

- Alias the app settings getter to avoid name shadowing in the settings API.
- Ensure `/api/settings` returns `routing_strategy` without raising.

## Capabilities

### Modified Capabilities

- `dashboard-settings`: settings endpoints respond reliably.

## Impact

- **Code**: `app/modules/settings/api.py`
- **Tests**: existing integration settings tests should pass
