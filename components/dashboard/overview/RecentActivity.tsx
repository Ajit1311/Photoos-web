"use client";

import {
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  Image,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  useNotificationContext,
} from "@/context/NotificationContext";


function getActivityIcon(
  notificationType: string,
) {

  const type =
    notificationType.toLowerCase();


  if (
    type.includes("payment") ||
    type.includes("invoice")
  ) {
    return CreditCard;
  }


  if (
    type.includes("upload") ||
    type.includes("asset") ||
    type.includes("photo")
  ) {
    return Upload;
  }


  if (
    type.includes("gallery") ||
    type.includes("album")
  ) {
    return Image;
  }


  if (
    type.includes("ai") ||
    type.includes("processing")
  ) {
    return Sparkles;
  }


  if (
    type.includes("complete") ||
    type.includes("success") ||
    type.includes("published")
  ) {
    return CheckCircle2;
  }


  return Bell;

}


function getActivityIconClass(
  notificationType: string,
) {

  const type =
    notificationType.toLowerCase();


  if (
    type.includes("payment") ||
    type.includes("invoice")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }


  if (
    type.includes("upload") ||
    type.includes("asset") ||
    type.includes("photo")
  ) {
    return "bg-primary/10 text-primary";
  }


  if (
    type.includes("ai") ||
    type.includes("processing")
  ) {
    return "bg-amber-50 text-amber-700";
  }


  if (
    type.includes("complete") ||
    type.includes("success") ||
    type.includes("published")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }


  return "bg-muted text-muted-foreground";

}


function formatActivityTime(
  createdAt: string,
) {

  const created =
    new Date(createdAt);

  const now =
    new Date();

  const difference =
    Math.max(
      0,
      now.getTime() -
        created.getTime(),
    );

  const minutes =
    Math.floor(
      difference /
        (1000 * 60),
    );


  if (minutes < 1) {
    return "Just now";
  }


  if (minutes < 60) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(
      minutes / 60,
    );


  if (hours < 24) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(
      hours / 24,
    );


  if (days < 7) {
    return `${days}d ago`;
  }


  return created.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  );

}


export default function RecentActivity() {

  const {
    center,
    loading,
    error,
    reload,
  } =
    useNotificationContext();


  const activities =
    center?.items?.slice(
      0,
      5,
    );


  return (

    <div className="rounded-2xl border border-border/80 bg-card shadow-[0_4px_24px_rgba(10,63,97,0.045)]">

      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6 sm:py-5">

        <div>

          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest updates from your studio.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            void reload();
          }}
          className="text-sm font-medium text-primary transition-colors hover:underline"
        >
          Refresh
        </button>

      </div>


      <div className="divide-y divide-border/70">

        {loading && (

          <div className="flex items-center justify-center py-14">

            <Loader2
              size={22}
              className="animate-spin text-slate-400"
            />

          </div>

        )}


        {!loading &&
          error && (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-semibold text-red-600">
                Unable to load recent activity
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
          !error &&
          activities.length === 0 && (

            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                <Clock
                  size={21}
                  className="text-slate-400"
                />

              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                No recent activity
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Studio activity will appear here as work happens.
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          activities.filter((a) => Boolean(a && a.id)).map(
            (activity) => {

              const Icon =
                getActivityIcon(
                  activity.notification_type,
                );

              const iconClass =
                getActivityIconClass(
                  activity.notification_type,
                );


              return (

                <button
                  key={activity.id}
                  type="button"
                  onClick={() => {

                    if (
                      activity.action_url
                    ) {
                      window.location.href =
                        activity.action_url;
                    }

                  }}
                  className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
                >

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
                  >

                    <Icon
                      size={18}
                    />

                  </div>


                  <div className="min-w-0 flex-1">

                    <h3
                      className={`font-semibold ${
                        activity.read_at
                          ? "text-slate-900"
                          : "text-[#0A3F61]"
                      }`}
                    >
                      {activity.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {activity.body}
                    </p>

                  </div>


                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {formatActivityTime(
                      activity.created_at,
                    )}
                  </span>

                </button>

              );

            },
          )}

      </div>

    </div>

  );

}
