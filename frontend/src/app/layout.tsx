import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NailAI – AI Nail Art Generator",
  description: "Generate stunning nail art designs and try them on virtually with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
