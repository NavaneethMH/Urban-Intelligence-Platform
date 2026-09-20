**Business Model Canvas (BMC)**

**AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet**

Stakeholders, value propositions, channels, resources, activities, partners, costs and value realization

| Problem Statement ID | 26124                            |
|----------------------|----------------------------------|
| Organization         | Bharat Electronics Limited (BEL) |
| Theme                | Smart Automation                 |
| Category             | Software                         |
| Team                 | INNOVEXA                         |

## Source basis

Prepared from the uploaded BEL problem statement and the INNOVEXA SIH 2025 idea presentation. Where the source does not prescribe a design detail, the document labels it as an implementation assumption or recommendation.

# 1. Canvas Summary

The uploaded SIH material is primarily a technical/public-sector problem statement rather than a commercial business brief. Therefore, the canvas below keeps source-supported beneficiaries and value propositions, while marking commercial/procurement elements as proposed assumptions for validation with BEL and city/transport authorities.

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr class="header">
<th rowspan="2"><p><strong>KEY PARTNERS</strong></p>
<ul>
<li><p>Bharat Electronics Limited (problem owner)</p></li>
<li><p>Public transport authorities / bus operators</p></li>
<li><p>Road &amp; civic agencies</p></li>
<li><p>Traffic management / law-enforcement stakeholders</p></li>
<li><p>Edge AI hardware and camera vendors</p></li>
<li><p>Cloud/data-center and connectivity providers</p></li>
<li><p>GIS/map-data providers (deployment choice)</p></li>
<li><p>Academic/AI validation partners (optional)</p></li>
</ul></th>
<th><p><strong>KEY ACTIVITIES</strong></p>
<ul>
<li><p>Edge AI model development &amp; validation</p></li>
<li><p>Fleet integration and camera/GPS calibration</p></li>
<li><p>Event ingestion and GIS platform operations</p></li>
<li><p>Model monitoring/retraining</p></li>
<li><p>Road/traffic analytics and reporting</p></li>
<li><p>Security, audit and fleet device operations</p></li>
</ul></th>
<th rowspan="2"><p><strong>VALUE PROPOSITIONS</strong></p>
<ul>
<li><p>Turn existing bus movement into continuous mobile urban sensing</p></li>
<li><p>Earlier road-defect and infrastructure visibility</p></li>
<li><p>Congestion heat maps and route intelligence</p></li>
<li><p>Geotagged incident evidence with ANPR confidence</p></li>
<li><p>Fleet-wide GIS situational awareness</p></li>
<li><p>Reduced bandwidth through edge processing</p></li>
<li><p>Evidence-based maintenance and planning</p></li>
</ul></th>
<th><p><strong>CUSTOMER RELATIONSHIPS</strong></p>
<ul>
<li><p>B2G/B2B2G solution deployment</p></li>
<li><p>Pilot + co-validation with authority teams</p></li>
<li><p>Control-room onboarding/training</p></li>
<li><p>SLA-based platform/device support</p></li>
<li><p>Periodic model and analytics review</p></li>
</ul></th>
<th rowspan="2"><p><strong>CUSTOMER / BENEFICIARY SEGMENTS</strong></p>
<ul>
<li><p>Transport authorities</p></li>
<li><p>Road / civic agencies</p></li>
<li><p>Traffic management &amp; authorized incident reviewers</p></li>
<li><p>Urban planners / city command centers</p></li>
<li><p>Bus operators (operational stakeholder)</p></li>
<li><p>Citizens as indirect beneficiaries of safer, better-maintained roads</p></li>
</ul></th>
</tr>
<tr class="odd">
<th><p><strong>KEY RESOURCES</strong></p>
<ul>
<li><p>Bus fleet camera coverage</p></li>
<li><p>Edge AI devices (Jetson-class)</p></li>
<li><p>Computer-vision models &amp; labeled data</p></li>
<li><p>Python/JS engineering stack</p></li>
<li><p>PostgreSQL/PostGIS + central compute</p></li>
<li><p>GIS dashboard and operational users</p></li>
</ul></th>
<th><p><strong>CHANNELS</strong></p>
<ul>
<li><p>BEL / public procurement programs</p></li>
<li><p>Transport/city control centers</p></li>
<li><p>System-integration partners</p></li>
<li><p>Pilot deployments on selected routes</p></li>
<li><p>Web GIS dashboard and automated reports</p></li>
</ul></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td colspan="2"><p><strong>COST STRUCTURE</strong></p>
<ul>
<li><p>Edge hardware, camera/GPS integration and installation</p></li>
<li><p>AI model development, labeling and validation</p></li>
<li><p>Cloud/control-center compute, database and object storage</p></li>
<li><p>4G/5G/Wi-Fi data usage</p></li>
<li><p>Software engineering, cybersecurity and DevOps</p></li>
<li><p>Field maintenance, device replacement and calibration</p></li>
<li><p>Training, support and model lifecycle operations</p></li>
</ul></td>
<td colspan="3"><p><strong>VALUE / REVENUE STREAMS (ASSUMPTIONS TO VALIDATE)</strong></p>
<ul>
<li><p>Public-sector project / system-integration contract</p></li>
<li><p>Per-bus or per-fleet deployment and maintenance fee</p></li>
<li><p>Annual platform support / AMC / SLA services</p></li>
<li><p>Analytics/reporting module licensing or managed-service fee</p></li>
<li><p>Hardware + software bundled deployment through BEL/partners</p></li>
<li><p>Non-monetary public value: faster defect response, better traffic management, improved safety and evidence-based planning</p></li>
</ul></td>
</tr>
</tbody>
</table>

