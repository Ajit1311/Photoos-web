"use client";

import GalleryWorkspace from "../gallery/GalleryWorkspace";
import OverviewDashboard from "../overview/OverviewDashboard";
import EventSettings from "../settings/EventSettings";
import EventChatWorkspace from "../chat/EventChatWorkspace";
import ReminderWorkspace from "../reminder/ReminderWorkspace";
import PaymentWorkspace from "../payments/PaymentWorkspace";

import {
  FaceGalleryWorkspace,
} from "../face-gallery";

import type {
  WorkspaceTab,
} from "@/types/events/workspace";


export interface WorkspaceContentProps {

  activeTab:
    WorkspaceTab;

  eventId:
    string;

  clientId:
    string
    | null;

  workspaceId:
    string
    | null;

}


export default function WorkspaceContent({
  activeTab,
  eventId,
  clientId,
  workspaceId,
}: WorkspaceContentProps) {

  switch (
    activeTab
  ) {

    case "overview":

      return (
        <OverviewDashboard
          eventId={
            eventId
          }
        />
      );


    case "gallery":

      return (
        <GalleryWorkspace />
      );


    case "face-gallery":

      return (
        <FaceGalleryWorkspace
          eventId={
            eventId
          }
          workspaceId={
            workspaceId
          }
        />
      );


    case "payments":

      return (
        <PaymentWorkspace
          eventId={
            eventId
          }
        />
      );


    case "chat":

      return (
        <EventChatWorkspace
          clientId={
            clientId
          }
        />
      );


    case "reminder":

      return (
        <ReminderWorkspace
          eventId={
            eventId
          }
        />
      );


    case "settings":

      return (
        <EventSettings
          eventId={
            eventId
          }
        />
      );


    default:

      return (
        <OverviewDashboard
          eventId={
            eventId
          }
        />
      );

  }

}
