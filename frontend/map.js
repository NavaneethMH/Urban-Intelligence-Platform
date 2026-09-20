/**
 * INNOVEXA Urban Intelligence Platform — MapLibre GL JS Map Engine
 * Replaces Leaflet with MapLibre GL JS + OpenFreeMap open basemap.
 * Vanilla JS / No bundler — loaded via CDN.
 *
 * Architecture:
 *  - UrbanIntelligenceMap: Main GIS class, primary experience for Command Center
 *  - GeoJSON sources: routes, buses, road_defects, incidents, congestion, road_health
 *  - Clustering on event layers at lower zooms with expandable cluster click
 *  - Live deterministic bus movement along route waypoints (60fps requestAnimationFrame)
 *  - Glowing new-event beacons with animated pulsing rings
 *  - Spotlight effect on selected event/bus with 3D camera flyTo (pitch & bearing)
 *  - Route highlighting & non-relevant corridor dimming
 *  - Interactive hover popups & drawer integration
 */

const BENGALURU_CENTER = [77.6100, 12.9600]; // [lng, lat]
const BENGALURU_ZOOM   = 11.8;

// Realistic Bengaluru route corridors with dense waypoints
const ROUTE_DEFINITIONS = [
  {
    id: 'R-500D', name: 'Outer Ring Road Express', color: '#00e5ff',
    waypoints: [
      [77.6234,12.9176],[77.6480,12.9220],[77.6762,12.9260],
      [77.7011,12.9562],[77.7090,12.9700],[77.6980,12.9920],
      [77.6789,12.9984],[77.6500,13.0180],[77.5970,13.0358]
    ]
  },
  {
    id: 'R-335E', name: 'East Tech Corridor', color: '#ffab00',
    waypoints: [
      [77.5708,12.9774],[77.5860,12.9750],[77.6074,12.9734],
      [77.6250,12.9700],[77.6413,12.9644],[77.6644,12.9591],
      [77.6900,12.9640],[77.7150,12.9720],[77.7337,12.9863]
    ]
  },
  {
    id: 'R-KIAS8', name: 'Airport Vayu Vajra', color: '#b388ff', dash: [4,2],
    waypoints: [
      [77.6602,12.8452],[77.6234,12.9176],[77.5921,12.9984],
      [77.5970,13.0358],[77.6200,13.0700],[77.6800,13.1200],[77.7066,13.1986]
    ]
  },
  {
    id: 'R-356M', name: 'Hosur Road Arterial', color: '#ff1744',
    waypoints: [
      [77.5708,12.9774],[77.5900,12.9500],[77.5960,12.9388],
      [77.6100,12.9250],[77.6234,12.9176],[77.6400,12.8900],
      [77.6602,12.8452],[77.7000,12.8200],[77.7681,12.7801]
    ]
  },
  {
    id: 'R-201R', name: 'Rajajinagar North Corridor', color: '#00e676',
    waypoints: [
      [77.5400,12.9900],[77.5600,12.9950],[77.5708,12.9774],
      [77.5500,12.9600],[77.5300,12.9550],[77.5100,12.9400],[77.4900,12.9200]
    ]
  },
  {
    id: 'R-215H', name: 'Hebbal–Koramangala Link', color: '#2979ff',
    waypoints: [
      [77.5970,13.0358],[77.5900,13.0100],[77.5820,12.9900],
      [77.5708,12.9774],[77.5650,12.9600],[77.5680,12.9388],[77.5850,12.9100]
    ]
  },
  {
    id: 'R-226N', name: 'Electronic City Expressway', color: '#ff6d00',
    waypoints: [
      [77.5708,12.9774],[77.5750,12.9500],[77.5800,12.9200],
      [77.5850,12.8900],[77.5900,12.8600],[77.5950,12.8300],[77.6000,12.8000]
    ]
  },
  {
    id: 'R-342F', name: 'Frazer Town Diagonal', color: '#f50057',
    waypoints: [
      [77.6074,12.9734],[77.6150,12.9650],[77.6234,12.9600],
      [77.6300,12.9550],[77.6200,12.9450],[77.6100,12.9350],[77.6050,12.9200]
    ]
  }
];

// Seed Generators
function generateBusGeoJSON(routeDefs) {
  const features = [];
  const busCount = 36;
  for (let i = 0; i < busCount; i++) {
    const route = routeDefs[i % routeDefs.length];
    const waypointIdx = Math.floor((i / routeDefs.length) * (route.waypoints.length - 1));
    const wp = route.waypoints[Math.min(waypointIdx, route.waypoints.length - 1)];
    const lng = wp[0] + (((i * 47) % 120) - 60) / 10000;
    const lat = wp[1] + (((i * 31) % 100) - 50) / 10000;
    const isOffline = i === 10 || i === 26;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: `BUS-${String(i + 1).padStart(3, '0')}`,
        registration: `KA 01 F ${4201 + i}`,
        route_id: route.id,
        route_name: route.name,
        status: isOffline ? 'OFFLINE' : 'ONLINE',
        speed_kph: isOffline ? 0 : +(22 + (i * 3.7) % 28).toFixed(1),
        heading: (i * 45) % 360,
        gps_timestamp: new Date(Date.now() - i * 4000).toISOString(),
        depot: ['Depot 25 (HSR)', 'Depot 18 (Whitefield)', 'Depot 7 (Majestic)', 'Depot 31 (ECity)'][i % 4],
        _waypoint_idx: waypointIdx,
        _waypoint_progress: (i * 0.17) % 1.0,
        _route_idx: i % routeDefs.length
      }
    });
  }
  return { type: 'FeatureCollection', features };
}

