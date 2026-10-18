# C4 Component Diagram

> Level 3 C4 diagram describing the structural components within the API Application Server container.

```mermaid
flowchart TD
    subgraph Server["API Application Server"]
        Router["HTTP Router / Dispatcher<br/>[Route Matching & Middleware]"]
        AuthMid["Auth Middleware<br/>[JWT / Token Verification]"]
        Validator["Contract Validator<br/>[OpenAPI Schema Guard]"]
        Controller["Feature Controllers<br/>[Request Handling & Serialization]"]
        DomainService["Domain Business Logic Services<br/>[Invariants & State Transitions]"]
        DataAccess["Data Access Repositories<br/>[ORM / Query Abstraction]"]
        EventBus["Internal Event Dispatcher<br/>[Pub/Sub & Side Effects]"]
    end

    Client["API Client / Webhook"] -->|HTTPS Requests| Router
    Router --> AuthMid
    AuthMid --> Validator
    Validator --> Controller
    Controller --> DomainService
    DomainService --> DataAccess
    DomainService --> EventBus
    DataAccess --> DB[("Database")]
    EventBus --> Cache[("Cache / Message Broker")]

    classDef component fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff;
    classDef storage fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    class Router,AuthMid,Validator,Controller,DomainService,DataAccess,EventBus component;
    class DB,Cache storage;
```

## Component Breakdown
1. **HTTP Router / Dispatcher:** Ingests inbound requests, maps URIs to handlers, and orchestrates middleware chains.
2. **Auth Middleware:** Verifies identity tokens, enforces RBAC/ABAC authorization rules, and rejects unauthenticated callers.
3. **Contract Validator:** Enforces schema integrity strictly against `docs/api/openapi.yaml` before executing business logic.
4. **Feature Controllers:** Translates HTTP payloads into domain parameters and formats standardized HTTP responses.
5. **Domain Business Logic Services:** Encapsulates core system invariants, state machines, and business rules.
6. **Data Access Repositories:** Isolates SQL/database operations behind typed repository contracts.
7. **Internal Event Dispatcher:** Coordinates asynchronous side effects, cache invalidations, and audit logging.
