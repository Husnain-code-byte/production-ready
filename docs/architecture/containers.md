# C4 Container Diagram

> Level 2 C4 diagram describing the deployable units (applications, datastores, queues) that make up the system.

```mermaid
flowchart TD
    Client["Single Page Application / Client<br/>[React / Vite or Flutter]"]
    API["API Application Server<br/>[Node.js / Go / Python]"]
    DB[("Primary Relational Database<br/>[PostgreSQL]")]
    Cache[("Distributed Cache<br/>[Redis]")]

    Client -->|JSON / HTTPS REST| API
    API -->|Read / Write SQL| DB
    API -->|Key-Value Cache| Cache

    classDef container fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef storage fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    class Client,API container;
    class DB,Cache storage;
```

## Containers Description
1. **Client SPA / Mobile App:** Renders user interface, enforces design tokens, client-side routing.
2. **API Application Server:** Handles business logic, validates API contracts against `docs/api/openapi.yaml`, enforces security.
3. **Database:** ACID compliant persistent storage.
4. **Cache:** Sub-millisecond session state and high-frequency read cache.
