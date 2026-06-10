import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakistan AI Assistant — Free Civic Help",
  description: "Free AI civic assistant for Pakistani citizens. Laws, rights, NADRA, FBR and more.",
  keywords: "Pakistan, AI, laws, NADRA, FBR, civic rights, Urdu",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#01411C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
