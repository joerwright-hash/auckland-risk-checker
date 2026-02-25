import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Read Claude API key from environment variable
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

// ─── Geocoding ─────────────────────────────────────────────────────────────
// Uses OpenStreetMap Nominatim, restricted to NZ with Auckland viewport hint.
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
      return res.status(404).json({
        error: 'Address not found. Try a more specific Auckland address.',
      })
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
// Each entry is a FeatureServer layer published by Auckland Council.
// We query with a point geometry (lng, lat) and return any intersecting polygons.
//
const HAZARD_LAYERS = [
  {
    type: 'Flooding',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_FloodHazard/FeatureServer/0/query',
  },
  {
    type: 'Coastal Inundation',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_CoastalHazard/FeatureServer/0/query',
  },
  {
    type: 'Liquefaction',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_LiquefactionHazard/FeatureServer/0/query',
  },
  {
    type: 'Overland Flow',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_OverlandFlow/FeatureServer/0/query',
  },
  {
    type: 'Storm Surge',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_StormSurge/FeatureServer/0/query',
  },
  {
    type: 'Tsunami',
    url: 'https://gis.aucklandcouncil.govt.nz/arcgis/rest/services/NaturalHazards/NaturalHazards_Tsunami/FeatureServer/0/query',
  },
]

/**
 * Query a single ArcGIS FeatureServer layer for a point intersection.
 * Returns a normalised hazard object, or null if no intersection / layer unavailable.
 */
async function queryArcGISLayer(layer, lat, lng) {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    spatialRel: 'esriSpatialRelIntersects',
    inSR: '4326',
    outSR: '4326',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
  })

  try {
    const response = await fetch(`${layer.url}?${params}`, {
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
      return null // Point does not intersect this hazard zone
    }

    // Strip ESRI system fields; keep meaningful attributes
    const attrs = data.features[0].attributes || {}
    const filteredAttrs = {}
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === '' || v === undefined) continue
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

// ─── Plain-English explanations via Claude ─────────────────────────────────
async function generateExplanations(hazards) {
  if (!hazards.length) return []

  const hazardList = hazards
    .map((h, i) => `${i + 1}. ${h.type}${
      Object.keys(h.attributes).length
        ? ` — council data: ${JSON.stringify(h.attributes)}`
        : ''
    }`)
    .join('\n')

  const prompt = `You are a friendly, knowledgeable property advisor helping everyday New Zealanders understand natural hazard risks before buying or living in a home.

A homeowner has looked up their Auckland property and the following hazards have been identified in Auckland Council's mapping data:

${hazardList}

For EACH hazard listed above, write a short plain-English explanation that:
- Describes what the hazard actually is in simple, everyday language (no GIS or technical jargon)
- Explains how it could affect the home or the people living there
- Mentions practical real-world implications such as insurance costs, building consent requirements, or what could happen during a severe weather event
- Is calm, clear, and honest — helpful without being scary or alarmist

Use this as a guide for the right tone and reading level:
"This property is in an area that could flood during very heavy rain. While flooding may not happen often, when it does, water could enter the house or damage access to the property. Homes in these areas often face higher insurance costs and may need extra precautions against water damage."

Write 3–4 sentences per hazard. Aim for a general public reading level.

Respond ONLY with a JSON array of strings — one explanation per hazard, in the same order as listed above.
Example: ["Explanation for hazard 1.", "Explanation for hazard 2."]`

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
    // Graceful fallback — app still works without AI explanations
    return hazards.map(
      h => `This property is located within a ${h.type} hazard zone according to Auckland Council data. Consider speaking with a property professional for more information.`
    )
  }
}

// ─── /api/hazards ──────────────────────────────────────────────────────────
app.get('/api/hazards', async (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lng = parseFloat(req.query.lng)

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }

  // Rough Auckland bounds check
  if (lat < -38 || lat > -35 || lng < 173 || lng > 176) {
    return res.status(400).json({ error: 'Location appears to be outside Auckland' })
  }

  try {
    // Query all layers in parallel
    const results = await Promise.all(
      HAZARD_LAYERS.map(layer => queryArcGISLayer(layer, lat, lng))
    )

    const hazards = results.filter(Boolean)
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
