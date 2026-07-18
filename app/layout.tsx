import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "sonner";

import QueryProvider from "@/providers/QueryProvider";
import { BootstrapProvider } from "@/context/BootstrapContext";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "PhotoOS",
  description: "PhotoOS",
};

export default function RootLayout({
  children,
}: Props) {
  return (
    <html lang="en">
      <body>

        <QueryProvider>

          <BootstrapProvider>

            {children}

            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={2000}
              expand={false}
              visibleToasts={5}
            />

          </BootstrapProvider>

        </QueryProvider>

      </body>
    </html>
  );
}