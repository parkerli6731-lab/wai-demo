import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RFQProvider } from "@/context/RFQContext";
import Header from "@/components/Header";
import RFQDrawer from "@/components/RFQDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WAI Global Headless | High-Speed Automotive Replacement Parts",
  description:
    "Ultra-lightweight edge catalog with instantaneous OE crossover lookup, covering Starters, Alternators, and Window Lift Motors for international distributors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white`}>
        <RFQProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <RFQDrawer />
          <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
            <p>WAI Global Headless Architecture Prototype • Powered by Next.js 15 & Edge Invariants</p>
            <p className="mt-1">Zero-Server Overhead • 10x Faster Automotive Part Intelligence</p>
          </footer>
        </RFQProvider>
      </body>
    </html>
  );
}
