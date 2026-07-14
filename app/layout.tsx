import type {
  Metadata,
} from "next";

import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";
import {
  BootstrapProvider,
} from "@/context/BootstrapContext";

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

          </BootstrapProvider>

        </QueryProvider>

      </body>
    </html>
  );

}