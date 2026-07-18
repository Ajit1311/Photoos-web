"use client";

import { ReactNode } from "react";

import DashboardLayoutComponent from "@/components/layout/DashboardLayout";
import { AlbumSessionProvider } from "@/context/AlbumSessionContext";
import { BootstrapProvider } from "@/context/BootstrapContext";
import { DashboardProvider } from "@/context/DashboardContext";

type LayoutProps = {
  children: ReactNode;
};

// =============================================================================
// Main Layout (जो AlbumSessionProvider आणि DashboardLayout ला रेंडर करतो)
// =============================================================================
export default function Layout({
  children,
}: LayoutProps) {
  return (
    <AlbumSessionProvider>
      <DashboardLayoutComponent>
        {children}
      </DashboardLayoutComponent>
    </AlbumSessionProvider>
  );
}

type Props = {
  children: ReactNode;
};

// =============================================================================
// Dashboard Layout (जो BootstrapProvider आणि DashboardProvider ला रेंडर करतो)
// =============================================================================
export function DashboardLayout({
  children,
}: Props) {
  return (
    <BootstrapProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </BootstrapProvider>
  );
}