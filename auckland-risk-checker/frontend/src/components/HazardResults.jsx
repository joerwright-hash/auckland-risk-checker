import './HazardResults.css'

const HAZARD_ICONS = {
  Flooding: '🌊',
  'Coastal Inundation': '🌊',
  Liquefaction: '🏔️',
  'Overland Flow': '💧',
  'Storm Surge': '⛈️',
  Tsunami: '🌊',
  Subsidence: '⬇️',
  'Contaminated Land': '⚗️',
  'Volcanic Hazard': '🌋',
  default: '⚠️',
}

const HAZARD_COLORS = {
  Flooding: '#1d4ed8',
  'Coastal Inundation': '#0891b2',
  Liquefaction: '#92400e',
  'Overland Flow': '#0369a1',
  'Storm Surge': '#6d28d9',
  Tsunami: '#1d4ed8',
  Subsidence: '#78350f',
  'Contaminated Land': '#065f46',
  'Volcanic Hazard': '#991b1b',
  default: '#374151',
}

function HazardCard({ hazard, explanation }) {
  const icon = HAZARD_ICONS[hazard.type] || HAZARD_ICONS.default
  const color = HAZARD_COLORS[hazard.type] || HAZARD_COLORS.default

  return (
    <div className="hazard-card" style={{ '--hazard-color': color }}>
      <div className="hazard-header">
        <span className="hazard-icon">{icon}</span>
        <div className="hazard-meta">
          <h3 className="hazard-type">{hazard.type}</h3>
          <span className="hazard-source">{hazard.source}</span>
        </div>
      </div>

      {explanation && (
        <div className="hazard-explanation">
          <p>{explanation}</p>
        </div>
      )}

      {hazard.attributes && Object.keys(hazard.attributes).length > 0 && (
        <details className="hazard-raw">
          <summary>Raw data</summary>
          <div className="hazard-attrs">
            {Object.entries(hazard.attributes)
              .filter(([, v]) => v !== null && v !== '' && v !== undefined)
              .map(([k, v]) => (
                <div key={k} className="hazard-attr-row">
                  <span className="attr-key">{k}</span>
                  <span className="attr-val">{String(v)}</span>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  )
}

export default function HazardResults({ data }) {
  const { hazards, explanations } = data

  if (!hazards || hazards.length === 0) {
    return (
      <section className="card hazard-results">
        <h2 className="card-title">
          <span className="card-title-icon">✅</span>
          Risk Summary
        </h2>
        <div className="no-hazards">
          <div className="no-hazards-icon">✅</div>
          <p className="no-hazards-title">No mapped hazards found</p>
          <p className="no-hazards-body">
            No mapped hazards were found at this location based on available Auckland Council data.
            This does not guarantee the property is risk-free — always seek professional advice before purchasing.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="card hazard-results">
      <h2 className="card-title">
        <span className="card-title-icon">⚠️</span>
        Risk Summary
        <span className="hazard-count">{hazards.length} hazard{hazards.length !== 1 ? 's' : ''} found</span>
      </h2>

      <div className="hazard-list">
        {hazards.map((h, i) => (
          <HazardCard
            key={i}
            hazard={h}
            explanation={explanations?.[i]}
          />
        ))}
      </div>

      <p className="hazard-disclaimer">
        ℹ️ This information is sourced from Auckland Council GIS data for informational purposes only.
        Consult a licensed professional before making property decisions.
      </p>
    </section>
  )
}
