# INNOVEXA Urban Intelligence Platform

Working SIH-style prototype for Problem Statement 26124: **AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet**.

## What is implemented

- Premium dark command-center application shell
- Command Center with simulated live GIS-style map, fleet markers, hazard/incident markers, metrics, filters and activity stream
- Live Fleet with route/bus status, device telemetry, simulated multi-camera AI overlays
- Road Intelligence registry for potholes, damaged roads, waterlogging and infrastructure deficiencies
- Traffic Intelligence charts, congestion events and route-delay context
- Incident Center with human-in-the-loop evidence review and ANPR candidate presentation
- AI Evidence explorer with model/confidence/review metadata
- Analytics for road health, traffic, sensing coverage, infrastructure and route reliability
- Fleet Health console
- Alert workflow: New → Acknowledged → Assigned → Resolved
- Reports with CSV and JSON exports and printable view
- Administration and role simulation
- Ctrl/Cmd + K command palette and global entity search
- Live simulation pause/resume and deterministic device recovery behavior
- Presentation mode
- Responsive desktop/tablet layout
- Loading/fallback behavior: live Supabase API first, deterministic local dataset if unavailable

## Connected services

### Supabase
The live prototype datastore is provisioned in Supabase (ap-south-1) with RLS enabled. It contains:

- 8 routes
- 32 buses
- 32 edge devices
- 128 urban-intelligence events
- 24 alerts
- audit logs for event/alert workflow changes

A JWT-protected Edge Function (`innovexa-api`) exposes only the prototype operations required by the UI. The browser uses the public anon token; privileged database credentials remain server-side.

### Railway
The project includes a Railway-ready service configuration path for future FastAPI/container deployment. The current live API is hosted as a Supabase Edge Function because it can securely access the seeded database without exposing service credentials.

## Run locally

The frontend is static and needs no build system:

```bash
cd frontend
python -m http.server 8080
```

Open `http://localhost:8080`.

The frontend will try the live Supabase Edge Function. If it cannot reach it, it automatically falls back to deterministic local demo data so the SIH demo remains usable.

## Demo flow

1. Open **Command Center** and point out buses and live detections.
2. Click a pothole marker or use **Start Demo Flow**.
3. Verify the event in the intelligence drawer; the review state is written and audited.
4. Open **Incident Center**, choose a hit-and-run/rash-driving event, inspect the ANPR candidate, and mark it Verified / Rejected / Uncertain.
5. Open **Traffic Intelligence** and explain peak-hour congestion and route delay.
6. Open **Fleet Health** then **Alert Center** and advance an alert through the workflow.
7. Open **Reports** and export CSV/JSON.
8. Use **Presentation Mode** during judging.

## Demo responsibility / limitations

- All vehicle, incident, ANPR and city data is simulated.
- No face recognition is implemented.
- ANPR text is explicitly presented as an AI candidate requiring human validation.
- The prototype does not automate punishment or law-enforcement conclusions.
- The custom SVG-like city map is intentionally tile-independent for demo reliability; production deployment should use MapLibre/PostGIS-backed vector layers.
