"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

import {
  sidebar,
} from "@/constants/sidebar";

import {
  APP_VERSION,
} from "@/constants/app";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  usePlanAccess,
} from "@/hooks/usePlanAccess";

import type {
  PlanFeatureKey,
} from "@/lib/subscription/plan-access";


type AdminState =
  | "loading"
  | "admin"
  | "standard";


type SidebarProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};


export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {

  const {
    loading:
      planLoading,
    canAccess,
  } =
    usePlanAccess();


  const [
    adminState,
    setAdminState,
  ] =
    useState<AdminState>(
      "loading",
    );


  /*
   * Resolve platform-admin access.
   *
   * Existing logic preserved.
   */
  useEffect(
    () => {

      let cancelled =
        false;


      async function resolvePlatformAdmin() {

        try {

          const membership =
            await resolveUserStudio();


          if (
            !membership
          ) {

            if (
              !cancelled
            ) {

              setAdminState(
                "standard",
              );

            }

            return;

          }


          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );


          if (
            !cancelled
          ) {

            setAdminState(
              compliance.is_photoos_admin
                ? "admin"
                : "standard",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "SIDEBAR PLATFORM ADMIN CHECK ERROR:",
            error,
          );


          if (
            !cancelled
          ) {

            setAdminState(
              "standard",
            );

          }

        }

      }


      resolvePlatformAdmin();


      return () => {

        cancelled =
          true;

      };

    },
    [],
  );


  return (
    <>
      {/* =========================================================
          MOBILE OVERLAY
          ========================================================= */}

      {
        mobileOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="
              fixed
              inset-0
              z-40
              bg-slate-950/45
              lg:hidden
            "
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
          />
        ) : null
      }


      {/* =========================================================
          SIDEBAR
          ========================================================= */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-slate-200",
          "bg-[#071C2B] text-white",
          "transition-all duration-200",
          collapsed
            ? "w-[76px]"
            : "w-[272px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >

        {/* =======================================================
            LOGO HEADER
            ======================================================= */}

        <div
          className="
            relative
            flex
            h-[96px]
            shrink-0
            items-center
            border-b
            border-white/10
            px-4
          "
        >

          <Link
            href="/dashboard"
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-3
            "
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
            title={
              collapsed
                ? "PhotoOS Dashboard"
                : undefined
            }
          >

            {/* PhotoOS Logo Mark */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#4F4FF7]
                shadow-lg
              "
            >

              <span
                className="
                  text-lg
                  font-black
                  text-white
                "
              >
                P
              </span>

            </div>


            {/* PhotoOS Text */}

            {
              !collapsed ? (
                <div
                  className="
                    min-w-0
                  "
                >

                  <div
                    className="
                      truncate
                      text-sm
                      font-bold
                      tracking-wide
                    "
                  >
                    PhotoOS
                  </div>

                  <div
                    className="
                      truncate
                      text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-slate-400
                    "
                  >
                    Studio
                  </div>

                </div>
              ) : null
            }

          </Link>


          {/* Desktop collapse */}

          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (value) =>
                  !value,
              )
            }
            className="
              absolute
              bottom-2
              right-2
              z-30
              hidden
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              bg-[#0A2A3D]
              text-slate-400
              shadow-md
              transition
              hover:bg-white/10
              hover:text-white
              lg:flex
            "
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >

            {
              collapsed ? (
                <PanelLeftOpen
                  className="
                    h-4
                    w-4
                  "
                />
              ) : (
                <PanelLeftClose
                  className="
                    h-4
                    w-4
                  "
                />
              )
            }

          </button>


          {/* Mobile close */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
            className="
              rounded-lg
              p-2
              text-slate-400
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            aria-label="Close sidebar"
          >

            <X
              className="
                h-4
                w-4
              "
            />

          </button>

        </div>


        {/* =======================================================
            NAVIGATION
            ======================================================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-3
            py-4
          "
        >

          {
            sidebar
              .filter(
                (
                  group,
                ) =>
                  !group.requiresPlatformAdmin ||
                  adminState ===
                    "admin",
              )
              .map(
                (
                  group,
                ) => {

                  const visibleItems =
                    group.items.filter(
                      (
                        item,
                      ) => {

                        const hasAdminAccess =
                          !item.requiresPlatformAdmin ||
                          adminState ===
                            "admin";


                        if (
                          !hasAdminAccess
                        ) {

                          return false;

                        }


                        if (
                          planLoading
                        ) {

                          return true;

                        }


                        if (
                          !item.requiredFeature
                        ) {

                          return true;

                        }


                        return canAccess(
                          item.requiredFeature as PlanFeatureKey,
                        );

                      },
                    );


                  if (
                    visibleItems.length ===
                    0
                  ) {

                    return null;

                  }


                  return (
                    <div
                      key={
                        group.group
                      }
                      className="
                        mb-2
                      "
                    >

                      {
                        !collapsed ? (
                          <SidebarGroup
                            title={
                              group.group
                            }
                          >

                            {
                              visibleItems.map(
                                (
                                  item,
                                ) => (
                                  <div
                                    key={
                                      item.href
                                    }
                                    onClick={() =>
                                      setMobileOpen(
                                        false,
                                      )
                                    }
                                  >

                                    <SidebarItem
                                      href={
                                        item.href
                                      }
                                      title={
                                        item.title
                                      }
                                      icon={
                                        item.icon
                                      }
                                    />

                                  </div>
                                ),
                              )
                            }

                          </SidebarGroup>
                        ) : (
                          /*
                           * Collapsed mode.
                           *
                           * SidebarItem itself contains the
                           * navigation styling, therefore we
                           * keep the same navigation source
                           * but render icon-only links here.
                           */
                          <div
                            className="
                              space-y-1
                            "
                          >

                            {
                              visibleItems.map(
                                (
                                  item,
                                ) => {

                                  const Icon =
                                    item.icon;


                                  return (
                                    <Link
                                      key={
                                        item.href
                                      }
                                      href={
                                        item.href
                                      }
                                      title={
                                        item.title
                                      }
                                      aria-label={
                                        item.title
                                      }
                                      onClick={() =>
                                        setMobileOpen(
                                          false,
                                        )
                                      }
                                      className="
                                        group
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-slate-300
                                        transition
                                        hover:bg-white/10
                                        hover:text-white
                                      "
                                    >

                                      <Icon
                                        className="
                                          h-[17px]
                                          w-[17px]
                                          shrink-0
                                          text-slate-400
                                          group-hover:text-white
                                        "
                                      />

                                    </Link>
                                  );

                                },
                              )
                            }

                          </div>
                        )
                      }

                    </div>
                  );

                },
              )
          }

        </div>


        {/* =======================================================
            FOOTER
            ======================================================= */}

        <div
          className="
            border-t
            border-white/10
            p-3
          "
        >

          {
            !collapsed ? (
              <div
                className="
                  rounded-xl
                  bg-white/5
                  px-3
                  py-2
                "
              >

                <div
                  className="
                    text-center
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Version
                </div>

                <div
                  className="
                    mt-1
                    text-center
                    text-xs
                    text-slate-300
                  "
                >
                  PhotoOS {APP_VERSION}
                </div>

              </div>
            ) : (
              <div
                className="
                  flex
                  justify-center
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
                title={`PhotoOS ${APP_VERSION}`}
              >
                v
              </div>
            )
          }

        </div>

      </aside>
    </>
  );
}
