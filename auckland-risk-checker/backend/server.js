import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Geocoding ─────────────────────────────────────────────────────────────
// Uses OpenStreetMap Nominatim. Restricted to Auckland/NZ viewport for accuracy.
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query
  if (!address) return res.status(400).json({ error: 'address is required' })

  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    countrycodes: 'nz',
    // Auckland bounding box: SW(174.4,-37.1) → NE(175.3,-36.6)
    viewbox: '174.4,-36.6,175.3,-37.1',
    bounded: '0',
  })

  const url = `https://nominatim.openstreetmap.org/search?${params}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AucklandPropertyRiskChecker/1.0 (portfolio demo)' },
    })
    const data = await response.json()

    if (!data.length) {
      return res.status(404).json({ error: 'Address not found. Try a more specific Auckland address.' })
    }

    const result = data[0]
    return res.json({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    })
  } catch (err) {
    console.error('Geocoding error:', err)
    return res.status(500).json({ error: 'Geocoding service unavailable' })
  }
})

// ─── Auckland Council ArcGIS Hazard Layers ─────────────────────────────────
//
// Auckland Council publishes spatial data via ArcGIS FeatureServer.
// We query each layer with a point geometry to find intersecting polygons.
//
// Layer catalogue (verified endpoints):
//   • Natural Hazards - Flood Plain (100-year ARI)
//   • Natural Hazards - Coastal Inundation
//   • Natural Hazards - Liquefaction
//   • Natural Hazards - Overland Flow Path
//   • Natural Hazards - Storm Surge
//   • Tsunami Inundation Zone
//
// Base URL pattern:
//   https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/
//     <ServiceName>/FeatureServer/<LayerIndex>/query

const HAZARD_LAYERS = [
  {
    type: 'Flooding',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_FloodHazard/FeatureServer/0/query',
    keepFields: ['FLOOD_ZONE', 'ARI', 'DESCRIPTION'],
  },
  {
    type: 'Coastal Inundation',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_CoastalHazard/FeatureServer/0/query',
    keepFields: ['ZONE_TYPE', 'DESCRIPTION'],
  },
  {
    type: 'Liquefaction',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_LiquefactionHazard/FeatureServer/0/query',
    keepFields: ['LIQUEFACTION_CATEGORY', 'DESCRIPTION'],
  },
  {
    type: 'Overland Flow',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_OverlandFlow/FeatureServer/0/query',
    keepFields: ['FLOW_DEPTH', 'DESCRIPTION'],
  },
  {
    type: 'Storm Surge',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_StormSurge/FeatureServer/0/query',
    keepFields: ['SURGE_LEVEL', 'DESCRIPTION'],
  },
  {
    type: 'Tsunami',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_Tsunami/FeatureServer/0/query',
    keepFields: ['INUNDATION_DEPTH', 'ZONE', 'DESCRIPTION'],
  },
]

/**
 * Query a single ArcGIS FeatureServer layer for a point intersection.
 * Returns null if no features found or if the layer is unavailable.
 */
async function queryArcGISLayer(layer, lat, lng) {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    spatialRel: 'esriSpatialRelIntersects',
    inSR: '4326',        // WGS84
    outSR: '4326',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  })

  const url = `${layer.url}?${params}`

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AucklandPropertyRiskChecker/1.0' },
    })

    if (!response.ok) {
      console.warn(`Layer "${layer.type}" returned HTTP ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.error) {
      console.warn(`Layer "${layer.type}" ArcGIS error:`, data.error.message)
      return null
    }

    if (!data.features || data.features.length === 0) {
      return null   // No intersection — no hazard here
    }

    // Take the first intersecting feature; pick only useful fields
    const attrs = data.features[0].attributes || {}
    const filteredAttrs = {}
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === '') continue
      // Strip ESRI internal fields but keep any matching keepFields or non-system fields
      if (k.startsWith('OBJECTID') || k === 'Shape__Area' || k === 'Shape__Length') continue
      filteredAttrs[k] = v
    }

    return {
      type: layer.type,
      source: 'Auckland Council',
      attributes: filteredAttrs,
    }
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      console.warn(`Layer "${layer.type}" timed out`)
    } else {
      console.warn(`Layer "${layer.type}" fetch error:`, err.message)
    }
    return null
  }
}

// ─── Claude explanations ───────────────────────────────────────────────────
async function generateExplanations(hazards) {
  if (!hazards.length) return []

  const hazardSummaries = hazards.map((h, i) =>
    `${i + 1}. ${h.type}: ${JSON.stringify(h.attributes)}`
  ).join('\n')

  const prompt = `You are a helpful property advisor. A homeowner in Auckland, New Zealand has asked about hazards on their property.

The following hazards were found in Auckland Council's GIS data for their property:

${hazardSummaries}

For each hazard, write a clear, plain-English explanation (2–4 sentences) that:
- Describes what the hazard means in everyday terms
- Explains the practical implications for the homeowner (insurance, building consent, flood risk, etc.)
- Is factual but not alarmist

Respond with a JSON array of strings, one explanation per hazard, in the same order as listed above.
Example format: ["Explanation for hazard 1.", "Explanation for hazard 2."]
Only output the JSON array, nothing else.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text.trim()
    const explanations = JSON.parse(text)
    return Array.isArray(explanations) ? explanations : []
  } catch (err) {
    console.error('Claude API error:', err.message)
    // Return generic fallbacks so the app still works
    return hazards.map(h => `This property is located within a ${h.type} hazard zone identified by Auckland Council.`)
  }
}

// ─── Hazard endpoint ───────────────────────────────────────────────────────
app.get('/api/hazards', async (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lng = parseFloat(req.query.lng)

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }

  // Check Auckland bounds roughly: lat -37.7 to -36.2, lng 174.3 to 175.6
  if (lat < -38 || lat > -35 || lng < 173 || lng > 176) {
    return res.status(400).json({ error: 'Location appears to be outside Auckland' })
  }

  try {
    // Query all hazard layers in parallel
    const results = await Promise.all(
      HAZARD_LAYERS.map(layer => queryArcGISLayer(layer, lat, lng))
    )

    // Filter out nulls (no intersection or error)
    const hazards = results.filter(Boolean)

    // Generate plain-English explanations via Claude
    const explanations = await generateExplanations(hazards)

    return res.json({ hazards, explanations })
  } catch (err) {
    console.error('Hazard check error:', err)
    return res.status(500).json({ error: 'Failed to check hazard layers' })
  }
})

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Auckland Risk Checker backend running on http://localhost:${PORT}`)
})
