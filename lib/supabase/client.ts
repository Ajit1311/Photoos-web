import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import {
  publishableKey,
  supabaseUrl,
} from "./config";

let client: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {

  return createClient(
    supabaseUrl,
    publishableKey,
    {

      auth: {

        persistSession: true,

        autoRefreshToken: true,

        detectSessionInUrl: true,

        flowType: "pkce",

      },

      global: {

        headers: {

          "x-client-info":
            "photoos-web",

        },

      },

    },
  );

}

export function getSupabaseClient(): SupabaseClient {

  if (!client) {

    client =
      createSupabaseClient();

  }

  return client;

}

export const supabase =
  getSupabaseClient();