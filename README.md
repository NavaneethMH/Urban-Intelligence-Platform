# INNOVEXA — AI-Powered Mobile Urban Intelligence Platform
### Smart Automation · Problem Statement ID: 26124 · Bharat Electronics Limited (BEL)

> **"Turning every public transport bus into a real-time mobile urban sensing node."**

---

## 1. Project Overview

The **INNOVEXA Urban Intelligence Platform** is an edge-first, fleet-scale city monitoring system developed for **SIH 2025 Problem Statement 26124**. 

Instead of relying solely on expensive, static city CCTVs that have blind spots, INNOVEXA equips regular public transport buses (e.g., BMTC fleet in Bengaluru) with multi-camera edge-AI hardware (NVIDIA Jetson Orin Nano). As buses navigate their daily routes, onboard deep-learning models detect, classify, geotag, and transmit road and traffic intelligence in real time while reducing network bandwidth by over **98%**.

### Key Source Documents Implemented
* `INNOVEXA_PRD_PS26124.md` (Product Requirements Document)
* `INNOVEXA_TRD_PS26124.md` (Technical Architecture & Engineering Constraints)
* `INNOVEXA_SRS_PS26124.md` (Software Requirements Specification)
* `INNOVEXA_BACKEND_SCHEMA_PS26124.md` (Central Schema, Entities, and Endpoints)
* `INNOVEXA_BMC_PS26124.md` (Business Model Canvas)

---

## 2. System Architecture

