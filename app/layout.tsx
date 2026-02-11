import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from '@vercel/analytics/react';
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Green Claim Check - EU Compliance Tool",
  description: "Validate your marketing claims against EU Green Claims Directive regulations. Prevent greenwashing penalties with our compliance scanner.",
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
