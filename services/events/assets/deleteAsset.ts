import { supabase } from "@/lib/supabase/client";

const FUNCTION_NAME = "assets";

export async function deleteAsset(
  studioId: string,
  assetId: string,
): Promise<void> {

  const {
    error,
  } = await supabase.functions.invoke(
    `${FUNCTION_NAME}/${assetId}`,
    {
      method: "DELETE",

      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

}