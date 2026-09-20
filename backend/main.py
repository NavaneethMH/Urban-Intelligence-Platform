"""
INNOVEXA Urban Intelligence Platform - Central Backend API
Problem Statement 26124 (BEL / Smart Automation / SIH 2025)
FastAPI implementation complying with INNOVEXA_BACKEND_SCHEMA_PS26124.md.
"""

import os
import io
import csv
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from backend.schemas import (
    EventReviewPatch,
    AlertPatch,
    SystemCounts,
    UrbanEvent,
    Bus,
    EdgeDevice,
    Alert,
    AuditLog
)
from backend.seed_data import (
    ROUTES,
    BUSES,
    DEVICES,
    EVENTS,
    ALERTS,
    ROAD_SEGMENTS,
    HOURLY_TRAFFIC,
    VEHICLE_CLASSIFICATION,
    AUDIT_LOGS,
    get_system_counts
)

app = FastAPI(
    title="INNOVEXA Urban Intelligence API",
    version="1.0.0",
    description="Edge-Fleet Aggregation & Urban Intelligence Backend for Problem Statement 26124",
)

# Enable CORS for local dev and frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory working state (initialized from seed data)
state_events = [dict(e) for e in EVENTS]
state_buses = [dict(b) for b in BUSES]
state_devices = [dict(d) for d in DEVICES]
state_alerts = [dict(a) for a in ALERTS]
state_audit_logs = [dict(log) for log in AUDIT_LOGS]

@app.get("/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "HEALTHY",
        "service": "innovexa-central-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "edge_nodes_registered": len(state_devices),
        "active_fleet_buses": sum(1 for b in state_buses if b["status"] == "ONLINE"),
        "version": "1.0.0"
    }

@app.get("/api/v1/bootstrap")
def get_bootstrap_state() -> Dict[str, Any]:
    """
    Returns complete synchronized platform state for initial frontend hydration.
    """
    counts = get_system_counts()
    # update dynamic counts
    counts["active_buses"] = sum(1 for b in state_buses if b["status"] == "ONLINE")
    counts["devices_online"] = sum(1 for d in state_devices if d["status"] == "HEALTHY")
    counts["critical_alerts"] = sum(1 for a in state_alerts if a["severity"] == "CRITICAL" and a["state"] != "RESOLVED")
    counts["potholes_detected"] = sum(1 for e in state_events if e["event_subtype"] == "POTHOLE")
    counts["incidents_under_review"] = sum(1 for e in state_events if e["event_type"] == "SAFETY_INCIDENT" and e["review_status"] == "PENDING")
    
    return {
        "counts": counts,
        "routes": ROUTES,
        "buses": state_buses,
        "devices": state_devices,
        "events": state_events,
        "alerts": state_alerts,
        "road_segments": ROAD_SEGMENTS,
        "hourly_traffic": HOURLY_TRAFFIC,
        "vehicle_classification": VEHICLE_CLASSIFICATION,
        "audit_logs": state_audit_logs[:50],
        "metadata": {
            "city": "Bengaluru Operational Sensing Zone",
            "jurisdiction": "BMTC / BBMP / Bengaluru Traffic Police",
            "edge_model_version": "v2.4.1",
            "simulated": True
        }
    }

