<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# STRICT POLICY: ZERO TOLERANCE FOR MOCK / DUMMY / FAKE DATA

1. **NO FAKE OR MOCK DATA IN CODEBASE**:
   - Never use mock, demo, dummy, or placeholder objects/arrays for users, studios, photographers, bookings, payments, leads, reviews, messages, notifications, or events.
   - Never use `lorem ipsum`, "John Doe", "Jane Doe", fake phone numbers, fake prices, or fake review counts.
   - Never use fake stock image URLs (`picsum.photos`, `placeholder.com`, `unsplash.com`, `pravatar.cc`). Always use real storage URLs from Cloudflare R2 / Supabase, or neutral CSS/SVG initials placeholders.
   - Never simulate API responses with `setTimeout` or fake success payloads.
2. **ZERO DATA HANDLING**:
   - Every list, card, chart, and feed must handle `loading` (skeleton), `empty` (friendly icon + actionable CTA button, e.g. "No availability slots set. Add your first date"), `error` (retry button), and `populated` from REAL Supabase/R2 sources.
   - New accounts with no data must show `0`, `-`, or empty states — never invented metrics.
3. **SEED DATA ONLY VIA MANUAL DEV SCRIPT**:
   - Application code must never import mock data.
   - Test data must live strictly in `/scripts/seed-dev.ts` and require the `--confirm-dev-seed` flag. It must refuse to run against production.
4. **AUTOMATED CI CHECK**:
   - Every PR and commit must pass `npm run check:no-mock`.
