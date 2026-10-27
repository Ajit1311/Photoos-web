import {
  supabase,
} from "@/lib/supabase/client";

export interface ClientPresence {
  client_id: string;

  is_online: boolean;

  last_seen_at:
    | string
    | null;
}

type ClientPresenceRow = {
  client_id?: unknown;

  is_online?: unknown;

  last_seen_at?: unknown;
};

function normalizeClientPresence(
  value: unknown,
  fallbackClientId: string,
): ClientPresence {
  const row =
    (
      value &&
      typeof value === "object"
        ? value
        : {}
    ) as ClientPresenceRow;

  return {
    client_id:
      typeof row.client_id ===
      "string"
        ? row.client_id
        : fallbackClientId,

    is_online:
      row.is_online === true,

    last_seen_at:
      typeof row.last_seen_at ===
      "string"
        ? row.last_seen_at
        : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Get Single Client Presence                                                 */
/* -------------------------------------------------------------------------- */

export async function getClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  if (!clientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_client_presence",
      {
        p_client_id:
          clientId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeClientPresence(
    data,
    clientId,
  );
}

/* -------------------------------------------------------------------------- */
/* Get Multiple Client Presence                                               */
/* -------------------------------------------------------------------------- */

export async function getClientPresenceList(
  clientIds: string[],
): Promise<ClientPresence[]> {
  const uniqueClientIds =
    [
      ...new Set(
        clientIds.filter(
          Boolean,
        ),
      ),
    ];

  if (
    uniqueClientIds.length ===
    0
  ) {
    return [];
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "list_client_presence",
      {
        p_client_ids:
          uniqueClientIds,
      },
    );

  if (error) {
    throw error;
  }

  const rows =
    Array.isArray(
      data,
    )
      ? data
      : [];

  const presenceByClientId =
    new Map<
      string,
      ClientPresence
    >();

  for (
    const row of rows
  ) {
    const normalized =
      normalizeClientPresence(
        row,
        "",
      );

    if (
      normalized.client_id
    ) {
      presenceByClientId.set(
        normalized.client_id,
        normalized,
      );
    }
  }

  return uniqueClientIds.map(
    (
      clientId,
    ) =>
      presenceByClientId.get(
        clientId,
      ) ?? {
        client_id:
          clientId,

        is_online:
          false,

        last_seen_at:
          null,
      },
  );
}

/* -------------------------------------------------------------------------- */
/* Ensure Client Presence                                                     */
/* -------------------------------------------------------------------------- */

export async function ensureClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  if (!clientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "ensure_client_presence",
      {
        p_client_id:
          clientId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeClientPresence(
    data,
    clientId,
  );
}

/* -------------------------------------------------------------------------- */
/* Heartbeat Client Presence                                                  */
/* -------------------------------------------------------------------------- */

export async function heartbeatClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  if (!clientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "heartbeat_client_presence",
      {
        p_client_id:
          clientId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeClientPresence(
    data,
    clientId,
  );
}
