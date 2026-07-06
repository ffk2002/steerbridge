import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "StayFinder — Discover Your Perfect Stay",
  description:
    "Search and book unique apartments worldwide. Explore interactive maps, read reviews, and find your ideal getaway.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>
            <Navbar />
            <main id="main-content">{children}</main>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
