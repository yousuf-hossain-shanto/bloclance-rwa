import { Providers } from "@/providers/providers";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "SurgeXRP — Tokenized Real Estate on XRPL",
  description:
    "Buy fractional units of curated real-world properties, earn rental yield, and trade peer-to-peer on the XRPL.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
