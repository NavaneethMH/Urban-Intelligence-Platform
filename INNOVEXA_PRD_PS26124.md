**Product Requirements Document (PRD)**

**AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet**

Product vision, users, scope, features, success criteria and release definition

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

# 2. Product Vision and Objectives

Vision: Create a fleet-scale urban intelligence layer that continuously observes city roads through existing public transport movement and converts video into geotagged, actionable events for transport, civic, traffic and planning authorities.

| **Objective**               | **Product outcome**                                                                                                      |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Proactive road maintenance  | Earlier visibility of defects and infrastructure deficiencies, with location, evidence and severity/confidence metadata. |
| Improved traffic management | Measurable vehicle density, congestion hotspots, bottlenecks and route delay indicators.                                 |
| Enhanced public safety      | Timely alerts for hazards, vulnerable pedestrians and incident vehicles.                                                 |
| Evidence-based planning     | Historical, spatial and route-level analytics to support prioritization and urban planning.                              |
| Bandwidth efficiency        | Edge inference filters continuous video into compact event packages and selected evidence clips/frames.                  |

# 3. Target Users and Stakeholders

| **Stakeholder**                     | **Primary needs**                                                                                            |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------|
| Transport authority / control room  | Fleet-wide GIS view, route delay, congestion, incident awareness and operational reports.                    |
| Road / civic agency                 | Road-condition map, defect prioritization, repeat-occurrence history and maintenance evidence.               |
| Traffic management / police         | Bottlenecks, vehicle density, rash/hit-and-run event evidence, ANPR results and geotagged incident timeline. |
| Urban planners / analysts           | Historical trends, origin-destination patterns, spatial analytics and exportable datasets.                   |
| Bus operator / system administrator | Device health, camera status, configuration, model versioning, connectivity and audit logs.                  |

# 4. Product Scope

## 4.1 In scope

- Onboard ingestion of multiple bus camera streams and GPS/GNSS telemetry.

- Edge AI inference for road hazards, infrastructure elements, vehicles, pedestrians, tracking and OCR/ANPR.

- Event scoring, deduplication, evidence selection and store-and-forward communications.

- Central API, event ingestion, geospatial database and fleet/device registry.

- Web GIS dashboard with event layers, heat maps, filters, search, incident review and reports.

- Operational analytics for road condition, traffic density/bottlenecks, route delay and fleet observations.

- Role-based access, auditability, retention controls and secure transport of incident evidence.

- Pilot-to-fleet deployment workflow and model/edge configuration management.

## 4.2 Out of scope for initial MVP

- Autonomous bus control or driver actuation.

- Issuing legal penalties automatically; the platform supplies evidence/alerts for authorized human review.

- Continuous cloud streaming of all raw camera feeds.

- Citywide fixed-CCTV replacement; the solution complements existing infrastructure.

- Guaranteed identity determination from faces or biometric surveillance.

# 5. Core User Journeys

| **ID** | **Journey**                                                                              | **Acceptance outcome**                                                                                                            |
|--------|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| UJ-01  | Road officer opens the GIS dashboard and filters potholes reported in the last 24 hours. | Map shows clustered/geotagged detections with confidence, timestamp, bus/route reference and evidence image/clip where available. |
| UJ-02  | Traffic controller views congestion on major corridors.                                  | Heat map and segment-level vehicle density reveal bottlenecks and route-delay indicators.                                         |
| UJ-03  | Incident reviewer receives a suspected hit-and-run/rash-driving alert.                   | Alert includes tracked vehicle evidence, plate text when readable, OCR confidence, time and GPS location for review.              |
| UJ-04  | Planner compares infrastructure deficiencies over a selected period.                     | Dashboard aggregates missing/damaged signage, crossings/dividers and supports export/reporting.                                   |
| UJ-05  | Administrator checks field health.                                                       | Device, camera, GPS, storage, model and connectivity health are visible with stale/offline status.                                |

# 6. Product Requirements

| **ID**   | **Capability**                | **Requirement**                                                                                                                                         | **Priority** |
|----------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| PR-F-001 | Multi-camera capture          | System shall ingest configured front/rear/side/cabin camera streams on each participating bus.                                                          | Must         |
| PR-F-002 | Road defect detection         | System shall generate geotagged observations for potholes and damaged road surface.                                                                     | Must         |
| PR-F-003 | Infrastructure detection      | System shall detect missing/damaged dividers, zebra crossings and traffic signboards when visible.                                                      | Must         |
| PR-F-004 | Waterlogging/hazard detection | System shall flag waterlogging and configured road hazards.                                                                                             | Must         |
| PR-F-005 | Vehicle analytics             | System shall detect/classify/count vehicles and derive density indicators.                                                                              | Must         |
| PR-F-006 | Bottleneck identification     | System shall aggregate density/speed/route observations to identify congestion hotspots.                                                                | Must         |
| PR-F-007 | Pedestrian risk events        | System shall detect vulnerable pedestrian situations, including school-child road crossing scenarios, subject to model capability and human validation. | Should       |
| PR-F-008 | Incident vehicle tracking     | System shall track a suspected offending vehicle through available frames/cameras during an incident event.                                             | Must         |
| PR-F-009 | ANPR/OCR                      | System shall extract candidate registration text with confidence score and retain source evidence.                                                      | Must         |
| PR-F-010 | Geotagging                    | Each event shall carry timestamp and GPS/GNSS coordinates, plus bus/device/route context where available.                                               | Must         |
| PR-F-011 | Edge filtering                | System shall transmit event metadata and selected evidence instead of continuous raw video by default.                                                  | Must         |
| PR-F-012 | GIS dashboard                 | Central platform shall visualize event layers, road condition and congestion heat maps.                                                                 | Must         |
| PR-F-013 | Reports/exports               | Authorized users shall generate incident and analytics reports and export filtered records.                                                             | Should       |
| PR-F-014 | Fleet analytics               | Platform shall aggregate events across buses and routes and support historical analysis.                                                                | Must         |
| PR-F-015 | OD / route-delay analytics    | Platform shall support origin-destination traffic pattern analysis and route-delay estimation from available fleet/traffic data.                        | Should       |
| PR-F-016 | Device operations             | Platform shall expose health, software/model version and last-seen state for edge devices.                                                              | Should       |