```text
  [ Bus Multi-Camera Array ]
  Front (1080p) · Rear · Left Curb · Right Divider · Cabin
            │
            ▼
  [ Onboard Edge AI Device (NVIDIA Jetson Orin Nano) ]
  • Road Hazard & Surface Detector (YOLOv8 ONNX/TensorRT)
  • Vehicle & Traffic Flow Density Tracker (ByteTrack)
  • High-Speed License Plate Extractor (CRNN OCR)
  • Spatiotemporal Deduplicator & Bandwidth Compression
            │ (Compact Geotagged JSON + Evidence Crops via 4G/5G/Wi-Fi)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                 CENTRAL PLATFORM BACKEND                    │
│                                                             │
│  FastAPI Gateway & Schema Enforcer                          │
│     ├── /api/v1/ingestion/events (Idempotent Edge Upload)   │
│     ├── /api/v1/events & /events/{id} (Defect Registry)     │
│     ├── /api/v1/fleet/buses & /devices (Telemetry Sync)     │
│     ├── /api/v1/analytics/congestion & road-condition       │
│     ├── /api/v1/alerts (4-Stage Operational Lifecycle)      │
│     └── /api/v1/audit-logs (Security & Governance Trail)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            COMMAND-AND-CONTROL WEB INTERFACE                │
│                                                             │
│  • MapLibre GL JS v4 + OpenFreeMap Basemap (No API Key)     │
│  • GeoJSON Operational Layers (Buses, Defects, Congestion)  │
│  • 11 Functional Operational Workspaces                     │
│  • 4 Interactive Guided Evaluation Demo Flows               │
│  • Human-in-the-Loop ANPR Forensic Review Workspace         │
│  • Ctrl+K Command Palette & Global Entity Search            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 11 Dedicated Workspaces & Screens

| # | Workspace | Purpose |
|---|---|---|
| **1** | **Command Center** | Hero GIS map, 8 live operational metric tiles, real-time activity stream, layer filters. |
| **2** | **Live Fleet** | Real-time tracking of 36 buses across 8 corridors; 5-camera simulated AI detection feeds (Front, Rear, Left, Right, Cabin). |
| **3** | **Road Intelligence** | Pothole depth/width tracking, repeat observations, road segment health score cards (0–100), defect registry. |
| **4** | **Traffic Intelligence** | Congestion heatmaps, hourly vehicle density, **interactive time-slider (06:00 to 22:00)** simulating peak-hour bottlenecks. |
| **5** | **Incident Center** | High-priority safety triage (hit-and-run, rash driving, school-zone pedestrian hazards). |
| **6** | **Incident Workspace** | Forensic evidence viewer with vehicle trajectory vectors, ANPR candidate zoom crop, character confidence bar, and human review controls. |
| **7** | **AI Evidence Explorer**| Searchable gallery of edge-captured visual evidence with bounding boxes, latency metrics, and confidence sliders. |
| **8** | **Fleet Health** | Edge device hardware console (temperatures, storage buffers, network latency, queue depth, AI runtime versions). |
| **9** | **Alert Center** | Four-stage alert workflow: **New → Acknowledged → Assigned → Resolved** with instant updates. |
| **10**| **Reports** | Custom report builder with **1-click CSV export**, **JSON export**, and **formal printable/PDF municipal report**. |
| **11**| **Administration** | 5-role persona switcher (Control Room, Sys Admin, Road Officer, Traffic Police, Urban Planner), model bundle registry, and audit log. |

---

## 4. 4 Guided End-to-End Demo Flows (SIH Judging)

Click the **Demo Flows** button in the top bar to run any of the four core evaluation scenarios:

1. **Flow 1: Pothole Detection & Civic Verification**
   - Bus detects a critical pothole on Silk Board Flyover Underpass.
   - Event appears on GIS map with pulsing marker and in the activity stream.
   - Clicking opens the **Event Intelligence Drawer** showing AI bounding box, confidence, GPS, and multi-pass telemetry.
   - User verifies detection; review status updates to `VERIFIED` and logs to central audit trail.
2. **Flow 2: Hit-and-Run ANPR & Police Investigation**
   - Offending vehicle detected by front camera buffer.
   - Launches forensic investigation workspace with vehicle trajectory vectors.
   - Displays ANPR candidate `KA 01 AB 4582` (Confidence: 91.2%) with ethical human review disclaimer.
   - Traffic police reviewer authenticates candidate and generates formal incident report.
3. **Flow 3: Corridor Congestion & Route Delay**
   - Time-slider scrubs to `18:00` (evening peak hour).
   - Vehicle density spikes to 1,910 veh/hr; corridor transit speed drops to 11.2 km/h.
   - Silk Board bottleneck alert escalates; route delays update across Outer Ring Road.
4. **Flow 4: Edge Device Failure & Auto-Recovery**
   - Edge device `EDGE-019` simulates network latency and heartbeat degradation.
   - Fleet health console flags status as `DEGRADED`.
   - Autonomous watchdog agent executes telemetry resync; node status recovers to `HEALTHY`.

---

## 5. Quick Start & Execution

### Prerequisites
- Python 3.10+ (Python 3.14 recommended)
- Web browser (Chrome, Edge, Firefox)

### Option A: One-Click Launch (Windows)
Double-click `run.bat` or run in PowerShell:
```powershell
.\run.ps1
```

### Option B: Manual Terminal Launch

**Terminal 1 — FastAPI Backend:**
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation & Swagger UI available at: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend HTTP Server:**
```bash
cd frontend
python -m http.server 8080
```
Command Center UI available at: `http://127.0.0.1:8080`

### Dual-Mode Resilience
The frontend is architected with dual-mode resilience:
- It connects to the live FastAPI backend on `http://127.0.0.1:8000`.
- If the backend is stopped or unavailable, it automatically switches to an embedded resilient local dataset with zero broken UI states or dead buttons.

---

## 6. Ethical & Responsible AI Governance

- **No Facial Recognition:** The platform strictly analyzes road infrastructure, traffic dynamics, and vehicles. Facial recognition is explicitly barred.
- **ANPR Candidate Protocol:** Extracted license plate text is categorized as an **"AI-generated candidate requiring human verification"** and does not establish automatic legal guilt.
- **Auditability:** All status updates, triage actions, and report exports are timestamped and logged with user role attribution.

---

## 7. Team & Theme Information

* **Team:** INNOVEXA
* **Problem Statement ID:** 26124
* **Organization:** Bharat Electronics Limited (BEL)
* **Theme:** Smart Automation
* **Category:** Software
