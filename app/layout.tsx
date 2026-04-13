import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportLens — Ticket Intelligence",
  description: "AI-powered support ticket triage and pattern detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
