"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle, ArrowRight, ChevronDown, Shield, Lock, CreditCard, Check } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Grid pattern SVG as base64 - extracted to constant to avoid Webpack serialization warnings
const GRID_PATTERN_BG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+";

export default function PricingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null);
  const [showFAQ, setShowFAQ] = useState<number | null>(null);

  const handlePricingClick = async (plan: 'free' | 'basic' | 'pro' | 'premium') => {
    // Free plan - redirect to signup
    if (plan === 'free') {
      router.push('/auth/signup');
      return;
    }

    // Check if user is logged in
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/login?redirect=/pricing`);
      toast.info('Please sign in to subscribe');
      return;
    }

    // Create checkout session
    setIsCreatingCheckout(plan);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan === 'basic' ? 'starter' : plan, // Map basic to starter in backend
          billingPeriod: isYearly ? 'yearly' : 'monthly',
          cancelUrl: window.location.href, // Pass current page URL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start checkout. Please try again.');
      setIsCreatingCheckout(null);
    }
  };

  const pricingPlans = [
    {
      id: 'free' as const,
      name: t.pricing.free.name,
      subtitle: (t.pricing.free as any).subtitle || "Für Einzelnutzer",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: t.pricing.free.features,
      cta: t.pricing.free.cta,
      popular: false,
      highlight: false,
      buttonVariant: 'outline' as const,
    },
    {
      id: 'basic' as const,
      name: (t.pricing as any).basic?.name || "BASIC",
      subtitle: (t.pricing as any).basic?.subtitle || "Für Freelancer & Einzelunternehmer",
      monthlyPrice: 19,
      yearlyPrice: 15,
      features: (t.pricing as any).basic?.features || ["100 scans/month", "Unlimited characters", "PDF reports", "Email support"],
      cta: (t.pricing as any).basic?.cta || "14 Tage kostenlos testen",
      trialDays: 14,
      popular: false,
      highlight: false,
      buttonVariant: 'outline' as const,
    },
    {
      id: 'pro' as const,
      name: t.pricing.pro.name,
      subtitle: (t.pricing.pro as any).subtitle || "Für wachsende Teams",
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: t.pricing.pro.features,
      cta: t.pricing.pro.cta,
      trialDays: 14,
      popular: true,
      highlight: true,
      badge: t.pricing.pro.badge,
      buttonVariant: 'primary' as const,
    },
    {
      id: 'premium' as const,
      name: (t.pricing as any).premium?.name || "PREMIUM",
      subtitle: (t.pricing as any).premium?.subtitle || "Für große Unternehmen",
      monthlyPrice: 149,
      yearlyPrice: 119,
      features: (t.pricing as any).premium?.features || ["Everything in Pro", "API access", "White label", "SLA", "Priority support"],
      cta: (t.pricing as any).premium?.cta || "14 Tage kostenlos testen",
      trialDays: 14,
      popular: false,
      highlight: false,
      buttonVariant: 'outline' as const,
    },
  ];


  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Transparente Preise. Maximale EU-Compliance.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Prüfen Sie Ihre Green Claims automatisch auf Übereinstimmung mit EU-Richtlinien gegen Greenwashing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
              {t.pricing.monthly}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-300 rounded-full shadow-md transform transition-transform duration-300 ${
                  isYearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isYearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {t.pricing.yearly}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                {t.pricing.save}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, idx) => {
              const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly && plan.monthlyPrice ? plan.monthlyPrice : null;
              const savings = originalPrice ? Math.round((1 - (plan.yearlyPrice / plan.monthlyPrice)) * 100) : 0;

              return (
                <div
                  key={idx}
                  className={`group relative bg-white dark:bg-gray-800 rounded-xl border transition-all duration-300 ${
                    plan.highlight
                      ? "border-primary/60 shadow-lg scale-[1.05] md:scale-[1.1] -mt-2 md:-mt-4"
                      : "border-gray-200 dark:border-gray-700 shadow-sm hover:scale-[1.02] hover:shadow-md hover:border-primary/40"
                  }`}
                >
                  {plan.highlight && plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                        {plan.name}
                      </h3>
                      {plan.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          {plan.subtitle}
                        </p>
                      )}
                      <div className="mb-2">
                        {plan.monthlyPrice === 0 ? (
                          <div className="text-5xl font-bold text-gray-900 dark:text-white">
                            €0
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-center gap-2">
                              {originalPrice && (
                                <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                                  €{originalPrice}
                                </span>
                              )}
                              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                €{displayPrice}
                              </span>
                              <span className="text-lg text-gray-500 dark:text-gray-400">
                                /{t.pricing.monthly.toLowerCase()}
                              </span>
                            </div>
                            {isYearly && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {isYearly ? `€${plan.yearlyPrice * 12} jährlich abgerechnet` : ''}
                                </p>
                                {savings > 0 && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                                    Spare €{plan.monthlyPrice * 12 - plan.yearlyPrice * 12} ({savings}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 min-h-[200px]">
                      {plan.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.highlight ? "text-primary" : "text-success"
                          }`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full ${
                        plan.highlight 
                          ? "bg-primary hover:bg-primary-dark shadow-md" 
                          : "border-2 hover:border-primary hover:text-primary"
                      }`}
                      onClick={() => handlePricingClick(plan.id)}
                      isLoading={isCreatingCheckout === plan.id}
                      disabled={isCreatingCheckout !== null && isCreatingCheckout !== plan.id}
                    >
                      {isCreatingCheckout === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          {plan.trialDays && (
                            <span className="ml-2 text-xs opacity-80">
                              ({plan.trialDays} {(t.pricing as any).trial || "days"})
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-success" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-success" />
              <span>14 Tage Geld-zurück-Garantie</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>Jederzeit kündbar</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              <span>Made in EU</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Gradient Background - same as Demo Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${GRID_PATTERN_BG}')` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mb-10 md:mb-12 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Häufig gestellte Fragen
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  question: "Kann ich jederzeit kündigen?",
                  answer: "Ja, alle Pläne sind monatlich kündbar ohne versteckte Gebühren.",
                },
                {
                  question: "Was passiert nach dem Free-Tier?",
                  answer: "Bei Erreichen des Limits erhalten Sie eine Benachrichtigung. Sie können jederzeit upgraden.",
                },
                {
                  question: "Sind die Preise inklusive MwSt.?",
                  answer: "Nein, alle Preise zzgl. 19% MwSt. für deutsche Kunden.",
                },
                {
                  question: "Wie funktioniert die 14-Tage-Testphase?",
                  answer: "Voller Zugang zu allen Features. Keine Kreditkarte erforderlich. Nach 14 Tagen automatische Umstellung oder Downgrade zu Free.",
                },
                {
                  question: "Bieten Sie Rabatte für NGOs oder Bildungseinrichtungen?",
                  answer: "Ja! Kontaktieren Sie uns für Sonderkonditionen.",
                },
                {
                  question: "Kann ich zwischen den Plänen wechseln?",
                  answer: "Ja, jederzeit upgraden oder downgraden. Bei Downgrade gilt die Änderung ab nächstem Abrechnungszeitraum.",
                },
                {
                  question: "Was sind \"Scans\"?",
                  answer: "Ein Scan = Eine Prüfung einer einzelnen Umweltaussage/Claim.",
                },
              ].map((faq, idx) => (
                <Card
                  key={idx}
                  variant="outlined"
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200"
                  onClick={() => setShowFAQ(showFAQ === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-base flex-1 text-gray-900 dark:text-white">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        showFAQ === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {showFAQ === idx && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-slide-up">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Noch Fragen? Wir beraten Sie gerne!
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="mailto:sales@greenclaimcheck.com?subject=Beratungsgespräch">
              <Button variant="primary" size="lg">
                Beratungsgespräch buchen <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </Link>
            <Link href="mailto:info@greenclaimcheck.com">
              <Button variant="outline" size="lg">
                E-Mail senden
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
