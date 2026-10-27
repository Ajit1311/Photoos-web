import { supabase } from "@/lib/supabase/client";

import type {
  MarketingCampaign,
  MarketingCampaignRecipient,
  MarketingStudioClient,
  SendMarketingCampaignInput,
} from "@/types/marketing";

type CampaignRow = {
  id: string;
  studio_id: string;
  title: string | null;
  message: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_by: string | null;
  sent_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type RecipientRow = {
  id: string;
  campaign_id: string;
  client_id: string | null;
  conversation_id: string | null;
  message_id: string | null;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

type StudioClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

function mapCampaign(
  row: CampaignRow,
): MarketingCampaign {
  return {
    id: row.id,
    studioId: row.studio_id,
    title: row.title,
    message: row.message,
    status: row.status as MarketingCampaign["status"],
    recipientCount: row.recipient_count,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    createdBy: row.created_by,
    sentAt: row.sent_at,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecipient(
  row: RecipientRow,
): MarketingCampaignRecipient {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    clientId: row.client_id,
    conversationId: row.conversation_id,
    messageId: row.message_id,
    status:
      row.status as MarketingCampaignRecipient["status"],
    errorMessage: row.error_message,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export async function getMarketingCampaigns(): Promise<
  MarketingCampaign[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("marketing_campaigns")
    .select(`
      id,
      studio_id,
      title,
      message,
      status,
      recipient_count,
      sent_count,
      failed_count,
      created_by,
      sent_at,
      metadata,
      created_at,
      updated_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (data ?? []).map(
    (row) =>
      mapCampaign(
        row as CampaignRow,
      ),
  );
}

export async function getMarketingStudioClients(): Promise<
  MarketingStudioClient[]
> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_marketing_studio_clients",
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (data ?? [])
    .map(
      (
        row: StudioClientRow,
      ): MarketingStudioClient => ({
        id: row.id,
        name:
          row.name?.trim() ||
          "Unnamed Client",
        email:
          row.email?.trim() ||
          null,
        phone:
          row.phone?.trim() ||
          null,
      }),
    )
    .sort(
      (
        a: MarketingStudioClient,
        b: MarketingStudioClient,
      ) =>
        a.name.localeCompare(
          b.name,
        ),
    );
}

export async function getMarketingCampaignRecipients(
  campaignId: string,
): Promise<
  MarketingCampaignRecipient[]
> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "marketing_campaign_recipients",
    )
    .select(`
      id,
      campaign_id,
      client_id,
      conversation_id,
      message_id,
      status,
      error_message,
      sent_at,
      created_at
    `)
    .eq(
      "campaign_id",
      campaignId,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (data ?? []).map(
    (row) =>
      mapRecipient(
        row as RecipientRow,
      ),
  );
}

export async function sendMarketingCampaign(
  input: SendMarketingCampaignInput,
): Promise<string> {
  const message =
    input.message.trim();

  if (!message) {
    throw new Error(
      "Campaign message cannot be empty.",
    );
  }

  const clientIds = Array.from(
    new Set(
      input.clientIds.filter(
        (
          clientId,
        ): clientId is string =>
          Boolean(
            clientId?.trim(),
          ),
      ),
    ),
  );

  if (
    clientIds.length === 0
  ) {
    throw new Error(
      "Select at least one client.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "send_marketing_campaign",
    {
      p_title:
        input.title?.trim() ||
        null,
      p_message: message,
      p_client_ids: clientIds,
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!data) {
    throw new Error(
      "Campaign was created but no campaign ID was returned.",
    );
  }

  return data;
}