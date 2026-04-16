import type { Metadata } from "next";
import { Fredoka, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredokaFont = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Maria + Roly",
  description: "We're getting married!",
  openGraph: {
    title: "Maria + Roly",
    description: "We're getting married!",
    images: [{ url: "/1.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maria + Roly",
    description: "We're getting married!",
    images: ["/1.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${fredokaFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
