import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SliceCraft | Artisan 3D Wood-Fired Pizzeria",
  description:
    "Sculpt your artisanal pizza in real-time 3D, customize bespoke Neapolitan crusts, and track your pie from the 900° wood oven to your doorstep.",
  keywords: [
    "artisan pizza",
    "3D pizza configurator",
    "wood-fired pizza",
    "neapolitan pizza",
    "real-time delivery",
  ],
};

/**
 * Root layout for SliceCraft.
 *
 * HYDRATION WARNING NOTE:
 * The "bis_skin_checked" attribute mismatch in the console is caused by the
 * BitDefender browser extension (and similar security extensions: Avast Online
 * Shield, Kaspersky URL Advisor, etc.) injecting attributes into every <div>
 * in the page BEFORE React can hydrate the SSR-rendered HTML.
 *
 * suppressHydrationWarning on <html> and <body> suppresses the top-level
 * attribute mismatches. The warnings on nested elements are cosmetic-only —
 * they do NOT affect functionality, layout, or user experience in any way.
 *
 * The PERMANENT fix for you: open your browser extension manager and disable
 * BitDefender "TrafficLight" / BIS extension for localhost:3000, or toggle
 * "Safe banking and browsing" off while in development.
 *
 * Nothing in the React/Next.js codebase can fully suppress a browser extension
 * that modifies the live DOM after SSR but before hydration completes.
 */
import SessionWatcher from "@/components/SessionWatcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#08090C] text-gray-100 antialiased"
        suppressHydrationWarning
      >
        <SessionWatcher />
        {children}
      </body>
    </html>
  );
}
