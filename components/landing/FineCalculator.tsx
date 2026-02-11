'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function FineCalculatorSection() {
  const [revenue, setRevenue] = useState(5000000) // Default: 5 Mio. €

  const calculateFine = (revenue: number) => {
    return Math.round(revenue * 0.04)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} Mio. €`
    }
    return formatCurrency(amount)
  }

  const fine = calculateFine(revenue)
  const sliderPercentage = ((revenue - 10000) / (100000000 - 10000)) * 100

  return (
    <section 
      id="bussgeld-rechner" 
      className="gradient-hero text-white py-20 md:py-24 px-4 relative overflow-hidden"
    >
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Was würde ein Verstoß <span className="text-emerald-400">IHR</span> Business kosten?
          </h2>
          <p className="text-emerald-200 text-lg md:text-xl max-w-2xl mx-auto">
            Berechnen Sie Ihr persönliches Bußgeld-Risiko basierend auf der EU-Richtlinie 2024/825
          </p>
        </div>

        {/* Calculator Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-700/50 shadow-2xl p-8 md:p-12">
          {/* Slider Section */}
          <div className="mb-10">
            <label className="block text-emerald-100 text-base md:text-lg mb-4 font-medium">
              Ihr jährlicher EU-Umsatz:
            </label>
            
            <input
              type="range"
              min="10000"
              max="100000000"
              step="10000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full h-3 bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              style={{
                background: `linear-gradient(to right, #34D399 0%, #34D399 ${sliderPercentage}%, #064E3B ${sliderPercentage}%, #064E3B 100%)`
              }}
              aria-label="Jährlicher EU-Umsatz in Euro"
              aria-valuemin={10000}
              aria-valuemax={100000000}
              aria-valuenow={revenue}
            />
            
            {/* Slider Labels */}
            <div className="flex justify-between items-center text-emerald-300 mt-3">
              <span className="text-xs md:text-sm">10.000 €</span>
              <div className="text-center">
                <span className="font-bold text-white text-xl md:text-2xl block">
                  {formatRevenue(revenue)}
                </span>
                <span className="text-xs text-emerald-400">Ihr Umsatz</span>
              </div>
              <span className="text-xs md:text-sm">100 Mio. €</span>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-gradient-to-br from-amber-500/20 to-red-500/20 border-2 border-amber-500 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-amber-100 text-base md:text-lg font-semibold">
                Mögliches Bußgeld bei Verstoß:
              </p>
            </div>
            
            <p className="text-5xl md:text-7xl font-bold text-white mb-3">
              {formatCurrency(fine)}
            </p>
            
            <p className="text-emerald-200 text-sm md:text-base mb-6">
              (4% des EU-Jahresumsatzes gemäß EU-Richtlinie 2024/825)
            </p>

            {/* Additional Costs Warning */}
            <div className="bg-white/10 rounded-lg p-4 mt-6">
              <p className="text-white text-sm md:text-base font-semibold mb-2">
                ⚠️ Zusätzliche Kosten:
              </p>
              <ul className="text-emerald-200 text-xs md:text-sm space-y-1 text-left max-w-md mx-auto">
                <li>• Reputationsschaden & Markenwert-Verlust</li>
                <li>• Rechtliche Auseinandersetzungskosten</li>
                <li>• Öffentliche Bekanntmachung des Verstoßes</li>
                <li>• Rückruf-Aktionen bei Produkten</li>
              </ul>
            </div>
          </div>

          {/* CTA Button in Calculator */}
          <div className="mt-8 text-center">
            <Link href="/app">
              <Button
                variant="primary"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full md:w-auto"
              >
                Jetzt Claims kostenlos prüfen →
              </Button>
            </Link>
            <p className="text-emerald-300 text-sm mt-3">
              Schützen Sie sich vor diesen Kosten – Compliance-Check in 30 Sekunden
            </p>
          </div>
        </div>

        {/* Example Cases */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-emerald-700/30 text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-emerald-300 text-xs uppercase tracking-wide mb-1">Startup</p>
            <p className="text-white text-lg font-bold">€40.000</p>
            <p className="text-emerald-400 text-xs">bei 1 Mio. € Umsatz</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-emerald-700/30 text-center">
            <div className="text-2xl mb-2">🏢</div>
            <p className="text-emerald-300 text-xs uppercase tracking-wide mb-1">Mittelstand</p>
            <p className="text-white text-lg font-bold">€800.000</p>
            <p className="text-emerald-400 text-xs">bei 20 Mio. € Umsatz</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-emerald-700/30 text-center">
            <div className="text-2xl mb-2">🏛️</div>
            <p className="text-emerald-300 text-xs uppercase tracking-wide mb-1">Konzern</p>
            <p className="text-white text-lg font-bold">€4+ Mio.</p>
            <p className="text-emerald-400 text-xs">bei 100 Mio. € Umsatz</p>
          </div>
        </div>
      </div>
    </section>
  )
}
