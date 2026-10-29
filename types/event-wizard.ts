export type ClientMode = "existing" | "new";

export type PaymentStatus =
  | "pending"
  | "advance_paid"
  | "paid";

export interface EventWizardData {
  // ===========================================================================
  // Basic Details
  // ===========================================================================
  projectId: string; // Associated project ID
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
  generateQrGallery: boolean;
  enableClientGallery: boolean;
  allowDownload: boolean;
  lockDownloadsUntilPayment: boolean;
  watermark: boolean;
  enableFavouriteSelection: boolean;
  expiryDate: string | null;

  // ===========================================================================
  // AI
  // ===========================================================================
  faceRecognition: boolean;
  duplicateDetection: boolean;
  blurDetection: boolean;
  bestPhotoSelection: boolean;
  albumSuggestions: boolean;
  smartTagGeneration: boolean;
}

export const defaultEventWizardData: EventWizardData = {
  projectId: "", // Default value
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

  generateQrGallery: true,
  enableClientGallery: true,
  allowDownload: false,
  lockDownloadsUntilPayment: true,
  watermark: true,
  enableFavouriteSelection: true,
  expiryDate: null,

  faceRecognition: true,
  duplicateDetection: true,
  blurDetection: true,
  bestPhotoSelection: true,
  albumSuggestions: true,
  smartTagGeneration: true,
};