# 2. Value Realization Logic

| **Input / capability**                      | **Immediate output**                            | **Operational value**                                              | **Longer-term public value**                              |
|---------------------------------------------|-------------------------------------------------|--------------------------------------------------------------------|-----------------------------------------------------------|
| Existing bus routes + multi-camera coverage | Frequent mobile observations across major roads | Broader coverage without relying only on fixed CCTV/manual surveys | More complete urban situational awareness                 |
| Edge AI                                     | Geotagged filtered events instead of raw video  | Lower bandwidth and faster local event generation                  | Scalable fleet deployment                                 |
| Central GIS/PostGIS analytics               | Maps, heat maps, history and reports            | Prioritized maintenance/traffic response                           | Evidence-based investment and planning                    |
| Incident tracking + ANPR confidence         | Structured evidence package                     | Faster authorized review and handoff                               | Potential public-safety improvement subject to governance |

# 3. Assumptions and Validation Questions

| **Area**          | **Assumption / question to validate**                                                                                     |
|-------------------|---------------------------------------------------------------------------------------------------------------------------|
| Buyer/procurement | Which entity owns procurement: BEL as prime integrator, transport undertaking, city command center, or another authority? |
| Commercial model  | Capex project, license + AMC, managed service, or bundled hardware/software? Source does not specify.                     |
| Data ownership    | Which authority owns road/traffic/incident data and evidence? What sharing permissions apply?                             |
| ROI baseline      | Current cost/time for manual road inspection, complaint handling, congestion studies and incident evidence gathering.     |
| Pilot KPI         | Minimum acceptable accuracy, road-km coverage, alert latency, false-alert rate and bandwidth reduction.                   |
| Operations        | Who reviews/triages alerts, who closes road defects, and what workflow/system receives confirmed events?                  |
| Scale             | Target number of buses, cameras per bus, operating hours, expected event rate and geographic coverage.                    |
| Governance        | Retention, access, audit and evidentiary rules for number plates and incident media.                                      |

# 4. Suggested Pilot Business Case Structure

1.  Baseline: quantify current inspection/complaint response workflow, coverage and delays on selected routes.

2.  Pilot: instrument selected buses/routes and measure road-km coverage, detection quality, bandwidth, central event latency and authority review workload.

3.  Operational trial: integrate confirmed defects/incidents into existing agency workflow and record time-to-action or resolution.

4.  Scale decision: compare incremental fleet coverage and operational benefit against edge hardware, connectivity, platform and support cost.
