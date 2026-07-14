export type ClientMode = "existing" | "new";

export type PaymentStatus =
  | "pending"
  | "advance_paid"
  | "paid";

export interface EventWizardData {
  // ===========================================================================
  // Basic Details
  // ===========================================================================
  title: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venue: string;

  // ===========================================================================
  // Client (Updated fields as requested)
  // ===========================================================================
  clientMode: ClientMode;

  selectedClientId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;

  // ===========================================================================
  // Team
  // ===========================================================================
  projectManagerId: string | null;
  photographerIds: string[];
  editorIds: string[];

  // ===========================================================================
  // Pricing
  // ===========================================================================
  packageAmount: number;
  advanceAmount: number;
  discount: number;
  balanceAmount: number;
  paymentDueDate: string;
  paymentStatus: PaymentStatus;

  // ===========================================================================
  // Gallery
  // ===========================================================================
  watermark: boolean;
  allowDownload: boolean;
  expiryDate: string | null;

  // ===========================================================================
  // AI
  // ===========================================================================
  faceRecognition: boolean;
  autoCulling: boolean;
  autoEnhancement: boolean;
}

export const defaultEventWizardData: EventWizardData = {
  title: "",
  eventType: "Wedding",
  eventDate: "",
  eventTime: "",
  venue: "",

  // Client Defaults Updated
  clientMode: "existing",
  selectedClientId: null,
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",

  projectManagerId: null,
  photographerIds: [],
  editorIds: [],

  packageAmount: 0,
  advanceAmount: 0,
  discount: 0,
  balanceAmount: 0,
  paymentDueDate: "",
  paymentStatus: "pending",

  watermark: true,
  allowDownload: false,
  expiryDate: null,

  faceRecognition: true,
  autoCulling: true,
  autoEnhancement: true,
};