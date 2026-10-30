# PhotoOS Web Application

PhotoOS is an advanced, production-grade SaaS operating system designed for professional photography studios, client galleries, AI facial recognition delivery, and an integrated marketplace.

---

## No Mock Data Policy

This project strictly enforces a **Zero Tolerance for Fake/Mock Data** policy:

1. **Production Realism**:
   - Application code must never contain hardcoded arrays of fake users, studios, reviews, bookings, notifications, or messages.
   - External placeholder image hosts (`picsum.photos`, `placeholder.com`, `unsplash.com`, `pravatar.cc`) are blocked in CI. Images must be real assets stored in Cloudflare R2 / Supabase Storage, or render neutral CSS/SVG placeholders.
   - Fake stats, sample chart curves, and fake delays simulating API success are strictly prohibited.
2. **Empty States**:
   - Accounts without data display real zeros (`0`), dashes (`-`), or standardized empty states with clear calls-to-action (e.g. "Create your first booking").
3. **Development Seed Data**:
   - If test fixtures are needed during local development, use the standalone script:
     ```bash
     npx tsx scripts/seed-dev.ts --confirm-dev-seed
     ```
   - This script refuses to run if `NODE_ENV === "production"` or against the production Supabase project.
4. **Automated Verification**:
   - Run the automated no-mock checker before commits:
     ```bash
     npm run check:no-mock
     ```

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build and Checks

```bash
npm run check:no-mock   # Validates zero mock/placeholder data
npm run lint            # Runs ESLint checks
npm run build           # Compiles production Next.js build
```
