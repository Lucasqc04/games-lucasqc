import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { ThemeScript } from "@/components/layout/theme-script";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.siteName,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/lucasqc-games-logo.png",
    apple: "/lucasqc-games-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.siteName,
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.siteName,
    description: siteConfig.description,
    siteName: siteConfig.siteName,
    images: [{ url: "/lucasqc-games-logo.png", width: 1024, height: 1024 }],
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff7ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
