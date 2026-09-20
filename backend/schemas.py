from __future__ import annotations
from typing import Any, List, Optional, Dict
from pydantic import BaseModel, Field

class GPSLocation(BaseModel):
    lat: float
    lon: float
    accuracy_m: float = 2.5
    speed_kph: float = 0.0
    heading_deg: float = 0.0

class CameraStream(BaseModel):
    id: str
    position: str # FRONT, REAR, LEFT_SIDE, RIGHT_SIDE, CABIN
    resolution: str = "1920x1080"
    fps: int = 30
    status: str = "STREAMING" # STREAMING, DEGRADED, OFFLINE

class EdgeDevice(BaseModel):
    id: str
    bus_id: str
    hardware_profile: str = "NVIDIA Jetson Orin Nano 8GB"
    software_version: str = "v2.4.1-prod"
    model_bundle_version: str = "urban-ai-2026.09"
    status: str = "HEALTHY" # HEALTHY, DEGRADED, OFFLINE, STALE
    temperature_c: float = 48.5
    storage_used_pct: float = 42.0
    network_latency_ms: int = 35
    inference_fps: float = 28.4
    queue_depth: int = 0
    last_heartbeat: str

class Bus(BaseModel):
    id: str
    registration: str
    fleet_code: str
    operator_id: str = "BMTC"
    assigned_depot: str
    route_id: str
    status: str = "ONLINE" # ONLINE, OFFLINE, MAINTENANCE
    speed_kph: float
    heading: float
    lat: float
    lon: float
    last_gps_fix: str
    device_id: str

class RouteCorridor(BaseModel):
    id: str
    code: str
    name: str
    origin: str
    destination: str
    distance_km: float
    avg_transit_min: int
    congestion_level: str # LOW, MODERATE, HIGH, SEVERE
    active_buses: int

class ANPRCandidate(BaseModel):
    plate_text: str
    confidence: float
    crop_url: Optional[str] = None
    char_confidences: List[float] = []
    disclaimer: str = "AI-generated candidate requiring human verification."

class DetectionBox(BaseModel):
    label: str
    confidence: float
    bbox: List[float] # [ymin, xmin, ymax, xmax] normalized or pixel
    track_id: Optional[int] = None

class UrbanEvent(BaseModel):
    id: str
    event_type: str # ROAD_DEFECT, INFRASTRUCTURE, TRAFFIC, SAFETY_INCIDENT
    event_subtype: str # POTHOLE, DAMAGED_ROAD, MISSING_DIVIDER, MISSING_ZEBRA_CROSSING, etc.
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    occurred_at: str
    road_name: str
    corridor_id: str
    bus_id: str
    route_id: str
    camera_id: str
    lat: float
    lon: float
    model_name: str
    model_version: str
    review_status: str = "PENDING" # PENDING, VERIFIED, REJECTED, UNCERTAIN
    alert_status: str = "NEW" # NEW, ACKNOWLEDGED, ASSIGNED, RESOLVED
    metadata: Dict[str, Any] = {}
    anpr: Optional[ANPRCandidate] = None
    detections: List[DetectionBox] = []
    evidence_url: Optional[str] = None

class EventReviewPatch(BaseModel):
    review_status: Optional[str] = None # VERIFIED, REJECTED, UNCERTAIN, PENDING
    alert_status: Optional[str] = None # ACKNOWLEDGED, ASSIGNED, RESOLVED
    review_notes: Optional[str] = None
    reviewer_role: Optional[str] = None

class Alert(BaseModel):
    id: str
    event_id: str
    category: str # ROAD_HAZARD, TRAFFIC_CONGESTION, SAFETY_INCIDENT, FLEET_HEALTH
    severity: str
    title: str
    description: str
    state: str = "NEW" # NEW, ACKNOWLEDGED, ASSIGNED, RESOLVED
    assigned_to: Optional[str] = None
    created_at: str
    updated_at: str

class AlertPatch(BaseModel):
    state: Optional[str] = None
    assigned_to: Optional[str] = None

class RoadSegmentHealth(BaseModel):
    id: str
    corridor_name: str
    length_km: float
    condition_score: int # 0 to 100
    status: str # GOOD, MODERATE, POOR, CRITICAL
    pothole_count: int
    infrastructure_issues: int
    last_inspected: str

class TrafficMetrics(BaseModel):
    corridor_id: str
    corridor_name: str
    avg_speed_kph: float
    baseline_speed_kph: float
    delay_minutes: int
    density_vph: int
    congestion_status: str

class AuditLog(BaseModel):
    id: str
    timestamp: str
    user_role: str
    action: str
    target_entity: str
    target_id: str
    details: str

class SystemCounts(BaseModel):
    active_buses: int
    total_buses: int
    devices_online: int
    events_today: int
    critical_alerts: int
    potholes_detected: int
    congestion_hotspots: int
    incidents_under_review: int
    city_coverage_pct: float
    average_confidence: float
