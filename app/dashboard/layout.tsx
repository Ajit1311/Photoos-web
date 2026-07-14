import { ReactNode } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlbumSessionProvider } from "@/context/AlbumSessionContext";
import { BootstrapProvider } from "@/context/BootstrapContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <BootstrapProvider>

      <AlbumSessionProvider>

        <DashboardLayout>

          {children}

        </DashboardLayout>

      </AlbumSessionProvider>

    </BootstrapProvider>
  );
}