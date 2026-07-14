export const supabaseUrl: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const publishableKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL",
  );
}

if (!publishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}