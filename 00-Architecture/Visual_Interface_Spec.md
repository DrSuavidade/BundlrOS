# BundlrOS Global Layout & Navigation

## Layout Structure

The application uses a "Holy Grail" layout minus the footer.

```
[       Global Top Bar (48px)       ]
[ Nav (240px) | Content Area (Fluid)]
```

### 1. Global Top Bar (`<AppBar />`)

- **Left**: BundlrOS Logo (Home).
- **Center**: Global Command Palette Trigger (`Cmd+K`).
- **Right**:
  - Notification Bell (Unified Inbox entry point).
  - Organization Switcher.
  - User Avatar (Profile/Settings).

### 2. Side Navigation (`<SideNav />`)

- **Scope**: Changes based on Context.
- **Global Context**:
  - Dashboard (Reporting)
  - Inbox
  - Clients (Client 360)
  - Projects (Service Factories)
  - Approvals
  - Budgets
- **Client Context** (When inside a Client):
  - < Back to Global
  - **Client Name**
  - Overview
  - Contracts
  - Deliverables
  - Financials
  - Assets

### 3. Content Area

- **Padding**: `var(--space-6)` (24px).
- **Container**: `max-width: 1200px` (usually) or Fluid.
- **Background**: `var(--color-bg-app)` (darker).
- **Cards**: `var(--color-bg-card)` (slightly lighter).

## Resolve Overlaps (Navigation Rules)

### Inbox vs Approvals vs QA

- **Unified Inbox (Module 5)** is the "Human-in-demand" center.
  - Alerts from Ops, Approvals, and QA failures land here.
- **Approvals Center (Module 8)** is a "Work Queue".
  - You go here to do heads-down processing of requests.
- **QA Gates (Module 9)** is more of a "Background Process" or "Dashboard".
  - Testers work here. Users usually see the _result_ in their Inbox.

### Reports vs Budgets vs KPIs

- **Budgets (Module 13)**: The financial constraints & tracking. "Money out/in".
- **KPIs (Module 10-11)**: The operational performance. "Speed/Quality".
- **Reporting (Module 10)**: The high-level PDF export / aggregation layer.

## Command Palette (Cmd+K)

Must support:

- `> Go to Client...`
- `> Create Deliverable...`
- `> Approve Budget...`
- `> Search Asset...`
