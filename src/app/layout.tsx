import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";

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
        {/* Desktop: fixed sidebar on the left */}
        <Sidebar />

        {/* Mobile: small header on top */}
        <MobileHeader />

        {/* Page content. Leaves room for the sidebar (desktop) and bottom bar (mobile) */}
        <main className="pb-24 md:pb-0 md:pl-64">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>

        {/* Mobile: navigation bar at the bottom */}
        <MobileNav />
      </body>
    </html>
  );
}