function generateDefectGeoJSON() {
  const subtypes = [
    { subtype: 'POTHOLE', type: 'ROAD_DEFECT', color: '#ff6d00', severity_opts: ['CRITICAL','HIGH','MEDIUM'] },
    { subtype: 'DAMAGED_ROAD', type: 'ROAD_DEFECT', color: '#ff8c00', severity_opts: ['HIGH','MEDIUM'] },
    { subtype: 'WATERLOGGING', type: 'INFRASTRUCTURE', color: '#2979ff', severity_opts: ['HIGH','MEDIUM'] },
    { subtype: 'MISSING_DIVIDER', type: 'INFRASTRUCTURE', color: '#ffab00', severity_opts: ['MEDIUM','LOW'] },
    { subtype: 'MISSING_ZEBRA_CROSSING', type: 'INFRASTRUCTURE', color: '#ffd600', severity_opts: ['MEDIUM','LOW'] },
    { subtype: 'DAMAGED_TRAFFIC_SIGN', type: 'INFRASTRUCTURE', color: '#ff9800', severity_opts: ['LOW','MEDIUM'] },
    { subtype: 'MISSING_TRAFFIC_SIGN', type: 'INFRASTRUCTURE', color: '#ff6d00', severity_opts: ['MEDIUM','HIGH'] }
  ];
  const roads = [
    'Outer Ring Road EcoSpace', 'Silk Board Flyover Underpass', 'Old Airport Road Manipal',
    'Hosur Road Kudlu Gate', 'Bellary Road Hebbal', 'Mysore Road Kengeri',
    'Bannerghatta Road BTM', 'MG Road Brigade', 'Residency Road', 'Richmond Road'
  ];
  const features = [];
  for (let i = 0; i < 90; i++) {
    const def = subtypes[i % subtypes.length];
    const sev = def.severity_opts[i % def.severity_opts.length];
    const lng = 77.52 + (((i * 53) % 220) / 1000);
    const lat = 12.89 + (((i * 37) % 170) / 1000);
    const isNew = i < 12; // first 12 are freshly detected today
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: `EVT-2026-0919-${String(i + 1).padStart(4, '0')}`,
        event_type: def.type,
        event_subtype: def.subtype,
        severity: sev,
        confidence: +(0.82 + (i % 17) / 100).toFixed(2),
        occurred_at: new Date(Date.now() - i * 450000).toISOString(),
        road_name: roads[i % roads.length],
        bus_id: `BUS-${String((i % 36) + 1).padStart(3, '0')}`,
        camera_id: `CAM-FRONT-${String((i % 36) + 1).padStart(3, '0')}`,
        route_id: ROUTE_DEFINITIONS[i % ROUTE_DEFINITIONS.length].id,
        review_status: i % 7 === 0 ? 'VERIFIED' : i % 19 === 0 ? 'REJECTED' : 'PENDING',
        repeat_observations: 1 + (i % 5),
        color: def.color,
        is_new: isNew ? 1 : 0
      }
    });
  }
  return { type: 'FeatureCollection', features };
}

function generateIncidentGeoJSON() {
  const subtypes = [
    { subtype: 'HIT_AND_RUN_SUSPECTED', color: '#ff1744' },
    { subtype: 'RASH_DRIVING', color: '#f50057' },
    { subtype: 'PEDESTRIAN_RISK', color: '#ff6d00' }
  ];
  const roads = [
    'Bellandur ORR Junction', 'Silk Board Signal', 'Whitefield Main Road',
    'Hebbal Flyover', 'Hosur Road Signal', 'Old Madras Road', 'Mysore Road Overpass'
  ];
  const features = [];
  for (let i = 0; i < 24; i++) {
    const def = subtypes[i % subtypes.length];
    const lng = 77.51 + (((i * 61) % 210) / 1000);
    const lat = 12.88 + (((i * 43) % 160) / 1000);
    const plateNum = 4500 + i;
    const isNew = i < 5;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: `INC-2026-0919-${String(i + 1).padStart(4, '0')}`,
        event_type: 'SAFETY_INCIDENT',
        event_subtype: def.subtype,
        severity: i % 3 === 0 ? 'CRITICAL' : 'HIGH',
        confidence: +(0.88 + (i % 12) / 100).toFixed(2),
        occurred_at: new Date(Date.now() - i * 600000).toISOString(),
        road_name: roads[i % roads.length],
        bus_id: `BUS-${String((i % 36) + 1).padStart(3, '0')}`,
        camera_id: `CAM-FRONT-${String((i % 36) + 1).padStart(3, '0')}`,
        route_id: ROUTE_DEFINITIONS[i % ROUTE_DEFINITIONS.length].id,
        review_status: i % 5 === 0 ? 'VERIFIED' : 'PENDING',
        anpr_plate: def.subtype !== 'PEDESTRIAN_RISK' ? `KA 01 AB ${plateNum}` : null,
        anpr_confidence: def.subtype !== 'PEDESTRIAN_RISK' ? +(0.88 + (i % 10) / 100).toFixed(2) : null,
        color: def.color,
        is_new: isNew ? 1 : 0
      }
    });
  }
  return { type: 'FeatureCollection', features };
}

