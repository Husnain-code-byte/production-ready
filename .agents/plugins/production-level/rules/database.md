# Database Conventions

## Schema Design
- Every table has a PRIMARY KEY (UUID preferred)
- Every FK column has an index — no exceptions
- Every table has `created_at` and `updated_at` timestamps with timezone
- snake_case for tables and columns; plural table names
- Constraints at the database level — never rely solely on application validation
- Soft deletes over hard deletes (with `deleted_at` timestamp)

## Migrations
- Every migration is reversible — `up` and `down` must both work and be tested
- Migration files: `NNNN_description.sql` — sequential numbering, never reuse numbers
- One concern per migration: schema changes, data changes, and index changes in separate files
- Test rollback before applying forward migration
- Never rename a column AND change its type in the same migration
- Backfill data in a separate migration from schema changes

## Query Standards
- Parameterized queries always — never string interpolation
- EXPLAIN ANALYZE reviewed for all new queries
- Appropriate indexes for all WHERE, JOIN, ORDER BY, and GROUP BY clauses
- No SELECT * — list explicit columns
- Connection pooling configured and monitored
- Query timeout configured (default: 30 seconds)

## Never
- Never DROP/TRUNCATE without explicit human confirmation (3 separate confirmations)
- Never run migrations in production without testing in staging first
- Never assume index exists — verify via schema inspection
