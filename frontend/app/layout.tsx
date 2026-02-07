import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import Link from "next/link";
import Navbar from "./components/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "StygianMaxxer",
  description: "Unofficial Stygian Onslaught db",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.variable} antialiased`}>
        <Navbar />
        <main className="pt-28 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
