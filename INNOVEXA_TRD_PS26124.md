**Technical Requirements Document (TRD)**

**AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet**

System architecture, components, interfaces, data, security, deployment and engineering constraints

| Problem Statement ID | 26124                            |
|----------------------|----------------------------------|
| Organization         | Bharat Electronics Limited (BEL) |
| Theme                | Smart Automation                 |
| Category             | Software                         |
| Team                 | INNOVEXA                         |

## Source basis

Prepared from the uploaded BEL problem statement and the INNOVEXA SIH 2025 idea presentation. Where the source does not prescribe a design detail, the document labels it as an implementation assumption or recommendation.

# 1. Source-Derived Product Context

The project transforms public transport buses into mobile urban sensing units. Multi-camera video is processed onboard to detect road defects, traffic conditions, infrastructure deficiencies, vulnerable pedestrian situations, and incident vehicles. The fleet-wide observations are aggregated centrally into GIS maps, heat maps, alerts, reports, route-delay analytics, and planning insights.

## 1.1 Source-defined capabilities

- Analyse front, rear, side and cabin camera streams on buses.

- Detect potholes, damaged roads, missing dividers, missing zebra crossings, damaged/missing traffic signboards, waterlogging and other road hazards.

- Detect, classify and count vehicles to estimate density and identify bottlenecks.

- Identify vulnerable pedestrian situations, including school children crossing roads.

- Track offending vehicles during incidents and extract registration number with confidence score, timestamp and GPS location.

- Aggregate fleet observations in a central GIS view and generate congestion heat maps, road-condition maps, incident reports and infrastructure-deficiency insights.

- Analyse origin-destination traffic patterns and estimate route delays.

- Minimize bandwidth by performing intelligent video processing at the edge and transmitting actionable events/evidence rather than continuous raw video.

# 2. Technical Architecture

The proposed implementation follows an edge-first, event-driven architecture. Video is processed close to the cameras on an NVIDIA Jetson-class or equivalent edge AI device; compact event packages are synchronized to Python-based central API services backed by PostgreSQL/PostGIS; React/JavaScript GIS views present operational intelligence.

## 2.1 Logical data flow

1.  Camera adapters ingest configured streams and normalize timestamps/frame metadata.

2.  Edge inference pipeline runs object/road/infrastructure detectors, trackers and OCR/ANPR as applicable.

3.  Event composer fuses inference, GPS/GNSS, camera and bus metadata, calculates confidence/severity and selects evidence.

4.  Local event store queues records and media; sync agent sends prioritized messages over 4G/5G/Wi-Fi with retry/backoff.

5.  Central ingestion validates device identity/schema, writes event metadata to PostgreSQL/PostGIS and media to object storage.

6.  Analytics services aggregate spatial/temporal observations into heat maps, road-condition layers, congestion and route analytics.

7.  Web GIS dashboard retrieves data through authenticated APIs/WebSocket/SSE where near-real-time refresh is required.

## 2.2 Component model

| **Layer** | **Component**      | **Responsibilities**                                                              | **Suggested technology**                                  |
|-----------|--------------------|-----------------------------------------------------------------------------------|-----------------------------------------------------------|
| Edge      | Video Ingest       | RTSP/file/device capture, stream health, frame sampling, timestamp normalization. | OpenCV/GStreamer integration                              |
| Edge      | Inference Runtime  | Road defects, infrastructure, vehicles, pedestrians; accelerated inference.       | YOLO family + TensorRT/ONNX where appropriate             |
| Edge      | Tracker            | Object association across frames; incident vehicle trajectory.                    | ByteTrack/DeepSORT-class approach (implementation choice) |
| Edge      | OCR/ANPR           | Plate localization, rectification, OCR and confidence aggregation.                | OpenCV + OCR model/service                                |
| Edge      | Event Engine       | Rules, confidence gating, dedup, severity, evidence packaging.                    | Python service                                            |
| Edge      | Telemetry/Sync     | GPS, health, local queue, encrypted API/MQ transport.                             | Python; HTTPS/MQTT optional                               |
| Central   | API Gateway / Auth | Device/user authentication, rate limit, API routing.                              | Reverse proxy + auth provider                             |
| Central   | Ingestion Service  | Schema validation, idempotency, event persistence, media references.              | Python FastAPI-class services                             |
| Central   | Geospatial DB      | Events, roads, routes, device positions, spatial indexes.                         | PostgreSQL + PostGIS                                      |
| Central   | Object Storage     | Evidence images/clips, reports, model packages.                                   | S3-compatible storage                                     |
| Central   | Analytics          | Clustering, heat maps, recurrence, density, route delay, OD analytics.            | Python batch/stream jobs                                  |
| Web       | GIS Dashboard      | Maps, filters, incident review, reports, fleet health.                            | React/JavaScript + web GIS library                        |