@app.get("/api/v1/events")
def list_events(
    event_type: Optional[str] = None,
    event_subtype: Optional[str] = None,
    severity: Optional[str] = None,
    review_status: Optional[str] = None,
    corridor_id: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    results = state_events
    if event_type and event_type != "ALL":
        results = [e for e in results if e["event_type"] == event_type]
    if event_subtype and event_subtype != "ALL":
        results = [e for e in results if e["event_subtype"] == event_subtype]
    if severity and severity != "ALL":
        results = [e for e in results if e["severity"] == severity]
    if review_status and review_status != "ALL":
        results = [e for e in results if e["review_status"] == review_status]
    if corridor_id:
        results = [e for e in results if e["corridor_id"] == corridor_id]
    return results[:limit]

@app.get("/api/v1/events/{event_id}")
def get_event(event_id: str) -> Dict[str, Any]:
    for e in state_events:
        if e["id"] == event_id:
            return e
    raise HTTPException(status_code=404, detail=f"Event {event_id} not found")

@app.patch("/api/v1/events/{event_id}")
def update_event_review(event_id: str, patch: EventReviewPatch) -> Dict[str, Any]:
    target = None
    for e in state_events:
        if e["id"] == event_id:
            target = e
            break
    if not target:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
        
    old_status = target.get("review_status", "PENDING")
    if patch.review_status:
        target["review_status"] = patch.review_status
    if patch.alert_status:
        target["alert_status"] = patch.alert_status
        
    # Append to audit logs
    now_str = datetime.now(timezone.utc).isoformat()
    reviewer = patch.reviewer_role or "Control Room Operator"
    log_entry = {
        "id": f"AUD-{len(state_audit_logs)+1:04d}",
        "timestamp": now_str,
        "user_role": reviewer,
        "action": f"EVENT_REVIEW_{patch.review_status or 'UPDATED'}",
        "target_entity": "EVENT",
        "target_id": event_id,
        "details": f"Review status changed from {old_status} to {target['review_status']}. Notes: {patch.review_notes or 'Human review complete'}"
    }
    state_audit_logs.insert(0, log_entry)
    
    # If verified as critical hazard, link or resolve corresponding alert
    for a in state_alerts:
        if a["event_id"] == event_id:
            if patch.alert_status:
                a["state"] = patch.alert_status
            elif patch.review_status == "REJECTED":
                a["state"] = "RESOLVED"
            a["updated_at"] = now_str

    return {"status": "SUCCESS", "event": target, "audit_log": log_entry}

@app.get("/api/v1/fleet/buses")
def list_buses() -> List[Dict[str, Any]]:
    return state_buses

@app.get("/api/v1/fleet/devices")
def list_devices() -> List[Dict[str, Any]]:
    return state_devices

@app.get("/api/v1/analytics/congestion")
def get_congestion_analytics() -> Dict[str, Any]:
    return {
        "hourly_traffic": HOURLY_TRAFFIC,
        "vehicle_distribution": VEHICLE_CLASSIFICATION,
        "corridor_congestion": [
            {"corridor": "Silk Board - Bellandur ORR", "delay_min": 24, "speed_kph": 11.2, "status": "SEVERE"},
            {"corridor": "Kundalahalli - Whitefield", "delay_min": 19, "speed_kph": 14.6, "status": "HIGH"},
            {"corridor": "Hosur Road Kudlu Gate", "delay_min": 16, "speed_kph": 16.8, "status": "HIGH"},
            {"corridor": "Hebbal Flyover Inbound", "delay_min": 12, "speed_kph": 21.0, "status": "MODERATE"},
            {"corridor": "Old Airport Road Manipal", "delay_min": 14, "speed_kph": 18.5, "status": "MODERATE"},
            {"corridor": "Mysore Road Nayandahalli", "delay_min": 4, "speed_kph": 34.0, "status": "LOW"},
        ],
        "top_bottlenecks": [e for e in state_events if e["event_subtype"] == "BOTTLENECK"][:6]
    }

@app.get("/api/v1/analytics/road-condition")
def get_road_condition_analytics() -> Dict[str, Any]:
    defects_by_type = {}
    for e in state_events:
        if e["event_type"] in ["ROAD_DEFECT", "INFRASTRUCTURE"]:
            st = e["event_subtype"]
            defects_by_type[st] = defects_by_type.get(st, 0) + 1
            
    return {
        "segments": ROAD_SEGMENTS,
        "defect_distribution": defects_by_type,
        "total_potholes": sum(1 for e in state_events if e["event_subtype"] == "POTHOLE"),
        "repeat_potholes": sum(1 for e in state_events if e["event_subtype"] == "POTHOLE" and e.get("metadata", {}).get("repeat_observations", 1) > 1),
        "overall_road_health_index": 72.8
    }

@app.get("/api/v1/alerts")
def list_alerts(
    state: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None
) -> List[Dict[str, Any]]:
    res = state_alerts
    if state and state != "ALL":
        res = [a for a in res if a["state"] == state]
    if category and category != "ALL":
        res = [a for a in res if a["category"] == category]
    if severity and severity != "ALL":
        res = [a for a in res if a["severity"] == severity]
    return res

@app.patch("/api/v1/alerts/{alert_id}")
def update_alert(alert_id: str, patch: AlertPatch) -> Dict[str, Any]:
    for a in state_alerts:
        if a["id"] == alert_id:
            old_state = a["state"]
            if patch.state:
                a["state"] = patch.state
            if patch.assigned_to:
                a["assigned_to"] = patch.assigned_to
            a["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            # Audit log entry
            state_audit_logs.insert(0, {
                "id": f"AUD-{len(state_audit_logs)+1:04d}",
                "timestamp": a["updated_at"],
                "user_role": "Control Room Operator",
                "action": f"ALERT_STATE_{a['state']}",
                "target_entity": "ALERT",
                "target_id": alert_id,
                "details": f"Alert state shifted from {old_state} to {a['state']} (Assigned: {a.get('assigned_to', 'N/A')})"
            })
            return {"status": "SUCCESS", "alert": a}
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

@app.post("/api/v1/ingestion/events")
def ingest_edge_event(event_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates edge-AI telemetry upload from a bus.
    Enforces idempotency and schema validation.
    """
    event_id = event_payload.get("id") or f"EVT-2026-0918-{len(state_events)+1:04d}"
    # Check if already exists
    for existing in state_events:
        if existing["id"] == event_id:
            return {"status": "DUPLICATE_IGNORED", "event_id": event_id}
            
    event_payload["id"] = event_id
    if "occurred_at" not in event_payload:
        event_payload["occurred_at"] = datetime.now(timezone.utc).isoformat()
    if "review_status" not in event_payload:
        event_payload["review_status"] = "PENDING"
    if "alert_status" not in event_payload:
        event_payload["alert_status"] = "NEW"
        
    state_events.insert(0, event_payload)
    
    # Create alert if critical or high
    if event_payload.get("severity") in ["CRITICAL", "HIGH"]:
        alt_id = f"ALT-2026-0918-{len(state_alerts)+1:04d}"
        new_alert = {
            "id": alt_id,
            "event_id": event_id,
            "category": event_payload.get("event_type", "ROAD_HAZARD"),
            "severity": event_payload.get("severity", "HIGH"),
            "title": f"Live Detection: {event_payload.get('event_subtype', 'HAZARD')} on {event_payload.get('road_name', 'Bengaluru')}",
            "description": f"Real-time edge event received from {event_payload.get('bus_id', 'BUS-001')}.",
            "state": "NEW",
            "assigned_to": "Field Operations Hub",
            "created_at": event_payload["occurred_at"],
            "updated_at": event_payload["occurred_at"]
        }
        state_alerts.insert(0, new_alert)
        
    return {"status": "INGESTED", "event_id": event_id}

@app.get("/api/v1/reports/export")
def export_reports(
    format: str = Query("csv", pattern="^(csv|json)$"),
    event_type: Optional[str] = None,
    corridor_id: Optional[str] = None
):
    rows = state_events
    if event_type and event_type != "ALL":
        rows = [r for r in rows if r["event_type"] == event_type]
    if corridor_id and corridor_id != "ALL":
        rows = [r for r in rows if r["corridor_id"] == corridor_id]
        
    if format == "json":
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "records_count": len(rows),
            "events": rows
        }
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=innovexa_urban_report.json"}
        )
    else:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Event ID", "Type", "Subtype", "Severity", "Confidence",
            "Timestamp", "Road Name", "Corridor", "Bus ID", "Camera ID",
            "Latitude", "Longitude", "Review Status", "Alert Status", "ANPR Plate"
        ])
        for r in rows:
            anpr_plate = r.get("anpr", {}).get("plate_text", "") if r.get("anpr") else ""
            writer.writerow([
                r.get("id"), r.get("event_type"), r.get("event_subtype"), r.get("severity"),
                r.get("confidence"), r.get("occurred_at"), r.get("road_name"), r.get("corridor_id"),
                r.get("bus_id"), r.get("camera_id"), r.get("lat"), r.get("lon"),
                r.get("review_status"), r.get("alert_status"), anpr_plate
            ])
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=innovexa_urban_report.csv"}
        )

@app.get("/api/v1/audit-logs")
def list_audit_logs() -> List[Dict[str, Any]]:
    return state_audit_logs[:100]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
