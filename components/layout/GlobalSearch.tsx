"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckSquare2,
  ChevronRight,
  CircleDollarSign,
  FolderKanban,
  Images,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";


type GlobalSearchItem = {
  id:
    string;

  title:
    string;

  description:
    string;

  category:
    string;

  href:
    string;

  keywords:
    string[];

  icon:
    LucideIcon;
};


const GLOBAL_SEARCH_ITEMS:
  GlobalSearchItem[] =
  [

    {
      id:
        "dashboard",

      title:
        "Dashboard",

      description:
        "Overview of your studio, activity and workspace.",

      category:
        "Workspace",

      href:
        "/dashboard",

      keywords:
        [
          "home",
          "overview",
          "workspace",
          "analytics",
        ],

      icon:
        LayoutDashboard,
    },


    {
      id:
        "clients",

      title:
        "Clients",

      description:
        "Manage clients and client information.",

      category:
        "Workspace",

      href:
        "/dashboard/clients",

      keywords:
        [
          "customer",
          "customers",
          "people",
          "client management",
        ],

      icon:
        Users,
    },


    {
      id:
        "projects",

      title:
        "Projects",

      description:
        "Manage photography projects and project workflows.",

      category:
        "Workspace",

      href:
        "/dashboard/projects",

      keywords:
        [
          "project",
          "job",
          "jobs",
          "work",
        ],

      icon:
        FolderKanban,
    },


    {
      id:
        "events",

      title:
        "Events",

      description:
        "Manage photography events and event workspaces.",

      category:
        "Workspace",

      href:
        "/dashboard/events",

      keywords:
        [
          "event",
          "wedding",
          "shoot",
          "shooting",
        ],

      icon:
        CalendarDays,
    },


    {
      id:
        "albums",

      title:
        "Albums",

      description:
        "Manage albums and photo collections.",

      category:
        "Media",

      href:
        "/dashboard/albums",

      keywords:
        [
          "album",
          "gallery",
          "photos",
          "collection",
        ],

      icon:
        Images,
    },


    {
      id:
        "assets",

      title:
        "Assets",

      description:
        "Manage uploaded photos, media and assets.",

      category:
        "Media",

      href:
        "/dashboard/assets",

      keywords:
        [
          "media",
          "photo",
          "photos",
          "files",
          "images",
          "upload",
        ],

      icon:
        Camera,
    },


    {
      id:
        "team",

      title:
        "Team",

      description:
        "Manage team members, roles and workspace access.",

      category:
        "Workspace",

      href:
        "/dashboard/team",

      keywords:
        [
          "members",
          "employees",
          "staff",
          "roles",
          "permissions",
        ],

      icon:
        BriefcaseBusiness,
    },


    {
      id:
        "chat",

      title:
        "Chat",

      description:
        "Open studio conversations and team communication.",

      category:
        "Communication",

      href:
        "/dashboard/chat",

      keywords:
        [
          "messages",
          "message",
          "conversation",
          "communication",
        ],

      icon:
        MessageCircle,
    },


    {
      id:
        "notifications",

      title:
        "Notifications",

      description:
        "Review workspace and system notifications.",

      category:
        "Communication",

      href:
        "/dashboard",

      keywords:
        [
          "alerts",
          "notification",
          "updates",
        ],

      icon:
        Bell,
    },


    {
      id:
        "payments",

      title:
        "Payments",

      description:
        "Manage payments and financial activity.",

      category:
        "Business",

      href:
        "/dashboard/payments",

      keywords:
        [
          "payment",
          "money",
          "invoice",
          "transaction",
          "finance",
        ],

      icon:
        CircleDollarSign,
    },


    {
      id:
        "packages",

      title:
        "Packages",

      description:
        "Manage photography packages and offerings.",

      category:
        "Business",

      href:
        "/dashboard/packages",

      keywords:
        [
          "package",
          "pricing",
          "service",
          "offer",
        ],

      icon:
        BriefcaseBusiness,
    },


    {
      id:
        "plans",

      title:
        "Plans & Subscription",

      description:
        "Manage your PhotoOS plan and subscription access.",

      category:
        "Business",

      href:
        "/dashboard/plans",

      keywords:
        [
          "subscription",
          "plan",
          "billing",
          "upgrade",
        ],

      icon:
        Sparkles,
    },


    {
      id:
        "marketing",

      title:
        "Marketing",

      description:
        "Manage marketing tools and campaigns.",

      category:
        "Business",

      href:
        "/dashboard/marketing",

      keywords:
        [
          "campaign",
          "promotion",
          "advertising",
          "marketing",
        ],

      icon:
        Megaphone,
    },


    {
      id:
        "marketplace-leads",

      title:
        "Marketplace Leads",

      description:
        "Review photography marketplace leads.",

      category:
        "Business",

      href:
        "/dashboard/marketplace/leads",

      keywords:
        [
          "lead",
          "leads",
          "marketplace",
          "enquiry",
          "inquiry",
        ],

      icon:
        Users,
    },


    {
      id:
        "ai",

      title:
        "AI Processing",

      description:
        "Access AI processing and intelligent photo workflows.",

      category:
        "AI",

      href:
        "/dashboard/ai",

      keywords:
        [
          "ai",
          "artificial intelligence",
          "processing",
          "automation",
        ],

      icon:
        Bot,
    },


    {
      id:
        "settings",

      title:
        "Settings",

      description:
        "Manage PhotoOS workspace and software settings.",

      category:
        "Settings",

      href:
        "/dashboard/settings",

      keywords:
        [
          "preferences",
          "configuration",
          "workspace settings",
        ],

      icon:
        Settings,
    },


    {
      id:
        "software-update",

      title:
        "Software Update",

      description:
        "View the current PhotoOS version and release notes.",

      category:
        "Settings",

      href:
        "/dashboard/settings#software-update",

      keywords:
        [
          "version",
          "release",
          "release notes",
          "whats new",
          "what's new",
          "schema",
          "update",
        ],

      icon:
        Sparkles,
    },


    {
      id:
        "watermark",

      title:
        "Watermark Settings",

      description:
        "Configure watermark source, logo, opacity, size and position.",

      category:
        "Settings",

      href:
        "/dashboard/settings#watermark-settings",

      keywords:
        [
          "watermark",
          "logo",
          "opacity",
          "position",
          "corner",
          "image",
          "branding",
          "download watermark",
          "export watermark",
        ],

      icon:
        Camera,
    },


    {
      id:
        "workspace-controls",

      title:
        "Live Workspace Controls",

      description:
        "Control workspace features and PhotoOS behavior.",

      category:
        "Settings",

      href:
        "/dashboard/settings#workspace-controls",

      keywords:
        [
          "toggle",
          "controls",
          "workspace",
          "preferences",
          "enable",
          "disable",
          "settings",
        ],

      icon:
        CheckSquare2,
    },


    {
      id:
        "security-settings",

      title:
        "Security Settings",

      description:
        "Manage workspace protection and security controls.",

      category:
        "Settings",

      href:
        "/dashboard/settings#workspace-controls",

      keywords:
        [
          "security",
          "privacy",
          "permissions",
          "protection",
          "access",
        ],

      icon:
        ShieldCheck,
    },

  ];


