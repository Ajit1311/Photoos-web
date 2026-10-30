/**
 * Development Seed Script (MANUAL EXECUTION ONLY)
 *
 * SAFETY GUARDS:
 * 1. Refuses to run if NODE_ENV === "production"
 * 2. Refuses to run against production Supabase / custom domain
 * 3. Requires explicit command-line confirmation flag --confirm-dev-seed
 */

const isProd = process.env.NODE_ENV === "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isProdHost =
  supabaseUrl.includes("photoos.in") ||
  supabaseUrl.includes("production") ||
  isProd;

if (isProdHost) {
  console.error("FATAL: Cannot run dev seed in production environment or against production database!");
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.includes("--confirm-dev-seed")) {
  console.error(
    "SAFETY BLOCK: To run this development seed script, you must pass the '--confirm-dev-seed' flag explicitly.\nExample: npx tsx scripts/seed-dev.ts --confirm-dev-seed",
  );
  process.exit(1);
}

console.log("[DevSeed] Development safety checks passed. (No automatic fixtures run without explicit user instructions)");

