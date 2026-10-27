import { getAccessToken } from "@/lib/auth/session";

import { supabase } from "@/lib/supabase/client";

import type {
  ChatConversation,
  ChatConversationDetails,
  ChatMessage,
  ChatMessageType,
  ClientPresence,
} from "@/types/chat";

export type {
  ChatConversation,
  ChatMessage,
};

type ChatConversationRow = {
  id: string;

  type:
    ChatConversation["type"];

  title: string;

  metadata:
    Record<string, unknown> | null;

  client_id:
    string | null;

  project_id:
    string | null;

  album_id:
    string | null;

  created_at: string;

  updated_at: string;

  unread_count:
    number | null;
};

type ChatConversationDetailsRow = {
  id: string;

  studio_id: string;

  type:
    ChatConversation["type"];

  title: string;

  project_id:
    string | null;

  album_id:
    string | null;

  client_id:
    string | null;

  status:
    "active"
    | "archived"
    | "closed";

  metadata:
    Record<string, unknown> | null;

  created_by: string;

  created_at: string;

  updated_at: string;
};

type ChatMessageRow = {
  id: string;

  conversation_id: string;

  sender_id: string;

  message_type:
    ChatMessage["message_type"];

  content: string;

  reply_to_id:
    string | null;

  metadata:
    Record<string, unknown> | null;

  created_at: string;

  updated_at: string;
};

type ClientPresenceRow = {
  client_id: string;

  is_online: boolean;

  last_seen_at: string | null;
};

/* -------------------------------------------------------------------------- */
/* Conversation Normalization                                                */
/* -------------------------------------------------------------------------- */

function normalizeConversation(
  row: ChatConversationRow,
): ChatConversation {
  const metadata =
    row.metadata ?? {};

  return {
    id:
      row.id,

    type:
      row.type,

    title:
      row.title,

    metadata,

    created_at:
      row.created_at,

    updated_at:
      row.updated_at,

    /*
     * IMPORTANT
     *
     * 225_chat_client_context.sql now returns
     * client_id / project_id / album_id directly.
     *
     * Do NOT depend on metadata for these relationships.
     */

    client_id:
      row.client_id,

    project_id:
      row.project_id,

    album_id:
      row.album_id,

    unread_count:
      Number(row.unread_count ?? 0),
  };
}

/* -------------------------------------------------------------------------- */
/* Message Normalization                                                      */
/* -------------------------------------------------------------------------- */

