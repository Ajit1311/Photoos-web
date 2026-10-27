"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  getNotificationCenter,
} from "@/lib/api/notification/get-notification-center";

import {
  getNotificationBadgeCount,
} from "@/lib/api/notification/get-notification-badge-count";

import {
  markNotificationRead,
} from "@/lib/api/notification/mark-notification-read";

import {
  markAllNotificationsRead,
} from "@/lib/api/notification/mark-all-notifications-read";

import {
  getTotalChatUnreadCount,
} from "@/lib/api/chat/get-total-chat-unread-count";

import type {
  NotificationBadgeCount,
  NotificationCenterResponse,
} from "@/types/notification/notification";


type NotificationContextValue = {

  center:
    NotificationCenterResponse;

  badge:
    NotificationBadgeCount;

  chatUnread:
    number;

  loading:
    boolean;

  refreshing:
    boolean;

  error:
    Error
    | null;

  reload:
    () => Promise<void>;

  markAsRead:
    (
      notificationId: string,
    ) => Promise<void>;

  markAllAsRead:
    () => Promise<void>;

};


const NotificationContext =
  createContext<
    NotificationContextValue
    | null
  >(
    null,
  );


type NotificationProviderProps = {

  children:
    ReactNode;

};


const EMPTY_CENTER:
  NotificationCenterResponse = {

    count:
      0,

    items:
      [],

  };


const EMPTY_BADGE:
  NotificationBadgeCount = {

    total:
      0,

    unread:
      0,

  };


