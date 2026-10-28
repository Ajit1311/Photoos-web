import { supabase } from "@/lib/supabase/client";
import { getAccessToken } from "@/lib/auth/session";
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";

/* -------------------------------------------------------------------------- */
/* Album Card                                                                 */
/* -------------------------------------------------------------------------- */

export type AlbumCard = {
  id: string;

  studio_id: string;

  project_id: string | null;

  client_id: string | null;

  client_name: string | null;

  code: string;

  title: string;

  slug: string;

  album_type: string;

  visibility: string;

  status: string;

  is_favorite: boolean;

  sequence: number;

  cover_asset: {
    id: string;

    storage_path: string | null;

    thumbnail_path: string | null;
  } | null;

  created_at: string;

  updated_at: string;
};

export type AlbumCardsResponse = {
  cards: AlbumCard[];

  total_count: number;

  limit: number;

  offset: number;

  has_more: boolean;
};

/* -------------------------------------------------------------------------- */
/* Album Workspace                                                            */
/* -------------------------------------------------------------------------- */

export type AlbumWorkspaceResponse =
  Record<string, unknown>;

export type AlbumDashboardResponse =
  Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeAlbumList(
  data: unknown,
): AlbumCard[] {
  if (Array.isArray(data)) {
    return data as AlbumCard[];
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const result =
      data as Record<string, unknown>;

    const candidates = [
      result.albums,
      result.items,
      result.data,
      result.rows,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as AlbumCard[];
      }
    }
  }

  return [];
}

function normalizeCreatedAlbum(
  data: unknown,
): AlbumCard | null {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    return (
      (data[0] as AlbumCard | undefined) ??
      null
    );
  }

  if (
    typeof data === "object"
  ) {
    const result =
      data as Record<string, unknown>;

    if (
      result.id &&
      typeof result.id === "string"
    ) {
      return result as AlbumCard;
    }

    const candidates = [
      result.album,
      result.data,
      result.result,
    ];

    for (const candidate of candidates) {
      if (
        candidate &&
        typeof candidate === "object"
      ) {
        const album =
          candidate as Record<string, unknown>;

        if (
          album.id &&
          typeof album.id === "string"
        ) {
          return album as AlbumCard;
        }
      }

      if (
        Array.isArray(candidate) &&
        candidate.length > 0
      ) {
        return candidate[0] as AlbumCard;
      }
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* List Albums                                                                */
/* -------------------------------------------------------------------------- */

export async function listAlbums(
  studioId: string,
  projectId?: string | null,
): Promise<AlbumCard[]> {
  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "album-list",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            studio_id: studioId,
            project_id: projectId ?? null,
            limit: 100,
            offset: 0,
            status: null,
            album_type: null,
            visibility: null,
            is_favorite: null,
            search: null,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        return normalizeAlbumList(data.data);
      }
    }
  } catch (edgeErr) {
    console.warn("[listAlbums] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("albums")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: dbAlbums, error: dbError } = await query;
    if (!dbError && dbAlbums) {
      return normalizeAlbumList(dbAlbums);
    }
  } catch (dbErr) {
    console.warn("[listAlbums] DB fallback error:", dbErr);
  }

  // 3. Resilient empty array
  return [];
}

/* -------------------------------------------------------------------------- */
/* Create Album                                                               */
/* -------------------------------------------------------------------------- */

