import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { AppDataProvider } from "@/providers/app-data-provider";

// Inter font: downloaded at build time and served by our own app
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hisaably – Every expense. Sorted.",
  description: "Split group expenses fairly and know who owes whom.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen">
        {/* Gives every page access to the saved data (Milestone 4) */}
        <AppDataProvider>
          {/* Desktop: fixed sidebar on the left.
              Suspense: the sidebar reads the current URL, which pages like
              /groups/[groupId] only know when opened (Milestone 5) */}
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>

          {/* Mobile: small header on top */}
          <MobileHeader />

          {/* Page content. Leaves room for the sidebar (desktop) and bottom bar (mobile) */}
          <main className="pb-24 md:pb-0 md:pl-64">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
              {children}
            </div>
          </main>

          {/* Mobile: navigation bar at the bottom */}
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </AppDataProvider>
      </body>
    </html>
  );
}