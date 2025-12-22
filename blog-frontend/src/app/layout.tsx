import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Navbar } from "@/components/layout";
import { SkipLink } from "@/components/ui/Accessibility";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Premium Blog Platform",
  description: "AI-Powered Knowledge Blogging Platform. Share ideas that matter.",
  keywords: ["blog", "writing", "knowledge", "AI", "premium", "articles"],
  authors: [{ name: "Premium Blog" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blog.example.com"),
  openGraph: {
    title: "Premium Blog Platform",
    description: "Share ideas that matter",
    type: "website",
    locale: "en_US",
    siteName: "Premium Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Blog Platform",
    description: "Share ideas that matter",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SkipLink />
        <Providers>
          <Navbar />
          <main id="main-content" className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
