# BundlrOS Module Dependency Graph

## Visual Graph

```mermaid
graph TD
    User-->Shell
    Shell-->IAM[1. IAM]
    Shell-->Inbox[5. Inbox]
    Shell-->Clients[6. Client 360]

    Inbox-->Events[3. Event Bus]
    Inbox-->Approvals[8. Approvals]
    Inbox-->QA[9. QA Gates]

    Clients-->Core[2. Core Data]
    Clients-->Budgets[13. Budgets]
    Clients-->Assets[4. File Hub]

    Budgets-->Contracts[2. Core Data: Contracts]
    Budgets-->Projects[2. Core Data: Projects]

    Approvals-->Deliverables[2. Core Data: Deliverables]
    QA-->Deliverables

    Factories[7. Service Factories]-->Deliverables
    Factories-->Assets

    Reporting[10. Reporting]-->Core
    Reporting-->Budgets
    Reporting-->SLA[11. Capacity/SLA]

    Events-->All((All Modules))
```

## Layers

1. **Presentation Layer**: Shell, Unified Inbox, Client 360, Reporting.
2. **Business Process Layer**: Approvals, QA, Budgets, Service Factories.
3. **Core Data Layer**: Core Data Model, IAM, File Asset Hub.
4. **Infrastructure Layer**: Event Bus (Module 3), Admin Hub (Module 12).

## Critical Paths

- **New Client**: `IAM` -> `Core` -> `File Hub` (Logo) -> `Event:client.created`.
- **New Deliverable**: `Factory` -> `Core` -> `Event:deliverable.created` -> `SLA` -> `Inbox` (Notification).
- **Publish**: `Core(status:ready)` -> `Event` -> `Approvals` -> `QA` -> `Core(status:published)`.