# 3. Edge Technical Requirements

| **ID**   | **Requirement**                                                                                                                                        |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| TR-E-001 | Support configurable multi-camera input with per-camera identity and orientation metadata.                                                             |
| TR-E-002 | Maintain monotonic event timestamps and associate each observation with latest valid GPS/GNSS fix.                                                     |
| TR-E-003 | Allow configurable frame sampling/resolution per analytic pipeline to balance accuracy and compute.                                                    |
| TR-E-004 | Run inference locally without a required cloud round trip.                                                                                             |
| TR-E-005 | Persist a bounded local event queue during network outage and synchronize later.                                                                       |
| TR-E-006 | Assign globally unique event IDs and use idempotent central ingestion to prevent duplicate retries.                                                    |
| TR-E-007 | Attach model name/version, threshold and confidence to AI-generated observations.                                                                      |
| TR-E-008 | Support evidence redaction/retention policies as required by deployment governance.                                                                    |
| TR-E-009 | Report health metrics: camera status, inference FPS, CPU/GPU utilization, storage, GPS status, network status, queue depth and software/model version. |
| TR-E-010 | Support signed/verified software and model update packages in production deployment (recommended).                                                     |

# 4. AI/Computer Vision Pipeline

| **Pipeline**     | **Inputs**                      | **Outputs**                                                           | **Engineering notes**                                                                              |
|------------------|---------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Road surface     | Forward/side road-facing frames | pothole/damaged-road bbox or segmentation, confidence, severity proxy | Prefer temporal confirmation across multiple frames to suppress transient false positives.         |
| Infrastructure   | Road-facing frames              | divider/crossing/signboard present/damaged/missing observation        | “Missing” requires contextual logic/reference expectations; validate scope carefully during pilot. |
| Traffic          | Road-facing frames              | vehicle class, track ID, count, density estimate                      | Aggregate by segment/time window; avoid double counting through tracking.                          |
| Pedestrian risk  | Road-facing frames              | pedestrian/school-child crossing event, confidence                    | Risk classification should combine person detection, scene/road zone and motion trajectory.        |
| Incident vehicle | Selected incident frames/video  | vehicle track, representative evidence                                | Preserve timeline across camera transitions only if calibrated/identifiable.                       |
| ANPR             | Vehicle/plate crop              | plate text candidate, per-character/sequence confidence               | Store source crop and reject below threshold; retain alternative candidates where useful.          |

# 5. Central Platform Requirements

