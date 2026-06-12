import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://omarshadyy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Omar Shady | Director & Photographer",
    template: "%s | Omar Shady",
  },
  description: "A filmmaker, photographer, and creative director crafting cinematic visual stories — films, photography, and creative projects worldwide.",
  keywords: ["Omar Shady", "filmmaker", "photographer", "director", "cinematography", "creative director", "films", "portfolio"],
  authors: [{ name: "Omar Shady" }],

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Omar Shady",
    title: "Omar Shady | Director & Photographer",
    description: "A filmmaker, photographer, and creative director crafting cinematic visual stories — films, photography, and creative projects worldwide.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Omar Shady | Director & Photographer",
    description: "A filmmaker, photographer, and creative director crafting cinematic visual stories.",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/hero.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SmoothScroll>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </SmoothScroll>
      </body>
    </html>
  );
}
