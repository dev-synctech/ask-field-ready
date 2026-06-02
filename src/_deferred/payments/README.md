# Deferred: Payments, Entitlements, and Demo Bypass

These files are **intentionally inactive** during the Phase 1 demo build of
At the Elbow Academy. Nothing in the live `src/` tree imports from this
folder, and TypeScript is configured (via `tsconfig.json` → `exclude`) to
skip type-checking it.

## What's here

| Path | Purpose | Reactivated in |
|---|---|---|
| `components/StripeEmbeddedCheckout.tsx` | Stripe Embedded Checkout mount | Phase 4 (payments) |
| `components/PaymentTestModeBanner.tsx` | Sandbox-mode banner | Phase 4 |
| `components/DemoModeBanner.tsx` | "Demo mode" header banner | Phase 4 (gating UX) |
| `components/DemoModeButton.tsx` | One-click demo entitlement toggle | Phase 4 |
| `components/TestAccessBypass.tsx` | Admin "grant access" helper | Phase 4 |
| `lib/stripe.ts` | Client-side Stripe.js loader | Phase 4 |
| `lib/stripe.server.ts` | Server Stripe client + error helpers | Phase 4 |
| `lib/payments.functions.ts` | `createCheckoutSession` server fn | Phase 4 |
| `lib/admin.functions.ts` | Admin user/entitlement queries | Phase 2/4 |
| `lib/content.functions.ts` | Entitlement-aware content reads | Phase 2/4 |
| `lib/demo.functions.ts` | Demo entitlement seeding | Phase 4 |
| `lib/seed-demo-admin.functions.ts` | Demo admin role seeding | Phase 2 |
| `hooks/use-auth.tsx` | Auth + entitlement hook | Phase 2 |
| `routes-api/webhook.ts` | Stripe webhook handler | Phase 4 |

## Rules

1. **Do not import from this folder** anywhere under `src/` (outside
   `src/_deferred/`). The exclude rule in `tsconfig.json` will not catch
   missing modules referenced from active code.
2. **Do not re-add a route file** that lives under `src/routes/api/public/payments/`
   until Phase 4. The TanStack Router file scanner registers any route file
   automatically — moving a file here is how we keep it out of the route tree.
3. When Phase 2 (auth) or Phase 4 (payments) begins, restore the relevant
   files to their original paths and re-wire imports.

## Why keep them at all

These modules encode real product decisions (price IDs, webhook signatures,
entitlement schema, demo-bypass UX). Recreating them from scratch in Phase
4 would be slower and more error-prone than restoring known-good code.