| **ID**   | **Requirement**                                                                                                 |
|----------|-----------------------------------------------------------------------------------------------------------------|
| TR-C-001 | Expose authenticated event-ingestion endpoint(s) accepting metadata and evidence references/uploads.            |
| TR-C-002 | Validate event schema and reject/quarantine malformed or unauthorized submissions.                              |
| TR-C-003 | Persist geospatial event geometry using PostGIS and create indexes for time/geometry/class queries.             |
| TR-C-004 | Support spatial clustering and heat-map aggregation by event type, severity and time window.                    |
| TR-C-005 | Expose APIs for map viewport queries, event detail, timeline, analytics, device health and reports.             |
| TR-C-006 | Maintain user roles and data access scopes; record evidence access/export in audit logs.                        |
| TR-C-007 | Support configurable retention/archive policies for metadata and media independently.                           |
| TR-C-008 | Provide monitoring/alerting for ingestion errors, backlog, database health, storage growth and offline devices. |
| TR-C-009 | Support horizontal scaling of stateless API/ingestion workers behind a load balancer.                           |
| TR-C-010 | Support backup and recovery of configuration, metadata and critical evidence according to deployment policy.    |

# 6. Data Model

| **Entity**  | **Key fields**                                                                                                                   |
|-------------|----------------------------------------------------------------------------------------------------------------------------------|
| Bus         | bus_id, operator_id, registration/fleet code, assigned depot, active status                                                      |
| EdgeDevice  | device_id, bus_id, hardware profile, software_version, model_bundle_version, last_seen, health                                   |
| Camera      | camera_id, device_id, position/orientation, stream config, calibration metadata, status                                          |
| GPSFix      | device_id, timestamp, latitude, longitude, speed, heading, accuracy                                                              |
| Event       | event_id, type, subtype, timestamp_start/end, geometry, confidence, severity, status, bus/device/camera/route IDs, model_version |
| Detection   | event_id, class, bbox/segmentation reference, confidence, track_id, attributes                                                   |
| ANPRResult  | event_id, plate_text, confidence, candidate_rank, crop_uri                                                                       |
| Evidence    | evidence_id, event_id, media_type, uri, hash, size, capture timestamp, retention_until                                           |
| RoadSegment | segment_id, geometry, road metadata, jurisdiction                                                                                |
| RouteTrip   | route_id/trip_id, scheduled/actual timing context where available                                                                |
| User/Audit  | user_id, role, action, resource, timestamp, source/IP metadata                                                                   |

# 7. Event Payload Contract (recommended)

Illustrative JSON fields; exact schema to be versioned in implementation:

{  
"schema_version": "1.0",  
"event_id": "uuid",  
"event_type": "ROAD_DEFECT\|TRAFFIC\|INCIDENT\|INFRASTRUCTURE\|PEDESTRIAN_RISK",  
"timestamp_utc": "ISO-8601",  
"device_id": "...", "bus_id": "...", "camera_id": "...",  
"gps": {"lat": 0.0, "lon": 0.0, "accuracy_m": 0.0},  
"confidence": 0.0, "severity": "LOW\|MEDIUM\|HIGH\|CRITICAL",  
"model": {"name": "...", "version": "..."},  
"attributes": {},  
"evidence": \[{"type":"image", "sha256":"...", "upload_ref":"..."}\]  
}

# 8. API and Integration Requirements

| **Interface**                  | **Purpose**                     | **Requirements**                                                                                                |
|--------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Edge → Central Ingestion       | Submit events, health, evidence | TLS; device auth; idempotency key/event ID; payload size limits; resumable/queued evidence upload where needed. |
| Dashboard → API                | Query GIS/events/analytics      | User auth; RBAC; viewport/time/type filters; pagination; server-side aggregation.                               |
| Central → Notification channel | Critical alert dissemination    | Configurable integration via webhook/SMS/email/control-room adapter if later approved; delivery status logged.  |
| Route/schedule data input      | Route delay and OD context      | Import or API adapter; source not specified in uploaded materials and must be defined with authority.           |
| GIS base layers                | Road/administrative context     | Use approved base-map/road network source and coordinate system; licensing/deployment to be defined.            |

# 9. Security and Privacy Architecture

- Device identity: per-device credentials/certificates; revoke compromised devices without fleet-wide key rotation.

- Transport: TLS for all external communications; no plaintext evidence transfer.

- Authorization: role-based permissions for viewer, operator/reviewer, analyst and administrator; least privilege.

