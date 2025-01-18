import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GridPattern from "@/components/ui/grid-pattern";
import { StarknetProvider } from "@/components/StarknetProvider";
import WalletStatusBar from "@/components/WalletStatusBar";

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
          <WalletStatusBar />
        </StarknetProvider>
      </body>
    </html>
  );
}