export async function createAlbum(
  studioId: string,
  projectId: string,
  title: string,
): Promise<AlbumCard> {
  try {
    const {
      data,
      error,
    } = await supabase.rpc(
      "create_album",
      {
        p_studio_id: studioId,
        p_project_id: projectId,
        p_title: title,
        p_description: null,
        p_album_type: "standard",
        p_visibility: "private",
        p_sequence: 1,
        p_cover_asset_id: null,
        p_metadata: {},
      },
    );

    if (!error && data) {
      const album = normalizeCreatedAlbum(data);
      if (album?.id) {
        return album;
      }
    }
  } catch (rpcErr) {
    console.warn("[createAlbum] RPC error, falling back to direct DB insert:", rpcErr);
  }

  // Direct DB insert fallback
  const { data: inserted, error: insertError } = await supabase
    .from("albums")
    .insert({
      studio_id: studioId,
      project_id: projectId,
      title: title,
      album_type: "standard",
      visibility: "private",
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  const result = normalizeCreatedAlbum(inserted) || (inserted as unknown as AlbumCard);
  if (!result?.id) {
    throw new Error(
      "Album was created but the album response does not contain an ID.",
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Get / Create Main Album                                                    */
/* -------------------------------------------------------------------------- */

export async function getOrCreateMainAlbum(
  studioId: string,
  projectId: string,
): Promise<AlbumCard> {
  const albums =
    await listAlbums(
      studioId,
      projectId,
    );

  const existingMainAlbum =
    albums.find(
      (album) =>
        album.title === "Main Album",
    );

  if (existingMainAlbum?.id) {
    return existingMainAlbum;
  }

  if (albums.length > 0) {
    return albums[0];
  }

  try {
    return await createAlbum(
      studioId,
      projectId,
      "Main Album",
    );
  } catch (error) {
    const errorCode =
      error &&
      typeof error === "object" &&
      "code" in error
        ? String(
            (
              error as {
                code?: unknown;
              }
            ).code,
          )
        : null;

    if (errorCode !== "23505") {
      throw error;
    }

    const refreshedAlbums =
      await listAlbums(
        studioId,
        projectId,
      );

    const existingAfterConflict =
      refreshedAlbums.find(
        (album) =>
          album.title === "Main Album",
      );

    if (existingAfterConflict?.id) {
      return existingAfterConflict;
    }

    if (
      refreshedAlbums.length > 0
    ) {
      return refreshedAlbums[0];
    }

    throw new Error(
      "Main Album already exists, but it could not be resolved after refreshing albums.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Album Cards                                                                */
/* -------------------------------------------------------------------------- */

export type GetAlbumCardsOptions = {
  projectId?: string | null;

  clientId?: string | null;

  limit?: number;

  offset?: number;
};

export async function getAlbumCards(
  studioId: string,
  options: GetAlbumCardsOptions = {},
): Promise<AlbumCardsResponse> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "album-list",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        body: {
          studio_id: studioId,
          project_id:
            options.projectId ?? null,
          limit:
            options.limit ?? 20,
          offset:
            options.offset ?? 0,
          status: null,
          album_type: null,
          visibility: null,
          is_favorite: null,
          search: null,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.message ??
        data?.error?.message ??
        "Unable to load albums.",
    );
  }

  const result =
    (data.data ?? {}) as Record<string, unknown>;

  const cards =
    Array.isArray(result.items)
      ? result.items
      : Array.isArray(result.albums)
        ? result.albums
        : Array.isArray(result.cards)
          ? result.cards
          : [];

  return {
    cards: cards as AlbumCard[],
    total_count:
      Number(result.total_count ?? cards.length),
    limit:
      Number(
        result.limit ??
          options.limit ??
          20,
      ),
    offset:
      Number(
        result.offset ??
          options.offset ??
          0,
      ),
    has_more:
      Boolean(result.has_more),
  };
}

/* -------------------------------------------------------------------------- */
/* Album Workspace                                                            */
/* -------------------------------------------------------------------------- */

export async function getAlbumWorkspace(
  albumId: string,
): Promise<AlbumWorkspaceResponse> {
  // 1. Try edge function first
  try {
    const token =
      (await getFirebaseIdToken().catch(() => null)) ||
      (await getAccessToken().catch(() => null));

    if (token) {
      const { data, error } = await supabase.functions.invoke(
        "album-workspace",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            album_id: albumId,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        return data.data as AlbumWorkspaceResponse;
      }
    }
  } catch (edgeErr) {
    console.warn("[getAlbumWorkspace] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbAlbum, error: dbErr } = await supabase
      .from("albums")
      .select("*, clients(*), projects(*)")
      .eq("id", albumId)
      .maybeSingle();

    if (!dbErr && dbAlbum) {
      return {
        album: dbAlbum,
        assets: [],
      } as AlbumWorkspaceResponse;
    }
  } catch (dbErr) {
    console.warn("[getAlbumWorkspace] DB fallback error:", dbErr);
  }

  return {} as AlbumWorkspaceResponse;
}

/* -------------------------------------------------------------------------- */
/* Album Dashboard                                                            */
/* -------------------------------------------------------------------------- */

export async function getAlbumDashboard(
  albumId: string,
): Promise<AlbumDashboardResponse> {
  // 1. Try edge function first
  try {
    const token =
      (await getFirebaseIdToken().catch(() => null)) ||
      (await getAccessToken().catch(() => null));

    if (token) {
      const { data, error } = await supabase.functions.invoke(
        "album-dashboard",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            album_id: albumId,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        return data.data as AlbumDashboardResponse;
      }
    }
  } catch (edgeErr) {
    console.warn("[getAlbumDashboard] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbAlbum, error: dbErr } = await supabase
      .from("albums")
      .select("*, clients(*), projects(*)")
      .eq("id", albumId)
      .maybeSingle();

    if (!dbErr && dbAlbum) {
      return {
        album: dbAlbum,
        stats: { totalAssets: 0, totalViews: 0 },
      } as AlbumDashboardResponse;
    }
  } catch (dbErr) {
    console.warn("[getAlbumDashboard] DB fallback error:", dbErr);
  }

  return {} as AlbumDashboardResponse;
}