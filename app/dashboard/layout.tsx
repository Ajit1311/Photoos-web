import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}