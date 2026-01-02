import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "منصة المتاجر الرقمية",
  description: "انشئ متجرك الرقمي الخاص بسهولة وبع العربية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        isSatellite={false}
        allowedRedirectOrigins={["https://orchids.page"]}
        dynamic>
      <html lang="ar" dir="rtl" suppressHydrationWarning>
        <body className="antialiased">
          <Script
            id="orchids-browser-logs"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
            strategy="afterInteractive"
            data-orchids-project-id="a1f42bd3-b2b8-4c9c-befa-185ab697bae2"
          />
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "DigitalStore", "version": "1.0.0"}'
          />
          {children}
          <Toaster position="top-center" />
          <VisualEditsMessenger />
        </body>
      </html>
    </ClerkProvider>
  );
}
