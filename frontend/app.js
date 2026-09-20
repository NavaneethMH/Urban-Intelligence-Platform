/**
 * INNOVEXA Urban Intelligence Platform — Core Controller
 * Problem Statement 26124 (BEL / Smart Automation / SIH 2025)
 */

const API_BASE = 'http://127.0.0.1:8000';

const NAV_ITEMS = [
  { id: 'command', name: 'Command Center', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'fleet', name: 'Live Fleet', icon: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2' },
  { id: 'road', name: 'Road Intelligence', icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' },
  { id: 'traffic', name: 'Traffic Intelligence', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { id: 'incidents', name: 'Incident Center', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
  { id: 'evidence', name: 'AI Evidence', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' },
  { id: 'analytics', name: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { id: 'health', name: 'Fleet Health', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { id: 'alerts', name: 'Alert Center', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { id: 'reports', name: 'Reports', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
  { id: 'admin', name: 'Administration', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z' }
];

const ROLES = [
  { id: 'CO', name: 'Control Room Operator', agency: 'BMTC Operations Hub', desc: 'Full citywide operational command, alert triage, incident dispatch' },
  { id: 'SA', name: 'System Administrator', agency: 'Platform Engineering', desc: 'Edge runtime deployment, AI model swaps, fleet telemetry configs' },
  { id: 'RO', name: 'Road/Civic Officer', agency: 'BBMP Infrastructure', desc: 'Pothole work order dispatch, divider & sign repair verification' },
  { id: 'TP', name: 'Traffic/Police Reviewer', agency: 'Bengaluru Traffic Police', desc: 'ANPR evidence investigation, rash driving & hit-and-run verification' },
  { id: 'UP', name: 'Urban Planner / Analyst', agency: 'DULT / Urban Mobility', desc: 'Historical corridor delay analysis, OD flow analytics, coverage insights' }
];

// Master Application State
const appState = {
  page: 'command',
  role: ROLES[0],
  data: null,
  isLiveApi: false,
  gisMap: null,
  simActive: true,
  simTick: 0,
  presentationMode: false,
  selectedEventId: null,
  selectedBusId: 'BUS-001',
  trafficHour: '09:00',
  filters: {
    severity: 'ALL',
    type: 'ALL',
    road: 'ALL'
  }
};

// DOM Utilities
const el = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

function showToast(message, type = 'info') {
  const container = el('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>●</span><span>${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3400);
}

// --------------------------------------------------------------------------
// API & Data Hydration
// --------------------------------------------------------------------------

async function fetchPlatformData() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/bootstrap`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    appState.data = json;
    appState.isLiveApi = true;
    updateBackendBadge(true);
    showToast('Connected to live FastAPI Urban Intelligence Backend', 'success');
  } catch (err) {
    console.warn('FastAPI backend offline, initializing embedded resilient dataset:', err);
    appState.data = getEmbeddedFallbackData();
    appState.isLiveApi = false;
    updateBackendBadge(false);
    showToast('Operating on local resilient urban intelligence dataset', 'warn');
  }
}

function updateBackendBadge(isLive) {
  const badge = el('backendBadge');
  if (badge) {
    badge.className = `status-chip ${isLive ? 'live' : 'local'}`;
    badge.textContent = isLive ? 'FASTAPI LIVE' : 'LOCAL CACHE';
  }
}

// --------------------------------------------------------------------------
// Navigation & Router
// --------------------------------------------------------------------------

function initNavigation() {
  const navMenu = el('navMenu');
  if (!navMenu) return;

  navMenu.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-item ${appState.page === item.id ? 'active' : ''}" data-screen="${item.id}">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${item.icon}"></path>
      </svg>
      <span>${item.name}</span>
    </button>
  `).join('');

  navMenu.querySelectorAll('[data-screen]').forEach(btn => {
    btn.onclick = () => {
      navigateTo(btn.dataset.screen);
    };
  });
}

function navigateTo(screenId) {
  if (appState.page === 'command' && screenId !== 'command' && appState.gisMap) {
    appState.gisMap.destroy();
    appState.gisMap = null;
  }
  appState.page = screenId;
  initNavigation();
  renderActiveView();
  closeDrawer();
}

function renderActiveView() {
  const container = el('viewContent');
  if (!container || !appState.data) return;

  // Update topbar active counts
  const alertCount = appState.data.alerts.filter(a => a.state === 'NEW').length;
  el('topAlertCount').textContent = alertCount;

  switch (appState.page) {
    case 'command':
      renderCommandCenter(container);
      break;
    case 'fleet':
      renderLiveFleet(container);
      break;
    case 'road':
      renderRoadIntelligence(container);
      break;
    case 'traffic':
      renderTrafficIntelligence(container);
      break;
    case 'incidents':
      renderIncidentCenter(container);
      break;
    case 'evidence':
      renderEvidenceExplorer(container);
      break;
    case 'analytics':
      renderAnalytics(container);
      break;
    case 'health':
      renderFleetHealth(container);
      break;
    case 'alerts':
      renderAlertCenter(container);
      break;
    case 'reports':
      renderReports(container);
      break;
    case 'admin':
      renderAdministration(container);
      break;
    default:
      renderCommandCenter(container);
  }
}

// --------------------------------------------------------------------------
// Screen 1: Command Center (Hero GIS Screen)
// --------------------------------------------------------------------------

function renderCommandCenter(container) {
  const counts = appState.data.counts;

  container.innerHTML = `
    <!-- Top Floating Operational Counters Strip -->
    <div class="metrics-strip ops-kpi-bar">
      <div class="metric-tile highlight">
        <span class="metric-label">Active Fleet</span>
        <span class="metric-value">${counts.active_buses} <small style="font-size:11px;color:var(--text-muted)">/ ${counts.total_buses}</small></span>
        <span class="metric-sub"><span class="delta-down">●</span> 94.4% In-Service</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Edge Ingestion</span>
        <span class="metric-value">${counts.devices_online}</span>
        <span class="metric-sub">Jetson Orin Nodes</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Events (24h)</span>
        <span class="metric-value">${counts.events_today}</span>
        <span class="metric-sub"><span class="delta-up">▲</span> +18 in last hour</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Critical Alerts</span>
        <span class="metric-value" style="color:var(--crimson-crit)">${counts.critical_alerts}</span>
        <span class="metric-sub">Requires Action</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Road Defects</span>
        <span class="metric-value" style="color:var(--orange-hazard)">${counts.potholes_detected}</span>
        <span class="metric-sub">14 Repeat Hazards</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Congestion Hotspots</span>
        <span class="metric-value" style="color:#2979ff">${counts.congestion_hotspots}</span>
        <span class="metric-sub">Silk Board & ORR</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Safety Incidents</span>
        <span class="metric-value" style="color:var(--amber-warn)">${counts.incidents_under_review}</span>
        <span class="metric-sub">Triage Pending</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Mean AI Confidence</span>
        <span class="metric-value">${counts.average_confidence}%</span>
        <span class="metric-sub">Edge Model v2.4.1</span>
      </div>
    </div>

    <!-- Primary Command Center GIS Viewport & Dynamic Overlay Layout -->
    <div class="command-center-layout map-dominant">
      <div class="map-viewport-wrapper">
        <div id="leafletMap"></div>

        <!-- Top Left: Floating Interactive Filter & Layer HUD -->
        <div class="map-floating-hud top-left-hud">
          <!-- Layer Toggles -->
          <div class="map-layer-chips">
            <span class="hud-label">OPERATIONAL LAYERS</span>
            <div class="chip-group">
              <button class="layer-chip active" data-layer="buses" title="Toggle Live Bus Sensing Fleet">
                <span class="layer-dot" style="background:#00e5ff"></span> Buses (36)
              </button>
              <button class="layer-chip active" data-layer="road_defects" title="Toggle Potholes & Surface Defects">
                <span class="layer-dot" style="background:#ff6d00"></span> Defects (90)
              </button>
              <button class="layer-chip active" data-layer="infrastructure" title="Toggle Missing Dividers & Signs">
                <span class="layer-dot" style="background:#ffab00"></span> Infrastructure
              </button>
              <button class="layer-chip active" data-layer="congestion" title="Toggle Vehicle Density Heatmap">
                <span class="layer-dot" style="background:#2979ff"></span> Congestion Heat
              </button>
              <button class="layer-chip active" data-layer="incidents" title="Toggle Safety Incidents">
                <span class="layer-dot" style="background:#ff1744"></span> Incidents
              </button>
              <button class="layer-chip active" data-layer="routes" title="Toggle Bus Route Corridors">
                <span class="layer-dot" style="background:#b388ff"></span> Corridors (8)
              </button>
              <button class="layer-chip active" data-layer="road_health" title="Toggle Road Condition Health Overlays">
                <span class="layer-dot" style="background:#00e676"></span> Health Segments
              </button>
            </div>
          </div>

          <!-- Quick Severity Filter Bar -->
          <div class="map-quick-filters">
            <span class="hud-label">SEVERITY FILTER</span>
            <div class="severity-pill-group">
              <button class="sev-pill active" data-sev="ALL">All Severities</button>
              <button class="sev-pill crit" data-sev="CRITICAL">Critical</button>
              <button class="sev-pill high" data-sev="HIGH">High</button>
              <button class="sev-pill med" data-sev="MEDIUM">Medium / Low</button>
            </div>
          </div>

          <!-- Corridor Quick Fly-To Selector -->
          <div class="map-corridor-bar">
            <span class="hud-label">FOCUS ARTERIAL CORRIDOR</span>
            <div class="corridor-pills">
              <button class="corridor-pill" data-corridor="ORR">Outer Ring Road</button>
              <button class="corridor-pill" data-corridor="SILK">Silk Board</button>
              <button class="corridor-pill" data-corridor="AIRPORT">Airport Express</button>
              <button class="corridor-pill" data-corridor="HOSUR">Hosur Road</button>
              <button class="corridor-pill reset" data-corridor="RESET" title="Reset View">Full City</button>
            </div>
          </div>
        </div>

        <!-- Bottom Left: Floating Map Legend -->
        <div class="map-legend-box enhanced-legend">
          <div class="legend-header">
            <span>SPATIAL CLASSIFICATION</span>
          </div>
          <div class="legend-items-grid">
            <div class="legend-item"><span class="legend-swatch bus"></span> Bus Telemetry Node</div>
            <div class="legend-item"><span class="legend-swatch defect"></span> Pothole / Surface Hazard</div>
            <div class="legend-item"><span class="legend-swatch infra"></span> Pavement / Sign Infra</div>
            <div class="legend-item"><span class="legend-swatch incident"></span> Safety Alert / ANPR</div>
            <div class="legend-item"><span class="legend-swatch congestion"></span> Congestion Hotspot</div>
            <div class="legend-item"><span class="legend-swatch new-beacon"></span> Live Detected Today</div>
          </div>
        </div>
      </div>

      <!-- Dockable Real-Time Event Stream Sidebar -->
      <aside class="activity-stream-panel dockable-panel" id="activityStreamPanel">
        <div class="panel-header-strip">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="panel-title">Real-Time Event Stream</span>
            <span class="status-chip live">STREAMING</span>
          </div>
          <button class="dock-toggle-btn" id="streamCollapseBtn" title="Collapse Stream Panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div class="activity-filter-info">
          <span>Click any card to spotlight &amp; 3D fly-to location</span>
        </div>
        <div class="activity-list" id="activityList">
          ${renderActivityCards(appState.data.events.slice(0, 30))}
        </div>
      </aside>

      <!-- Expand Toggle Button when collapsed -->
      <button class="stream-expand-tab hidden" id="streamExpandTab" title="Show Event Stream">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>EVENT STREAM</span>
      </button>
    </div>
  `;

  // Initialize GIS Map
  setTimeout(() => {
    if (!appState.gisMap) {
      appState.gisMap = new CityGISMap('leafletMap', openEventDrawer, openBusDrawer);
    }
    appState.gisMap.init();
    appState.gisMap.setRoutes(appState.data.routes);
    appState.gisMap.updateBuses(appState.data.buses);
    appState.gisMap.updateEvents(appState.data.events);

    // Wire Layer Chips
    container.querySelectorAll('[data-layer]').forEach(chip => {
      chip.onclick = () => {
        const layer = chip.dataset.layer;
        const active = appState.gisMap.toggleLayer(layer);
        chip.classList.toggle('active', active);
        showToast(`Layer ${layer}: ${active ? 'Visible' : 'Hidden'}`);
      };
    });

    // Wire Severity Filter Pills
    container.querySelectorAll('[data-sev]').forEach(pill => {
      pill.onclick = () => {
        container.querySelectorAll('[data-sev]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const sev = pill.dataset.sev;
        appState.gisMap.setSeverityFilter(sev);
        showToast(`Filter: ${sev === 'ALL' ? 'All events visible' : `${sev} severity events`}`);
      };
    });

    // Wire Corridor Quick Focus
    container.querySelectorAll('[data-corridor]').forEach(btn => {
      btn.onclick = () => {
        const c = btn.dataset.corridor;
        if (c === 'RESET') {
          appState.gisMap.resetView();
          showToast('Reset map to full Bengaluru view');
        } else if (c === 'ORR') {
          appState.gisMap.flyTo(12.9260, 77.6762, 14.5, 48, -15);
          appState.gisMap.highlightRoute('R-500D');
          showToast('Focused on Outer Ring Road Express Corridor');
        } else if (c === 'SILK') {
          appState.gisMap.flyTo(12.9176, 77.6234, 16.0, 52, 20);
          showToast('Focused on Silk Board Flyover Junction');
        } else if (c === 'AIRPORT') {
          appState.gisMap.flyTo(13.1000, 77.6500, 13.0, 45, 0);
          appState.gisMap.highlightRoute('R-KIAS8');
          showToast('Focused on Airport Vayu Vajra Corridor');
        } else if (c === 'HOSUR') {
          appState.gisMap.flyTo(12.8500, 77.6600, 14.0, 45, -10);
          appState.gisMap.highlightRoute('R-356M');
          showToast('Focused on Hosur Road Arterial');
        }
      };
    });

    // Wire Activity Click
    container.querySelectorAll('[data-evt-id]').forEach(card => {
      card.onclick = () => {
        const evtId = card.dataset.evtId;
        openEventDrawer(evtId);
        const targetEvt = appState.data.events.find(e => e.id === evtId);
        if (targetEvt && appState.gisMap) {
          appState.gisMap.setSpotlight(targetEvt.lat, targetEvt.lon);
          appState.gisMap.flyTo(targetEvt.lat, targetEvt.lon, 16.5, 52, -15);
          if (targetEvt.route_id) {
            appState.gisMap.highlightRoute(targetEvt.route_id);
          }
        }
      };
    });

    // Wire Stream Panel Collapse / Expand
    const panel = el('activityStreamPanel');
    const expandTab = el('streamExpandTab');
    const collapseBtn = el('streamCollapseBtn');

    if (collapseBtn && panel && expandTab) {
      collapseBtn.onclick = () => {
        panel.classList.add('collapsed');
        expandTab.classList.remove('hidden');
        if (appState.gisMap && appState.gisMap.map) {
          setTimeout(() => appState.gisMap.map.resize(), 250);
        }
      };

      expandTab.onclick = () => {
        panel.classList.remove('collapsed');
        expandTab.classList.add('hidden');
        if (appState.gisMap && appState.gisMap.map) {
          setTimeout(() => appState.gisMap.map.resize(), 250);
        }
      };
    }
  }, 50);
}

function renderActivityCards(events) {
  return events.map(evt => `
    <div class="activity-card ${appState.selectedEventId === evt.id ? 'selected' : ''}" data-evt-id="${evt.id}">
      <span class="activity-indicator ${evt.severity}"></span>
      <div class="activity-body">
        <div class="activity-head-row">
          <span class="activity-name">${evt.event_subtype.replace(/_/g, ' ')}</span>
          <span class="activity-time">${formatTime(evt.occurred_at)}</span>
        </div>
        <div class="activity-location">${evt.road_name}</div>
        <div class="activity-meta-row">
          <span class="badge ${evt.severity === 'CRITICAL' ? 'badge-crit' : evt.severity === 'HIGH' ? 'badge-warn' : 'badge-neutral'}">${evt.severity}</span>
          <span class="badge badge-ai">${(evt.confidence * 100).toFixed(0)}% AI</span>
          <span style="font-size:10px;color:var(--text-muted)">${evt.bus_id}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// Screen 2: Live Fleet Operations
// --------------------------------------------------------------------------

function renderLiveFleet(container) {
  const buses = appState.data.buses;
  const currentBus = buses.find(b => b.id === appState.selectedBusId) || buses[0];
  const dev = appState.data.devices.find(d => d.bus_id === currentBus.id);

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">FLEET TELEMETRY & EDGE SURVEILLANCE</span>
        <h2 class="section-title">Mobile Urban Sensing Fleet</h2>
        <p class="section-desc">Real-time edge compute status, multi-camera feeds, and AI bounding box detection matrix.</p>
      </div>
      <div>
        <span class="status-chip live">${buses.filter(b=>b.status==='ONLINE').length} / ${buses.length} ACTIVE BUSES</span>
      </div>
    </div>

    <div class="fleet-view-grid">
      <!-- Left Bus Selector List -->
      <div class="fleet-list-pane">
        <div class="panel-header-strip">
          <span class="panel-title">Participating Buses</span>
          <span class="badge badge-neutral">36 Units</span>
        </div>
        <div style="flex:1;overflow-y:auto">
          ${buses.map(b => `
            <div class="fleet-item ${b.id === currentBus.id ? 'active' : ''}" data-bus-item="${b.id}">
              <div class="bus-title-group">
                <strong>${b.id}</strong>
                <span>${b.registration} · ${b.route_id}</span>
              </div>
              <div style="text-align:right">
                <span class="badge ${b.status === 'ONLINE' ? 'badge-ok' : 'badge-warn'}">${b.status}</span>
                <span style="font-size:10px;font-family:var(--font-mono);display:block;margin-top:2px">${b.speed_kph} km/h</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Detail Pane: 5-Camera Simulated Matrix -->
      <div class="fleet-detail-pane">
        <!-- Bus & Edge Telemetry Bar -->
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <span class="eyebrow">NODE PROFILE</span>
            <h3 style="font-size:16px;color:#fff;font-family:var(--font-mono)">${currentBus.id} — ${currentBus.registration}</h3>
            <span style="font-size:11px;color:var(--text-muted)">Route: ${currentBus.route_id} · Depot: ${currentBus.assigned_depot} · Speed: ${currentBus.speed_kph} km/h · Heading: ${currentBus.heading}°</span>
          </div>
          <div style="display:flex;gap:12px">
            <div style="text-align:center">
              <span style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Hardware</span>
              <strong style="display:block;font-size:12px;color:var(--cyan-primary)">Jetson Orin Nano</strong>
            </div>
            <div style="text-align:center">
              <span style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Temp</span>
              <strong style="display:block;font-size:12px;color:#fff">${dev ? dev.temperature_c : 48.2}°C</strong>
            </div>
            <div style="text-align:center">
              <span style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Storage</span>
              <strong style="display:block;font-size:12px;color:#fff">${dev ? dev.storage_used_pct : 42}%</strong>
            </div>
            <div style="text-align:center">
              <span style="font-size:9px;color:var(--text-muted);text-transform:uppercase">Inference FPS</span>
              <strong style="display:block;font-size:12px;color:var(--emerald-ok)">${dev ? dev.inference_fps : 28.4} FPS</strong>
            </div>
          </div>
        </div>

        <!-- 5-Camera Matrix -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span class="panel-title">Multi-Camera Edge AI Inference Feeds</span>
            <span style="font-size:11px;color:var(--text-muted)">Edge-filtered detection frames (Bandwidth optimized)</span>
          </div>

          <div class="camera-matrix-grid">
            <!-- Front Camera (Primary) -->
            <div class="camera-tile primary-feed">
              <div class="camera-header">
                <span>CAM-FRONT · Forward Road & Hazard Detection</span>
                <span class="badge badge-ok">STREAMING 1080P</span>
              </div>
              <div class="camera-viewport">
                ${renderCameraCanvas('front')}
                <div class="camera-hud-overlay">CAM-FRONT-01 · 1080P30</div>
                <div class="camera-hud-fps">INFERENCE: 28.8 FPS</div>
                <div class="ai-bbox" style="top:25%;left:35%;width:28%;height:45%">
                  <span class="ai-bbox-tag">CAR 97%</span>
                </div>
                <div class="ai-bbox hazard" style="bottom:12%;left:45%;width:20%;height:18%">
                  <span class="ai-bbox-tag">POTHOLE 94%</span>
                </div>
              </div>
            </div>

            <!-- Rear Camera -->
            <div class="camera-tile">
              <div class="camera-header">
                <span>CAM-REAR · Trailing Traffic & ANPR</span>
                <span class="badge badge-ok">STREAMING</span>
              </div>
              <div class="camera-viewport">
                ${renderCameraCanvas('rear')}
                <div class="camera-hud-overlay">CAM-REAR-01</div>
                <div class="camera-hud-fps">29.1 FPS</div>
                <div class="ai-bbox" style="top:32%;left:30%;width:35%;height:40%">
                  <span class="ai-bbox-tag">VEHICLE 94%</span>
                </div>
              </div>
            </div>

            <!-- Left Side Camera -->
            <div class="camera-tile">
              <div class="camera-header">
                <span>CAM-LEFT · Divider & Median Condition</span>
                <span class="badge badge-ok">STREAMING</span>
              </div>
              <div class="camera-viewport">
                ${renderCameraCanvas('left')}
                <div class="camera-hud-overlay">CAM-LEFT-01</div>
                <div class="ai-bbox" style="top:40%;left:15%;width:25%;height:35%">
                  <span class="ai-bbox-tag">MEDIAN_OK 96%</span>
                </div>
              </div>
            </div>

            <!-- Right Side Camera -->
            <div class="camera-tile">
              <div class="camera-header">
                <span>CAM-RIGHT · Curb, Zebra & Pedestrians</span>
                <span class="badge badge-ok">STREAMING</span>
              </div>
              <div class="camera-viewport">
                ${renderCameraCanvas('right')}
                <div class="camera-hud-overlay">CAM-RIGHT-01</div>
                <div class="ai-bbox crit" style="top:30%;left:55%;width:20%;height:45%">
                  <span class="ai-bbox-tag">PEDESTRIAN 92%</span>
                </div>
              </div>
            </div>

            <!-- Cabin Camera -->
            <div class="camera-tile">
              <div class="camera-header">
                <span>CAM-CABIN · Occupancy & Interior Safety</span>
                <span class="badge badge-ok">STREAMING</span>
              </div>
              <div class="camera-viewport">
                ${renderCameraCanvas('cabin')}
                <div class="camera-hud-overlay">CAM-CABIN-01</div>
                <div style="position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:4px;font-size:10px;color:#fff">
                  Passenger Load: <strong>34%</strong> (Moderate)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire Bus Selector
  container.querySelectorAll('[data-bus-item]').forEach(item => {
    item.onclick = () => {
      appState.selectedBusId = item.dataset.busItem;
      renderLiveFleet(container);
    };
  });
}

function renderCameraCanvas(angle) {
  // SVG Graphic Simulation for Camera Feeds
  return `
    <svg viewBox="0 0 640 360" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a131b"/>
          <stop offset="100%" stop-color="#14212e"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="#04080c"/>
      <polygon points="120,360 520,360 360,160 280,160" fill="url(#roadGrad)"/>
      <line x1="320" y1="160" x2="320" y2="360" stroke="#00e5ff" stroke-width="2" stroke-dasharray="14,14" opacity="0.6"/>
      <line x1="280" y1="160" x2="120" y2="360" stroke="#3d5063" stroke-width="3"/>
      <line x1="360" y1="160" x2="520" y2="360" stroke="#3d5063" stroke-width="3"/>
      <text x="20" y="340" fill="#5e758c" font-family="monospace" font-size="11">ANG: ${angle.toUpperCase()} · EDGE SIMULATED FEED</text>
    </svg>
  `;
}

// --------------------------------------------------------------------------
// Screen 3: Road Intelligence
// --------------------------------------------------------------------------

function renderRoadIntelligence(container) {
  const defects = appState.data.events.filter(e => e.event_type === 'ROAD_DEFECT' || e.event_type === 'INFRASTRUCTURE');
  const segments = appState.data.road_segments;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">INFRASTRUCTURE DEFICIENCY & SURFACE HEALTH</span>
        <h2 class="section-title">Road Condition Intelligence</h2>
        <p class="section-desc">Automated detection of potholes, pavement subsidence, missing dividers, zebra crossings, and waterlogging.</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" id="filterPotholesOnly">Potholes Only</button>
        <button class="btn btn-primary" id="exportRoadReport">Export Defect Registry</button>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Corridor Segment Health Cards -->
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span class="panel-title">Corridor Surface Health Indices</span>
          <span style="font-size:11px;color:var(--text-muted)">Evaluated from multi-bus repeat observations</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:10px">
          ${segments.map(seg => `
            <div class="metric-tile" style="border-left:3px solid ${seg.status === 'GOOD' ? '#00e676' : seg.status === 'MODERATE' ? '#ffab00' : '#ff1744'}">
              <span class="metric-label" style="font-size:11px;color:#fff">${seg.corridor_name}</span>
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0">
                <span class="metric-value" style="font-size:18px">${seg.condition_score} <small style="font-size:11px;color:var(--text-muted)">/ 100</small></span>
                <span class="badge ${seg.status === 'GOOD' ? 'badge-ok' : seg.status === 'MODERATE' ? 'badge-warn' : 'badge-crit'}">${seg.status}</span>
              </div>
              <div style="font-size:10px;color:var(--text-secondary)">
                ${seg.pothole_count} Potholes · ${seg.infrastructure_issues} Infra Defects
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Road Defects Table -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden">
        <div class="panel-header-strip">
          <span class="panel-title">Active Defect & Hazard Registry</span>
          <span style="font-size:11px;color:var(--text-muted)">Click any row to locate on GIS map</span>
        </div>
        <div class="table-responsive">
          <table class="innovexa-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Defect Category</th>
                <th>Road / Corridor</th>
                <th>Severity</th>
                <th>AI Confidence</th>
                <th>Repeat Observations</th>
                <th>Reporting Bus</th>
                <th>Review Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${defects.map(d => `
                <tr data-road-evt="${d.id}">
                  <td style="font-family:var(--font-mono);font-weight:600">${d.id}</td>
                  <td><strong>${d.event_subtype.replace(/_/g, ' ')}</strong></td>
                  <td>${d.road_name}</td>
                  <td><span class="badge ${d.severity === 'CRITICAL' ? 'badge-crit' : d.severity === 'HIGH' ? 'badge-warn' : 'badge-neutral'}">${d.severity}</span></td>
                  <td><span class="badge badge-ai">${(d.confidence * 100).toFixed(0)}%</span></td>
                  <td style="font-family:var(--font-mono);color:var(--cyan-primary)">${d.metadata.repeat_observations || 1} Passes</td>
                  <td>${d.bus_id}</td>
                  <td><span class="badge ${d.review_status === 'VERIFIED' ? 'badge-ok' : d.review_status === 'REJECTED' ? 'badge-crit' : 'badge-warn'}">${d.review_status}</span></td>
                  <td>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:10px" data-inspect-evt="${d.id}">Inspect</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-road-evt]').forEach(row => {
    row.onclick = () => {
      const evtId = row.dataset.roadEvt;
      openEventDrawer(evtId);
    };
  });

  el('exportRoadReport').onclick = () => {
    window.open(`${API_BASE}/api/v1/reports/export?format=csv&event_type=ROAD_DEFECT`, '_blank');
  };
}

// --------------------------------------------------------------------------
// Screen 4: Traffic Intelligence & Peak-Hour Simulation
// --------------------------------------------------------------------------

function renderTrafficIntelligence(container) {
  const trafficEvents = appState.data.events.filter(e => e.event_type === 'TRAFFIC');
  const hourly = appState.data.hourly_traffic;
  const currentHourData = hourly.find(h => h.hour === appState.trafficHour) || hourly[3];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">TRAFFIC CONGESTION & ROUTE DELAY ANALYSIS</span>
        <h2 class="section-title">Traffic Density & Bottlenecks</h2>
        <p class="section-desc">Mobile vehicle classification, corridor speeds, route delays, and time-slider congestion simulation.</p>
      </div>
      <div>
        <span class="status-chip live">MONITORING 8 CORRIDORS</span>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Time Slider HUD -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:14px 18px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <span class="eyebrow">TIME-LAPSE CONGESTION SIMULATOR</span>
            <h3 style="font-size:15px;color:#fff">Selected Hour: <span style="color:var(--cyan-primary);font-family:var(--font-mono)">${currentHourData.hour}</span></h3>
          </div>
          <div style="display:flex;gap:16px">
            <div>
              <span style="font-size:9.5px;color:var(--text-muted);text-transform:uppercase">Avg Speed</span>
              <strong style="display:block;font-size:14px;color:#fff">${currentHourData.avg_speed_kph} km/h</strong>
            </div>
            <div>
              <span style="font-size:9.5px;color:var(--text-muted);text-transform:uppercase">Density</span>
              <strong style="display:block;font-size:14px;color:var(--cyan-primary)">${currentHourData.density_vph} veh/hr</strong>
            </div>
            <div>
              <span style="font-size:9.5px;color:var(--text-muted);text-transform:uppercase">Congestion Index</span>
              <strong style="display:block;font-size:14px;color:${currentHourData.congestion_index > 80 ? 'var(--crimson-crit)' : '#ffab00'}">${currentHourData.congestion_index}/100</strong>
            </div>
          </div>
        </div>
        <input type="range" id="hourSlider" min="0" max="${hourly.length - 1}" value="${hourly.findIndex(h => h.hour === currentHourData.hour)}" style="width:100%;accent-color:var(--cyan-primary);cursor:pointer">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-family:var(--font-mono);color:var(--text-muted);margin-top:4px">
          <span>06:00 (Early Morning)</span>
          <span>09:00 (Morning Peak)</span>
          <span>13:00 (Midday)</span>
          <span>18:00 (Evening Peak)</span>
          <span>22:00 (Night)</span>
        </div>
      </div>

      <!-- Vehicle Class Composition & Corridor Delays -->
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:16px">
        <!-- Vehicle Breakdown -->
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Vehicle Class Composition (Edge Counts)</span>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">
            ${Object.entries(appState.data.vehicle_classification).map(([vClass, pct]) => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px">
                  <span>${vClass}</span>
                  <strong style="font-family:var(--font-mono)">${pct}%</strong>
                </div>
                <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${vClass.includes('Two') ? '#00e5ff' : vClass.includes('Car') ? '#2979ff' : vClass.includes('Auto') ? '#ffab00' : '#b388ff'}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Corridor Delays Table -->
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Critical Corridor Delays</span>
          <table class="innovexa-table" style="margin-top:10px">
            <thead>
              <tr>
                <th>Corridor</th>
                <th>Transit Delay</th>
                <th>Avg Speed</th>
                <th>Congestion Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Outer Ring Road (Silk Board to Bellandur)</td>
                <td style="color:var(--crimson-crit);font-weight:700">+24 min</td>
                <td>11.2 km/h</td>
                <td><span class="badge badge-crit">SEVERE</span></td>
              </tr>
              <tr>
                <td>Kundalahalli Gate to Whitefield</td>
                <td style="color:var(--orange-hazard);font-weight:700">+19 min</td>
                <td>14.6 km/h</td>
                <td><span class="badge badge-warn">HIGH</span></td>
              </tr>
              <tr>
                <td>Hosur Road Kudlu Gate Convergence</td>
                <td style="color:var(--orange-hazard);font-weight:700">+16 min</td>
                <td>16.8 km/h</td>
                <td><span class="badge badge-warn">HIGH</span></td>
              </tr>
              <tr>
                <td>Hebbal Flyover City Inbound</td>
                <td style="color:#ffab00;font-weight:700">+12 min</td>
                <td>21.0 km/h</td>
                <td><span class="badge badge-warn">MODERATE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Wire Hour Slider
  const slider = el('hourSlider');
  if (slider) {
    slider.oninput = (e) => {
      const idx = parseInt(e.target.value, 10);
      appState.trafficHour = hourly[idx].hour;
      renderTrafficIntelligence(container);
    };
  }
}

// --------------------------------------------------------------------------
// Screen 5: Incident Center & Human-In-The-Loop ANPR Workspace
// --------------------------------------------------------------------------

function renderIncidentCenter(container) {
  const incidents = appState.data.events.filter(e => e.event_type === 'SAFETY_INCIDENT');

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">CRITICAL SAFETY EVENTS & OFFENDING VEHICLE TRIAGE</span>
        <h2 class="section-title">Incident Center & ANPR Review</h2>
        <p class="section-desc">Evidence verification pipeline for hit-and-run, rash driving, and school-zone pedestrian hazards.</p>
      </div>
      <div>
        <span class="status-chip live">${incidents.filter(i=>i.review_status==='PENDING').length} PENDING HUMAN REVIEW</span>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden">
        <div class="panel-header-strip">
          <span class="panel-title">Incident Evidence Queue</span>
          <span style="font-size:11px;color:var(--text-muted)">Click row to launch full Investigation Workspace</span>
        </div>
        <div class="table-responsive">
          <table class="innovexa-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Incident Subtype</th>
                <th>Location / Road</th>
                <th>Timestamp</th>
                <th>Offending Vehicle Plate Candidate</th>
                <th>ANPR Confidence</th>
                <th>Observing Bus</th>
                <th>Review Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${incidents.map(inc => `
                <tr data-incident-row="${inc.id}">
                  <td style="font-family:var(--font-mono);font-weight:700">${inc.id}</td>
                  <td><strong>${inc.event_subtype.replace(/_/g, ' ')}</strong></td>
                  <td>${inc.road_name}</td>
                  <td style="font-family:var(--font-mono)">${formatTime(inc.occurred_at)}</td>
                  <td>
                    ${inc.anpr ? `<span style="font-family:var(--font-mono);background:#ffd600;color:#000;font-weight:700;padding:2px 6px;border-radius:3px">${inc.anpr.plate_text}</span>` : '<span style="color:var(--text-muted)">None Extracted</span>'}
                  </td>
                  <td>
                    ${inc.anpr ? `<span class="badge badge-ai">${(inc.anpr.confidence * 100).toFixed(1)}%</span>` : '—'}
                  </td>
                  <td>${inc.bus_id}</td>
                  <td><span class="badge ${inc.review_status === 'VERIFIED' ? 'badge-ok' : inc.review_status === 'REJECTED' ? 'badge-crit' : 'badge-warn'}">${inc.review_status}</span></td>
                  <td>
                    <button class="btn btn-primary" style="padding:2px 8px;font-size:10px" data-launch-workspace="${inc.id}">Review Evidence</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-incident-row]').forEach(row => {
    row.onclick = () => {
      openIncidentWorkspace(row.dataset.incidentRow);
    };
  });
}

function openIncidentWorkspace(eventId) {
  const evt = appState.data.events.find(e => e.id === eventId);
  if (!evt) return;

  const modal = el('incidentModal');
  const windowEl = el('incidentModalWindow');
  modal.classList.remove('hidden');

  const plateText = evt.anpr?.plate_text || 'KA 01 AB 4582';
  const conf = evt.anpr?.confidence || 0.912;

  windowEl.innerHTML = `
    <div class="modal-header">
      <div>
        <span class="drawer-eyebrow">HUMAN-IN-THE-LOOP FORENSIC WORKSPACE</span>
        <h3>${evt.id} — ${evt.event_subtype.replace(/_/g, ' ')}</h3>
      </div>
      <button class="modal-close-btn" id="closeIncidentModal">×</button>
    </div>

    <div class="incident-workspace-grid">
      <!-- Left Panel: Large Evidence Frame & ANPR Crop -->
      <div class="evidence-canvas-panel">
        <div class="large-frame-view">
          <svg viewBox="0 0 640 360" width="100%" height="100%">
            <rect width="640" height="360" fill="#060c12"/>
            <polygon points="120,360 520,360 360,160 280,160" fill="#111c28"/>
            <line x1="320" y1="160" x2="320" y2="360" stroke="#00e5ff" stroke-width="2" stroke-dasharray="14,14" opacity="0.6"/>
            <!-- Offending Car -->
            <rect x="250" y="190" width="140" height="90" fill="#1b2a3a" stroke="#ff1744" stroke-width="2.5" rx="6"/>
            <rect x="270" y="245" width="100" height="25" fill="#ffd600" stroke="#000" stroke-width="1.5"/>
            <text x="320" y="262" fill="#000" font-family="monospace" font-weight="bold" font-size="12" text-anchor="middle">${plateText}</text>
            <!-- Tracking Trajectory Vector -->
            <line x1="320" y1="280" x2="340" y2="340" stroke="#ff1744" stroke-width="2.5" stroke-dasharray="4,4"/>
            <circle cx="340" cy="340" r="4" fill="#ff1744"/>
            <text x="350" y="344" fill="#ff1744" font-family="monospace" font-size="10">TRACK-104 (48 km/h)</text>
          </svg>
          <div class="camera-hud-overlay">BUS-014 · CAM-FRONT · UTC 14:32:09</div>
          <div class="ai-bbox crit" style="top:52%;left:39%;width:22%;height:25%">
            <span class="ai-bbox-tag">SUSPECTED VEHICLE (KA 01 AB 4582)</span>
          </div>
        </div>

        <!-- ANPR Crop & Per-Character Verification -->
        <div class="anpr-crop-strip">
          <div class="anpr-plate-display">${plateText}</div>
          <div class="anpr-meta-group">
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span>OCR Candidate Confidence</span>
              <strong style="color:var(--emerald-ok);font-family:var(--font-mono)">${(conf * 100).toFixed(1)}%</strong>
            </div>
            <div class="anpr-conf-bar">
              <div class="anpr-conf-fill" style="width:${conf * 100}%"></div>
            </div>
            <div style="font-size:9.5px;color:var(--text-muted);font-family:var(--font-mono)">
              CHAR CONF: K:94% A:92% 0:89% 1:91% A:95% B:88% 4:90% 5:92% 8:93% 2:86%
            </div>
          </div>
        </div>

        <div class="disclaimer-callout">
          <strong>⚠ Human Validation Protocol:</strong> AI-generated candidate text extracted from edge video. This candidate does not establish legal identity or liability until authenticated by an authorized police reviewer.
        </div>
      </div>

      <!-- Right Panel: Incident Timeline & Human Action Buttons -->
      <div class="incident-details-panel">
        <div>
          <span class="panel-title">Forensic Incident Timeline</span>
          <div class="timeline-trail" style="margin-top:12px">
            <div class="timeline-node">
              <time>14:32:09 UTC</time>
              <strong>Vehicle Enters Camera Field</strong>
              <p>Detected by BUS-014 forward camera on Bellandur ORR corridor.</p>
            </div>
            <div class="timeline-node danger">
              <time>14:32:11 UTC</time>
              <strong>Unsafe Collision / Maneuver Event</strong>
              <p>Rapid acceleration and unsafe lane deviation triggered incident buffer.</p>
            </div>
            <div class="timeline-node">
              <time>14:32:12 UTC</time>
              <strong>Multi-Frame Tracking Initiated</strong>
              <p>ByteTrack assigned ID 104; preserved trajectory coordinates.</p>
            </div>
            <div class="timeline-node">
              <time>14:32:14 UTC</time>
              <strong>ANPR Candidate Extracted</strong>
              <p>Candidate plate text "${plateText}" generated with ${(conf*100).toFixed(1)}% confidence.</p>
            </div>
            <div class="timeline-node">
              <time>14:32:17 UTC</time>
              <strong>Encrypted Metadata Transmitted</strong>
              <p>Geotagged package synchronized to central operations console.</p>
            </div>
          </div>
        </div>

        <div class="review-actions-bar">
          <button class="btn btn-primary" id="btnVerifyIncident">Verify Incident</button>
          <button class="btn btn-danger" id="btnRejectIncident">Reject False Positive</button>
          <button class="btn btn-secondary" id="btnMarkUncertain">Mark Uncertain</button>
          <button class="btn btn-secondary" id="btnExportIncidentReport">Export Incident Report</button>
        </div>
      </div>
    </div>
  `;

  el('closeIncidentModal').onclick = () => modal.classList.add('hidden');

  el('btnVerifyIncident').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'VERIFIED', 'Verified by Traffic Police Reviewer');
    modal.classList.add('hidden');
    renderActiveView();
  };

  el('btnRejectIncident').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'REJECTED', 'Rejected false positive by reviewer');
    modal.classList.add('hidden');
    renderActiveView();
  };

  el('btnMarkUncertain').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'UNCERTAIN', 'Flagged for secondary evidence review');
    modal.classList.add('hidden');
    renderActiveView();
  };

  el('btnExportIncidentReport').onclick = () => {
    modal.classList.add('hidden');
    openPrintableReport(evt);
  };
}

// --------------------------------------------------------------------------
// Screen 6: AI Evidence Explorer
// --------------------------------------------------------------------------

function renderEvidenceExplorer(container) {
  const events = appState.data.events;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">EDGE INFERENCE GALLERY & AUDIT ARTIFACTS</span>
        <h2 class="section-title">AI Evidence Explorer</h2>
        <p class="section-desc">Searchable library of edge detections, inference bounding boxes, and model verification records.</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" id="filterHighConf">Confidence ≥ 90%</button>
      </div>
    </div>

    <div style="padding:16px 20px">
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:14px">
        ${events.slice(0, 24).map(e => `
          <div class="camera-tile" style="cursor:pointer" data-evidence-card="${e.id}">
            <div class="camera-header">
              <span style="font-family:var(--font-mono)">${e.id}</span>
              <span class="badge ${e.severity === 'CRITICAL' ? 'badge-crit' : 'badge-warn'}">${e.severity}</span>
            </div>
            <div class="camera-viewport" style="aspect-ratio:16/10">
              ${renderCameraCanvas(e.camera_id)}
              <div class="ai-bbox" style="top:25%;left:25%;width:50%;height:50%">
                <span class="ai-bbox-tag">${e.event_subtype.replace(/_/g, ' ')} ${(e.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div style="padding:10px 12px;background:var(--bg-surface-elevated)">
              <div style="font-weight:600;font-size:12px;color:#fff">${e.road_name}</div>
              <div style="font-size:10.5px;color:var(--text-muted);margin:2px 0">${e.bus_id} · ${e.model_name} ${e.model_version}</div>
              <div style="display:flex;justify-content:space-between;margin-top:6px">
                <span class="badge ${e.review_status === 'VERIFIED' ? 'badge-ok' : 'badge-neutral'}">${e.review_status}</span>
                <span style="font-size:10px;font-family:var(--font-mono);color:var(--cyan-primary)">Latency: ${e.metadata.inference_ms || 32}ms</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-evidence-card]').forEach(card => {
    card.onclick = () => openEventDrawer(card.dataset.evidenceCard);
  });
}

// --------------------------------------------------------------------------
// Screen 7: Analytics
// --------------------------------------------------------------------------

function renderAnalytics(container) {
  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">SPATIAL-TEMPORAL MOBILITY INSIGHTS</span>
        <h2 class="section-title">Citywide Analytics & Planning</h2>
        <p class="section-desc">Historical road health trends, sensing coverage frequency, infrastructure backlog, and route reliability.</p>
      </div>
      <div>
        <button class="btn btn-primary" onclick="window.print()">Export PDF Brief</button>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Sensing Coverage Indicators -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px">
        <div class="metric-tile">
          <span class="metric-label">Unique Road KM Observed</span>
          <span class="metric-value">1,842 km</span>
          <span class="metric-sub">City Arterial Network</span>
        </div>
        <div class="metric-tile">
          <span class="metric-label">Citywide Sensing Coverage</span>
          <span class="metric-value" style="color:var(--emerald-ok)">84.6%</span>
          <span class="metric-sub">Demo Metropolitan Zone</span>
        </div>
        <div class="metric-tile">
          <span class="metric-label">Revisit Frequency</span>
          <span class="metric-value">6.4 passes</span>
          <span class="metric-sub">Per Corridor / Day</span>
        </div>
        <div class="metric-tile">
          <span class="metric-label">Bandwidth Reduction</span>
          <span class="metric-value" style="color:var(--cyan-primary)">98.4%</span>
          <span class="metric-sub">Edge AI vs Raw Video Stream</span>
        </div>
      </div>

      <!-- Charts Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- 8-Week Road Health Trend -->
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Road Surface Quality Index (8-Week Trend)</span>
          <div style="margin-top:14px;display:flex;align-items:flex-end;gap:14px;height:140px;padding-bottom:10px">
            ${[84, 82, 79, 75, 73, 70, 71, 74].map((score, i) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end">
                <span style="font-size:10px;font-family:var(--font-mono);color:#fff;margin-bottom:4px">${score}</span>
                <div style="width:100%;height:${score}%;background:${score < 72 ? 'var(--crimson-crit)' : score < 80 ? 'var(--amber-warn)' : 'var(--cyan-primary)'};border-radius:2px 2px 0 0"></div>
                <span style="font-size:10px;color:var(--text-muted);margin-top:4px">W${i+1}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Route Reliability & Delay Index -->
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Route Schedule Adherence & Congestion Resistance</span>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            ${appState.data.routes.map((r, i) => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                  <span><strong>${r.id}</strong>: ${r.name}</span>
                  <span style="font-family:var(--font-mono)">${94 - i * 5}%</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${94 - i * 5}%;background:#00e5ff"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Screen 8: Fleet Health Operations Console
// --------------------------------------------------------------------------

function renderFleetHealth(container) {
  const devices = appState.data.devices;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">EDGE COMPUTE RUNTIMES & TELEMETRY</span>
        <h2 class="section-title">Fleet Device Health Console</h2>
        <p class="section-desc">Hardware temperatures, storage buffers, inference frame-rates, and network latency monitoring.</p>
      </div>
      <div>
        <button class="btn btn-secondary" id="btnTriggerHealthCheck">Trigger Edge Ping</button>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Device Health Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px">
        <div class="metric-tile" style="border-left:3px solid var(--emerald-ok)">
          <span class="metric-label">Healthy Runtimes</span>
          <span class="metric-value">${devices.filter(d=>d.status==='HEALTHY').length}</span>
          <span class="metric-sub">Operating Nominal</span>
        </div>
        <div class="metric-tile" style="border-left:3px solid var(--amber-warn)">
          <span class="metric-label">Degraded</span>
          <span class="metric-value">${devices.filter(d=>d.status==='DEGRADED').length}</span>
          <span class="metric-sub">High Temp or Latency</span>
        </div>
        <div class="metric-tile" style="border-left:3px solid var(--orange-hazard)">
          <span class="metric-label">Stale Telemetry</span>
          <span class="metric-value">${devices.filter(d=>d.status==='STALE').length}</span>
          <span class="metric-sub">> 30 min since sync</span>
        </div>
        <div class="metric-tile" style="border-left:3px solid var(--crimson-crit)">
          <span class="metric-label">Offline</span>
          <span class="metric-value">${devices.filter(d=>d.status==='OFFLINE').length}</span>
          <span class="metric-sub">Depot Maintenance</span>
        </div>
      </div>

      <!-- Telemetry Table -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden">
        <div class="table-responsive">
          <table class="innovexa-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Host Bus</th>
                <th>Status</th>
                <th>Hardware Profile</th>
                <th>Core Temp</th>
                <th>Storage Buffer</th>
                <th>Network Latency</th>
                <th>Inference Rate</th>
                <th>Software Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${devices.map(dev => `
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700">${dev.id}</td>
                  <td><strong>${dev.bus_id}</strong></td>
                  <td><span class="badge ${dev.status === 'HEALTHY' ? 'badge-ok' : dev.status === 'DEGRADED' ? 'badge-warn' : dev.status === 'STALE' ? 'badge-warn' : 'badge-crit'}">${dev.status}</span></td>
                  <td>${dev.hardware_profile}</td>
                  <td style="font-family:var(--font-mono);color:${dev.temperature_c > 60 ? 'var(--crimson-crit)' : '#fff'}">${dev.temperature_c}°C</td>
                  <td style="font-family:var(--font-mono)">${dev.storage_used_pct}%</td>
                  <td style="font-family:var(--font-mono)">${dev.network_latency_ms} ms</td>
                  <td style="font-family:var(--font-mono);color:var(--emerald-ok)">${dev.inference_fps} FPS</td>
                  <td>${dev.software_version}</td>
                  <td>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:10px" onclick="showToast('Diagnostics ran on ${dev.id}: Heartbeat verified.')">Diagnostic</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  el('btnTriggerHealthCheck').onclick = () => {
    showToast('Ping packet broadcast to all 36 edge nodes. Telemetry refreshed.', 'success');
  };
}

// --------------------------------------------------------------------------
// Screen 9: Alert Center
// --------------------------------------------------------------------------

function renderAlertCenter(container) {
  const alerts = appState.data.alerts;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">INCIDENT DISPATCH & WORK ORDER TRIAGE</span>
        <h2 class="section-title">Alert Operations Center</h2>
        <p class="section-desc">Four-stage alert resolution workflow: New → Acknowledged → Assigned → Resolved.</p>
      </div>
      <div>
        <span class="badge badge-warn">${alerts.filter(a=>a.state!=='RESOLVED').length} Active Alerts</span>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Workflow Status Counters -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px">
        ${['NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'RESOLVED'].map(st => `
          <div class="metric-tile" style="border-top:3px solid ${st==='NEW'?'var(--crimson-crit)':st==='ACKNOWLEDGED'?'#ffab00':st==='ASSIGNED'?'#2979ff':'#00e676'}">
            <span class="metric-label">${st}</span>
            <span class="metric-value">${alerts.filter(a=>a.state===st).length}</span>
          </div>
        `).join('')}
      </div>

      <!-- Alerts Queue -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden">
        <div class="table-responsive">
          <table class="innovexa-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Alert Title</th>
                <th>Assigned Unit</th>
                <th>Timestamp</th>
                <th>State</th>
                <th>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.map(alt => `
                <tr>
                  <td style="font-family:var(--font-mono);font-weight:700">${alt.id}</td>
                  <td><span class="badge badge-neutral">${alt.category}</span></td>
                  <td><span class="badge ${alt.severity === 'CRITICAL' ? 'badge-crit' : alt.severity === 'HIGH' ? 'badge-warn' : 'badge-neutral'}">${alt.severity}</span></td>
                  <td><strong>${alt.title}</strong></td>
                  <td>${alt.assigned_to || 'Unassigned'}</td>
                  <td style="font-family:var(--font-mono)">${formatTime(alt.created_at)}</td>
                  <td><span class="badge ${alt.state === 'RESOLVED' ? 'badge-ok' : alt.state === 'ASSIGNED' ? 'badge-ai' : alt.state === 'ACKNOWLEDGED' ? 'badge-warn' : 'badge-crit'}">${alt.state}</span></td>
                  <td>
                    ${alt.state !== 'RESOLVED' ? `
                      <button class="btn btn-primary" style="padding:3px 8px;font-size:10px" data-alert-next="${alt.id}">
                        ${alt.state === 'NEW' ? 'Acknowledge' : alt.state === 'ACKNOWLEDGED' ? 'Assign Crew' : 'Resolve'}
                      </button>
                    ` : '<span style="color:var(--text-muted);font-size:10px">✓ Closed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-alert-next]').forEach(btn => {
    btn.onclick = async () => {
      const altId = btn.dataset.alertNext;
      const alert = appState.data.alerts.find(a => a.id === altId);
      if (!alert) return;

      const nextState = alert.state === 'NEW' ? 'ACKNOWLEDGED' : alert.state === 'ACKNOWLEDGED' ? 'ASSIGNED' : 'RESOLVED';
      await updateAlertState(altId, nextState);
      renderAlertCenter(container);
    };
  });
}

// --------------------------------------------------------------------------
// Screen 10: Reports Builder & Printable View
// --------------------------------------------------------------------------

function renderReports(container) {
  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">OFFICIAL EXPORT & COMPLIANCE RECORDS</span>
        <h2 class="section-title">Operational Reports</h2>
        <p class="section-desc">Generate official municipal road hazard dossiers, traffic corridor summaries, and CSV/JSON data packages.</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" id="btnExportCSV">Export Full CSV</button>
        <button class="btn btn-secondary" id="btnExportJSON">Export Full JSON</button>
        <button class="btn btn-primary" id="btnPrintReport">Print Formal Dossier</button>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Report Generator Options -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:16px">
        <span class="panel-title">Report Configuration Parameters</span>
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-top:12px">
          <div>
            <label style="font-size:10.5px;color:var(--text-muted);display:block;margin-bottom:4px">Report Type</label>
            <select id="repType" style="width:100%;background:var(--bg-surface-elevated);border:1px solid var(--border-default);color:#fff;padding:6px;border-radius:4px">
              <option value="ALL">Complete Urban Intelligence Summary</option>
              <option value="ROAD_DEFECT">Road Pothole & Defect Registry</option>
              <option value="INFRASTRUCTURE">Missing Infrastructure Deficiency</option>
              <option value="SAFETY_INCIDENT">High-Priority Safety Incidents</option>
              <option value="TRAFFIC">Traffic Congestion Hotspots</option>
            </select>
          </div>
          <div>
            <label style="font-size:10.5px;color:var(--text-muted);display:block;margin-bottom:4px">Corridor Zone</label>
            <select id="repCorridor" style="width:100%;background:var(--bg-surface-elevated);border:1px solid var(--border-default);color:#fff;padding:6px;border-radius:4px">
              <option value="ALL">All City Zones</option>
              ${appState.data.routes.map(r => `<option value="${r.id}">${r.id}: ${r.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:10.5px;color:var(--text-muted);display:block;margin-bottom:4px">Date Range</label>
            <input type="date" value="2026-09-18" style="width:100%;background:var(--bg-surface-elevated);border:1px solid var(--border-default);color:#fff;padding:5px;border-radius:4px">
          </div>
          <div style="display:flex;align-items:flex-end">
            <button class="btn btn-primary" style="width:100%" id="btnPreviewReport">Apply Filter Preview</button>
          </div>
        </div>
      </div>

      <!-- Live Report Preview Table -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden">
        <div class="panel-header-strip">
          <span class="panel-title">Report Data Preview (${appState.data.events.length} Records)</span>
        </div>
        <div class="table-responsive">
          <table class="innovexa-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Type</th>
                <th>Subtype</th>
                <th>Severity</th>
                <th>Road Name</th>
                <th>Bus ID</th>
                <th>Review Status</th>
              </tr>
            </thead>
            <tbody>
              ${appState.data.events.slice(0, 15).map(e => `
                <tr>
                  <td style="font-family:var(--font-mono)">${e.id}</td>
                  <td>${e.event_type}</td>
                  <td><strong>${e.event_subtype}</strong></td>
                  <td><span class="badge ${e.severity === 'CRITICAL' ? 'badge-crit' : 'badge-warn'}">${e.severity}</span></td>
                  <td>${e.road_name}</td>
                  <td>${e.bus_id}</td>
                  <td><span class="badge ${e.review_status === 'VERIFIED' ? 'badge-ok' : 'badge-warn'}">${e.review_status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  el('btnExportCSV').onclick = () => {
    window.open(`${API_BASE}/api/v1/reports/export?format=csv`, '_blank');
  };

  el('btnExportJSON').onclick = () => {
    window.open(`${API_BASE}/api/v1/reports/export?format=json`, '_blank');
  };

  el('btnPrintReport').onclick = () => {
    openPrintableReport();
  };
}

function openPrintableReport(specificIncident = null) {
  const container = el('printReportContainer');
  container.classList.remove('hidden');

  container.innerHTML = `
    <div style="background:#fff;color:#000;padding:40px;max-width:850px;margin:30px auto;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:14px">
        <div>
          <h1 style="font-size:22px;margin:0">INNOVEXA URBAN INTELLIGENCE PLATFORM</h1>
          <p style="margin:2px 0;font-size:12px;color:#555">Mobile Public Transport Edge Sensing Network · Problem Statement 26124</p>
        </div>
        <div style="text-align:right;font-size:11px">
          <strong>DATE:</strong> 2026-09-18<br>
          <strong>ZONE:</strong> Bengaluru Metro
        </div>
      </div>

      <div style="margin:20px 0">
        <h2 style="font-size:16px;border-bottom:1px solid #ccc;padding-bottom:4px">
          ${specificIncident ? `INCIDENT INVESTIGATION REPORT — ${specificIncident.id}` : 'MUNICIPAL ROAD CONDITION & HAZARD DOSSIER'}
        </h2>
        <p style="font-size:12px;color:#333">
          ${specificIncident 
            ? `Forensic summary of detected safety event involving suspected offending vehicle candidate ${specificIncident.anpr?.plate_text || 'KA 01 AB 4582'}.`
            : 'Consolidated summary of road defects, pavement hazards, and missing infrastructure elements observed by the 36-bus mobile sensing fleet.'}
        </p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11px;margin:20px 0">
        <thead>
          <tr style="background:#eee;border-bottom:1px solid #000">
            <th style="padding:6px;text-align:left">ID</th>
            <th style="padding:6px;text-align:left">Category</th>
            <th style="padding:6px;text-align:left">Road Location</th>
            <th style="padding:6px;text-align:left">Severity</th>
            <th style="padding:6px;text-align:left">Confidence</th>
            <th style="padding:6px;text-align:left">Review Status</th>
          </tr>
        </thead>
        <tbody>
          ${(specificIncident ? [specificIncident] : appState.data.events.slice(0, 15)).map(e => `
            <tr style="border-bottom:1px solid #ddd">
              <td style="padding:6px">${e.id}</td>
              <td style="padding:6px"><strong>${e.event_subtype}</strong></td>
              <td style="padding:6px">${e.road_name}</td>
              <td style="padding:6px">${e.severity}</td>
              <td style="padding:6px">${(e.confidence * 100).toFixed(0)}%</td>
              <td style="padding:6px">${e.review_status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:11px;border-top:1px solid #000;padding-top:12px">
        <div>
          <strong>System Generated:</strong> INNOVEXA Autonomous Edge Ingestion Engine v2.4.1
        </div>
        <div style="text-align:right">
          <strong>Authorized Officer Sign-off:</strong> ______________________
        </div>
      </div>

      <div style="text-align:center;margin-top:24px">
        <button class="btn btn-primary" onclick="window.print()">Print Dossier</button>
        <button class="btn btn-secondary" onclick="document.getElementById('printReportContainer').classList.add('hidden')">Close</button>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Screen 11: Administration & Role Simulation
// --------------------------------------------------------------------------

function renderAdministration(container) {
  container.innerHTML = `
    <div class="section-header">
      <div>
        <span class="eyebrow">GOVERNANCE, ROLES & MODEL REGISTRY</span>
        <h2 class="section-title">Administration Console</h2>
        <p class="section-desc">Manage edge AI model bundles, simulate authority roles, inspect audit logs, and configure alert escalation rules.</p>
      </div>
    </div>

    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:16px">
      <!-- Role Simulation Grid -->
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:16px">
        <span class="panel-title">Active Persona Simulation</span>
        <p style="font-size:11px;color:var(--text-muted);margin:4px 0 12px">Switch operational persona to test permissions and workflow action guards.</p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px">
          ${ROLES.map(r => `
            <div class="metric-tile ${r.id === appState.role.id ? 'highlight' : ''}" style="cursor:pointer" data-role-select="${r.id}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="role-initials">${r.id}</span>
                ${r.id === appState.role.id ? '<span class="badge badge-ok">ACTIVE</span>' : ''}
              </div>
              <strong style="color:#fff;font-size:12.5px;margin-top:6px">${r.name}</strong>
              <span style="font-size:10px;color:var(--cyan-primary)">${r.agency}</span>
              <p style="font-size:10px;color:var(--text-muted);margin-top:4px">${r.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Models & Fleet Deployments -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Edge AI Model Bundle Registry</span>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            <div style="background:var(--bg-surface-elevated);padding:8px 12px;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:#fff;font-size:12px">YOLOv8-UrbanRoadDefect</strong>
                <span style="display:block;font-size:10px;color:var(--text-muted)">v2.4.1 (ONNX TensorRT 8.6) · 36 Devices</span>
              </div>
              <span class="badge badge-ok">ACTIVE</span>
            </div>
            <div style="background:var(--bg-surface-elevated);padding:8px 12px;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:#fff;font-size:12px">ByteTrack-TrajectoryEngine</strong>
                <span style="display:block;font-size:10px;color:var(--text-muted)">v1.8.0 · Multi-Camera Vehicle Tracker</span>
              </div>
              <span class="badge badge-ok">ACTIVE</span>
            </div>
            <div style="background:var(--bg-surface-elevated);padding:8px 12px;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:#fff;font-size:12px">CRNN-IndianANPR-OCR</strong>
                <span style="display:block;font-size:10px;color:var(--text-muted)">v3.1.2 · High-speed Plate Candidate Extraction</span>
              </div>
              <span class="badge badge-ok">ACTIVE</span>
            </div>
          </div>
        </div>

        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px">
          <span class="panel-title">Audit Log Trail</span>
          <div style="margin-top:10px;max-height:160px;overflow-y:auto">
            ${appState.data.audit_logs.map(log => `
              <div style="font-size:11px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                <span style="font-family:var(--font-mono);color:var(--text-muted)">${formatTime(log.timestamp)}</span>
                <strong style="color:var(--cyan-primary);margin-left:6px">${log.user_role}:</strong>
                <span style="color:#fff">${log.details}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-role-select]').forEach(card => {
    card.onclick = () => {
      const rId = card.dataset.roleSelect;
      const targetRole = ROLES.find(r => r.id === rId);
      if (targetRole) {
        appState.role = targetRole;
        el('roleInitials').textContent = targetRole.id;
        el('roleName').textContent = targetRole.name;
        showToast(`Switched active persona to ${targetRole.name}`);
        renderAdministration(container);
      }
    };
  });
}

// --------------------------------------------------------------------------
// Contextual Intelligence Drawer (Event & Bus)
// --------------------------------------------------------------------------

function openEventDrawer(eventId) {
  const evt = appState.data.events.find(e => e.id === eventId);
  if (!evt) return;

  appState.selectedEventId = eventId;
  const drawer = el('intelDrawer');
  const overlay = el('drawerOverlay');

  el('drawerEyebrow').textContent = 'EVENT INTELLIGENCE';
  el('drawerHeading').textContent = evt.id;

  el('drawerContent').innerHTML = `
    <!-- Camera Viewport Preview -->
    <div class="camera-viewport" style="aspect-ratio:16/9;border:1px solid var(--border-default);border-radius:var(--radius-sm)">
      ${renderCameraCanvas(evt.camera_id)}
      <div class="camera-hud-overlay">${evt.camera_id} · ${formatTime(evt.occurred_at)}</div>
      <div class="ai-bbox ${evt.severity === 'CRITICAL' ? 'crit' : 'hazard'}" style="top:25%;left:25%;width:50%;height:50%">
        <span class="ai-bbox-tag">${evt.event_subtype.replace(/_/g, ' ')} ${(evt.confidence * 100).toFixed(0)}%</span>
      </div>
    </div>

    <!-- Metadata Definitions -->
    <dl class="kv-grid">
      <dt>Event Type</dt>
      <dd>${evt.event_type}</dd>
      <dt>Subtype</dt>
      <dd><strong>${evt.event_subtype.replace(/_/g, ' ')}</strong></dd>
      <dt>Severity</dt>
      <dd><span class="badge ${evt.severity === 'CRITICAL' ? 'badge-crit' : 'badge-warn'}">${evt.severity}</span></dd>
      <dt>AI Confidence</dt>
      <dd><span class="badge badge-ai">${(evt.confidence * 100).toFixed(1)}%</span></dd>
      <dt>Location</dt>
      <dd>${evt.road_name}</dd>
      <dt>GPS Coordinates</dt>
      <dd style="font-family:var(--font-mono)">${evt.lat.toFixed(5)}°N, ${evt.lon.toFixed(5)}°E</dd>
      <dt>Observing Bus</dt>
      <dd>${evt.bus_id} (${evt.route_id})</dd>
      <dt>AI Model</dt>
      <dd>${evt.model_name} ${evt.model_version}</dd>
      <dt>Review Status</dt>
      <dd><span class="badge ${evt.review_status === 'VERIFIED' ? 'badge-ok' : evt.review_status === 'REJECTED' ? 'badge-crit' : 'badge-warn'}">${evt.review_status}</span></dd>
      ${evt.anpr ? `
        <dt>ANPR Candidate</dt>
        <dd style="font-family:var(--font-mono);background:#ffd600;color:#000;padding:1px 4px;border-radius:3px">${evt.anpr.plate_text}</dd>
      ` : ''}
      <dt>Repeat Passes</dt>
      <dd style="color:var(--cyan-primary)">${evt.metadata.repeat_observations || 1} Observations</dd>
    </dl>

    <!-- Human Review Actions -->
    <div style="border-top:1px solid var(--border-subtle);padding-top:12px;display:flex;flex-wrap:wrap;gap:8px">
      <button class="btn btn-primary" id="drawerVerifyBtn">Verify Detection</button>
      <button class="btn btn-danger" id="drawerRejectBtn">Reject False Positive</button>
      <button class="btn btn-secondary" id="drawerUncertainBtn">Mark Uncertain</button>
      ${evt.event_type === 'SAFETY_INCIDENT' ? `<button class="btn btn-demo" id="drawerWorkspaceBtn">Launch Incident Workspace</button>` : ''}
    </div>
  `;

  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');

  el('drawerVerifyBtn').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'VERIFIED', 'Verified via Intelligence Drawer');
    openEventDrawer(evt.id);
  };

  el('drawerRejectBtn').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'REJECTED', 'Rejected via Intelligence Drawer');
    openEventDrawer(evt.id);
  };

  el('drawerUncertainBtn').onclick = async () => {
    await updateEventReviewStatus(evt.id, 'UNCERTAIN', 'Marked uncertain via Intelligence Drawer');
    openEventDrawer(evt.id);
  };

  const wsBtn = el('drawerWorkspaceBtn');
  if (wsBtn) {
    wsBtn.onclick = () => {
      closeDrawer();
      openIncidentWorkspace(evt.id);
    };
  }
}

function openBusDrawer(busId) {
  const bus = appState.data.buses.find(b => b.id === busId);
  const dev = appState.data.devices.find(d => d.bus_id === busId);
  if (!bus) return;

  const drawer = el('intelDrawer');
  const overlay = el('drawerOverlay');

  el('drawerEyebrow').textContent = 'MOBILE SENSING NODE';
  el('drawerHeading').textContent = bus.id;

  el('drawerContent').innerHTML = `
    <dl class="kv-grid">
      <dt>Registration</dt>
      <dd style="font-family:var(--font-mono)">${bus.registration}</dd>
      <dt>Route</dt>
      <dd><strong>${bus.route_id}</strong></dd>
      <dt>Depot</dt>
      <dd>${bus.assigned_depot}</dd>
      <dt>Status</dt>
      <dd><span class="badge ${bus.status === 'ONLINE' ? 'badge-ok' : 'badge-warn'}">${bus.status}</span></dd>
      <dt>Speed</dt>
      <dd>${bus.speed_kph} km/h</dd>
      <dt>Heading</dt>
      <dd>${bus.heading}°</dd>
      <dt>GPS Fix</dt>
      <dd style="font-family:var(--font-mono)">${bus.lat.toFixed(5)}, ${bus.lon.toFixed(5)}</dd>
      <dt>Edge Device</dt>
      <dd>${dev ? dev.id : 'N/A'} (${dev ? dev.status : 'N/A'})</dd>
      <dt>Core Temp</dt>
      <dd>${dev ? dev.temperature_c : '—'}°C</dd>
      <dt>Storage Buffer</dt>
      <dd>${dev ? dev.storage_used_pct : '—'}%</dd>
    </dl>

    <div style="margin-top:14px">
      <span class="panel-title">Forward Camera Live AI Stream</span>
      <div class="camera-viewport" style="aspect-ratio:16/9;border:1px solid var(--border-default);border-radius:var(--radius-sm);margin-top:6px">
        ${renderCameraCanvas('front')}
        <div class="ai-bbox" style="top:25%;left:35%;width:28%;height:45%">
          <span class="ai-bbox-tag">CAR 97%</span>
        </div>
      </div>
    </div>
  `;

  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');
}

function closeDrawer() {
  const drawer = el('intelDrawer');
  const overlay = el('drawerOverlay');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// --------------------------------------------------------------------------
// State Mutation Actions (API + Resilient Local Updates)
// --------------------------------------------------------------------------

async function updateEventReviewStatus(eventId, newStatus, notes = '') {
  const evt = appState.data.events.find(e => e.id === eventId);
  if (evt) {
    evt.review_status = newStatus;
    showToast(`Event ${eventId} set to ${newStatus}`, 'success');

    // Add local audit log
    appState.data.audit_logs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      user_role: appState.role.name,
      action: `EVENT_REVIEW_${newStatus}`,
      target_entity: 'EVENT',
      target_id: eventId,
      details: notes || `Reviewed by ${appState.role.name}`
    });
  }

  // Update FastAPI Backend asynchronously
  if (appState.isLiveApi) {
    try {
      await fetch(`${API_BASE}/api/v1/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: newStatus,
          review_notes: notes,
          reviewer_role: appState.role.name
        })
      });
    } catch (err) {
      console.warn('Asynchronous API patch fallback:', err);
    }
  }

  if (appState.page === 'command' && appState.gisMap) {
    appState.gisMap.updateEvents(appState.data.events);
  }
}

async function updateAlertState(alertId, nextState) {
  const alert = appState.data.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.state = nextState;
    showToast(`Alert ${alertId} progressed to ${nextState}`, 'success');
  }

  if (appState.isLiveApi) {
    try {
      await fetch(`${API_BASE}/api/v1/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: nextState })
      });
    } catch (err) {
      console.warn('Alert patch API error:', err);
    }
  }
}

// --------------------------------------------------------------------------
// Command Palette (Ctrl+K)
// --------------------------------------------------------------------------

function initCommandPalette() {
  const palette = el('commandPalette');
  const input = el('paletteInput');
  const results = el('paletteResults');

  el('globalSearchBtn').onclick = () => openPalette();

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') {
      palette.classList.add('hidden');
      closeDrawer();
      el('incidentModal').classList.add('hidden');
      el('roleModal').classList.add('hidden');
      el('printReportContainer').classList.add('hidden');
    }
  });

  input.oninput = () => renderPaletteResults(input.value.trim());

  function openPalette() {
    palette.classList.remove('hidden');
    input.value = '';
    input.focus();
    renderPaletteResults('');
  }

  function renderPaletteResults(query) {
    const q = query.toLowerCase();
    const commands = NAV_ITEMS.map(item => ({
      type: 'NAV',
      title: `Navigate to ${item.name}`,
      subtitle: 'Screen switch',
      action: () => navigateTo(item.id)
    }));

    const events = (appState.data?.events || []).slice(0, 40).map(evt => ({
      type: 'EVENT',
      title: `${evt.id} · ${evt.event_subtype.replace(/_/g, ' ')}`,
      subtitle: `${evt.road_name} · ${evt.bus_id}`,
      action: () => {
        navigateTo('command');
        setTimeout(() => {
          openEventDrawer(evt.id);
          if (appState.gisMap) appState.gisMap.flyTo(evt.lat, evt.lon, 16);
        }, 150);
      }
    }));

    const buses = (appState.data?.buses || []).map(b => ({
      type: 'BUS',
      title: `${b.id} — ${b.registration}`,
      subtitle: `Route: ${b.route_id} · Speed: ${b.speed_kph} km/h`,
      action: () => {
        appState.selectedBusId = b.id;
        navigateTo('fleet');
      }
    }));

    const all = [...commands, ...events, ...buses];
    const filtered = all.filter(item => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)).slice(0, 10);

    results.innerHTML = filtered.map((item, idx) => `
      <div class="palette-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        <div class="palette-item-main">
          <span class="palette-item-tag">${item.type}</span>
          <div>
            <strong style="color:#fff;font-size:12.5px;display:block">${item.title}</strong>
            <small style="color:var(--text-muted);font-size:10.5px">${item.subtitle}</small>
          </div>
        </div>
        <span style="font-size:10px;color:var(--text-muted)">↵ Select</span>
      </div>
    `).join('');

    results.querySelectorAll('.palette-item').forEach((itemEl, idx) => {
      itemEl.onclick = () => {
        palette.classList.add('hidden');
        filtered[idx].action();
      };
    });
  }
}

// --------------------------------------------------------------------------
// 4 End-to-End Demo Flows (SIH Judging Presentation)
// --------------------------------------------------------------------------

function initDemoFlows() {
  const btn = el('demoFlowBtn');
  const menu = el('demoFlowMenu');

  btn.onclick = (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  };

  document.addEventListener('click', () => menu.classList.add('hidden'));

  menu.querySelectorAll('[data-demo]').forEach(item => {
    item.onclick = () => {
      const demoNum = parseInt(item.dataset.demo, 10);
      menu.classList.add('hidden');
      executeDemoFlow(demoNum);
    };
  });
}

function executeDemoFlow(flowNumber) {
  switch (flowNumber) {
    case 1:
      // Flow 1: Pothole Detection & Civic Verification
      navigateTo('command');
      showToast('DEMO 1: BUS-004 detected critical pothole on Silk Board Flyover Underpass', 'warn');
      setTimeout(() => {
        const pothole = appState.data.events.find(e => e.event_subtype === 'POTHOLE' && e.severity === 'CRITICAL') || appState.data.events[0];
        if (pothole) {
          if (appState.gisMap) appState.gisMap.flyTo(pothole.lat, pothole.lon, 16);
          openEventDrawer(pothole.id);
          showToast('Opened Event Intelligence Drawer with AI bounding box & multi-pass telemetry');
        }
      }, 700);
      break;

    case 2:
      // Flow 2: Hit-and-Run ANPR & Police Investigation
      navigateTo('incidents');
      showToast('DEMO 2: Launching Forensic Workspace for Hit-and-Run Incident', 'danger');
      setTimeout(() => {
        const inc = appState.data.events.find(e => e.event_subtype === 'HIT_AND_RUN_SUSPECTED') || appState.data.events[0];
        if (inc) {
          openIncidentWorkspace(inc.id);
          showToast('Forensic trajectory & ANPR Candidate KA 01 AB 4582 loaded for review');
        }
      }, 500);
      break;

    case 3:
      // Flow 3: Corridor Congestion & Route Delay
      navigateTo('traffic');
      showToast('DEMO 3: Simulating 18:00 Peak-Hour Surge on Outer Ring Road', 'info');
      setTimeout(() => {
        appState.trafficHour = '18:00';
        renderActiveView();
        showToast('Corridor speeds reduced to 11 km/h; Silk Board bottleneck alert escalated');
      }, 600);
      break;

    case 4:
      // Flow 4: Edge Device Failure & Auto-Recovery
      navigateTo('health');
      showToast('DEMO 4: Simulating EDGE-019 Telemetry Degradation', 'warn');
      const dev = appState.data.devices.find(d => d.id === 'EDGE-019');
      if (dev) dev.status = 'DEGRADED';
      renderActiveView();
      setTimeout(() => {
        showToast('Self-healing agent re-synchronized EDGE-019. Status restored to HEALTHY', 'success');
        if (dev) dev.status = 'HEALTHY';
        renderActiveView();
      }, 3500);
      break;
  }
}

// --------------------------------------------------------------------------
// Live Simulation Ticker
// --------------------------------------------------------------------------

function initSimulationTicker() {
  setInterval(() => {
    // Live Clock update
    const now = new Date();
    el('liveClock').textContent = now.toLocaleTimeString('en-IN', { hour12: false });

    if (!appState.simActive || !appState.data) return;

    appState.simTick++;

    // Gently move buses along waypoints
    appState.data.buses.forEach((bus, i) => {
      if (bus.status === 'ONLINE') {
        const deltaLat = Math.sin((appState.simTick + i) / 5) * 0.00004;
        const deltaLon = Math.cos((appState.simTick + i) / 6) * 0.00004;
        bus.lat = +(bus.lat + deltaLat).toFixed(6);
        bus.lon = +(bus.lon + deltaLon).toFixed(6);
      }
    });

    // Update map bus markers
    if (appState.gisMap && appState.page === 'command') {
      appState.gisMap.updateBuses(appState.data.buses);
    }
  }, 1000);

  // Sim Pause / Resume Toggle
  el('simToggleBtn').onclick = () => {
    appState.simActive = !appState.simActive;
    el('simIcon').textContent = appState.simActive ? '⏸' : '▶';
    showToast(`Simulation ${appState.simActive ? 'Resumed' : 'Paused'}`);
  };

  // Presentation Mode Toggle
  el('presentationBtn').onclick = () => {
    appState.presentationMode = !appState.presentationMode;
    document.body.classList.toggle('presentation-mode', appState.presentationMode);
    showToast(`Presentation Mode: ${appState.presentationMode ? 'ACTIVE (HUD Optimized)' : 'OFF'}`);
  };

  // Alert Bell opens alerts
  el('alertBellBtn').onclick = () => navigateTo('alerts');

  // Sidebar Collapse
  el('collapseSidebar').onclick = () => {
    el('sidebar').classList.toggle('collapsed');
  };

  el('menuToggle').onclick = () => {
    el('sidebar').classList.toggle('mobile-open');
  };

  el('drawerCloseBtn').onclick = () => closeDrawer();
  el('drawerOverlay').onclick = () => closeDrawer();

  // Role Avatar Modal
  el('roleAvatarBtn').onclick = () => {
    const modal = el('roleModal');
    const grid = el('roleGrid');
    modal.classList.remove('hidden');

    grid.innerHTML = ROLES.map(r => `
      <div class="metric-tile ${r.id === appState.role.id ? 'highlight' : ''}" style="cursor:pointer;padding:12px" data-modal-role="${r.id}">
        <div style="display:flex;justify-content:space-between">
          <span class="role-initials">${r.id}</span>
          ${r.id === appState.role.id ? '<span class="badge badge-ok">ACTIVE</span>' : ''}
        </div>
        <strong style="color:#fff;display:block;margin-top:6px">${r.name}</strong>
        <span style="font-size:10px;color:var(--cyan-primary)">${r.agency}</span>
        <p style="font-size:10px;color:var(--text-muted);margin-top:4px">${r.desc}</p>
      </div>
    `).join('');

    grid.querySelectorAll('[data-modal-role]').forEach(card => {
      card.onclick = () => {
        const rId = card.dataset.modalRole;
        const target = ROLES.find(r => r.id === rId);
        if (target) {
          appState.role = target;
          el('roleInitials').textContent = target.id;
          el('roleName').textContent = target.name;
          modal.classList.add('hidden');
          showToast(`Active persona: ${target.name}`);
          renderActiveView();
        }
      };
    });
  };

  el('closeRoleModal').onclick = () => el('roleModal').classList.add('hidden');
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

// Embedded Resilient Local Dataset (Mirroring backend/seed_data.py)
function getEmbeddedFallbackData() {
  const routes = [
    { id: "R-500D", name: "Outer Ring Road Express", origin: "Silk Board", destination: "Hebbal Flyover", active_buses: 6, waypoints: [{lat:12.9176,lon:77.6234},{lat:12.9260,lon:77.6762},{lat:12.9562,lon:77.7011},{lat:12.9984,lon:77.6789},{lat:13.0358,lon:77.5970}] },
    { id: "R-335E", name: "East Tech Corridor", origin: "Majestic", destination: "ITPB Whitefield", active_buses: 5, waypoints: [{lat:12.9774,lon:77.5708},{lat:12.9734,lon:77.6074},{lat:12.9644,lon:77.6413},{lat:12.9591,lon:77.6644},{lat:12.9863,lon:77.7337}] },
    { id: "R-KIAS8", name: "Airport Vayu Vajra", origin: "Electronic City", destination: "Airport Terminal 2", active_buses: 5, waypoints: [{lat:12.8452,lon:77.6602},{lat:12.9176,lon:77.6234},{lat:12.9984,lon:77.5921},{lat:13.0358,lon:77.5970},{lat:13.1986,lon:77.7066}] },
    { id: "R-356M", name: "Hosur Road Arterial", origin: "Majestic", destination: "Attibele Border", active_buses: 4, waypoints: [{lat:12.9774,lon:77.5708},{lat:12.9388,lon:77.5960},{lat:12.9176,lon:77.6234},{lat:12.8452,lon:77.6602},{lat:12.7801,lon:77.7681}] }
  ];

  const buses = Array.from({ length: 36 }, (_, i) => ({
    id: `BUS-${String(i + 1).padStart(3, '0')}`,
    registration: `KA 01 F ${4201 + i}`,
    fleet_code: `BMTC-EV-${String(i + 1).padStart(3, '0')}`,
    assigned_depot: ['Depot 25 (HSR)', 'Depot 18 (Whitefield)', 'Depot 7 (Majestic)', 'Depot 31 (ECity)'][i % 4],
    route_id: routes[i % routes.length].id,
    status: [10, 26].includes(i) ? 'OFFLINE' : 'ONLINE',
    speed_kph: [10, 26].includes(i) ? 0.0 : +(20 + (i * 3.7) % 30).toFixed(1),
    heading: (i * 45) % 360,
    lat: +(12.92 + ((i * 31) % 95) / 1000).toFixed(6),
    lon: +(77.54 + ((i * 47) % 150) / 1000).toFixed(6),
    last_gps_fix: new Date().toISOString(),
    device_id: `EDGE-${String(i + 1).padStart(3, '0')}`
  }));

  const devices = buses.map((b, i) => ({
    id: `EDGE-${String(i + 1).padStart(3, '0')}`,
    bus_id: b.id,
    hardware_profile: "NVIDIA Jetson Orin Nano 8GB",
    software_version: "v2.4.1-prod",
    status: [10, 26].includes(i) ? 'OFFLINE' : i === 18 ? 'STALE' : i === 5 ? 'DEGRADED' : 'HEALTHY',
    temperature_c: +(46 + (i * 1.8) % 20).toFixed(1),
    storage_used_pct: +(38 + (i * 2.3) % 46).toFixed(1),
    network_latency_ms: i === 5 ? 180 : 38 + (i * 7) % 40,
    inference_fps: [10, 26].includes(i) ? 0.0 : i === 5 ? 14.5 : 28.6
  }));

  const events = Array.from({ length: 130 }, (_, i) => {
    const types = ['POTHOLE', 'DAMAGED_ROAD', 'MISSING_DIVIDER', 'WATERLOGGING', 'CONGESTION', 'BOTTLENECK', 'HIT_AND_RUN_SUSPECTED', 'PEDESTRIAN_RISK'];
    const st = types[i % types.length];
    const isInc = st === 'HIT_AND_RUN_SUSPECTED' || st === 'PEDESTRIAN_RISK';
    const isTraf = st === 'CONGESTION' || st === 'BOTTLENECK';
    const isInfra = st === 'MISSING_DIVIDER' || st === 'WATERLOGGING';
    const evType = isInc ? 'SAFETY_INCIDENT' : isTraf ? 'TRAFFIC' : isInfra ? 'INFRASTRUCTURE' : 'ROAD_DEFECT';

    return {
      id: `EVT-2026-0918-${String(i + 1).padStart(4, '0')}`,
      event_type: evType,
      event_subtype: st,
      severity: i % 14 === 0 ? 'CRITICAL' : i % 4 === 0 ? 'HIGH' : i % 3 === 0 ? 'MEDIUM' : 'LOW',
      confidence: +(0.84 + (i % 15) / 100).toFixed(2),
      occurred_at: new Date(Date.now() - i * 420000).toISOString(),
      road_name: ['Outer Ring Road EcoSpace', 'Silk Board Underpass', 'Old Airport Road Manipal', 'Hosur Road Kudlu Gate', 'Bellary Road Hebbal'][i % 5],
      corridor_id: routes[i % routes.length].id,
      bus_id: buses[i % 36].id,
      route_id: routes[i % routes.length].id,
      camera_id: `CAM-FRONT-${String((i % 36) + 1).padStart(3, '0')}`,
      lat: +(12.91 + ((i * 27) % 110) / 1000).toFixed(6),
      lon: +(77.53 + ((i * 41) % 170) / 1000).toFixed(6),
      model_name: 'YOLOv8-UrbanIntelligence',
      model_version: 'v2.4.1',
      review_status: i % 7 === 0 ? 'VERIFIED' : i % 19 === 0 ? 'REJECTED' : 'PENDING',
      alert_status: 'NEW',
      metadata: { repeat_observations: 1 + (i % 6), inference_ms: 32.4 },
      anpr: isInc ? { plate_text: `KA 01 AB ${4500 + i}`, confidence: 0.912 } : null
    };
  });

  const alerts = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').slice(0, 24).map((e, idx) => ({
    id: `ALT-2026-0918-${String(idx + 1).padStart(4, '0')}`,
    event_id: e.id,
    category: e.event_type,
    severity: e.severity,
    title: `${e.event_subtype.replace(/_/g, ' ')} on ${e.road_name}`,
    state: idx % 5 === 0 ? 'RESOLVED' : idx % 3 === 0 ? 'ASSIGNED' : idx % 2 === 0 ? 'ACKNOWLEDGED' : 'NEW',
    created_at: e.occurred_at
  }));

  const road_segments = [
    { id: "SEG-01", corridor_name: "Outer Ring Road (Silk Board to Marathahalli)", length_km: 9.2, condition_score: 62, status: "POOR", pothole_count: 14, infrastructure_issues: 6 },
    { id: "SEG-02", corridor_name: "Outer Ring Road (Marathahalli to Hebbal)", length_km: 14.8, condition_score: 78, status: "MODERATE", pothole_count: 6, infrastructure_issues: 3 },
    { id: "SEG-03", corridor_name: "Old Airport Road Arterial", length_km: 11.4, condition_score: 71, status: "MODERATE", pothole_count: 8, infrastructure_issues: 4 },
    { id: "SEG-04", corridor_name: "Hosur Road Expressway Service Lanes", length_km: 18.2, condition_score: 54, status: "CRITICAL", pothole_count: 19, infrastructure_issues: 9 }
  ];

  const hourly_traffic = [
    { hour: "06:00", density_vph: 480, avg_speed_kph: 38.2, congestion_index: 22 },
    { hour: "07:00", density_vph: 820, avg_speed_kph: 32.5, congestion_index: 44 },
    { hour: "08:00", density_vph: 1340, avg_speed_kph: 21.4, congestion_index: 78 },
    { hour: "09:00", density_vph: 1780, avg_speed_kph: 14.8, congestion_index: 94 },
    { hour: "12:00", density_vph: 1050, avg_speed_kph: 26.8, congestion_index: 52 },
    { hour: "18:00", density_vph: 1910, avg_speed_kph: 12.4, congestion_index: 98 },
    { hour: "21:00", density_vph: 920, avg_speed_kph: 29.5, congestion_index: 42 }
  ];

  const vehicle_classification = {
    "Two-Wheeler": 41.2,
    "Passenger Car": 34.6,
    "Auto-Rickshaw": 12.8,
    "Public/Commercial Bus": 7.4,
    "Commercial Truck": 4.0
  };

  const audit_logs = [
    { id: "AUD-01", timestamp: new Date().toISOString(), user_role: "Control Room Operator", action: "EVENT_VERIFIED", target_id: "EVT-01", details: "Verified Silk Board Pothole" },
    { id: "AUD-02", timestamp: new Date().toISOString(), user_role: "Traffic/Police Reviewer", action: "ANPR_REVIEW", target_id: "EVT-23", details: "Plate candidate KA 01 AB 4582 checked" }
  ];

  return {
    counts: {
      active_buses: 34,
      total_buses: 36,
      devices_online: 32,
      events_today: 130,
      critical_alerts: 6,
      potholes_detected: 28,
      congestion_hotspots: 18,
      incidents_under_review: 8,
      city_coverage_pct: 84.6,
      average_confidence: 91.2
    },
    routes,
    buses,
    devices,
    events,
    alerts,
    road_segments,
    hourly_traffic,
    vehicle_classification,
    audit_logs
  };
}

// --------------------------------------------------------------------------
// Application Bootstrapper
// --------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initCommandPalette();
  initDemoFlows();
  initSimulationTicker();
  await fetchPlatformData();
  renderActiveView();
});