# 7. Non-Functional Product Requirements

| **Area**        | **Product requirement / target**                                                                                                                                                                               |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Latency         | Safety/incident events should be generated near-real-time at the edge; central visibility depends on available connectivity. Pilot target: event metadata visible within 30 seconds when network is available. |
| Bandwidth       | Default operating mode shall avoid continuous full-resolution cloud video streaming; event-first upload with configurable evidence size/quality.                                                               |
| Reliability     | Edge node shall continue inference during temporary network loss and queue events for later synchronization.                                                                                                   |
| Security        | Authenticated devices/users, encrypted transport, least-privilege access, auditable access to incident evidence.                                                                                               |
| Privacy         | Collect only data required for stated civic/transport purposes; configure retention and restrict access to sensitive evidence.                                                                                 |
| Scalability     | Central services should scale horizontally from a pilot fleet to many buses/routes without redesigning the data model.                                                                                         |
| Explainability  | Each AI event should expose model confidence, source frame/clip and relevant metadata so an authorized reviewer can validate it.                                                                               |
| Maintainability | Models, thresholds, camera configurations and edge software should be versioned and remotely manageable.                                                                                                       |
| Availability    | Central dashboard target for production: 99.5% monthly availability excluding planned maintenance (implementation assumption).                                                                                 |

# 8. MVP and Release Plan

| **Phase**   | **Scope**                                                                                                                    | **Exit criteria**                                                                                |
|-------------|------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| MVP / Pilot | Selected buses/routes; pothole/road damage, vehicles/density, geotagged event ingestion, basic GIS dashboard, device health. | Stable end-to-end capture → edge inference → event upload → map review; pilot metrics baselined. |
| Release 1   | Infrastructure deficiencies, waterlogging, ANPR incident workflow, heat maps, reports, store-and-forward hardening.          | Authority users can review/triage events and produce operational reports.                        |
| Release 2   | Pedestrian-risk models, route-delay and OD analytics, fleet-wide scaling, model lifecycle automation.                        | Validated analytics across expanded routes with operational governance and monitoring.           |

# 9. Success Metrics

| **Metric**                 | **How measured**                                                                                |
|----------------------------|-------------------------------------------------------------------------------------------------|
| Detection precision/recall | Per class on a labeled validation set and field audit sample; targets set after pilot baseline. |
| False alert rate           | Human-rejected events / reviewed events, by class and camera.                                   |
| Geolocation quality        | Percentage of events with valid GPS and median location error against field checks.             |
| Event latency              | Capture timestamp to central availability for connected cases.                                  |
| Bandwidth reduction        | Uploaded bytes per bus-hour compared with equivalent continuous video transfer.                 |
| Coverage                   | Unique road-km observed per bus/day and revisit frequency.                                      |
| Operational adoption       | Reviewed events, resolved/forwarded cases, report usage and active authority users.             |
| System health              | Online edge nodes, camera uptime, queue backlog and failed upload rate.                         |

# 10. Risks and Product Mitigations

| **Risk**                                              | **Mitigation**                                                                                                 |
|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Lighting, rain, blur, occlusion reduce model accuracy | Class-specific confidence thresholds; evidence review; diverse training data; periodic model evaluation.       |
| Duplicate observations from repeated bus passes       | Spatiotemporal clustering and deduplication; maintain observation history and recurrence count.                |
| Intermittent connectivity                             | Local queue, retry/backoff, priority upload for critical incidents.                                            |
| Camera/GPS failure                                    | Device health monitoring, stale telemetry flags, graceful degradation.                                         |
| Sensitive incident data misuse                        | RBAC, audit logs, encryption, retention policy, approval workflow for evidence access/export.                  |
| Scale overwhelms backend                              | Partitioned geospatial/event storage, asynchronous ingestion, horizontal services and data lifecycle policies. |

# 11. Assumptions Requiring Validation

- Exact performance targets, legal retention periods, alert escalation rules and agency integrations are not specified in the uploaded source and must be agreed with BEL/participating authorities.

- The dashboard is assumed to support authenticated multi-role users and operational device management because fleet deployment requires these controls.

- ANPR output is treated as a candidate observation requiring confidence and human review, not as an automatically conclusive identity.

- Route-delay and origin-destination analytics depend on availability/quality of route, schedule and telemetry context beyond raw camera detections.
