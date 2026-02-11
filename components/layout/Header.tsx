"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Leaf, Menu, X } from "lucide-react";

export function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (pathname === "/") {
      // On homepage, scroll to section
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // On other pages, navigate to homepage with hash
      router.push(`/#${sectionId}`);
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToDemo = () => {
    if (pathname === "/") {
      // On homepage, scroll to demo section
      document.getElementById('demo-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // On other pages, navigate to homepage with hash, then scroll after page loads
      router.push('/#demo-section');
      // After navigation, scroll to demo section
      setTimeout(() => {
        const section = document.getElementById('demo-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  const isScrolledStyle = isScrolled
    ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm"
    : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolledStyle} border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Green Claim Check
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features-section")}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              {t.nav.features}
            </button>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              {t.nav.pricing}
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                {t.nav.signIn}
              </button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={scrollToDemo}
              className="bg-primary hover:bg-primary-dark"
            >
              {t.nav.tryFree}
            </Button>
            <LanguageToggle />
            <DarkModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4 animate-slide-up">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("features-section")}
                className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors py-2"
              >
                {t.nav.features}
              </button>
              <Link
                href="/pricing"
                className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors py-2 block"
              >
                {t.nav.pricing}
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/auth/login">
                  <button className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors py-2">
                    {t.nav.signIn}
                  </button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={scrollToDemo}
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  {t.nav.tryFree}
                </Button>
                <div className="pt-2">
                  <LanguageToggle />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
