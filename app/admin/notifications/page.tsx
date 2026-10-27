"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";
import {
  getPlatformAdminNotificationCount,
  listPlatformAdminNotifications,
  markAllPlatformAdminNotificationsRead,
  markPlatformAdminNotificationRead,
  type PlatformAdminNotification,
} from "@/lib/api/platform-admin-notifications";
import PlatformAdminGuard from "@/components/platform-admin/PlatformAdminGuard";

function priorityClass(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "low":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PlatformAdminNotificationsPage() {
  const [notifications, setNotifications] = useState<
    PlatformAdminNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [items, count] = await Promise.all([
        listPlatformAdminNotifications(unreadOnly),
        getPlatformAdminNotificationCount(),
      ]);

      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(id: string) {
    try {
      await markPlatformAdminNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read."
      );
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      setError(null);

      await markAllPlatformAdminNotificationsRead();

      setNotifications((current) =>
        current.map((notification) =>
          notification.read_at
            ? notification
            : {
                ...notification,
                read_at: new Date().toISOString(),
              }
        )
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <PlatformAdminGuard>
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Bell size={21} />
                </div>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Notifications
                  </h1>
                  <p className="text-sm text-slate-500">
                    Platform Admin notification center
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadNotifications()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll || unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Unread
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {unreadCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Loaded
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                View
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {unreadOnly ? "Unread only" : "All notifications"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  !unreadOnly
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setUnreadOnly(true)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  unreadOnly
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Unread
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Latest notifications
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* List */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-sm text-slate-500">
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Bell size={24} className="text-slate-400" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-800">
                  No notifications
                </h2>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {unreadOnly
                    ? "There are no unread notifications."
                    : "You do not have any platform notifications yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at;

                  return (
                    <div
                      key={notification.id}
                      className={`p-5 transition ${
                        isUnread ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isUnread
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Bell size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`text-sm ${
                                    isUnread
                                      ? "font-semibold text-slate-900"
                                      : "font-medium text-slate-700"
                                  }`}
                                >
                                  {notification.title}
                                </h3>

                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityClass(
                                    notification.priority
                                  )}`}
                                >
                                  {notification.priority}
                                </span>

                                {isUnread && (
                                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white">
                                    Unread
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-400">
                                {notification.notification_type} ·{" "}
                                {formatDate(notification.created_at)}
                              </p>
                            </div>

                            {isUnread && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMarkRead(notification.id)
                                }
                                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                              >
                                <Check size={14} />
                                Mark read
                              </button>
                            )}
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {notification.body}
                          </p>

                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {notification.action_label || "Open"}
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PlatformAdminGuard>
  );
}
