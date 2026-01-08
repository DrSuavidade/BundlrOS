# BundlrOS Canonical Event Schema

All events must traverse Module 3 (Event Bus).
Format: CloudEvents v1.0 compatible.

## Event Structure

```json
{
  "specversion": "1.0",
  "type": "com.bundlros.module.entity.action",
  "source": "urn:module:id",
  "subject": "entity_id",
  "id": "uuid",
  "time": "2026-01-08T16:39:57Z",
  "datacontenttype": "application/json",
  "data": { ... }
}
```

## Catalog

### Identity & Access (IAM)

- `iam.user.created`: When a new user is invited.
- `iam.user.role_changed`: Permissions update.

### Core Data (Lifecycle)

- `core.client.created`: Triggers folder creation (Mod 4), Slack channel (Mod 12).
- `core.deliverable.created`: Triggers capacity check (Mod 11).
- `core.deliverable.status_changed`:
  - `-> awaiting_approval`: Triggers Approval Request (Mod 8).
  - `-> in_qa`: Triggers QA Check (Mod 9).
  - `-> published`: Triggers Client Notification (Mod 5/6).
- `core.contract.signed`: Triggers Budget Creation (Mod 13).

### Budgets

- `budget.threshold.breached`: When `actual > 80% of planned`.
- `budget.locked`: Financials finalized for month.

### Operations (QA / Approvals)

- `ops.approval.requested`: Notification to approver.
- `ops.approval.decided`:
  - `approved`: Advances deliverable status.
  - `rejected`: Regresses deliverable status.
- `ops.qa.failed`: Blocks publishing.
- `ops.qa.passed`: Unblocks publishing.

## Interaction Rules

1. **Idempotency**: All consumers MUST handle duplicate event delivery using `id`.
2. **Async**: Visual UIs should optimistically update, but the "Truth" is settled by the event consummation.
3. **Traceability**: Every 'automation run' (Module 3) MUST link back to the `trigger_event_id`.
