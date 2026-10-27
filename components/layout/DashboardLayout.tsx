"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";


type DashboardLayoutProps = {
  children: ReactNode;
};


export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(false);


  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);


  /*
   * Restore desktop sidebar state.
   */
  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        "photoos_studio_sidebar_collapsed",
      );

    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);


  /*
   * Persist desktop sidebar state.
   */
  useEffect(() => {
    window.localStorage.setItem(
      "photoos_studio_sidebar_collapsed",
      String(collapsed),
    );
  }, [collapsed]);


  return (
    <div
      className="
        min-h-screen
        bg-background
        text-foreground
      "
    >

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />


      {/* =====================================================
          MAIN APPLICATION AREA

          Desktop:
            272px sidebar
            76px collapsed sidebar

          Tablet / Mobile:
            no sidebar space
          ===================================================== */}

      <div
        className={[
          "min-h-screen",
          "transition-[margin-left]",
          "duration-200",
          "lg:ml-[272px]",
          collapsed
            ? "lg:ml-[76px]"
            : "lg:ml-[272px]",
        ].join(" ")}
      >

        <Header
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />


        <main
          className="
            min-w-0
            flex-1
            p-3
            sm:p-4
            md:p-5
            lg:p-6
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}
