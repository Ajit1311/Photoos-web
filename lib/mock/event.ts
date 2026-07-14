import { Event } from "@/types/event";

export const mockEvent: Event = {
  id: "evt_001",

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
};

export const mockEvents: Event[] = [
  mockEvent,
  {
    ...mockEvent,
    id: "evt_002",
    title: "Sneha & Amit Pre Wedding",
    date: "2026-07-15",
    venue: "Goa",
    status: "active",
    client: {
      id: "cli_002",
      name: "Sneha Patil",
      phone: "+91 9876500000",
      email: "sneha@gmail.com",
    },
  },
  {
    ...mockEvent,
    id: "evt_003",
    title: "Joshi Family Function",
    date: "2026-08-02",
    venue: "Pune",
    status: "completed",
    client: {
      id: "cli_003",
      name: "Mahesh Joshi",
      phone: "+91 9876511111",
      email: "mahesh@gmail.com",
    },
  },
];