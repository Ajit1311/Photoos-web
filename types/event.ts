export type EventStatus =
  | "draft"
  | "active"
  | "completed"
  | "published";

export interface EventClient {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface EventGallery {
  totalPhotos: number;
  publishedPhotos: number;
  favorites: number;
  downloads: number;
}

export interface EventDelivery {
  published: boolean;
  visibility: "public" | "private" | "pin";
  allowDownloads: boolean;
  watermark: boolean;
  expiresAt: string | null;
}

export interface Event {
  id: string;
  title: string;
  status: EventStatus;
  date: string;
  venue: string;
  client: EventClient;
  gallery: EventGallery;
  delivery: EventDelivery;
}