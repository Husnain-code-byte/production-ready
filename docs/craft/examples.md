# Polyglot Engineering Craft Examples (Before & After)

This reference document provides concrete, paired examples of brittle, brute-forced code versus mature, elegant implementations across our supported stacks.

---

## 1. Python: Decoupled Service Layer & Concurrency

### Before: Brute-Forced, Leaky, & Swallowing (Anti-Pattern)
```python
# app/services/url_service.py
from fastapi import HTTPException
from app.schemas import CreateUrlRequest  # Leaking HTTP DTO into service!
import time

db = {}

def create_short_url(req: CreateUrlRequest):
    try:
        # Brute force sleep for race conditions
        time.sleep(0.01)
        if req.url in db:
            return db[req.url]
        code = str(hash(req.url))[:6]
        db[code] = req.url
        return code
    except:
        # Silent exception swallowing!
        return None
```

### After: Pure Domain, Decoupled, Atomic, & Bounded (Craft Standard)
```python
# app/domain/models.py
from dataclasses import dataclass

@dataclass(frozen=True)
class ShortLink:
    slug: str
    target_url: str

# app/services/url_service.py
import threading
from typing import Dict
from app.domain.models import ShortLink
from app.domain.errors import CapacityExceededError

class UrlShortenerService:
    def __init__(self, max_entries: int = 10_000) -> None:
        self._max_entries = max_entries
        self._store: Dict[str, ShortLink] = {}
        self._lock = threading.Lock()

    def register(self, slug: str, target_url: str) -> ShortLink:
        with self._lock:
            if len(self._store) >= self._max_entries and slug not in self._store:
                raise CapacityExceededError(f"Store reached capacity: {self._max_entries}")
            link = ShortLink(slug=slug, target_url=target_url)
            self._store[slug] = link
            return link
```

---

## 2. TypeScript: Strict Discrimination vs. Cargo-Cult `any`

### Before: Loose, Brute-Forced with any & Type Suppressions
```python
// src/billing/processor.ts
export function processPayment(payload: any) {
  // @ts-ignore
  if (payload.type == "card") {
    return chargeCard(payload.number, payload.cvv);
  } else if (payload.type == "crypto") {
    // @ts-ignore
    return transferCrypto(payload.wallet);
  }
  return false;
}
```

### After: Discriminated Union with Exhaustive Compile-Time Checking
```typescript
// src/billing/processor.ts
export type PaymentMethod = 
  | { readonly kind: "card"; readonly token: string; readonly last4: string }
  | { readonly kind: "bank"; readonly accountId: string; readonly routingNumber: string };

export function processPayment(method: PaymentMethod): Result<TransactionReceipt, BillingError> {
  switch (method.kind) {
    case "card":
      return chargeToken(method.token);
    case "bank":
      return debitAccount(method.accountId, method.routingNumber);
    default: {
      const _exhaustive: never = method;
      throw new Error(`Unhandled payment method: ${_exhaustive}`);
    }
  }
}
```

---

## 3. Python Route Layer: Centralized Exception Handling

### Before: Duplicate Try/Except Blocks in Every Route
```python
# app/routes/items.py
@router.post("/items")
def create_item(req: ItemRequest):
    try:
        return service.create(req.name)
    except ItemExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{id}")
def get_item(id: str):
    try:
        return service.get(id)
    except ItemNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### After: Clean 3-Line Delegation with App-Level Exception Handlers
```python
# app/routes/items.py
@router.post("/items", status_code=201)
def create_item(req: ItemRequest, service: ItemService = Depends(get_service)) -> ItemResponse:
    item = service.create(name=req.name)
    return ItemResponse.from_domain(item)

# app/main.py
@app.exception_handler(ItemExistsError)
def handle_item_exists(_: Request, exc: ItemExistsError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"error": "CONFLICT", "message": str(exc)})
```

---

## 4. Documentation & ADRs: Clear Trade-offs vs. Vanity

### Before: Vague Vanity Marketing
> "We chose FastKV because it is the world's most cutting-edge, blazing-fast, next-generation distributed cache that will seamlessly solve all our performance needs with 100% reliability."

### After: Rigorous MADR Decision with Explicit Sacrifices
> "Chosen option: **In-Memory Thread-Safe Bounded Map**, because our maximum key cardinality is bounded at 10,000 items and p99 query latency must remain under 1ms. 
> 
> **Negative Consequences & Trade-Offs (What We Gave Up):**
> * State is process-local and lost on process restart.
> * Horizontal multi-instance scaling requires sticky routing or transition to Redis once traffic exceeds a single node."