export function NotificationProvider({
  children,
}: NotificationProviderProps) {

  const bootstrap =
    useBootstrapContext();


  const studioId =
    bootstrap.data?.workspace.studio?.id ??
    null;


  const profileId =
    bootstrap.data?.profile?.id ??
    bootstrap.data?.workspace.membership.profileId ??
    null;


  const [
    center,
    setCenter,
  ] =
    useState<
      NotificationCenterResponse
    >(
      EMPTY_CENTER,
    );


  const [
    badge,
    setBadge,
  ] =
    useState<
      NotificationBadgeCount
    >(
      EMPTY_BADGE,
    );


  const [
    chatUnread,
    setChatUnread,
  ] =
    useState(
      0,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState<
      Error
      | null
    >(
      null,
    );


  const loadNotifications =
    useCallback(
      async (
        mode:
          "initial"
          | "refresh" =
          "initial",
      ) => {

        if (!studioId) {

          setCenter(
            EMPTY_CENTER,
          );

          setBadge(
            EMPTY_BADGE,
          );

          setChatUnread(
            0,
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

          return;

        }


        if (
          mode ===
          "initial"
        ) {

          setLoading(
            true,
          );

        } else {

          setRefreshing(
            true,
          );

        }


        setError(
          null,
        );


        try {

          const [
            nextCenter,
            nextBadge,
            nextChatUnread,
          ] =
            await Promise.all(
              [

                getNotificationCenter(
                  studioId,
                  profileId,
                  null,
                  50,
                ),

                profileId
                  ? getNotificationBadgeCount(
                      studioId,
                      profileId,
                    )
                  : Promise.resolve(EMPTY_BADGE),

                getTotalChatUnreadCount(),

              ],
            );


          setCenter(
            nextCenter,
          );

          setBadge(
            nextBadge,
          );

          setChatUnread(
            nextChatUnread,
          );

        } catch (
          loadError
        ) {

          const nextError =
            loadError instanceof Error
              ? loadError
              : new Error(
                  "Failed to load notifications.",
                );


          console.error(
            "NOTIFICATION CONTEXT LOAD ERROR:",
            nextError,
          );


          setError(
            nextError,
          );

        } finally {

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

        }

      },
      [
        studioId,
        profileId,
      ],
    );


  useEffect(
    () => {

      void loadNotifications(
        "initial",
      );

    },
    [
      loadNotifications,
    ],
  );



  useEffect(
    () => {

      if (
        !studioId
      ) {

        return;

      }


      const channel =
        supabase
          .channel(
            `notifications-${studioId}-${profileId ?? "anonymous"}`,
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table:
                "notifications",
              filter:
                `studio_id=eq.${studioId}`,
            },
            (
              payload,
            ) => {

              const notification =
                payload.new as {
                  recipient_profile_id:
                    string
                    | null;

                  recipient_client_id:
                    string
                    | null;
                };


              if (
                profileId &&
                notification.recipient_profile_id &&
                notification.recipient_profile_id !==
                  profileId
              ) {

                return;

              }


              void loadNotifications(
                "refresh",
              );

            },
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table:
                "notifications",
              filter:
                `studio_id=eq.${studioId}`,
            },
            (
              payload,
            ) => {

              const notification =
                payload.new as {
                  recipient_profile_id:
                    string
                    | null;

                  recipient_client_id:
                    string
                    | null;
                };


              if (
                profileId &&
                notification.recipient_profile_id &&
                notification.recipient_profile_id !==
                  profileId
              ) {

                return;

              }


              void loadNotifications(
                "refresh",
              );

            },
          )
          .subscribe();


      return () => {

        void supabase.removeChannel(
          channel,
        );

      };

    },
    [
      studioId,
      profileId,
      loadNotifications,
    ],
  );


  const reload =
    useCallback(
      async () => {

        await loadNotifications(
          "refresh",
        );

      },
      [
        loadNotifications,
      ],
    );


  const markAsRead =
    useCallback(
      async (
        notificationId: string,
      ) => {

        const target =
          center.items.find(
            (
              item,
            ) =>
              item.id ===
              notificationId,
          );


        if (
          !target ||
          target.read_at
        ) {

          return;

        }


        const updatedCount =
          await markNotificationRead(
            notificationId,
          );


        if (
          updatedCount <=
          0
        ) {

          await loadNotifications(
            "refresh",
          );

          return;

        }


        const now =
          new Date()
            .toISOString();


        setCenter(
          (
            current,
          ) => ({

            ...current,

            count:
              Math.max(
                0,
                current.count - 1,
              ),

            items:
              current.items.filter(
                (
                  item,
                ) =>
                  item.id !==
                  notificationId,
              ),

          }),
        );


        setBadge(
          (
            current,
          ) => ({

            ...current,

            total:
              Math.max(
                0,
                current.total - 1,
              ),

            unread:
              Math.max(
                0,
                current.unread - 1,
              ),

          }),
        );

      },
      [
        center.items,
        loadNotifications,
      ],
    );


  const markChatAsRead =
    useCallback(
      () => {

        setChatUnread(
          (current) =>
            Math.max(
              0,
              current - 1,
            ),
        );

      },
      [],
    );


  const markAllAsRead =
    useCallback(
      async () => {

        const unreadIds =
          center.items
            .filter(
              (
                item,
              ) =>
                !item.read_at,
            )
            .map(
              (
                item,
              ) =>
                item.id,
            );


        if (
          unreadIds.length ===
          0
        ) {

          return;

        }


        const updatedCount =
          await markAllNotificationsRead(
            unreadIds,
          );


        if (
          updatedCount <=
          0
        ) {

          await loadNotifications(
            "refresh",
          );

          return;

        }


        const now =
          new Date()
            .toISOString();


        setCenter(
          (
            current,
          ) => ({

            ...current,

            count:
              Math.max(
                0,
                current.count - updatedCount,
              ),

            items:
              current.items.filter(
                (
                  item,
                ) =>
                  !unreadIds.includes(
                    item.id,
                  ),
              ),

          }),
        );


        setBadge(
          (
            current,
          ) => ({

            ...current,

            total:
              Math.max(
                0,
                current.total - updatedCount,
              ),

            unread:
              Math.max(
                0,
                current.unread - updatedCount,
              ),

          }),
        );

      },
      [
        center.items,
        loadNotifications,
      ],
    );


  const value =
    useMemo<
      NotificationContextValue
    >(
      () => ({

        center,

        badge,

        chatUnread,

        loading,

        refreshing,

        error,

        reload,

        markAsRead,

        markAllAsRead,

        markChatAsRead,

      }),
      [
        center,
        badge,
        chatUnread,
        loading,
        refreshing,
        error,
        reload,
        markAsRead,
        markAllAsRead,
        markChatAsRead,
      ],
    );


  return (

    <NotificationContext.Provider
      value={value}
    >

      {children}

    </NotificationContext.Provider>

  );

}


export function useNotificationContext() {

  const context =
    useContext(
      NotificationContext,
    );


  if (!context) {

    throw new Error(
      "useNotificationContext must be used inside NotificationProvider.",
    );

  }


  return context;

}
