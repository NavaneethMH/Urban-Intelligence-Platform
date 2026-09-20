"""
Deterministic Bengaluru urban intelligence seed data for INNOVEXA Urban Intelligence Platform.
Problem Statement 26124 (BEL / Smart Automation / SIH 2025).
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any

# Corridors and Routes across Bengaluru
ROUTES = [
    {
        "id": "R-500D",
        "code": "500D",
        "name": "Outer Ring Road Express",
        "origin": "Silk Board Junction",
        "destination": "Hebbal Flyover",
        "distance_km": 32.4,
        "avg_transit_min": 78,
        "congestion_level": "HIGH",
        "active_buses": 6,
        "waypoints": [
            {"lat": 12.9176, "lon": 77.6234, "name": "Silk Board"},
            {"lat": 12.9260, "lon": 77.6762, "name": "Bellandur EcoSpace"},
            {"lat": 12.9562, "lon": 77.7011, "name": "Marathahalli Bridge"},
            {"lat": 12.9984, "lon": 77.6789, "name": "KR Puram Hanging Bridge"},
            {"lat": 13.0182, "lon": 77.6251, "name": "Kalyan Nagar Ring Rd"},
            {"lat": 13.0358, "lon": 77.5970, "name": "Hebbal Flyover"},
        ]
    },
    {
        "id": "R-335E",
        "code": "335E",
        "name": "East Tech Corridor",
        "origin": "Kempegowda Bus Station",
        "destination": "ITPB Whitefield",
        "distance_km": 24.2,
        "avg_transit_min": 65,
        "congestion_level": "SEVERE",
        "active_buses": 5,
        "waypoints": [
            {"lat": 12.9774, "lon": 77.5708, "name": "Majestic"},
            {"lat": 12.9734, "lon": 77.6074, "name": "MG Road / Trinity"},
            {"lat": 12.9644, "lon": 77.6413, "name": "Domlur Flyover"},
            {"lat": 12.9591, "lon": 77.6644, "name": "Old Airport Road HAL"},
            {"lat": 12.9585, "lon": 77.7121, "name": "Kundalahalli Gate"},
            {"lat": 12.9863, "lon": 77.7337, "name": "ITPB Whitefield"},
        ]
    },
    {
        "id": "R-KIAS8",
        "code": "KIAS-8",
        "name": "Airport Vayu Vajra",
        "origin": "Electronic City Wipro Gate",
        "destination": "Kempegowda Intl Airport",
        "distance_km": 54.0,
        "avg_transit_min": 95,
        "congestion_level": "MODERATE",
        "active_buses": 5,
        "waypoints": [
            {"lat": 12.8452, "lon": 77.6602, "name": "Electronic City"},
            {"lat": 12.9176, "lon": 77.6234, "name": "Silk Board"},
            {"lat": 12.9352, "lon": 77.6245, "name": "Koramangala 100ft"},
            {"lat": 12.9984, "lon": 77.5921, "name": "Mekhri Circle"},
            {"lat": 13.0358, "lon": 77.5970, "name": "Hebbal"},
            {"lat": 13.1986, "lon": 77.7066, "name": "Airport Terminal 2"},
        ]
    },
    {
        "id": "R-356M",
        "code": "356M",
        "name": "Hosur Road Arterial",
        "origin": "Kempegowda Bus Station",
        "destination": "Attibele Border",
        "distance_km": 34.5,
        "avg_transit_min": 72,
        "congestion_level": "HIGH",
        "active_buses": 4,
        "waypoints": [
            {"lat": 12.9774, "lon": 77.5708, "name": "Majestic"},
            {"lat": 12.9388, "lon": 77.5960, "name": "Dairy Circle"},
            {"lat": 12.9176, "lon": 77.6234, "name": "Silk Board"},
            {"lat": 12.9022, "lon": 77.6364, "name": "Bommanahalli"},
            {"lat": 12.8452, "lon": 77.6602, "name": "Electronic City Toll"},
            {"lat": 12.7801, "lon": 77.7681, "name": "Attibele"},
        ]
    },
    {
        "id": "R-201R",
        "code": "201R",
        "name": "South-East Connector",
        "origin": "Banashankari TTMC",
        "destination": "CV Raman Nagar",
        "distance_km": 21.0,
        "avg_transit_min": 52,
        "congestion_level": "MODERATE",
        "active_buses": 4,
        "waypoints": [
            {"lat": 12.9156, "lon": 77.5736, "name": "Banashankari"},
            {"lat": 12.9250, "lon": 77.5938, "name": "Jayanagar 4th Block"},
            {"lat": 12.9352, "lon": 77.6245, "name": "Koramangala"},
            {"lat": 12.9644, "lon": 77.6413, "name": "Domlur"},
            {"lat": 12.9856, "lon": 77.6631, "name": "CV Raman Nagar DRDO"},
        ]
    },
    {
        "id": "R-215H",
        "code": "215H",
        "name": "Central Metro Feed",
        "origin": "Kempegowda Bus Station",
        "destination": "Indiranagar 100ft Rd",
        "distance_km": 14.8,
        "avg_transit_min": 44,
        "congestion_level": "MODERATE",
        "active_buses": 4,
        "waypoints": [
            {"lat": 12.9774, "lon": 77.5708, "name": "Majestic"},
            {"lat": 12.9840, "lon": 77.6033, "name": "Shivaji Nagar"},
            {"lat": 12.9780, "lon": 77.6234, "name": "Ulsoor Lake"},
            {"lat": 12.9698, "lon": 77.6425, "name": "Indiranagar 100ft Rd"},
        ]
    },
    {
        "id": "R-226N",
        "code": "226N",
        "name": "Mysore Road Corridor",
        "origin": "Kengeri Satellite Town",
        "destination": "Kempegowda Bus Station",
        "distance_km": 18.6,
        "avg_transit_min": 48,
        "congestion_level": "LOW",
        "active_buses": 4,
        "waypoints": [
            {"lat": 12.9123, "lon": 77.4812, "name": "Kengeri"},
            {"lat": 12.9391, "lon": 77.5214, "name": "Nayandahalli"},
            {"lat": 12.9554, "lon": 77.5521, "name": "Sirsi Circle"},
            {"lat": 12.9774, "lon": 77.5708, "name": "Majestic"},
        ]
    },
    {
        "id": "R-342F",
        "code": "342F",
        "name": "Sarjapur Tech Arterial",
        "origin": "KR Market",
        "destination": "Sarjapur Town",
        "distance_km": 28.3,
        "avg_transit_min": 68,
        "congestion_level": "HIGH",
        "active_buses": 4,
        "waypoints": [
            {"lat": 12.9634, "lon": 77.5752, "name": "KR Market"},
            {"lat": 12.9281, "lon": 77.6450, "name": "Agara Junction"},
            {"lat": 12.9182, "lon": 77.6712, "name": "Bellandur Gate"},
            {"lat": 12.9094, "lon": 77.6974, "name": "Carmelaram"},
            {"lat": 12.8621, "lon": 77.7852, "name": "Sarjapur"},
        ]
    }
]

# Build 36 Buses and Edge Devices
DEPOTS = ["Depot 25 (HSR Layout)", "Depot 18 (Whitefield)", "Depot 7 (Subhash Nagar)", "Depot 31 (Electronic City)"]

def generate_seed_fleet():
    now = datetime.now(timezone.utc)
    buses = []
    devices = []
    
    # 36 buses distributed across routes
    for i in range(36):
        bus_idx = i + 1
        bus_id = f"BUS-{str(bus_idx).padStart(3, '0') if hasattr(str(bus_idx), 'padStart') else f'{bus_idx:03d}'}"
        route = ROUTES[i % len(ROUTES)]
        depot = DEPOTS[i % len(DEPOTS)]
        
        # Position interpolation along route waypoints
        wps = route["waypoints"]
        wp_step = (i * 2) % len(wps)
        base_wp = wps[wp_step]
        next_wp = wps[(wp_step + 1) % len(wps)]
        
        fraction = ((i * 17) % 100) / 100.0
        lat = round(base_wp["lat"] + (next_wp["lat"] - base_wp["lat"]) * fraction, 6)
        lon = round(base_wp["lon"] + (next_wp["lon"] - base_wp["lon"]) * fraction, 6)
        
        status = "OFFLINE" if bus_idx in [11, 27] else "ONLINE"
        speed = 0.0 if status == "OFFLINE" else round(18.0 + (i * 3.7) % 32.0, 1)
        heading = (i * 47) % 360
        reg = f"KA 01 F {4200 + bus_idx}"
        
        buses.append({
            "id": bus_id,
            "registration": reg,
            "fleet_code": f"BMTC-EV-{bus_idx:03d}",
            "operator_id": "BMTC",
            "assigned_depot": depot,
            "route_id": route["id"],
            "status": status,
            "speed_kph": speed,
            "heading": heading,
            "lat": lat,
            "lon": lon,
            "last_gps_fix": (now - timedelta(seconds=i * 12)).isoformat(),
            "device_id": f"EDGE-{bus_idx:03d}",
        })
        
        # Device status
        dev_status = "OFFLINE" if bus_idx in [11, 27] else "STALE" if bus_idx == 19 else "DEGRADED" if bus_idx in [6, 23] else "HEALTHY"
        devices.append({
            "id": f"EDGE-{bus_idx:03d}",
            "bus_id": bus_id,
            "hardware_profile": "NVIDIA Jetson Orin Nano 8GB",
            "software_version": "v2.4.1-prod",
            "model_bundle_version": "urban-ai-2026.09",
            "status": dev_status,
            "temperature_c": round(46.0 + (i * 1.8) % 22.0, 1),
            "storage_used_pct": round(38.0 + (i * 2.3) % 48.0, 1),
            "network_latency_ms": 180 if dev_status == "DEGRADED" else 42 + (i * 7) % 45,
            "inference_fps": 0.0 if dev_status == "OFFLINE" else 14.2 if dev_status == "DEGRADED" else 28.6,
            "queue_depth": 14 if dev_status == "DEGRADED" else 0,
            "last_heartbeat": (now - timedelta(minutes=45 if dev_status == "STALE" else 120 if dev_status == "OFFLINE" else 0, seconds=i * 5)).isoformat(),
        })
        
    return buses, devices

BUSES, DEVICES = generate_seed_fleet()

# Urban Events (130+ distinct, realistic events)
def generate_seed_events():
    now = datetime.now(timezone.utc)
    events = []
    
    EVENT_PROFILES = [
        # (type, subtype, severity, conf, road, corridor, detection_labels, is_incident)
        ("ROAD_DEFECT", "POTHOLE", "HIGH", 0.94, "Outer Ring Road (EcoSpace Service Lane)", "R-500D", ["POTHOLE 94%", "ROAD_SURFACE 98%"], False),
        ("ROAD_DEFECT", "POTHOLE", "CRITICAL", 0.96, "Silk Board Flyover Underpass", "R-500D", ["POTHOLE 96%", "ROAD_SURFACE 99%"], False),
        ("ROAD_DEFECT", "DAMAGED_ROAD", "MEDIUM", 0.88, "Marathahalli Main Ring Rd", "R-500D", ["DAMAGED_SURFACE 88%"], False),
        ("ROAD_DEFECT", "POTHOLE", "HIGH", 0.91, "Old Airport Road (Opposite Manipal Hospital)", "R-335E", ["POTHOLE 91%"], False),
        ("ROAD_DEFECT", "POTHOLE", "MEDIUM", 0.87, "Whitefield Main Road near Varthur Kodi", "R-335E", ["POTHOLE 87%"], False),
        ("ROAD_DEFECT", "DAMAGED_ROAD", "HIGH", 0.89, "Hosur Road near Kudlu Gate Junction", "R-356M", ["ROAD_SUBSIDENCE 89%"], False),
        ("ROAD_DEFECT", "POTHOLE", "CRITICAL", 0.95, "Bannerghatta Rd (Near Dairy Circle)", "R-356M", ["POTHOLE 95%"], False),
        ("ROAD_DEFECT", "POTHOLE", "LOW", 0.82, "Mysore Road Nayandahalli Flyover descent", "R-226N", ["POTHOLE 82%"], False),
        ("ROAD_DEFECT", "DAMAGED_ROAD", "MEDIUM", 0.86, "Sarjapur Road Carmelaram Railway Crossing", "R-342F", ["DAMAGED_SURFACE 86%"], False),
        
        ("INFRASTRUCTURE", "MISSING_DIVIDER", "HIGH", 0.92, "Bellary Road Expressway Hebbal Merge", "R-KIAS8", ["DEFECTIVE_DIVIDER 92%"], False),
        ("INFRASTRUCTURE", "MISSING_ZEBRA_CROSSING", "HIGH", 0.89, "Koramangala 80ft Road Junction", "R-201R", ["FADED_ZEBRA_MARKING 89%"], False),
        ("INFRASTRUCTURE", "DAMAGED_SIGNBOARD", "MEDIUM", 0.91, "Indiranagar 100ft Rd Metro Pillar 44", "R-215H", ["DAMAGED_SIGN_POST 91%"], False),
        ("INFRASTRUCTURE", "MISSING_SIGNBOARD", "MEDIUM", 0.85, "KR Puram Hanging Bridge Ramp", "R-500D", ["MISSING_SPEED_LIMIT_SIGN 85%"], False),
        ("INFRASTRUCTURE", "WATERLOGGING", "CRITICAL", 0.96, "Bellandur Central Mall Underpass", "R-500D", ["WATER_ACCUMULATION_DEPTH_20CM 96%"], False),
        ("INFRASTRUCTURE", "WATERLOGGING", "HIGH", 0.93, "Domlur Intermediate Ring Road", "R-201R", ["WATERLOGGING 93%"], False),
        ("INFRASTRUCTURE", "MISSING_DIVIDER", "MEDIUM", 0.88, "Agara Lake Outer Ring Road", "R-342F", ["BROKEN_CONCRETE_MEDIAN 88%"], False),
        
        ("TRAFFIC", "CONGESTION", "SEVERE", 0.95, "Silk Board Junction Northbound", "R-500D", ["VEHICLE_COUNT_84 95%", "AVG_SPEED_6KPH 97%"], False),
        ("TRAFFIC", "BOTTLENECK", "HIGH", 0.92, "Kundalahalli Gate Underpass Entrance", "R-335E", ["BOTTLENECK_DETECTED 92%"], False),
        ("TRAFFIC", "CONGESTION", "HIGH", 0.91, "Hebbal Flyover City-Inbound Merge", "R-KIAS8", ["CONGESTION_HOTSPOT 91%"], False),
        ("TRAFFIC", "BOTTLENECK", "MEDIUM", 0.89, "Bommanahalli Signal Hosur Road", "R-356M", ["SLOW_SPEED_FLOW 89%"], False),
        ("TRAFFIC", "CONGESTION", "HIGH", 0.90, "Marathahalli Multiplex Junction", "R-500D", ["TRAFFIC_DENSITY_1420VPH 90%"], False),
        ("TRAFFIC", "BOTTLENECK", "HIGH", 0.93, "Dairy Circle Flyover Convergence", "R-356M", ["MERGING_BOTTLENECK 93%"], False),
        
        ("SAFETY_INCIDENT", "HIT_AND_RUN_SUSPECTED", "CRITICAL", 0.94, "Outer Ring Road Bellandur Pedestrian Underpass", "R-500D", ["OFFENDING_VEHICLE 94%", "PLATE_CANDIDATE 89%"], True),
        ("SAFETY_INCIDENT", "RASH_DRIVING", "HIGH", 0.91, "Old Airport Road HAL Signal", "R-335E", ["UNSAFE_LANE_CHANGE 91%", "SPEED_OVER_LIMIT 93%"], True),
        ("SAFETY_INCIDENT", "PEDESTRIAN_RISK", "HIGH", 0.89, "Indiranagar 12th Main Road (School Zone)", "R-215H", ["SCHOOL_CHILD_CROSSING 89%", "VULNERABLE_PEDESTRIAN 94%"], False),
        ("SAFETY_INCIDENT", "HIT_AND_RUN_SUSPECTED", "CRITICAL", 0.96, "Hosur Road Electronic City Elevated Descent", "R-356M", ["COLLISION_DETECTED 96%", "SUSPECTED_VEHICLE 92%"], True),
        ("SAFETY_INCIDENT", "RASH_DRIVING", "HIGH", 0.88, "Mysore Road Sirsi Circle Flyover", "R-226N", ["ZIGZAG_OVERTAKING 88%"], True),
        ("SAFETY_INCIDENT", "PEDESTRIAN_RISK", "CRITICAL", 0.93, "Whitefield ITPL Main Gate Crossing", "R-335E", ["PEDESTRIAN_RISK_CONGESTION 93%"], False),
    ]

    ANPR_CANDIDATES = [
        {"plate": "KA 01 AB 4582", "conf": 0.91, "chars": [0.94, 0.92, 0.89, 0.91, 0.95, 0.88, 0.90, 0.92, 0.93, 0.86]},
        {"plate": "KA 03 MH 8912", "conf": 0.88, "chars": [0.90, 0.89, 0.85, 0.88, 0.91, 0.84, 0.87, 0.90, 0.88, 0.86]},
        {"plate": "KA 04 NJ 3241", "conf": 0.94, "chars": [0.96, 0.95, 0.92, 0.94, 0.96, 0.92, 0.95, 0.93, 0.94, 0.91]},
        {"plate": "KA 05 EQ 2190", "conf": 0.86, "chars": [0.88, 0.87, 0.84, 0.86, 0.89, 0.83, 0.85, 0.88, 0.87, 0.83]},
        {"plate": "KA 51 ME 7709", "conf": 0.92, "chars": [0.95, 0.93, 0.90, 0.92, 0.96, 0.91, 0.93, 0.91, 0.93, 0.89]},
    ]

    # Generate 132 structured events
    for idx in range(132):
        prof = EVENT_PROFILES[idx % len(EVENT_PROFILES)]
        ev_type, ev_subtype, severity, conf_base, road_name, corridor_id, detections, is_incident = prof
        
        bus_idx = (idx * 3) % 36
        bus = BUSES[bus_idx]
        
        # Perturb lat/lon slightly around bus position or corridor
        jitter_lat = ((idx * 13) % 100 - 50) * 0.0004
        jitter_lon = ((idx * 17) % 100 - 50) * 0.0004
        event_lat = round(bus["lat"] + jitter_lat, 6)
        event_lon = round(bus["lon"] + jitter_lon, 6)
        
        occurred_time = now - timedelta(hours=(idx * 2) % 48, minutes=(idx * 11) % 60, seconds=idx * 7)
        confidence = round(min(0.99, conf_base + ((idx % 7) - 3) * 0.01), 2)
        
        # Camera ID
        cam_role = "CAM-FRONT" if idx % 4 != 0 else "CAM-REAR" if idx % 4 == 1 else "CAM-LEFT" if idx % 4 == 2 else "CAM-RIGHT"
        cam_id = f"{cam_role}-{bus['id'].split('-')[1]}"
        
        # ANPR assignment for incident profiles
        anpr_data = None
        if is_incident or (ev_type == "SAFETY_INCIDENT" and idx % 3 == 0):
            cand = ANPR_CANDIDATES[idx % len(ANPR_CANDIDATES)]
            anpr_data = {
                "plate_text": cand["plate"],
                "confidence": cand["conf"],
                "crop_url": f"/static/anpr_crops/{cand['plate'].replace(' ', '_')}.jpg",
                "char_confidences": cand["chars"],
                "disclaimer": "AI candidate extraction requiring human verification. Does not establish legal liability."
            }
            
        # Review status: mix of PENDING, VERIFIED, REJECTED, UNCERTAIN
        review_status = "VERIFIED" if idx % 7 == 0 else "REJECTED" if idx % 19 == 0 else "UNCERTAIN" if idx % 11 == 0 else "PENDING"
        alert_status = "ASSIGNED" if review_status == "VERIFIED" else "ACKNOWLEDGED" if idx % 5 == 0 else "NEW"
        
        # Repeat observations counter for road defects
        repeat_obs = 1 + (idx % 8) if ev_type == "ROAD_DEFECT" else 1
        
        events.append({
            "id": f"EVT-2026-0918-{idx+1:04d}",
            "event_type": ev_type,
            "event_subtype": ev_subtype,
            "severity": severity,
            "confidence": confidence,
            "occurred_at": occurred_time.isoformat(),
            "road_name": road_name,
            "corridor_id": corridor_id,
            "bus_id": bus["id"],
            "route_id": bus["route_id"],
            "camera_id": cam_id,
            "lat": event_lat,
            "lon": event_lon,
            "model_name": "YOLOv8-UrbanIntelligence" if ev_type != "SAFETY_INCIDENT" else "YOLOv8-DeepSORT-CRNN",
            "model_version": "v2.4.1",
            "review_status": review_status,
            "alert_status": alert_status,
            "metadata": {
                "repeat_observations": repeat_obs,
                "estimated_depth_cm": (4 + (idx % 9) * 2) if ev_subtype == "POTHOLE" else None,
                "estimated_width_cm": (25 + (idx % 15) * 5) if ev_subtype == "POTHOLE" else None,
                "lane_position": ["LANE_1_MEDIAN", "LANE_2_CENTER", "LANE_3_CURB", "SERVICE_ROAD"][idx % 4],
                "reporting_buses": [bus["id"], f"BUS-{(bus_idx + 4) % 36 + 1:03d}"],
                "inference_ms": 32.5 + (idx % 8) * 1.5,
                "weather": "CLEAR" if idx % 5 != 0 else "OVERCAST"
            },
            "anpr": anpr_data,
            "detections": [
                {"label": det.split()[0], "confidence": float(det.split()[1].replace('%', '')) / 100.0, "bbox": [0.3, 0.25, 0.7, 0.75], "track_id": 101 + idx}
                for det in detections
            ],
            "evidence_url": f"/static/evidence/evt_{idx+1}.jpg"
        })
        
    return events

EVENTS = generate_seed_events()

# Operational Alerts (28 seeded alerts)
def generate_seed_alerts(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    alerts = []
    
    # Take high severity events + device alerts
    alert_candidates = [e for e in events if e["severity"] in ["CRITICAL", "HIGH"]][:24]
    
    for i, e in enumerate(alert_candidates):
        state = "RESOLVED" if i % 6 == 0 else "ASSIGNED" if i % 4 == 0 else "ACKNOWLEDGED" if i % 3 == 0 else "NEW"
        cat = "ROAD_HAZARD" if e["event_type"] == "ROAD_DEFECT" else "SAFETY_INCIDENT" if e["event_type"] == "SAFETY_INCIDENT" else "TRAFFIC_CONGESTION"
        alerts.append({
            "id": f"ALT-2026-0918-{i+1:04d}",
            "event_id": e["id"],
            "category": cat,
            "severity": e["severity"],
            "title": f"{e['event_subtype'].replace('_', ' ').title()} on {e['road_name']}",
            "description": f"Detected by {e['bus_id']} ({e['camera_id']}) with {(e['confidence']*100):.0f}% AI confidence.",
            "state": state,
            "assigned_to": "Civic Works BBMP Zone-4" if cat == "ROAD_HAZARD" else "Traffic Police Control Room" if cat == "SAFETY_INCIDENT" else "BMTC Operations Hub",
            "created_at": e["occurred_at"],
            "updated_at": (now - timedelta(minutes=i * 5)).isoformat()
        })
        
    # Add 4 Fleet Health Alerts
    for j, dev_id in enumerate(["EDGE-011", "EDGE-027", "EDGE-019", "EDGE-006"]):
        state = "NEW" if j < 2 else "ACKNOWLEDGED"
        alerts.append({
            "id": f"ALT-2026-0918-{len(alert_candidates)+j+1:04d}",
            "event_id": dev_id,
            "category": "FLEET_HEALTH",
            "severity": "HIGH" if j < 2 else "MEDIUM",
            "title": f"Device Telemetry Alert: {dev_id}",
            "description": f"Device {dev_id} on BUS-0{dev_id.split('-')[1]} reported {'HEARTBEAT_LOSS' if j < 2 else 'HIGH_TEMPERATURE_LATENCY'}.",
            "state": state,
            "assigned_to": "Depot Systems Engineering",
            "created_at": (now - timedelta(hours=j+1)).isoformat(),
            "updated_at": (now - timedelta(minutes=j*15)).isoformat()
        })
        
    return alerts

ALERTS = generate_seed_alerts(EVENTS)

# Road Condition Segment Health Metrics
ROAD_SEGMENTS = [
    {"id": "SEG-01", "corridor_name": "Outer Ring Road (Silk Board to Marathahalli)", "length_km": 9.2, "condition_score": 62, "status": "POOR", "pothole_count": 14, "infrastructure_issues": 6, "last_inspected": "10 min ago"},
    {"id": "SEG-02", "corridor_name": "Outer Ring Road (Marathahalli to Hebbal)", "length_km": 14.8, "condition_score": 78, "status": "MODERATE", "pothole_count": 6, "infrastructure_issues": 3, "last_inspected": "14 min ago"},
    {"id": "SEG-03", "corridor_name": "Old Airport Road Arterial", "length_km": 11.4, "condition_score": 71, "status": "MODERATE", "pothole_count": 8, "infrastructure_issues": 4, "last_inspected": "8 min ago"},
    {"id": "SEG-04", "corridor_name": "Hosur Road Expressway Service Lanes", "length_km": 18.2, "condition_score": 54, "status": "CRITICAL", "pothole_count": 19, "infrastructure_issues": 9, "last_inspected": "5 min ago"},
    {"id": "SEG-05", "corridor_name": "Bellary Road Airport Corridor", "length_km": 28.5, "condition_score": 92, "status": "GOOD", "pothole_count": 2, "infrastructure_issues": 1, "last_inspected": "2 min ago"},
    {"id": "SEG-06", "corridor_name": "Koramangala 100ft Intermediate Ring Rd", "length_km": 7.6, "condition_score": 81, "status": "GOOD", "pothole_count": 3, "infrastructure_issues": 2, "last_inspected": "18 min ago"},
    {"id": "SEG-07", "corridor_name": "Mysore Road Metro Corridor", "length_km": 12.0, "condition_score": 86, "status": "GOOD", "pothole_count": 4, "infrastructure_issues": 1, "last_inspected": "22 min ago"},
    {"id": "SEG-08", "corridor_name": "Sarjapur Road Tech Corridor", "length_km": 15.3, "condition_score": 58, "status": "POOR", "pothole_count": 16, "infrastructure_issues": 7, "last_inspected": "12 min ago"},
]

# Hourly Traffic Density and Congestion Profile
HOURLY_TRAFFIC = [
    {"hour": "06:00", "density_vph": 480, "avg_speed_kph": 38.2, "congestion_index": 22},
    {"hour": "07:00", "density_vph": 820, "avg_speed_kph": 32.5, "congestion_index": 44},
    {"hour": "08:00", "density_vph": 1340, "avg_speed_kph": 21.4, "congestion_index": 78},
    {"hour": "09:00", "density_vph": 1780, "avg_speed_kph": 14.8, "congestion_index": 94},
    {"hour": "10:00", "density_vph": 1620, "avg_speed_kph": 16.2, "congestion_index": 88},
    {"hour": "11:00", "density_vph": 1210, "avg_speed_kph": 24.1, "congestion_index": 62},
    {"hour": "12:00", "density_vph": 1050, "avg_speed_kph": 26.8, "congestion_index": 52},
    {"hour": "13:00", "density_vph": 980, "avg_speed_kph": 28.0, "congestion_index": 48},
    {"hour": "14:00", "density_vph": 1120, "avg_speed_kph": 25.4, "congestion_index": 56},
    {"hour": "15:00", "density_vph": 1290, "avg_speed_kph": 22.8, "congestion_index": 65},
    {"hour": "16:00", "density_vph": 1490, "avg_speed_kph": 19.5, "congestion_index": 75},
    {"hour": "17:00", "density_vph": 1820, "avg_speed_kph": 13.9, "congestion_index": 96},
    {"hour": "18:00", "density_vph": 1910, "avg_speed_kph": 12.4, "congestion_index": 98},
    {"hour": "19:00", "density_vph": 1750, "avg_speed_kph": 15.1, "congestion_index": 91},
    {"hour": "20:00", "density_vph": 1380, "avg_speed_kph": 21.0, "congestion_index": 70},
    {"hour": "21:00", "density_vph": 920, "avg_speed_kph": 29.5, "congestion_index": 42},
    {"hour": "22:00", "density_vph": 610, "avg_speed_kph": 35.8, "congestion_index": 28},
]

# Vehicle Class Composition Breakdown
VEHICLE_CLASSIFICATION = {
    "Two-Wheeler": 41.2,
    "Passenger Car": 34.6,
    "Auto-Rickshaw": 12.8,
    "Public/Commercial Bus": 7.4,
    "Light/Heavy Commercial Truck": 4.0
}

# Audit Logs
AUDIT_LOGS = [
    {"id": "AUD-01", "timestamp": "2026-09-18T18:14:22Z", "user_role": "Control Room Operator", "action": "EVENT_ACKNOWLEDGED", "target_entity": "EVENT", "target_id": "EVT-2026-0918-0001", "details": "Acknowledged critical pothole on Silk Board Underpass."},
    {"id": "AUD-02", "timestamp": "2026-09-18T18:12:05Z", "user_role": "Traffic/Police Reviewer", "action": "ANPR_REVIEW_VERIFIED", "target_entity": "INCIDENT", "target_id": "EVT-2026-0918-0023", "details": "Verified ANPR candidate KA 01 AB 4582 for hit-and-run investigation."},
    {"id": "AUD-03", "timestamp": "2026-09-18T17:55:40Z", "user_role": "Road/Civic Officer", "action": "WORK_ORDER_DISPATCH", "target_entity": "ROAD_DEFECT", "target_id": "EVT-2026-0918-0004", "details": "Dispatched emergency asphalt repair crew to Old Airport Road."},
    {"id": "AUD-04", "timestamp": "2026-09-18T17:30:11Z", "user_role": "System Administrator", "action": "EDGE_MODEL_HOTSWAP", "target_entity": "FLEET_MODEL", "target_id": "YOLOv8-v2.4.1", "details": "Model bundle urban-ai-2026.09 validated on 34 edge devices."},
]

def get_system_counts():
    active_buses = sum(1 for b in BUSES if b["status"] == "ONLINE")
    devices_online = sum(1 for d in DEVICES if d["status"] == "HEALTHY")
    critical_alerts = sum(1 for a in ALERTS if a["severity"] == "CRITICAL" and a["state"] != "RESOLVED")
    potholes = sum(1 for e in EVENTS if e["event_subtype"] == "POTHOLE")
    congestion = sum(1 for e in EVENTS if e["event_type"] == "TRAFFIC")
    incidents = sum(1 for e in EVENTS if e["event_type"] == "SAFETY_INCIDENT" and e["review_status"] == "PENDING")
    
    return {
        "active_buses": active_buses,
        "total_buses": len(BUSES),
        "devices_online": devices_online,
        "events_today": len(EVENTS),
        "critical_alerts": critical_alerts,
        "potholes_detected": potholes,
        "congestion_hotspots": congestion,
        "incidents_under_review": incidents,
        "city_coverage_pct": 84.6,
        "average_confidence": 91.2
    }
