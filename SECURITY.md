# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub's
[private security advisories](https://github.com/blazyy/z-planner/security/advisories/new)
rather than opening a public issue. We aim to acknowledge reports within a few days.

## Supported versions

This is a single-deployment application; only the currently deployed `main` is supported.

## Security posture

The application is hardened along several axes:

- **Authentication & tenancy** — All `/boards` routes and `/api/planner/**` endpoints are
  protected by Clerk middleware. Every database query is scoped by `clerkUserId` **and** a
  nested entity-id existence check (dual-layer tenancy), so a user can never read or mutate
  another user's data even with a guessed id (no IDOR).
- **Input validation** — Every mutating request body is validated against a strict (`.strict()`)
  zod schema; unknown keys are rejected rather than mass-assigned. Requests are additionally
  guarded by a content-type check (415) and a 1 MB body-size cap (413). Mongo updates use
  allowlisted dotted `$set` paths only.
- **Rate limiting** — A per-user in-memory token bucket (60 burst, 10 req/s steady) returns
  `429 Too Many Requests` past the threshold. See `docs/cve-tracking.md` for the per-instance
  caveat under serverless.
- **Transport & headers** — `next.config.js` sets a Content-Security-Policy (Clerk-aware),
  `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, and a conservative `Permissions-Policy`.
- **Observability** — Structured server logging (pino) plus a mutation audit trail
  (`{ userId, method, path, status }`) for POST/PATCH/DELETE.
- **Dependencies** — `npm audit` is part of the hardening baseline; transitive advisories are
  pinned via package.json `overrides`. Remaining accepted residuals are tracked in
  `docs/cve-tracking.md`. Dependabot is enabled (`.github/dependabot.yml`).

## Known accepted residuals

See [`docs/cve-tracking.md`](docs/cve-tracking.md).