function generateCongestionGeoJSON() {
  const hotspots = [
    { lng: 77.6234, lat: 12.9176, weight: 0.95 }, // Silk Board
    { lng: 77.7011, lat: 12.9562, weight: 0.90 }, // Kundalahalli
    { lng: 77.6762, lat: 12.9260, weight: 0.85 }, // Marathahalli
    { lng: 77.5970, lat: 13.0358, weight: 0.82 }, // Hebbal
    { lng: 77.5708, lat: 12.9774, weight: 0.78 }, // Majestic
    { lng: 77.6074, lat: 12.9734, weight: 0.72 }, // Old Airport
    { lng: 77.5960, lat: 12.9388, weight: 0.68 }, // Hosur Rd
    { lng: 77.6300, lat: 12.9600, weight: 0.64 }, // Indiranagar
  ];
  const features = [];
  hotspots.forEach((hs, i) => {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [hs.lng, hs.lat] },
      properties: { weight: hs.weight, density_vph: Math.round(hs.weight * 2200) }
    });
    for (let j = 0; j < 14; j++) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            hs.lng + (((j * 37 + i * 13) % 60) - 30) / 5500,
            hs.lat + (((j * 29 + i * 17) % 50) - 25) / 5500
          ]
        },
        properties: { weight: hs.weight * (0.55 + (j % 5) * 0.09), density_vph: Math.round(hs.weight * 1350) }
      });
    }
  });
  return { type: 'FeatureCollection', features };
}

function generateRoadHealthGeoJSON() {
  const segments = [
    {
      name: 'Outer Ring Road (Silk Board to Marathahalli)', color: '#ff6d00',
      health: 'POOR', score: 62,
      coords: [[77.6234,12.9176],[77.6480,12.9220],[77.6762,12.9260]]
    },
    {
      name: 'Outer Ring Road (Marathahalli to Hebbal)', color: '#00e676',
      health: 'GOOD', score: 78,
      coords: [[77.6762,12.9260],[77.7011,12.9562],[77.6980,12.9920],[77.5970,13.0358]]
    },
    {
      name: 'Old Airport Road Arterial', color: '#ffab00',
      health: 'MODERATE', score: 71,
      coords: [[77.5708,12.9774],[77.6074,12.9734],[77.6413,12.9644],[77.7337,12.9863]]
    },
    {
      name: 'Hosur Road Expressway Service Lanes', color: '#ff1744',
      health: 'CRITICAL', score: 54,
      coords: [[77.5708,12.9774],[77.5960,12.9388],[77.6234,12.9176],[77.6602,12.8452]]
    },
    {
      name: 'Bellary Road Hebbal to Airport', color: '#00e676',
      health: 'GOOD', score: 84,
      coords: [[77.5970,13.0358],[77.6200,13.0700],[77.6800,13.1200],[77.7066,13.1986]]
    }
  ];
  return {
    type: 'FeatureCollection',
    features: segments.map((seg, i) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: seg.coords },
      properties: {
        id: `SEG-${String(i + 1).padStart(2, '0')}`,
        name: seg.name,
        health: seg.health,
        score: seg.score,
        color: seg.color,
        length_km: +(3 + i * 1.8).toFixed(1)
      }
    }))
  };
}

function generateRoutesGeoJSON(routeDefs) {
  return {
    type: 'FeatureCollection',
    features: routeDefs.map(r => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: r.waypoints },
      properties: { id: r.id, name: r.name, color: r.color, dash: r.dash || null }
    }))
  };
}

// ---------------------------------------------------------------------------
// UrbanIntelligenceMap Class
// ---------------------------------------------------------------------------

class UrbanIntelligenceMap {
  constructor(containerId, onSelectEvent, onSelectBus) {
    this.containerId = containerId;
    this.onSelectEvent = onSelectEvent;
    this.onSelectBus = onSelectBus;

    this.map = null;
    this.popup = null;
    this._initialized = false;
    this._destroyed = false;

    // Simulation & animation state
    this.simActive = true;
    this._simRafId = null;
    this._simTick = 0;

    // GeoJSON references
    this._busGeoJSON        = null;
    this._defectGeoJSON     = null;
    this._incidentGeoJSON   = null;
    this._congestionGeoJSON = null;
    this._roadHealthGeoJSON = null;
    this._routesGeoJSON     = null;

    // Layer visibility state
    this.layerVisibility = {
      buses:          true,
      routes:         true,
      road_defects:   true,
      infrastructure: true,
      incidents:      true,
      congestion:     true,
      road_health:    true,
      pedestrian:     true
    };

    // Filter state
    this.currentSeverityFilter = 'ALL';

    // Highlighted / selected references
    this._selectedEventId = null;
    this._selectedBusId   = null;
    this._highlightedRouteId = null;
  }

