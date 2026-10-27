export type MarketingCampaignStatus =
  | "draft"
  | "sending"
  | "sent"
  | "partial"
  | "failed";

export type MarketingRecipientStatus =
  | "pending"
  | "sent"
  | "failed";

export interface MarketingStudioClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface MarketingCampaign {
  id: string;
  studioId: string;
  title: string | null;
  message: string;
  status: MarketingCampaignStatus;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdBy: string | null;
  sentAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SendMarketingCampaignInput {
  title?: string | null;
  message: string;
  clientIds: string[];
}

export interface MarketingCampaignRecipient {
  id: string;
  campaignId: string;
  clientId: string | null;
  conversationId: string | null;
  messageId: string | null;
  status: MarketingRecipientStatus;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}