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

export const metadata: Metadata = {
  title: "Omar Shady | Director & Photographer",
  description: "A filmmaker, photographer, and creative storyteller creating visual experiences, documentaries, events, and cultural projects.",
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
