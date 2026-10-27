import { Event } from "@/types/event";

export const mockEvent: Event = {
  id: "evt_001",

  projectId: "evt_001",

  title: "Rahul & Priya Wedding",

  status: "published",

  date: "2026-07-09",

  venue: "Kolhapur",

  client: {
    id: "cli_001",
    name: "Rahul Patil",
    phone: "+91 9876543210",
    email: "rahul@gmail.com",
  },

  gallery: {
    totalPhotos: 12482,
    publishedPhotos: 4826,
    favorites: 438,
    downloads: 1287,
  },

  delivery: {
    published: true,
    visibility: "public",
    allowDownloads: true,
    watermark: false,
    expiresAt: "2026-08-09",
  },

  financial: {
    budget: 250000,
    received: 150000,
    balance: 100000,
  },
};

export const mockEvents: Event[] = [
  mockEvent,
];