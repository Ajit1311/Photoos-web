export type ChatConversationType =
  | "direct"
  | "group"
  | "client"
  | "internal";

export type ChatMessageType =
  | "text"
  | "image"
  | "file"
  | "system";

export type ChatConversationStatus =
  | "active"
  | "archived"
  | "closed";

/* -------------------------------------------------------------------------- */
/* Client Presence                                                            */
/* -------------------------------------------------------------------------- */

export interface ClientPresence {
  client_id: string;

  is_online: boolean;

  last_seen_at: string | null;
}

/* -------------------------------------------------------------------------- */
/* Conversations                                                              */
/* -------------------------------------------------------------------------- */

export interface ChatConversation {
  id: string;

  type: ChatConversationType;

  title: string;

  metadata: Record<string, unknown>;

  created_at: string;

  updated_at: string;

  client_id?: string | null;

  project_id?: string | null;

  album_id?: string | null;

  unread_count?: number;
}

export interface ChatConversationDetails
  extends ChatConversation {
  studio_id: string;

  status: ChatConversationStatus;

  created_by: string;
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  id: string;

  conversation_id: string;

  sender_id: string;

  message_type: ChatMessageType;

  content: string;

  reply_to_id: string | null;

  metadata: Record<string, unknown>;

  attachments: Array<{
    id: string;
    asset_id: string | null;
    file_name: string;
    file_path: string;
    file_type: string | null;
    file_size: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
    signed_url?: string | null;
  }>;

  created_at: string;

  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */


export interface SendChatMessageInput {
  conversationId: string;

  content: string;

  messageType?: ChatMessageType;

  replyToId?: string | null;

  metadata?: Record<string, unknown>;
}