function normalizeSearchText(
  value:
    string,
) {

  return value
    .toLowerCase()
    .trim();

}


function getSearchScore(
  item:
    GlobalSearchItem,

  query:
    string,
) {

  const normalizedQuery =
    normalizeSearchText(
      query,
    );


  if (
    normalizedQuery.length ===
    0
  ) {

    return 0;

  }


  const title =
    normalizeSearchText(
      item.title,
    );


  const description =
    normalizeSearchText(
      item.description,
    );


  const category =
    normalizeSearchText(
      item.category,
    );


  const keywords =
    item.keywords.map(
      normalizeSearchText,
    );


  if (
    title ===
    normalizedQuery
  ) {

    return 100;

  }


  if (
    title.startsWith(
      normalizedQuery,
    )
  ) {

    return 80;

  }


  if (
    title.includes(
      normalizedQuery,
    )
  ) {

    return 70;

  }


  if (
    keywords.some(
      (
        keyword,
      ) =>
        keyword ===
        normalizedQuery,
    )
  ) {

    return 65;

  }


  if (
    keywords.some(
      (
        keyword,
      ) =>
        keyword.includes(
          normalizedQuery,
        ),
    )
  ) {

    return 55;

  }


  if (
    description.includes(
      normalizedQuery,
    )
  ) {

    return 40;

  }


  if (
    category.includes(
      normalizedQuery,
    )
  ) {

    return 30;

  }


  return -1;

}


