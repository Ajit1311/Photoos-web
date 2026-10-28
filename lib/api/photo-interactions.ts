import { supabase } from "@/lib/supabase/client";

export interface PhotoComment {
  id: string;
  author: string;
  comment: string;
  created_at: string;
}

export async function togglePhotoFavorite(
  assetId: string,
  isFavorite: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("toggle_photo_favorite", {
      p_asset_id: assetId,
      p_is_favorite: isFavorite,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle favorite.",
    };
  }
}

export async function togglePhotoSelection(
  assetId: string,
  isSelected: boolean,
  clientName = "Client",
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("toggle_photo_selection", {
      p_asset_id: assetId,
      p_is_selected: isSelected,
      p_selected_by: clientName,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle selection.",
    };
  }
}

export async function addPhotoComment(
  assetId: string,
  author: string,
  comment: string,
): Promise<{ success: boolean; comment?: PhotoComment; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("add_photo_comment", {
      p_asset_id: assetId,
      p_author: author,
      p_comment: comment,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const res = data as { success: boolean; comment?: PhotoComment; error?: string };
    return res;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add comment.",
    };
  }
}
