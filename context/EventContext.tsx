"use client";

import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { useEvent } from "@/hooks/useEvent";
import { Event } from "@/types/event";

type EventContextValue = {
  event: Event | null;
  loading: boolean;
};

const EventContext =
  createContext<EventContextValue | null>(null);

type EventProviderProps = {
  eventId: string;
  children: ReactNode;
};

export function EventProvider({
  eventId,
  children,
}: EventProviderProps) {
  const { event, loading } =
    useEvent(eventId);

  return (
    <EventContext.Provider
      value={{
        event,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

const DEFAULT_EVENT_VALUE: EventContextValue = {
  event: null,
  loading: false,
};

export function useCurrentEvent() {
  const context = useContext(EventContext);
  return context ?? DEFAULT_EVENT_VALUE;
}