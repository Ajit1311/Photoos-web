import { createClient } from "@supabase/supabase-js";

import {
  publishableKey,
  supabaseUrl,
} from "./config";

export const supabase = createClient(
  supabaseUrl as string,
  publishableKey as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);