  init() {
    if (this._initialized || this._destroyed) return;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (typeof maplibregl === 'undefined') {
      console.error('[UrbanIntelligenceMap] maplibregl is undefined');
      return;
    }

    this._initialized = true;

    // Generate seed datasets
    this._routesGeoJSON     = generateRoutesGeoJSON(ROUTE_DEFINITIONS);
    this._busGeoJSON        = generateBusGeoJSON(ROUTE_DEFINITIONS);
    this._defectGeoJSON     = generateDefectGeoJSON();
    this._incidentGeoJSON   = generateIncidentGeoJSON();
    this._congestionGeoJSON = generateCongestionGeoJSON();
    this._roadHealthGeoJSON = generateRoadHealthGeoJSON();

    // MapLibre Map instance
    this.map = new maplibregl.Map({
      container: this.containerId,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: BENGALURU_CENTER,
      zoom: BENGALURU_ZOOM,
      pitch: 32,
      bearing: -8,
      antialias: true,
      attributionControl: false
    });

    this.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    this.map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    this.popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'innovexa-mgl-popup',
      maxWidth: '300px'
    });

    this.map.on('load', () => {
      this._addSources();
      this._addLayers();
      this._addInteractions();
    });

    this._resizeObserver = new ResizeObserver(() => {
      if (this.map) this.map.resize();
    });
    this._resizeObserver.observe(container);

    this._startSimulation();
  }

  _addSources() {
    // 1. Routes
    this.map.addSource('src-routes', { type: 'geojson', data: this._routesGeoJSON });

    // 2. Buses
    this.map.addSource('src-buses', { type: 'geojson', data: this._busGeoJSON });

    // 3. Clustered Defects
    this.map.addSource('src-defects', {
      type: 'geojson',
      data: this._defectGeoJSON,
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 45
    });

    // 4. Clustered Incidents
    this.map.addSource('src-incidents', {
      type: 'geojson',
      data: this._incidentGeoJSON,
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 50
    });

    // 5. Congestion Heatmap
    this.map.addSource('src-congestion', { type: 'geojson', data: this._congestionGeoJSON });

    // 6. Road Health Segments
    this.map.addSource('src-road-health', { type: 'geojson', data: this._roadHealthGeoJSON });

    // 7. Spotlight Single Feature Source (Dynamic spotlight for selected item)
    this.map.addSource('src-spotlight', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }

  _addLayers() {
    const map = this.map;

    // ── 1. Route Corridors ──────────────────────────────────────────────────
    map.addLayer({
      id: 'layer-routes-casing',
      type: 'line',
      source: 'src-routes',
      paint: {
        'line-color': '#030608',
        'line-width': ['case', ['==', ['get', 'id'], ''], 8, 5],
        'line-opacity': 0.6,
        'line-cap': 'round'
      }
    });

    map.addLayer({
      id: 'layer-routes',
      type: 'line',
      source: 'src-routes',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3.2,
        'line-opacity': 0.8,
        'line-cap': 'round',
        'line-join': 'round'
      }
    });

    // Glowing Highlighted Route Overlay
    map.addLayer({
      id: 'layer-routes-highlight',
      type: 'line',
      source: 'src-routes',
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'line-color': '#00e5ff',
        'line-width': 6,
        'line-opacity': 0.95,
        'line-blur': 1.5,
        'line-cap': 'round'
      }
    });

    // ── 2. Road Condition Segments ──────────────────────────────────────────
    map.addLayer({
      id: 'layer-road-health',
      type: 'line',
      source: 'src-road-health',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 5.5,
        'line-opacity': 0.72,
        'line-cap': 'round'
      }
    });

    // ── 3. Congestion Heatmap ───────────────────────────────────────────────
    map.addLayer({
      id: 'layer-congestion',
      type: 'heatmap',
      source: 'src-congestion',
      maxzoom: 16,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 15, 2.2],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,    'rgba(41,121,255,0)',
          0.2,  'rgba(41,121,255,0.45)',
          0.45, 'rgba(255,171,0,0.68)',
          0.7,  'rgba(255,109,0,0.85)',
          1,    'rgba(255,23,68,0.98)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 22, 15, 52],
        'heatmap-opacity': 0.65
      }
    });

    // ── 4. Clusters for Road Defects ────────────────────────────────────────
    map.addLayer({
      id: 'layer-defects-cluster',
      type: 'circle',
      source: 'src-defects',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#ff6d00',
          8,  '#ff8c00',
          18, '#ff3d00'
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          16,
          8,  20,
          18, 25
        ],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#06090d',
        'circle-opacity': 0.88
      }
    });

    map.addLayer({
      id: 'layer-defects-cluster-count',
      type: 'symbol',
      source: 'src-defects',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 11
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual Defect Markers (unclustered)
    map.addLayer({
      id: 'layer-defects-glow',
      type: 'circle',
      source: 'src-defects',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 14,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.22
      }
    });

    map.addLayer({
      id: 'layer-defects',
      type: 'circle',
      source: 'src-defects',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'severity'], 'CRITICAL'], 8.5,
          ['==', ['get', 'severity'], 'HIGH'], 6.5,
          5.0
        ],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#000000',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.95
      }
    });

    // Animated / New Event Pulsing Beacon
    map.addLayer({
      id: 'layer-defects-new-pulse',
      type: 'circle',
      source: 'src-defects',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_new'], 1]],
      paint: {
        'circle-radius': 18,
        'circle-color': 'transparent',
        'circle-stroke-color': '#ff6d00',
        'circle-stroke-width': 2,
        'circle-opacity': 0.85
      }
    });

    // Infrastructure Defects Filtered Layer
    map.addLayer({
      id: 'layer-infrastructure',
      type: 'circle',
      source: 'src-defects',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'event_type'], 'INFRASTRUCTURE']],
      paint: {
        'circle-radius': 6.5,
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.92
      }
    });

    // ── 5. Clusters for Safety Incidents ────────────────────────────────────
    map.addLayer({
      id: 'layer-incidents-cluster',
      type: 'circle',
      source: 'src-incidents',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ff1744',
        'circle-radius': [
          'step', ['get', 'point_count'],
          16,
          5, 20
        ],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    map.addLayer({
      id: 'layer-incidents-cluster-count',
      type: 'symbol',
      source: 'src-incidents',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 11
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual Incident Markers (unclustered)
    map.addLayer({
      id: 'layer-incidents-pulse',
      type: 'circle',
      source: 'src-incidents',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 19,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.18
      }
    });

    map.addLayer({
      id: 'layer-incidents',
      type: 'circle',
      source: 'src-incidents',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 9,
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.96
      }
    });

    // Pedestrian Risk Specific
    map.addLayer({
      id: 'layer-pedestrian',
      type: 'circle',
      source: 'src-incidents',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'event_subtype'], 'PEDESTRIAN_RISK']],
      paint: {
        'circle-radius': 11,
        'circle-color': '#ff6d00',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.95
      }
    });

    // ── 6. Mobile Fleet (Buses) ─────────────────────────────────────────────
    map.addLayer({
      id: 'layer-buses-halo',
      type: 'circle',
      source: 'src-buses',
      paint: {
        'circle-radius': 15,
        'circle-color': [
          'case', ['==', ['get', 'status'], 'ONLINE'], '#00e5ff', '#5e758c'
        ],
        'circle-opacity': 0.16
      }
    });

    map.addLayer({
      id: 'layer-buses',
      type: 'circle',
      source: 'src-buses',
      paint: {
        'circle-radius': 7.5,
        'circle-color': [
          'case', ['==', ['get', 'status'], 'ONLINE'], '#00e5ff', '#5e758c'
        ],
        'circle-stroke-color': [
          'case', ['==', ['get', 'status'], 'ONLINE'], '#003742', '#222d38'
        ],
        'circle-stroke-width': 2.2,
        'circle-opacity': 0.98
      }
    });

    map.addLayer({
      id: 'layer-buses-label',
      type: 'symbol',
      source: 'src-buses',
      minzoom: 11.5,
      layout: {
        'text-field': ['concat', ['get', 'id'], ' • ', ['to-string', ['get', 'speed_kph']], 'kph'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 9.5,
        'text-offset': [0, 1.4],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#00e5ff',
        'text-halo-color': '#06090d',
        'text-halo-width': 1.8
      }
    });

    // ── 7. Selected Event / Bus Spotlight Layer ──────────────────────────────
    map.addLayer({
      id: 'layer-spotlight-outer',
      type: 'circle',
      source: 'src-spotlight',
      paint: {
        'circle-radius': 36,
        'circle-color': 'transparent',
        'circle-stroke-color': '#00e5ff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.95
      }
    });

    map.addLayer({
      id: 'layer-spotlight-inner',
      type: 'circle',
      source: 'src-spotlight',
      paint: {
        'circle-radius': 22,
        'circle-color': 'rgba(0, 229, 255, 0.22)',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5
      }
    });
  }

  _addInteractions() {
    const map = this.map;
    const popup = this.popup;

    // ── Cluster Click Handling (Smooth zoom-in to expand) ───────────────────
    ['layer-defects-cluster', 'layer-incidents-cluster'].forEach(layerId => {
      const srcId = layerId.includes('defects') ? 'src-defects' : 'src-incidents';

      map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });

      map.on('click', layerId, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
        const clusterId = features[0].properties.cluster_id;
        const src = map.getSource(srcId);
        if (!src) return;

        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom + 0.8,
            duration: 600
          });
        });
      });
    });

    // ── Bus Hover & Click ───────────────────────────────────────────────────
    map.on('mouseenter', 'layer-buses', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      popup.setLngLat(coords).setHTML(`
        <div class="mgl-popup-inner">
          <div class="mgl-popup-eyebrow">MOBILE SENSING NODE</div>
          <div class="mgl-popup-title">${props.id} — ${props.registration}</div>
          <div class="mgl-popup-row"><span>Route</span><strong style="color:#00e5ff">${props.route_name || props.route_id}</strong></div>
          <div class="mgl-popup-row"><span>Status</span><span class="mgl-badge ${props.status === 'ONLINE' ? 'ok' : 'off'}">${props.status}</span></div>
          <div class="mgl-popup-row"><span>Live Speed</span><strong>${props.speed_kph} km/h</strong></div>
          <div class="mgl-popup-row"><span>Heading</span><span>${props.heading}°</span></div>
          <div class="mgl-popup-row"><span>Assigned Depot</span><span>${props.depot}</span></div>
          <div style="margin-top:6px;font-size:10px;color:#00e5ff;text-align:center">Click to inspect node & live cameras →</div>
        </div>
      `).addTo(map);

      // Highlight the bus's route line
      this.highlightRoute(props.route_id);
    });

    map.on('mouseleave', 'layer-buses', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
      this.clearRouteHighlight();
    });

    map.on('click', 'layer-buses', (e) => {
      const props = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates;
      this.setSpotlight(coords[1], coords[0]);
      this.flyTo(coords[1], coords[0], 15.8, 48, -12);
      if (this.onSelectBus) this.onSelectBus(props.id);
    });

    // ── Road Defects & Infrastructure Hover & Click ─────────────────────────
    ['layer-defects', 'layer-infrastructure'].forEach(layerId => {
      map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();
        popup.setLngLat(coords).setHTML(this._buildEventPopupHTML(props)).addTo(map);
        if (props.route_id) this.highlightRoute(props.route_id);
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
        this.clearRouteHighlight();
      });
      map.on('click', layerId, (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        this.setSpotlight(coords[1], coords[0]);
        this.flyTo(coords[1], coords[0], 16.5, 52, -15);
        if (this.onSelectEvent) this.onSelectEvent(props.id);
      });
    });

    // ── Safety Incidents & Pedestrian Risk Hover & Click ───────────────────
    ['layer-incidents', 'layer-pedestrian'].forEach(layerId => {
      map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();
        popup.setLngLat(coords).setHTML(this._buildEventPopupHTML(props)).addTo(map);
        if (props.route_id) this.highlightRoute(props.route_id);
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
        this.clearRouteHighlight();
      });
      map.on('click', layerId, (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        this.setSpotlight(coords[1], coords[0]);
        this.flyTo(coords[1], coords[0], 16.5, 55, 10);
        if (this.onSelectEvent) this.onSelectEvent(props.id);
      });
    });

    // ── Road Health Tooltip ─────────────────────────────────────────────────
    map.on('mouseenter', 'layer-road-health', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      popup.setLngLat([e.lngLat.lng, e.lngLat.lat]).setHTML(`
        <div class="mgl-popup-inner">
          <div class="mgl-popup-eyebrow">ROAD HEALTH SEGMENT</div>
          <div class="mgl-popup-title">${props.name}</div>
          <div class="mgl-popup-row"><span>Health Score</span><strong>${props.score}/100</strong></div>
          <div class="mgl-popup-row"><span>Status</span><span class="mgl-badge ${props.health === 'GOOD' ? 'ok' : props.health === 'CRITICAL' ? 'crit' : 'warn'}">${props.health}</span></div>
          <div class="mgl-popup-row"><span>Monitored Length</span><span>${props.length_km} km</span></div>
        </div>
      `).addTo(map);
    });

    map.on('mouseleave', 'layer-road-health', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  _buildEventPopupHTML(props) {
    const sevClass = props.severity === 'CRITICAL' ? 'crit' : props.severity === 'HIGH' ? 'warn' : 'ok';
    return `
      <div class="mgl-popup-inner">
        <div class="mgl-popup-eyebrow">${props.event_type || 'EVENT'}</div>
        <div class="mgl-popup-title">${(props.event_subtype || '').replace(/_/g, ' ')}</div>
        <div class="mgl-popup-row"><span>Event ID</span><span style="font-family:monospace;font-size:10px">${props.id}</span></div>
        <div class="mgl-popup-row"><span>Severity</span><span class="mgl-badge ${sevClass}">${props.severity}</span></div>
        <div class="mgl-popup-row"><span>AI Confidence</span><span class="mgl-badge ai">${Math.round((props.confidence || 0) * 100)}%</span></div>
        <div class="mgl-popup-row"><span>Location</span><span>${props.road_name || '—'}</span></div>
        <div class="mgl-popup-row"><span>Detecting Bus</span><strong>${props.bus_id || '—'}</strong></div>
        <div class="mgl-popup-row"><span>Review Status</span><span class="mgl-badge ${props.review_status === 'VERIFIED' ? 'ok' : 'warn'}">${props.review_status || 'PENDING'}</span></div>
        ${props.anpr_plate ? `<div class="mgl-popup-row"><span>ANPR Plate</span><strong style="background:#ffd600;color:#000;padding:1px 5px;border-radius:2px;font-size:11px">${props.anpr_plate}</strong></div>` : ''}
        <div style="margin-top:8px;font-size:10.5px;color:#00e5ff;font-weight:600;text-align:center">Click to open Intelligence Drawer →</div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // Spotlight on Selected Event / Bus
  // -------------------------------------------------------------------------
  setSpotlight(lat, lon) {
    if (!this.map) return;
    const src = this.map.getSource('src-spotlight');
    if (!src) return;

    if (lat === null || lon === null) {
      src.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    src.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {}
      }]
    });
  }

  clearSpotlight() {
    this.setSpotlight(null, null);
  }

  // -------------------------------------------------------------------------
  // Route Highlighting
  // -------------------------------------------------------------------------
  highlightRoute(routeId) {
    if (!this.map || !this.map.getLayer('layer-routes-highlight')) return;
    this._highlightedRouteId = routeId;
    this.map.setFilter('layer-routes-highlight', ['==', ['get', 'id'], routeId]);

    // Subtly dim non-selected routes
    if (this.map.getLayer('layer-routes')) {
      this.map.setPaintProperty('layer-routes', 'line-opacity', 0.25);
    }
  }

  clearRouteHighlight() {
    if (!this.map || !this.map.getLayer('layer-routes-highlight')) return;
    this._highlightedRouteId = null;
    this.map.setFilter('layer-routes-highlight', ['==', ['get', 'id'], '']);
    if (this.map.getLayer('layer-routes')) {
      this.map.setPaintProperty('layer-routes', 'line-opacity', 0.8);
    }
  }

  // -------------------------------------------------------------------------
  // Severity Filtering on Map
  // -------------------------------------------------------------------------
  setSeverityFilter(severity) {
    this.currentSeverityFilter = severity;
    if (!this.map) return;

    let filter = ['!', ['has', 'point_count']];
    if (severity !== 'ALL') {
      filter = ['all', ['!', ['has', 'point_count']], ['==', ['get', 'severity'], severity]];
    }

    if (this.map.getLayer('layer-defects')) {
      this.map.setFilter('layer-defects', filter);
    }
    if (this.map.getLayer('layer-defects-glow')) {
      this.map.setFilter('layer-defects-glow', filter);
    }
  }

  // -------------------------------------------------------------------------
  // Layer Visibility Toggles
  // -------------------------------------------------------------------------
  setLayerVisibility(layerKey, visible) {
    this.layerVisibility[layerKey] = visible;
    const v = visible ? 'visible' : 'none';

    const layerMap = {
      buses:          ['layer-buses', 'layer-buses-halo', 'layer-buses-label'],
      routes:         ['layer-routes', 'layer-routes-casing', 'layer-routes-highlight'],
      road_defects:   ['layer-defects', 'layer-defects-glow', 'layer-defects-cluster', 'layer-defects-cluster-count', 'layer-defects-new-pulse'],
      infrastructure: ['layer-infrastructure'],
      incidents:      ['layer-incidents', 'layer-incidents-pulse', 'layer-incidents-cluster', 'layer-incidents-cluster-count'],
      congestion:     ['layer-congestion'],
      road_health:    ['layer-road-health'],
      pedestrian:     ['layer-pedestrian']
    };

    const layers = layerMap[layerKey] || [];
    layers.forEach(id => {
      if (this.map && this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', v);
      }
    });
    return visible;
  }

  toggleLayer(layerKey) {
    const newState = !this.layerVisibility[layerKey];
    return this.setLayerVisibility(layerKey, newState);
  }

  // -------------------------------------------------------------------------
  // Camera Controls
  // -------------------------------------------------------------------------
  flyTo(lat, lon, zoom = 15.5, pitch = 45, bearing = 0) {
    if (!this.map) return;
    this.map.flyTo({
      center: [lon, lat],
      zoom,
      pitch,
      bearing,
      duration: 1400,
      essential: true
    });
  }

  resetView() {
    if (!this.map) return;
    this.clearSpotlight();
    this.clearRouteHighlight();
    this.map.flyTo({
      center: BENGALURU_CENTER,
      zoom: BENGALURU_ZOOM,
      pitch: 32,
      bearing: -8,
      duration: 1200
    });
  }

  // -------------------------------------------------------------------------
  // Live Simulation Ticker
  // -------------------------------------------------------------------------
  _startSimulation() {
    const SPEED = 0.0022; // smooth forward waypoint progression
    let lastTime = performance.now();

    const tick = (now) => {
      if (this._destroyed) return;
      this._simRafId = requestAnimationFrame(tick);

      if (!this.simActive || !this.map || !this._busGeoJSON) return;
      if (!this.map.getSource('src-buses')) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      let dirty = false;
      this._busGeoJSON.features.forEach(f => {
        const props = f.properties;
        if (props.status === 'OFFLINE') return;

        const routeIdx = props._route_idx % ROUTE_DEFINITIONS.length;
        const route = ROUTE_DEFINITIONS[routeIdx];
        const wps = route.waypoints;

        props._waypoint_progress = (props._waypoint_progress || 0) + SPEED * dt * 30;
        if (props._waypoint_progress >= wps.length - 1) {
          props._waypoint_progress = 0;
        }

        const segIdx = Math.floor(props._waypoint_progress);
        const t = props._waypoint_progress - segIdx;
        const wpA = wps[Math.min(segIdx, wps.length - 2)];
        const wpB = wps[Math.min(segIdx + 1, wps.length - 1)];

        f.geometry.coordinates = [
          wpA[0] + (wpB[0] - wpA[0]) * t,
          wpA[1] + (wpB[1] - wpA[1]) * t
        ];

        const dlng = wpB[0] - wpA[0];
        const dlat = wpB[1] - wpA[1];
        props.heading = Math.round((Math.atan2(dlng, dlat) * 180 / Math.PI + 360) % 360);
        props.gps_timestamp = new Date().toISOString();
        dirty = true;
      });

      if (dirty) {
        const src = this.map.getSource('src-buses');
        if (src) src.setData(this._busGeoJSON);
      }

      // Animate pulsing new-events ring radius
      this._simTick++;
      if (this.map.getLayer('layer-defects-new-pulse')) {
        const pulseR = 15 + Math.sin(this._simTick / 10) * 6;
        const pulseOpacity = 0.5 + Math.cos(this._simTick / 10) * 0.4;
        this.map.setPaintProperty('layer-defects-new-pulse', 'circle-radius', pulseR);
        this.map.setPaintProperty('layer-defects-new-pulse', 'circle-opacity', Math.max(0.1, pulseOpacity));
      }

      if (this.map.getLayer('layer-spotlight-outer')) {
        const spotR = 32 + Math.sin(this._simTick / 8) * 5;
        this.map.setPaintProperty('layer-spotlight-outer', 'circle-radius', spotR);
      }
    };

    this._simRafId = requestAnimationFrame(tick);
  }

  // -------------------------------------------------------------------------
  // External Data Binding
  // -------------------------------------------------------------------------
  setRoutes(routesData) {
    if (!routesData || !routesData.length) return;
    this._routesGeoJSON = {
      type: 'FeatureCollection',
      features: routesData.map(r => {
        const routeDef = ROUTE_DEFINITIONS.find(rd => rd.id === r.id);
        const color = routeDef ? routeDef.color : '#00e5ff';
        const coords = (r.waypoints || []).map(wp => [wp.lon, wp.lat]);
        return {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: { id: r.id, name: r.name, color }
        };
      })
    };
    this._updateSource('src-routes', this._routesGeoJSON);
  }

  updateBuses(busesData) {
    if (!busesData) return;
    const features = busesData.map((bus, i) => {
      const routeDef = ROUTE_DEFINITIONS.find(rd => rd.id === bus.route_id);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(bus.lon), Number(bus.lat)] },
        properties: {
          id: bus.id,
          registration: bus.registration || '',
          route_id: bus.route_id || '',
          route_name: routeDef ? routeDef.name : '',
          status: bus.status || 'ONLINE',
          speed_kph: bus.speed_kph || 0,
          heading: bus.heading || 0,
          gps_timestamp: bus.last_gps_fix || new Date().toISOString(),
          depot: bus.assigned_depot || '',
          _route_idx: i % ROUTE_DEFINITIONS.length,
          _waypoint_progress: (i * 0.17) % 1.0
        }
      };
    });
    this._busGeoJSON = { type: 'FeatureCollection', features };
    this._updateSource('src-buses', this._busGeoJSON);
  }

  updateEvents(eventsData) {
    if (!eventsData) return;
    const defects = [];
    const incidents = [];

    eventsData.forEach((evt, i) => {
      const isNew = i < 15;
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(evt.lon), Number(evt.lat)] },
        properties: {
          id: evt.id,
          event_type: evt.event_type,
          event_subtype: evt.event_subtype,
          severity: evt.severity,
          confidence: evt.confidence,
          occurred_at: evt.occurred_at,
          road_name: evt.road_name,
          bus_id: evt.bus_id,
          camera_id: evt.camera_id,
          route_id: evt.route_id,
          review_status: evt.review_status,
          repeat_observations: evt.metadata?.repeat_observations || 1,
          anpr_plate: evt.anpr?.plate_text || null,
          anpr_confidence: evt.anpr?.confidence || null,
          color: evt.event_type === 'SAFETY_INCIDENT' ? '#ff1744'
               : evt.event_type === 'INFRASTRUCTURE'  ? '#ffab00' : '#ff6d00',
          is_new: isNew ? 1 : 0
        }
      };
      if (evt.event_type === 'SAFETY_INCIDENT') {
        incidents.push(feature);
      } else {
        defects.push(feature);
      }
    });

    this._defectGeoJSON = { type: 'FeatureCollection', features: defects };
    this._incidentGeoJSON = { type: 'FeatureCollection', features: incidents };
    this._updateSource('src-defects', this._defectGeoJSON);
    this._updateSource('src-incidents', this._incidentGeoJSON);
  }

  _updateSource(sourceId, data) {
    if (!this.map) return;
    const src = this.map.getSource(sourceId);
    if (src) src.setData(data);
  }

  pauseSimulation() {
    this.simActive = false;
  }

  resumeSimulation() {
    this.simActive = true;
  }

  destroy() {
    this._destroyed = true;
    if (this._simRafId) {
      cancelAnimationFrame(this._simRafId);
      this._simRafId = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this._initialized = false;
  }
}

// Expose globally
window.UrbanIntelligenceMap = UrbanIntelligenceMap;
window.CityGISMap = UrbanIntelligenceMap;