function normalizeMessage(
  row: ChatMessageRow,
): ChatMessage {
  return {
    id:
      row.id,

    conversation_id:
      row.conversation_id,

    sender_id:
      row.sender_id,

    message_type:
      row.message_type,

    content:
      row.content,

    reply_to_id:
      row.reply_to_id,

    metadata:
      row.metadata ?? {},

      attachments:
        (
          Array.isArray(
            (row as ChatMessageRow & {
              attachments?: ChatMessage["attachments"];
            }).attachments,
          )
            ? (
                (row as ChatMessageRow & {
                  attachments?: ChatMessage["attachments"];
                }).attachments ?? []
              )
            : []
        ),

    created_at:
      row.created_at,

    updated_at:
      row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Client Presence Normalization                                              */
/* -------------------------------------------------------------------------- */

function normalizeClientPresence(
  row:
    | ClientPresenceRow
    | null
    | undefined,
  fallbackClientId?: string,
): ClientPresence {
  return {
    client_id:
      row?.client_id ??
      fallbackClientId ??
      "",

    is_online:
      Boolean(
        row?.is_online,
      ),

    last_seen_at:
      row?.last_seen_at ??
      null,
  };
}

/* -------------------------------------------------------------------------- */
/* Client Presence                                                            */
/* -------------------------------------------------------------------------- */

export async function ensureClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  const trimmedClientId =
    clientId.trim();

  if (!trimmedClientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "ensure_client_presence",
    {
      p_client_id:
        trimmedClientId,
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  return normalizeClientPresence(
    row as ClientPresenceRow | null,
    trimmedClientId,
  );
}

export async function heartbeatClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  const trimmedClientId =
    clientId.trim();

  if (!trimmedClientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "heartbeat_client_presence",
    {
      p_client_id:
        trimmedClientId,
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  return normalizeClientPresence(
    row as ClientPresenceRow | null,
    trimmedClientId,
  );
}

export async function getClientPresence(
  clientId: string,
): Promise<ClientPresence> {
  const trimmedClientId =
    clientId.trim();

  if (!trimmedClientId) {
    throw new Error(
      "Client ID is required.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_presence",
    {
      p_client_id:
        trimmedClientId,
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  return normalizeClientPresence(
    row as ClientPresenceRow | null,
    trimmedClientId,
  );
}

export async function listClientPresence(
  clientIds: string[],
): Promise<ClientPresence[]> {
  const uniqueClientIds =
    Array.from(
      new Set(
        clientIds
          .map(
            (clientId) =>
              clientId.trim(),
          )
          .filter(Boolean),
      ),
    );

  if (
    uniqueClientIds.length ===
    0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase.rpc(
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
    Array.isArray(data)
      ? data
      : [];

  const presenceByClientId =
    new Map<
      string,
      ClientPresence
    >();

  for (
    const row of rows as ClientPresenceRow[]
  ) {
    const presence =
      normalizeClientPresence(
        row,
      );

    if (
      presence.client_id
    ) {
      presenceByClientId.set(
        presence.client_id,
        presence,
      );
    }
  }

  return uniqueClientIds.map(
    (clientId) =>
      presenceByClientId.get(
        clientId,
      ) ??
      normalizeClientPresence(
        null,
        clientId,
      ),
  );
}

/* -------------------------------------------------------------------------- */
/* Unread Count                                                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* My Conversations                                                           */
/* -------------------------------------------------------------------------- */

export async function getMyChatConversations(): Promise<
  ChatConversation[]
> {
  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load chat conversations.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "get-my-chat-conversations",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: {},
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
      data?.error ??
      "Unable to load chat conversations.",
    );
  }

  const conversations =
    (
      (data.data ?? []) as ChatConversationRow[]
    ).map(
      normalizeConversation,
    );

  return conversations;
}

export async function removeChatConversation(
  conversationId: string,
): Promise<boolean> {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "rpc_remove_chat_conversation",
    {
      p_conversation_id:
        conversationId,
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function restoreChatConversationForUser(
  conversationId: string,
  profileId: string,
): Promise<boolean> {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required.",
    );
  }

  if (!profileId) {
    throw new Error(
      "Profile ID is required.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "rpc_restore_chat_conversation_for_user",
    {
      p_conversation_id:
        conversationId,

      p_profile_id:
        profileId,
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}

/* -------------------------------------------------------------------------- */
/* Conversation Details                                                       */
/* -------------------------------------------------------------------------- */

export async function getChatConversationDetails(
  conversationId: string,
): Promise<ChatConversationDetails> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_chat_conversation_details",
    {
      p_conversation_id:
        conversationId,
    },
  );

  if (error) {
    throw error;
  }

  const rows =
    (
      data ?? []
    ) as ChatConversationDetailsRow[];

  if (!rows.length) {
    throw new Error(
      "Chat conversation not found.",
    );
  }

  const row =
    rows[0];

  return {
    id:
      row.id,

    studio_id:
      row.studio_id,

    type:
      row.type,

    title:
      row.title,

    project_id:
      row.project_id,

    album_id:
      row.album_id,

    client_id:
      row.client_id,

    status:
      row.status,

    metadata:
      row.metadata ?? {},

    created_by:
      row.created_by,

    created_at:
      row.created_at,

    updated_at:
      row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

export async function getChatMessages(
  conversationId: string,
  options?: {
    limit?: number;

    before?: string | null;
  },
): Promise<ChatMessage[]> {
  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load chat messages.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "get-chat-messages",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: {
        conversation_id:
          conversationId,

        limit:
          options?.limit ?? 50,

        before:
          options?.before ?? null,
      },
    },
  );

  if (error) {
    throw error;
  }

  const responseData =
    data?.data ?? data ?? [];

  console.log("[getChatMessages] FRONTEND RESPONSE", {
    responseData,
    rowCount: Array.isArray(responseData)
      ? responseData.length
      : 0,
    firstRow: Array.isArray(responseData) && responseData.length > 0
      ? responseData[0]
      : null,
  });

  const normalized =
    (responseData as ChatMessageRow[]).map(
      normalizeMessage,
    );

  console.log("[getChatMessages] NORMALIZED", {
    rowCount: normalized.length,
    firstMessage:
      normalized.length > 0
        ? normalized[0]
        : null,
  });

  return normalized;
}

/* -------------------------------------------------------------------------- */
/* Send Message                                                               */
/* -------------------------------------------------------------------------- */

export async function sendChatMessage(
  conversationId: string,
  content: string,
  options?: {
    messageType?:
      ChatMessageType;

    replyToId?:
      string | null;

    metadata?:
      Record<string, unknown>;
  },
): Promise<string> {
  const trimmedConversationId =
    conversationId.trim();

  const trimmedContent =
    content.trim();

  if (!trimmedConversationId) {
    throw new Error(
      "Conversation ID is required.",
    );
  }

  if (!trimmedContent) {
    throw new Error(
      "Message content is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to send chat messages.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "send-chat-message",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: {
        conversation_id:
          trimmedConversationId,

        content:
          trimmedContent,

        message_type:
          options?.messageType ??
          "text",

        reply_to_id:
          options?.replyToId ??
          null,

        metadata:
          options?.metadata ??
          {},
      },
    },
  );

  if (error) {
    throw error;
  }

  const messageId =
    data?.data;

  if (!messageId) {
    throw new Error(
      "Message was not created.",
    );
  }

  return messageId as string;
}

/* -------------------------------------------------------------------------- */
/* Mark Message Read                                                          */
/* -------------------------------------------------------------------------- */

export type ChatPinnedMessage = {
  message_id: string;

  conversation_id: string;

  pinned_by: string;

  pinned_at: string;
};

export async function pinChatMessage(
  messageId: string,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "pin_chat_message",
    {
      p_message_id:
        messageId,
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function unpinChatMessage(
  messageId: string,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "unpin_chat_message",
    {
      p_message_id:
        messageId,
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getChatPinnedMessages(
  conversationId: string,
): Promise<ChatPinnedMessage[]> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_chat_pinned_messages",
    {
      p_conversation_id:
        conversationId,
    },
  );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as ChatPinnedMessage[];
}

export async function markChatMessageRead(
  messageId: string,
): Promise<boolean> {
  const trimmedMessageId =
    messageId.trim();

  if (!trimmedMessageId) {
    throw new Error(
      "Message ID is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to mark chat messages as read.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "mark-chat-message-read",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: {
        message_id:
          trimmedMessageId,
      },
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(
    data?.success ??
    data?.data ??
    data,
  );
}

/* -------------------------------------------------------------------------- */
/* Chat Attachments                                                           */
/* -------------------------------------------------------------------------- */

export interface ChatMessageAttachment {
  id: string;

  asset_id: string | null;

  file_name: string;

  file_path: string;

  file_type: string | null;

  file_size: number | null;

  metadata:
    Record<string, unknown>;

  created_at: string;

  signed_url?:
    string | null;
}

type ChatMessageAttachmentRow = {
  id: string;

  asset_id: string | null;

  file_name: string;

  file_path: string;

  file_type: string | null;

  file_size: number | null;

  metadata:
    Record<string, unknown> | null;

  created_at: string;
};

export async function prepareChatAttachmentUpload(
  conversationId: string,
  file: File,
): Promise<{
  attachment_id: string;

  bucket: string;

  storage_path: string;

  storage_filename: string;
}> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "prepare_chat_attachment_upload",
    {
      p_conversation_id:
        conversationId,

      p_file_name:
        file.name,

      p_file_type:
        file.type ||
        null,

      p_file_size:
        file.size,
    },
  );

  if (error) {
    throw error;
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!row) {
    throw new Error(
      "Chat attachment preparation returned an empty response.",
    );
  }

  if (!row.attachment_id) {
    throw new Error(
      "Chat attachment preparation did not return attachment ID.",
    );
  }

  if (!row.bucket) {
    throw new Error(
      "Chat attachment preparation did not return storage bucket.",
    );
  }

  if (!row.storage_path) {
    throw new Error(
      "Chat attachment preparation did not return storage path.",
    );
  }

  if (!row.storage_filename) {
    throw new Error(
      "Chat attachment preparation did not return storage filename.",
    );
  }

  return {
    attachment_id:
      row.attachment_id,

    bucket:
      row.bucket,

    storage_path:
      row.storage_path,

    storage_filename:
      row.storage_filename,
  };
}

export async function completeChatAttachmentUpload(
  payload: {
    messageId: string;

    attachmentId: string;

    storagePath: string;

    fileName: string;

    fileType: string | null;

    fileSize: number;

    metadata?:
      Record<string, unknown>;
  },
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "complete_chat_attachment_upload",
    {
      p_message_id:
        payload.messageId,

      p_attachment_id:
        payload.attachmentId,

      p_storage_path:
        payload.storagePath,

      p_file_name:
        payload.fileName,

      p_file_type:
        payload.fileType,

      p_file_size:
        payload.fileSize,

      p_metadata:
        payload.metadata ?? {},
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Chat attachment completion returned no attachment ID.",
    );
  }

  return data as string;
}

export async function getChatMessageAttachments(
  messageId: string,
): Promise<ChatMessageAttachment[]> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_chat_message_attachments",
    {
      p_message_id:
        messageId,
    },
  );

  if (error) {
    throw error;
  }

  const rows =
    (
      data ?? []
    ) as ChatMessageAttachmentRow[];

  const attachments =
    await Promise.all(
      rows.map(
        async (
          row,
        ): Promise<ChatMessageAttachment> => {
          let signedUrl:
            string | null =
            null;

          if (
            row.file_path
          ) {
            const result =
              await supabase.storage
                .from("assets")
                .createSignedUrl(
                  row.file_path,
                  3600,
                );

            signedUrl =
              result.data?.signedUrl ??
              null;
          }

          return {
            id:
              row.id,

            asset_id:
              row.asset_id,

            file_name:
              row.file_name,

            file_path:
              row.file_path,

            file_type:
              row.file_type,

            file_size:
              row.file_size,

            metadata:
              row.metadata ?? {},

            created_at:
              row.created_at,

            signed_url:
              signedUrl,
          };
        },
      ),
    );

  return attachments;
}

/* -------------------------------------------------------------------------- */
/* Delete Message                                                             */
/* -------------------------------------------------------------------------- */

export async function deleteChatMessage(
  messageId: string,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "rpc_delete_chat_message",
    {
      p_message_id:
        messageId,
    },
  );

  if (error) {
    throw error;
  }

  return Boolean(data);
}

/* -------------------------------------------------------------------------- */
/* Create Client Conversation                                                 */
/* -------------------------------------------------------------------------- */

export async function createClientChatConversation(
  clientProfileId: string,
  clientId: string,
  clientName: string,
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "create-chat-conversation",
    {
      method:
        "POST",

      body: {
        conversation_type:
          "client",

        title:
          clientName,

        participant_ids: [
          clientProfileId,
        ],

        metadata: {
          client_id:
            clientId,

          client_profile_id:
            clientProfileId,

          client_name:
            clientName,
        },
      },
    },
  );

  if (error) {
    throw error;
  }

  if (
    !data?.success ||
    !data.data
  ) {
    throw new Error(
      "Unable to create client chat conversation.",
    );
  }

  return data.data as string;
}

export async function startClientChatConversation(
  clientId: string,
  _clientName?: string | null,
): Promise<string> {
  const trimmedClientId =
    clientId.trim();

  if (!trimmedClientId) {
    throw new Error(
      "Client ID is required to start chat.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "rpc_start_client_chat",
    {
      p_client_id:
        trimmedClientId,
    },
  );

  if (error) {
    console.error(
      "START CLIENT CHAT RPC ERROR",
    );

    console.error(
      "message:",
      error.message,
    );

    console.error(
      "code:",
      error.code,
    );

    console.error(
      "details:",
      error.details,
    );

    console.error(
      "hint:",
      error.hint,
    );

    console.error(
      "full error:",
      JSON.stringify(
        error,
        Object.getOwnPropertyNames(
          error,
        ),
        2,
      ),
    );

    throw new Error(
      error.message ||
      "Unable to start client chat.",
    );
  }

  if (!data) {
    throw new Error(
      "Client chat could not be started.",
    );
  }

  return data as string;
}

/* -------------------------------------------------------------------------- */
/* Chat Join Requests                                                         */
/* -------------------------------------------------------------------------- */

export type CreateChatJoinRequestResponse = {
  id: string;
  conversation_id: string;
  requested_by: string;
  status: string;
  message: string | null;
  created_at: string;
};

export type ChatJoinRequest = {
  id: string;
  studio_id: string;
  conversation_id: string;
  requested_by: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function requestChatJoin(
  conversationId: string,
  message?: string,
): Promise<CreateChatJoinRequestResponse> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "request-chat-join",
      {
        body: {
          conversation_id:
            conversationId,

          message:
            message ??
            null,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Unable to create chat join request.",
    );
  }

  return data as CreateChatJoinRequestResponse;

}


export async function reviewChatJoinRequest(
  requestId: string,
  action: "approved" | "rejected",
  rejectionReason?: string,
): Promise<ChatJoinRequest> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "review-chat-join-request",
      {
        body: {
          request_id:
            requestId,

          action,

          rejection_reason:
            rejectionReason ??
            null,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Unable to review chat join request.",
    );
  }

  return data as ChatJoinRequest;

}


export async function getChatJoinRequests(
  status = "pending",
): Promise<ChatJoinRequest[]> {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "list_chat_join_requests",
      {
        p_status:
          status,
      },
    );

  if (error) {
    throw error;
  }

  return (
    data ??
    []
  ) as ChatJoinRequest[];

}

/* -------------------------------------------------------------------------- */
/* Conversation Member Management                                              */
/* -------------------------------------------------------------------------- */

export type AddChatConversationMembersRequest = {
  conversationId: string;
  memberIds: string[];
};

export type AddChatConversationMembersResponse = {
  insertedCount: number;
};

export async function addChatConversationMembers(
  payload: AddChatConversationMembersRequest,
): Promise<AddChatConversationMembersResponse> {

  const {
    data,
    error,
  } = await supabase.rpc(
    "add_chat_conversation_members",
    {
      p_conversation_id:
        payload.conversationId,

      p_member_ids:
        payload.memberIds,
    },
  );

  if (error) {

    throw new Error(
      error.message,
    );

  }

  return {
    insertedCount:
      Number(
        data ?? 0,
      ),
  };

}

export type ChatConversationMember = {
  member_id: string;
  conversation_id: string;
  profile_id: string | null;
  client_id: string | null;
  member_type: "employee" | "client";
  display_name: string;
  email: string | null;
  role: string | null;
  joined_at: string | null;
  created_at: string;
};

export async function listChatConversationMembers(
  conversationId: string,
): Promise<ChatConversationMember[]> {
  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load conversation members.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "get-chat-conversation-members",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: {
        conversation_id:
          conversationId,
      },
    },
  );

  if (error) {
    throw error;
  }

  const responseData =
    data?.data ?? data ?? [];

  return Array.isArray(responseData)
    ? responseData as ChatConversationMember[]
    : [];
}
export type AddChatConversationClientsRequest = {
  conversationId: string;
  clientIds: string[];
};

export async function addChatConversationClients(
  request: AddChatConversationClientsRequest,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "add_chat_conversation_clients",
    {
      p_conversation_id:
        request.conversationId,

      p_client_ids:
        request.clientIds,
    },
  );

  if (error) {
    throw error;
  }
}
