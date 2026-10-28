import type { Metadata, Viewport } from "next";

import "./globals.css";

import { Toaster } from "sonner";

import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { BootstrapProvider } from "@/context/BootstrapContext";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { ReconsentModal } from "@/components/legal/ReconsentModal";

type Props = {
  children: React.ReactNode;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#090D14" },
  ],
};

export const metadata: Metadata = {
  title: "PhotoOS | Premium Photography Studio OS",
  description: "All-in-one studio management, client galleries, CRM, payments, and AI face discovery platform for professional photographers.",
  icons: {
    icon: "/PhotoOS-favicon.png",
    shortcut: "/PhotoOS-favicon.png",
    apple: "/PhotoOS-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          <QueryProvider>

            <BootstrapProvider>

              {children}

              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={3000}
                expand={false}
                visibleToasts={4}
              />

              <CookieConsentBanner />
              <ReconsentModal />

            </BootstrapProvider>

          </QueryProvider>

        </ThemeProvider>

      </body>
    </html>
  );
}
