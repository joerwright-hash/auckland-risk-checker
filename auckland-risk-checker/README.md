# Auckland Property Risk Checker

A portfolio demo web app that checks Auckland properties against council hazard layers.

## Stack

- **Frontend**: React + Vite + Leaflet
- **Backend**: Node.js + Express
- **Geocoding**: OpenStreetMap Nominatim
- **Hazard data**: Auckland Council ArcGIS FeatureServer
- **Explanations**: Claude API (Anthropic)

## Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your ANTHROPIC_API_KEY
```

### 3. Run

In two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:5173

## How it works

1. User enters an Auckland address
2. Backend geocodes via Nominatim → returns lat/lng
3. Frontend shows Leaflet map with marker
4. Backend queries Auckland Council ArcGIS hazard layers in parallel
5. Any intersecting hazard polygons are returned and normalised
6. Claude API generates plain-English explanations
7. Frontend displays hazard list with explanations

## Hazard layers checked

| Hazard | Layer |
|--------|-------|
| Flooding | NaturalHazards_FloodHazard |
| Coastal Inundation | NaturalHazards_CoastalHazard |
| Liquefaction | NaturalHazards_LiquefactionHazard |
| Overland Flow | NaturalHazards_OverlandFlow |
| Storm Surge | NaturalHazards_StormSurge |
| Tsunami | NaturalHazards_Tsunami |

## Disclaimer

For informational/portfolio purposes only. Not a substitute for professional advice.
