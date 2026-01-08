# BundlrOS Merged Domain Model

## 1. Core Entities (Owned by Module 2: Core Data Model)

These entities are the source of truth for the entire system.

### Organization (Tenant)

- **id**: UUID
- **name**: string
- **settings**: json

### User (Owned by Module 1: IAM)

- **id**: UUID
- **email**: string (unique)
- **name**: string
- **role**: Role (Admin, AM, PodLead, QA, Designer, Dev, ClientApprover)
- **status**: UserStatus (Active, Inactive)
- **avatar_url**: string

### Client

- **id**: UUID
- **name**: string
- **code**: string (3-4 char uppercase)
- **industry**: string
- **logo_url**: string
- **status**: ClientStatus (Active, Churned, Lead)
- **contacts**: Contact[]

### ServiceContract

- **id**: UUID
- **client_id**: UUID
- **title**: string
- **start_date**: ISO8601
- **end_date**: ISO8601
- **total_value**: decimal
- **currency**: string (default: USD)
- **status**: ContractStatus (Draft, Active, Expired)

### Project (The "Container" of work)

- **id**: UUID
- **client_id**: UUID
- **contract_id**: UUID (optional)
- **name**: string
- **type**: ProjectType (Retainer, OneOff)
- **external_links**: ProjectLink[] (Jira, Plane, Taiga)

### Deliverable (The "Unit" of work)

- **id**: UUID
- **project_id**: UUID
- **title**: string
- **type**: DeliverableType (Document, Design, Code, Report, Video)
- **status**: DeliverableStatus (Draft, InProgress, AwaitingApproval, InQA, QAFailed, Approved, Published)
- **assignee_id**: UUID (User)
- **progress**: integer (0-100)
- **due_date**: ISO8601
- **version**: string

## 2. Financial Entities (Owned by Module 13: Budgets)

### Budget

- **id**: UUID
- **client_id**: UUID
- **project_id**: UUID (optional)
- **name**: string
- **total_cap**: decimal
- **used_amount**: decimal
- **items**: LineItem[]

### LineItem

- **id**: UUID
- **budget_id**: UUID
- **service_type**: ServiceCategory
- **tier**: Tier
- **cost**: decimal
- **hours_allocated**: integer

## 3. Operational Entities

### Asset (Owned by Module 4: File Hub)

- **id**: UUID
- **entity_id**: UUID (Polymorphic: Deliverable, Client, Project)
- **url**: string
- **type**: MimeType
- **tags**: string[]

### ApprovalRequest (Owned by Module 8: Approvals)

- **id**: UUID
- **deliverable_id**: UUID
- **requester_id**: UUID
- **approver_id**: UUID
- **status**: ApprovalStatus (Pending, Approved, Rejected)
- **comments**: string

### QA_Check (Owned by Module 9: QA Gates)

- **id**: UUID
- **deliverable_id**: UUID
- **passed**: boolean
- **metrics**: json
- **checker_id**: UUID

## 4. Relationships & Ownership

| Entity          | Owner Module | Consumers     |
| :-------------- | :----------- | :------------ |
| **User**        | 1. Identity  | All           |
| **Client**      | 2. Core Data | 6, 10, 11, 13 |
| **Deliverable** | 2. Core Data | 5, 8, 9, 11   |
| **Budget**      | 13. Budgets  | 6, 10         |
| **Asset**       | 4. File Hub  | 6, 7          |
