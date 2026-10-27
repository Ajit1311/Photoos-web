"use client";

import { useEffect, useState } from "react";

import {
  CheckCheck,
  Loader2,
  MessageCircle,
  RotateCcw,
  X,
} from "lucide-react";

import {
  useNotificationContext,
} from "@/context/NotificationContext";

import {
  getChatUnreadNotifications,
  type ChatUnreadNotification,
} from "@/lib/api/chat/get-chat-unread-notifications";

import {
  markChatMessageRead,
} from "@/lib/api/chat";


type NotificationPanelProps = {

  open:
    boolean;

  onClose:
    () => void;

};


export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {

  const {
    center,
    badge,
    loading,
    refreshing,
    error,
    reload,
    markAsRead,
    markAllAsRead,
  } =
    useNotificationContext();


  const [chatNotifications, setChatNotifications] =
    useState<ChatUnreadNotification[]>([]);

  const [chatLoading, setChatLoading] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    setChatLoading(true);

    void (
      async () => {
        try {
          const notifications =
            await getChatUnreadNotifications(200);

          if (!cancelled) {
            setChatNotifications(
              notifications,
            );
          }
        } catch (error) {
          console.error(
            "CHAT NOTIFICATION LOAD ERROR:",
            error,
          );
        } finally {
          if (!cancelled) {
            setChatLoading(false);
          }
        }
      }
    )();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const totalUnread =
    badge.unread +
    chatNotifications.length;

  const notificationItems =
    Array.isArray(center?.items)
      ? center.items
      : [];

  const totalItems =
    notificationItems.length +
    chatNotifications.length;

  const handleMarkAllRead =
    async () => {

      try {
        await markAllAsRead();

        await Promise.all(
          chatNotifications.map(
            (notification) =>
              markChatMessageRead(
                notification.message_id,
              ),
          ),
        );

        setChatNotifications([]);
      } catch (error) {
        console.error(
          "NOTIFICATION MARK ALL ERROR:",
          error,
        );
      }
    };

  const handleChatNotificationClick =
    async (
      notification: ChatUnreadNotification,
    ) => {

      try {
        await markChatMessageRead(
          notification.message_id,
        );

        setChatNotifications(
          (current) =>
            current.filter(
              (item) =>
                item.message_id !==
                notification.message_id,
            ),
        );

        onClose();

        window.location.href =
          `/dashboard/chat?open=${encodeURIComponent(
            notification.conversation_id,
          )}`;
      } catch (error) {
        console.error(
          "CHAT NOTIFICATION CLICK ERROR:",
          error,
        );
      }
    };

  const unifiedItems = [
    ...chatNotifications.map(
      (notification) => ({
        kind: "chat" as const,
        created_at:
          notification.created_at,
        data: notification,
      }),
    ),

    ...notificationItems.map(
      (notification) => ({
        kind: "notification" as const,
        created_at:
          notification.created_at,
        data: notification,
      }),
    ),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime(),
  );

  if (
    !open
  ) {

    return null;

  }


  return (

    <div className="absolute right-0 top-full z-50 mt-3 w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

        <div>

          <div className="flex items-center gap-2">

            <h3 className="text-sm font-bold text-slate-900">

              Notifications

            </h3>


            {totalUnread > 0 && (

              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">

                {totalUnread > 99
                  ? "99+"
                  : totalUnread}

                {" unread"}

              </span>

            )}

          </div>


          <p className="mt-1 text-xs text-slate-400">

            {totalItems > 0
              ? `${totalItems} notification${totalItems === 1 ? "" : "s"}`
              : "You're all caught up"}

          </p>

        </div>


        <div className="flex items-center gap-2">

          {totalUnread > 0 && (

            <button
              type="button"
              onClick={() => {
                void handleMarkAllRead();
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] font-bold text-blue-600 transition hover:bg-blue-50"
            >

              <CheckCheck
                size={14}
              />

              Mark all read

            </button>

          )}

          <button
            type="button"
            onClick={() => {

              void reload();

            }}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
            title="Refresh notifications"
          >

            {refreshing
              ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )
              : (
                  <RotateCcw
                    size={15}
                  />
                )}

          </button>


          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >

            <X
              size={17}
            />

          </button>

        </div>

      </div>


      <div className="max-h-[480px] overflow-y-auto">

        {(loading || chatLoading) && (

          <div className="flex items-center justify-center py-16">

            <Loader2
              size={22}
              className="animate-spin text-slate-400"
            />

          </div>

        )}


        {!loading &&
          error && (

            <div className="px-5 py-12 text-center">

              <p className="text-sm font-medium text-red-600">

                Failed to load notifications

              </p>


              <button
                type="button"
                onClick={() => {

                  void reload();

                }}
                className="mt-3 text-xs font-bold text-slate-700 underline underline-offset-4"
              >

                Try again

              </button>

            </div>

          )}


        {!loading &&
          !chatLoading &&
          !error &&
          totalItems === 0 && (

            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                <CheckCheck
                  size={21}
                  className="text-slate-400"
                />

              </div>


              <p className="mt-4 text-sm font-bold text-slate-700">

                No notifications

              </p>


              <p className="mt-1 text-xs text-slate-400">

                New activity will appear here.

              </p>

            </div>

          )}


        {!loading &&
          !chatLoading &&
          !error &&
          unifiedItems.map(
            (item) => {

              if (item.kind === "chat") {

                const notification =
                  item.data;

                return (

                  <button
                    key={`chat-${notification.message_id}`}
                    type="button"
                    onClick={() => {
                      void handleChatNotificationClick(
                        notification,
                      );
                    }}
                    className="flex w-full gap-3 border-b border-slate-100 bg-blue-50/30 px-5 py-4 text-left transition hover:bg-blue-50"
                  >

                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100">

                      <MessageCircle
                        size={16}
                        className="text-blue-600"
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <p className="truncate text-sm font-bold text-slate-800">

                          {notification.title}

                        </p>

                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">

                        {notification.body}

                      </p>

                      <p className="mt-2 text-[10px] font-medium text-slate-400">

                        {new Date(
                          notification.created_at,
                        ).toLocaleString()}

                      </p>

                    </div>

                  </button>

                );
              }

              const notification =
                item.data;

              const isUnread =
                !notification.read_at;

              return (

                <button
                  key={`notification-${notification.id}`}
                  type="button"
                  onClick={() => {
                    void (
                      async () => {
                        try {

                          if (
                            !notification.read_at
                          ) {

                            await markAsRead(
                              notification.id,
                            );

                          }

                          onClose();

                        } catch (
                          error
                        ) {

                          console.error(
                            "NOTIFICATION CLICK ERROR:",
                            error,
                          );

                        }
                      }
                    )();
                  }}
                  className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    isUnread
                      ? "bg-blue-50/30"
                      : "bg-white"
                  }`}
                >

                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      isUnread
                        ? "bg-blue-500"
                        : "bg-transparent"
                    }`}
                  />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <p className="truncate text-sm font-bold text-slate-800">

                        {notification.title}

                      </p>

                      {notification.priority >= 8 && (

                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase text-red-600">

                          High

                        </span>

                      )}

                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">

                      {notification.body}

                    </p>

                    <p className="mt-2 text-[10px] font-medium text-slate-400">

                      {new Date(
                        notification.created_at,
                      ).toLocaleString()}

                    </p>

                  </div>

                </button>

              );

            },
          )}

      </div>

    </div>

  );

}
