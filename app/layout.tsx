import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakistan AI Assistant — Free Civic Help",
  description:
    "Free AI-powered assistant for Pakistani citizens. Ask about laws, rights, NADRA, FBR, property, labor, and government procedures in English, Urdu, or Roman Urdu.",
  keywords: "Pakistan, AI, laws, rights, NADRA, FBR, civic, Urdu",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#01411C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
