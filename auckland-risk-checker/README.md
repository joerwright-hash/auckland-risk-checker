# Auckland Property Risk Checker

A portfolio demo web app that checks Auckland properties against council hazard layers and generates plain-English risk summaries.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Leaflet |
| Backend | Node.js + Express |
| Geocoding | OpenStreetMap Nominatim |
| Hazard data | Auckland Council ArcGIS FeatureServer |
| Explanations | Claude API (`claude-sonnet-4-6`) |

## Project Structure

```
auckland-risk-checker/
├── backend/
│   ├── server.js        # Express server
│   │   ├── GET /api/geocode   — Nominatim address lookup
│   │   └── GET /api/hazards   — ArcGIS hazard query + Claude explanations
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── AddressSearch.jsx   — address input + submit
    │       ├── MapView.jsx         — Leaflet map with marker
    │       └── RiskSummary.jsx     — hazard cards + explanations
    ├── vite.config.js   # proxies /api → backend :3001
    └── package.json
```

## Setup & Running

### 1. Install dependencies

```bash
# From the auckland-risk-checker/ directory:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your Claude API key:

```
CLAUDE_API_KEY=sk-ant-...
PORT=3001
```

Get a key at https://console.anthropic.com

### 3. Run backend

```bash
cd backend
npm run dev        # uses node --watch (Node 18+)
# or: npm start
```

Backend runs on **http://localhost:3001**

### 4. Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

Open http://localhost:5173 and enter an Auckland address.

---

## How it works

1. User enters an address and clicks **Check risks**
2. Frontend calls `GET /api/geocode?address=...`
3. Backend hits Nominatim → returns `{ lat, lng, displayName }`
4. Frontend shows a Leaflet map centred on the location
5. Frontend calls `GET /api/hazards?lat=...&lng=...`
6. Backend queries 6 Auckland Council ArcGIS FeatureServer layers **in parallel** using `esriGeometryPoint` + `esriSpatialRelIntersects`
7. Matching hazard polygons are normalised to `{ type, source, attributes }`
8. Hazard list is sent to Claude with a prompt asking for plain-English homeowner explanations
9. Backend returns `{ hazards, explanations }` to the frontend
10. Frontend displays each hazard in a card with the AI explanation

---

## Hazard layers checked

| Hazard | ArcGIS Service |
|--------|----------------|
| Flooding | NaturalHazards_FloodHazard |
| Coastal Inundation | NaturalHazards_CoastalHazard |
| Liquefaction | NaturalHazards_LiquefactionHazard |
| Overland Flow | NaturalHazards_OverlandFlow |
| Storm Surge | NaturalHazards_StormSurge |
| Tsunami | NaturalHazards_Tsunami |

If a layer times out or returns an error it is silently skipped — other layers still return results.

---

## Disclaimer

For informational/portfolio purposes only. Not a substitute for professional property or legal advice.
