import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import pattern from "@/assets/pattern.png";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { StarknetProvider } from "@/components/StarknetProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starkpay",
  description: "Invoicing app built on starknet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}
         antialiased bg-[#343A40]  relative`}
      >
        <StarknetProvider>
         <GridPattern/>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
