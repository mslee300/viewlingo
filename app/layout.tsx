import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViewLingo",
  description: "ViewLingo is the best way to learn languages using smart glasses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: '#F0F0F04F',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