- Evidence integrity: content hashes and immutable audit trail for incident evidence; optional trusted timestamp/signing depending on legal use.

- Secrets: stored outside source code, rotated, and never embedded in model/application packages.

- Data minimization: upload only necessary event evidence by default; separate retention rules for metadata and media.

- Logging: security-relevant actions, authentication failures, exports, administrative changes and model/config deployments.

- Privacy: avoid face identification; if people appear incidentally in evidence, access and retention must follow authority policy.

# 10. Performance and Capacity Engineering

| **Dimension**   | **Engineering requirement / sizing method**                                                                                                             |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Edge throughput | Select camera FPS/resolution and model mix so sustained inference does not exceed thermal/power budget; measure dropped-frame rate and GPU utilization. |
| Local storage   | Size for offline queue horizon × expected event/evidence generation rate plus safety margin; evict only per policy.                                     |
| Network         | Prioritize metadata/critical events; compress evidence; adaptive upload under constrained 4G/5G/Wi-Fi.                                                  |
| Database        | Partition high-volume events by time; GiST/SP-GiST indexes for geometry; indexes for event type/device/time.                                            |
| Object storage  | Lifecycle policies, checksums and tiering/expiry for evidence.                                                                                          |
| Map queries     | Pre-aggregate heat-map tiles/cells for large time windows; cap viewport result density.                                                                 |
| Fleet scale     | Load-test with synthetic event rates derived from buses × cameras × event frequency, not raw frame rate.                                                |

# 11. Deployment Topology

| **Environment** | **Purpose**                                 | **Minimum controls**                                                                                       |
|-----------------|---------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Development     | Rapid integration/model experimentation     | Synthetic/sample feeds, local DB, feature branches, unit tests.                                            |
| Pilot/Staging   | Selected buses/routes and authority testers | Production-like TLS/auth, monitoring, controlled model rollout, labeled validation samples.                |
| Production      | Fleet service                               | HA central services, backups, RBAC, audit, observability, signed releases, rollback and incident runbooks. |

# 12. Observability and Operations

- Metrics: events/min by class, inference FPS/latency, confidence distributions, queue depth, upload failures, API latency/error rate, DB/storage growth.

- Logs: structured logs with event/device correlation IDs; avoid unnecessary sensitive payload logging.

- Traces: optional distributed tracing across ingestion → processing → API for central services.

- Alerts: offline edge device, camera failure, GPS stale, high queue depth, ingestion failure spike, database/storage threshold, abnormal model output drift.

- Model monitoring: class frequency, reviewer rejection rate and confidence drift by route/time/weather proxies where available.

# 13. Test Strategy

| **Level**        | **Coverage**                                                                                                              |
|------------------|---------------------------------------------------------------------------------------------------------------------------|
| Unit             | Schema validation, geospatial functions, dedup/rules, OCR post-processing, auth policy, report calculations.              |
| Model evaluation | Per-class precision/recall, confusion matrix, night/rain/occlusion slices, OCR exact/character accuracy.                  |
| Edge integration | Multi-stream ingest, GPS association, offline queue, restart recovery, thermal soak, storage pressure.                    |
| End-to-end       | Known video → expected events → central storage → GIS rendering → review/export.                                          |
| Load             | Ingestion and map query throughput at pilot and projected fleet event rates.                                              |
| Security         | Authentication/authorization, credential revocation, dependency scanning, API abuse/rate limit and evidence access audit. |
| Field acceptance | Route drive tests with manual ground truth sampling and authority review.                                                 |

# 14. Open Technical Decisions

- Exact Jetson/edge device model and camera interfaces/codecs.

- Model family/version, training data and licensing for each detection task.

- Whether message transport is HTTPS-only or includes MQTT/Kafka-class messaging centrally.

- Object storage/cloud/on-prem deployment platform and high-availability topology.

- Approved map/road-network data source and route/schedule integration.

- Formal data retention, evidence chain-of-custody and privacy requirements from deploying authority.
