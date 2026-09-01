# N5Deal Marketplace Submission

- Production URL: https://n5deal-marketplace-blond.vercel.app
- GitHub repository: https://github.com/pridecore/N5Deal
- Deployment status: PASS, Vercel production deployment is live
- Database status: PASS, existing Neon PostgreSQL database verified
- Migration status: PASS, `0001_init` and `0002_phase3_operations` are applied

## Implemented Scope

N5Deal Marketplace is a production-minded Next.js prototype for a private M&A and financial-assets marketplace with authenticated Buyer, Seller, and Manager workflows.

- Buyer: login, browse marketplace opportunities, search/filter/sort, open asset details, view Smart Match, message sellers, and maintain acquisition criteria.
- Seller: login, manage asset listings, create/edit listing drafts, publish/archive eligible assets, browse Buyer discovery, and message buyers.
- Manager: login, review platform metrics, inspect participants and assets, moderate users/assets, and review audit events.

## Smart Matching

Smart Matching is deterministic and explainable. It scores assets against Buyer criteria across category, geography, investment range, revenue range, EBITDA range, and deal type, returning a score, match level, reasons, and mismatches.

## Architecture Summary

- Next.js App Router and React server/client components
- Prisma with PostgreSQL migrations
- Service/repository layering for auth, assets, matching, messaging, buyer discovery, and manager moderation
- Zod validation at API and form boundaries
- Server-side sessions with `HttpOnly`, `SameSite=Lax`, production `Secure` cookies
- RBAC and ownership checks enforced server-side
- CSRF protection for unsafe session-authenticated mutations

## Validation Results

- Lint: PASS
- Typecheck: PASS
- Unit/integration: PASS, 19/19
- Playwright E2E: PASS, 10/10
- Production build: PASS
- Buyer production QA: PASS
- Seller production QA: PASS
- Manager production QA: PASS
- Security/session/CSRF production QA: PASS
- Responsive QA: PASS

## Non-Blocking Limitation

Distributed rate limiting requires Redis-compatible backing for multi-instance production. The current abstraction is ready for that integration, while local/prototype operation uses in-memory rate limiting.
