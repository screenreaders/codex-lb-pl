## 1. Routing Strategy Configuration

- [x] 1.1 Add `CODEX_LB_ROUTING_STRATEGY` setting and normalize allowed values
- [x] 1.2 Extend balancer selection to support round-robin
- [x] 1.3 Wire routing strategy into proxy request selection

## 2. Configuration Examples

- [x] 2.1 Document new env var in `.env.example`

## 3. Tests

- [x] 3.1 Add coverage for round-robin selection

## 4. Dashboard Visibility

- [x] 4.1 Expose routing strategy in dashboard settings response
- [x] 4.2 Show round-robin label in the status bar

## 5. Spec Delta

- [ ] 5.1 Update relevant routing spec/context docs when available
