import { useState } from 'react'
import 'leaflet/dist/leaflet.css'
import AddressSearch from './components/AddressSearch'
import MapView from './components/MapView'
import RiskSummary from './components/RiskSummary'
import './App.css'

export default function App() {
  const [location, setLocation] = useState(null)    // { lat, lng, displayName }
  const [hazardData, setHazardData] = useState(null) // { hazards, explanations }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('idle') // idle | geocoding | checking | done

  async function handleSearch(address) {
    setError(null)
    setHazardData(null)
    setLocation(null)
    setLoading(true)

    try {
      // Step 1: Geocode address → lat/lng
      setStep('geocoding')
      const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      if (!geoRes.ok) {
        const err = await geoRes.json()
        throw new Error(err.error || 'Geocoding failed')
      }
      const geo = await geoRes.json()
      setLocation(geo)

      // Step 2: Check hazard layers
      setStep('checking')
      const hazardRes = await fetch(`/api/hazards?lat=${geo.lat}&lng=${geo.lng}`)
      if (!hazardRes.ok) {
        const err = await hazardRes.json()
        throw new Error(err.error || 'Hazard check failed')
      }
      const hazards = await hazardRes.json()
      setHazardData(hazards)
      setStep('done')
    } catch (e) {
      setError(e.message)
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="header-icon">🏡</span>
            <span className="header-brand">Auckland Property Risk Checker</span>
          </div>
          <p className="header-sub">Check hazard risks for your Auckland property</p>
        </div>
      </header>

      <main className="main">
        <AddressSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="status-card">
            <div className="spinner" />
            <span className="status-text">
              {step === 'geocoding' && 'Locating address…'}
              {step === 'checking' && 'Checking Auckland Council hazard layers…'}
            </span>
          </div>
        )}

        {location && (
          <div className="results-grid">
            <section className="card map-card">
              <h2 className="card-title">
                <span className="card-title-icon">📍</span>
                Location
              </h2>
              <p className="location-name">{location.displayName}</p>
              <MapView lat={location.lat} lng={location.lng} />
            </section>

            {hazardData && (
              <RiskSummary data={hazardData} />
            )}
          </div>
        )}

        {!location && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h2>Enter an Auckland address to get started</h2>
            <p>
              We'll check the property against Auckland Council hazard data including
              flooding, coastal inundation, liquefaction, and more.
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Data sourced from Auckland Council ArcGIS services.
          For informational purposes only — not a substitute for professional advice.
        </p>
      </footer>
    </div>
  )
}
