import { supabase } from "@/lib/supabase/client";

export async function invokeFunction<T>(
  name: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } =
    await supabase.functions.invoke(name, {
      body,
    });

  if (error) {
    throw error;
  }

  return data as T;
}