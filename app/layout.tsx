import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from '@vercel/analytics/react';
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Green Lens — EU Green Claims Compliance Screening",
  description: "Green Lens helps brands and regulators instantly check marketing claims and sustainability labels for compliance with EU green claims rules.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Green Lens — EU Green Claims Compliance Screening",
    description: "Instant compliance screening for marketing copy and sustainability labels under EU Directive 2024/825.",
    images: ["/og-image.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Lens — EU Green Claims Compliance Screening",
    description: "Instant compliance screening for marketing copy and sustainability labels under EU Directive 2024/825.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <ConditionalHeader />
            {children}
            <Footer />
            <Toaster 
              position="bottom-right"
              richColors
              closeButton
              duration={3000}
            />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
