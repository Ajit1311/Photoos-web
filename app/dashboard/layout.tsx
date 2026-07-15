import { ReactNode } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlbumSessionProvider } from "@/context/AlbumSessionContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <AlbumSessionProvider>

      <DashboardLayout>

        {children}

      </DashboardLayout>

    </AlbumSessionProvider>
  );
}