export default function GlobalSearch() {

  const router =
    useRouter();


  const inputRef =
    useRef<
      HTMLInputElement
    >(
      null,
    );


  const containerRef =
    useRef<
      HTMLDivElement
    >(
      null,
    );


  const [
    query,
    setQuery,
  ] =
    useState(
      "",
    );


  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );


  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(
      0,
    );


  const results =
    useMemo(
      () => {

        const normalizedQuery =
          normalizeSearchText(
            query,
          );


        if (
          normalizedQuery.length ===
          0
        ) {

          return [];

        }


        return GLOBAL_SEARCH_ITEMS
          .map(
            (
              item,
            ) => ({
              item,
              score:
                getSearchScore(
                  item,
                  normalizedQuery,
                ),
            }),
          )
          .filter(
            (
              result,
            ) =>
              result.score >=
              0,
          )
          .sort(
            (
              a,
              b,
            ) =>
              b.score -
              a.score,
          )
          .slice(
            0,
            8,
          )
          .map(
            (
              result,
            ) =>
              result.item,
          );

      },
      [
        query,
      ],
    );


  useEffect(
    () => {

      setActiveIndex(
        0,
      );

    },
    [
      results,
    ],
  );


  useEffect(
    () => {

      function handleKeyboardShortcut(
        event:
          KeyboardEvent,
      ) {

        if (
          (
            event.metaKey ||
            event.ctrlKey
          ) &&
          event.key.toLowerCase() ===
            "k"
        ) {

          event.preventDefault();

          setOpen(
            true,
          );


          window.setTimeout(
            () => {

              inputRef.current?.focus();

            },
            0,
          );

        }

      }


      function handleOutsideClick(
        event:
          MouseEvent,
      ) {

        if (
          !containerRef.current
        ) {

          return;

        }


        if (
          !containerRef.current.contains(
            event.target as Node,
          )
        ) {

          setOpen(
            false,
          );

        }

      }


      window.addEventListener(
        "keydown",
        handleKeyboardShortcut,
      );


      window.addEventListener(
        "mousedown",
        handleOutsideClick,
      );


      return () => {

        window.removeEventListener(
          "keydown",
          handleKeyboardShortcut,
        );


        window.removeEventListener(
          "mousedown",
          handleOutsideClick,
        );

      };

    },
    [],
  );


  function handleNavigate(
    item:
      GlobalSearchItem,
  ) {

    setOpen(
      false,
    );


    setQuery(
      "",
    );


    router.push(
      item.href,
    );

  }


  function handleKeyDown(
    event:
      React.KeyboardEvent<
        HTMLInputElement
      >,
  ) {

    if (
      event.key ===
      "ArrowDown"
    ) {

      event.preventDefault();


      setActiveIndex(
        (
          current,
        ) =>
          Math.min(
            current + 1,
            results.length - 1,
          ),
      );

      return;

    }


    if (
      event.key ===
      "ArrowUp"
    ) {

      event.preventDefault();


      setActiveIndex(
        (
          current,
        ) =>
          Math.max(
            current - 1,
            0,
          ),
      );

      return;

    }


    if (
      event.key ===
      "Escape"
    ) {

      setOpen(
        false,
      );


      inputRef.current?.blur();

      return;

    }


    if (
      event.key ===
      "Enter"
    ) {

      const selectedResult =
        results[
          activeIndex
        ];


      if (
        selectedResult
      ) {

        event.preventDefault();

        handleNavigate(
          selectedResult,
        );

      }

    }

  }


  return (
    <div
      ref={containerRef}
      className="relative"
    >

      <div className="relative">

        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />


        <input
          ref={inputRef}
          value={query}
          onChange={
            (
              event,
            ) => {

              setQuery(
                event.target.value,
              );


              setOpen(
                true,
              );

            }
          }
          onFocus={() => {

            setOpen(
              true,
            );

          }}
          onKeyDown={
            handleKeyDown
          }
          placeholder="Search PhotoOS..."
          className="h-11 w-[300px] rounded-2xl border border-slate-200 bg-white py-2 pl-11 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61]/40 focus:ring-4 focus:ring-[#0A3F61]/5"
        />


        {
          query.length >
          0
            ? (
              <button
                type="button"
                onClick={() => {

                  setQuery(
                    "",
                  );


                  inputRef.current?.focus();

                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >

                <X
                  size={16}
                />

              </button>
            )
            : (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">

                ⌘ K

              </div>
            )
        }

      </div>


      {
        open &&
        query.trim().length >
          0
          ? (
            <div className="absolute right-0 top-full z-[100] mt-3 w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.14)]">

              {
                results.length >
                0
                  ? (
                    <div className="max-h-[480px] overflow-y-auto p-2">

                      {
                        results.map(
                          (
                            item,
                            index,
                          ) => {

                            const Icon =
                              item.icon;


                            return (
                              <button
                                key={item.id}
                                type="button"
                                onMouseEnter={() => {

                                  setActiveIndex(
                                    index,
                                  );

                                }}
                                onClick={() => {

                                  handleNavigate(
                                    item,
                                  );

                                }}
                                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition ${
                                  activeIndex ===
                                  index
                                    ? "bg-[#0A3F61]/5"
                                    : "hover:bg-slate-50"
                                }`}
                              >

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A3F61]">

                                  <Icon
                                    size={18}
                                  />

                                </div>


                                <div className="min-w-0 flex-1">

                                  <div className="flex items-center gap-2">

                                    <p className="truncate text-sm font-bold text-slate-900">

                                      {
                                        item.title
                                      }

                                    </p>


                                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">

                                      {
                                        item.category
                                      }

                                    </span>

                                  </div>


                                  <p className="mt-1 truncate text-xs text-slate-500">

                                    {
                                      item.description
                                    }

                                  </p>

                                </div>


                                <ChevronRight
                                  size={17}
                                  className="shrink-0 text-slate-300"
                                />

                              </button>
                            );

                          },
                        )
                      }

                    </div>
                  )
                  : (
                    <div className="px-6 py-10 text-center">

                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                        <Search
                          size={20}
                        />

                      </div>


                      <p className="mt-4 text-sm font-semibold text-slate-700">

                        No matching sections found

                      </p>


                      <p className="mt-1 text-xs text-slate-400">

                        Try searching for clients, payments, watermark, AI or settings.

                      </p>

                    </div>
                  )
              }


              {
                results.length >
                0
                  ? (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] font-medium text-slate-400">

                      <span>

                        ↑ ↓ Navigate

                      </span>


                      <span>

                        Enter to open

                      </span>


                      <span>

                        Esc to close

                      </span>

                    </div>
                  )
                  : null
              }

            </div>
          )
          : null
      }

    </div>
  );

}
