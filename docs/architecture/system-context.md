# C4 System Context

> Level 1 C4 diagram describing the system boundaries, users, and external integrations.

```mermaid
flowchart TD
    User["End User / Client"]
    Admin["System Administrator"]
    
    subgraph SystemBoundary ["Production Level Application Boundary"]
        App["Production Level Software System<br/>(Core Services & API)"]
    end
    
    ExtAuth["External Identity Provider<br/>(OAuth / OIDC)"]
    ExtStorage["Cloud Storage / Database<br/>(Persistence Layer)"]

    User -->|Uses / HTTPS| App
    Admin -->|Manages / HTTPS| App
    App -->|Authenticates via| ExtAuth
    App -->|Persists data to| ExtStorage

    classDef primary fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef boundary fill:#f8fafc,stroke:#64748b,stroke-width:2px,stroke-dasharray: 5 5;
    class App primary;
    class SystemBoundary boundary;
```

## Key Invariants
- All client communication must occur over TLS (HTTPS/WSS).
- User requests must be authenticated at the edge before hitting core domain services.
