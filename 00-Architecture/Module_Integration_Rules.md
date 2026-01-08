# BundlrOS Integration Rules & Contracts

## 1. Visual Integration (The "One OS" Rule)

- **Global Navigation**: Managed by the generic App Shell. All modules are children of this shell.
- **Visual Resets**: FORBIDDEN. Navigation between modules must use Client-side routing (React Router), sharing the same `AuthContext` and `ThemeContext`.
- **Theme**: All modules must consume tokens from `@bundlros/ui`. Hardcoded hex values are banned.

## 2. Hard Contracts

### The "No Bypass" Rule (QA & Approvals)

- **Rule**: A Deliverable cannot enter `ready` or `published` status without a corresponding `ops.qa.passed` event AND `ops.approval.decided(approved)` event.
- **Enforcement**: The API Layer (Module 2) must reject updates to status if the prerequisite records do not exist.

### The "Budget Impact" Rule

- **Rule**: Every `deliverable` creation or scope change must have an estimated `hours` or `cost`.
- **Enforcement**: UI requires these fields. Automation warns if `sum(deliverables) > budget.cap`.

### The "Single Asset" Rule

- **Rule**: No module stores files locally (base64) or in private S3 buckets.
- **Enforcement**: All uploads go to Module 4 (File Hub), returning an `asset_id` and `url`. Modules store the `asset_id`.

## 3. Tech Stack Normalization

- **Framework**: Vite + React + TypeScript.
- **State**: React Query (Server State) + Context (Auth/Theme). Avoid robust Redux unless necessary.
- **Styling**: TailwindCSS (with `bundlros` prefix/config) OR CSS Modules with shared variables. (User preference: Vanilla CSS/Tokens).
- **Icons**: Lucide React.
