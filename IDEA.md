# SHRAMLOOP — Last-Mile Occupational Heat Action System

**Competition:** Indradhanu — International Grand Challenge 2026 (2nd Edition)  
**Organizer:** International Relations Cell, PCCOE Pune  
**Theme:** AI for Climate Change (UN SDG 13)  
**Domain:** Disaster Resilience, Public Health & Community Well-being  
**Sub-tracks:** Early Warning Systems · Climate-Induced Health Risk Assessment · Community Resilience Solutions  
**Document version:** 1.0 — Finalized August 22, 2026  
**Status:** Ready for Idea PPT + Registration

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem — With Hard Numbers](#2-the-problem--with-hard-numbers)
3. [Why Existing Solutions Are Not Enough](#3-why-existing-solutions-are-not-enough)
4. [The SHRAMLOOP Solution](#4-the-shramloop-solution)
5. [Technical Architecture](#5-technical-architecture)
6. [Nugen Intelligence Integration (Mandatory)](#6-nugen-intelligence-integration-mandatory)
7. [SitePod — IoT Hardware Layer](#7-sitepod--iot-hardware-layer)
8. [Pune Pilot — Home-Turf Advantage](#8-pune-pilot--home-turf-advantage)
9. [Competition Fit Analysis](#9-competition-fit-analysis)
10. [Why This Wins — Pattern Match to 2025–26 Winners](#10-why-this-wins--pattern-match-to-202526-winners)
11. [Self-Critique: Flaws We Found and How We Fixed Them](#11-self-critique-flaws-we-found-and-how-we-fixed-them)
12. [Q&A Defense Playbook](#12-qa-defense-playbook)
13. [Build Roadmap & Milestones](#13-build-roadmap--milestones)
14. [Team Composition & Roles](#14-team-composition--roles)
15. [Idea PPT Structure (Slide-by-Slide)](#15-idea-ppt-structure-slide-by-slide)
16. [Live Demo Script (Grand Finale)](#16-live-demo-script-grand-finale)
17. [Risk Register](#17-risk-register)
18. [References & Data Sources](#18-references--data-sources)
19. [Final Verdict](#19-final-verdict)

---

## 1. Executive Summary

### One-liner

> **SHRAMLOOP closes the gap between heat intelligence dashboards and actual worker protection — automatically converting SHRAM/IMD heat forecasts into shift schedules, cooling-point routing, and multilingual supervisor alerts, validated by on-site IoT sensors.**

### The insight that makes this defensible

India now has world-class **heat data layers** (SHRAM for district-level occupational heat stress, CHAITRA for ward-level urban heat planning). What India does **not** have is a system that **closes the loop** at the point of work — telling the construction contractor, NREGA site supervisor, or gig-platform dispatcher *exactly what to do tomorrow morning* in language they understand, before workers arrive on site.

SHRAM tells you Pune district is Zone 5 for heavy labor in sun.  
CHAITRA tells you which ward needs 500 cool-roof installations over 3 years.  
**SHRAMLOOP tells Supervisor Rajesh at 6:00 AM:** *"Magarpatta site: start work 6–10:30 AM only. Mandatory shade break 10:30–4:00 PM. Resume 4–7 PM. ORS station at coordinates X. Acknowledge by replying YES."*

### What we are NOT building

| We are NOT | Because |
|------------|---------|
| Another heat dashboard | SHRAM (shram.info) already does this at district scale with EHI-N* |
| Another ward planning tool | CHAITRA (chaitra.info) already does IPCC AR6 ward-level intervention budgeting |
| A consumer app for workers | Informal workers won't install apps; we target **supervisors and contractors** |
| Reinventing wet-bulb temperature | We use **EHI-N*** (metabolic-rate-aware) via SHRAM's public API |
| Competing with Berkeley IECC | We **cite them as our data foundation** and build the action layer they explicitly don't |

### What we ARE building

A **three-layer occupational heat action orchestrator**:

1. **Data Layer** — Ingests SHRAM API (EHI-N* forecasts), IMD station data, PMC ward boundaries, informal-worker density proxies
2. **Intelligence Layer** — AI shift optimizer + Nugen-aligned multilingual briefing agent
3. **Action Layer** — SitePod IoT sensors at work sites + automated voice/SMS dispatch to supervisors

---

## 2. The Problem — With Hard Numbers

### 2.1 Scale of the crisis (2026 data)

| Statistic | Source |
|-----------|--------|
| ~380 million outdoor/heat-exposed workers in India | IECC EHI-N* policy paper, Feb 2026 |
| **$78 billion/year** in lost wages from heat (≈2% of GDP) | IIED, July 2026 — survey of 538 informal worker households |
| Outdoor workers lose **~24 workdays/year** to heat (~9% of annual income) | IIED / The Guardian, July 2026 |
| **~3,400 excess deaths** from a single day of extreme heat nationally | Frontiers in Environmental Health, 2026 — district-level modelling |
| **~30,000 excess deaths** from a 5-day heatwave nationally | Frontiers in Environmental Health, 2026 |
| EHI-N* shows **41.5% of India** reached Zone 6 (physiological failure) for heavy outdoor labor in Apr–Jun 2024, vs only 9.6% flagged by NOAA Heat Index | IECC technical report, Feb 2026 |
| In Zone 6, workers reach dangerous core temperatures in **14–32 minutes** | IECC EHI-N* technical report |

### 2.2 The structural gap — data exists, action doesn't

India's weather and climate institutions have improved dramatically:

- **IMD** issues heatwave alerts and seasonal outlooks
- **SHRAM** (launched 2026) provides real-time EHI-N* monitoring for 700+ districts with public API
- **CHAITRA** (launched Feb 2026) provides ward-level heat action planning for 12 cities
- **250+ cities** have adopted Heat Action Plans (HAPs)

Yet for the **informal worker on a Pune construction site today**:

- Maharashtra SOP mandates rescheduling outdoor work to 6–11 AM and 4–8 PM during heat alerts — but **implementation depends on contractors and ward offices**, not automated systems
- PMC issued heat advisories in 2026 telling workers to avoid 12–3 PM — but **no system enforces this at the site level**
- Prayas Pune research (April 2026) documents that informal workers **prioritize income over health** — generic advisories are ignored because missing a day's wage means no food
- Prayas found workplace facilities index scores just **2.1/10** for outdoor workers in Pune — shade, water, toilets are structurally absent

> **The failure mode is not missing data. It is missing last-mile action orchestration.**

### 2.3 Why Pune specifically

| Factor | Relevance |
|--------|-----------|
| Grand Finale is at **PCCOE, Pune** | Home-turf demo advantage — judges see their own city |
| SHRAM has **15+ IMD stations** in Pune district with live EHI-N* data | Verified via API pull on Aug 22, 2026 (Magarpatta, Chinchwad, Hadapsar, Pashan, etc.) |
| PMC ward boundary KML files are **open data** (OpenCity.in, PMC.gov.in) | 41 electoral wards — enables ward-level overlay |
| Prayas Pune has **published 2026 research** on street vendors, construction workers, manual laborers | Local credibility, citable in pitch |
| Maharashtra SOP for outdoor informal work is **active policy** | Our system maps directly to legal work-window requirements |
| CHAITRA does **not yet include Pune** in its 12-city dashboard | Gap we fill using same open satellite/ward data methodology |

---

## 3. Why Existing Solutions Are Not Enough

### 3.1 SHRAM (shram.info) — what it does and where it stops

**Built by:** India Energy & Climate Center (IECC), UC Berkeley  
**Launched:** 2026  
**URL:** https://shram.info/

| Capability | Limitation for our use case |
|------------|----------------------------|
| Real-time EHI-N* for 700+ districts | **District-level** — Pune has 15 stations but no site-level granularity |
| MET 3–6 work intensity toggles | User must **manually interpret** what Zone 5 means for their site |
| 1–3 day forecasts | No **shift schedule output** — just risk zones |
| Public JSON API (verified working) | No **action dispatch** — no supervisor notification |
| Email alerts (planned) | Not **multilingual voice** for low-literacy supervisors |
| SMS alerts (planned 2026) | Generic, not **site-specific shift optimization** |

**SHRAM API endpoints (verified live Aug 22, 2026):**
```
Current alerts:  https://iecc-io.github.io/SHRAM/weather_logs/latest_alerts.json
3-day forecast:  https://iecc-io.github.io/SHRAM/weather_logs/forecast_data.json
24-hour history: https://iecc-io.github.io/SHRAM/weather_logs/alerts_24h.json
```

**Example live data — Pune, Magarpatta station, Aug 22, 2026 17:24 IST:**
- Temperature: 24.5°C, RH: 95%
- EHI-6* (heavy labor, sun): **Zone 5**
- EHI-6* (heavy labor, shade): Zone 5

SHRAM answers: *"What is the heat stress risk?"*  
SHRAMLOOP answers: *"What should Supervisor Rajesh do about it at Site 7 tomorrow?"*

### 3.2 CHAITRA (chaitra.info) — what it does and where it stops

**Built by:** Same IECC team  
**Launched:** February 2026  
**URL:** https://chaitra.info/ (12 cities currently)

| Capability | Limitation for our use case |
|------------|----------------------------|
| Ward-level IPCC AR6 risk assessment | Designed for **municipal budget planning**, not daily operations |
| Cool roof / tree planting priority maps | **Long-term infrastructure** — not today's shift decision |
| Budget-ready intervention estimates | **Months-to-years horizon** — not 6 AM tomorrow briefing |
| 7 analytical layers (UHI, population risk, etc.) | **No supervisor notification** or work scheduling |
| Pune not yet in 12-city list | Opportunity: we apply same ward-boundary approach for Pune pilot |

CHAITRA answers: *"Which ward needs ₹2 crore in cool roofs over 3 years?"*  
SHRAMLOOP answers: *"Which sites in that ward should stop work at 10:30 AM today?"*

### 3.3 What failed at last year's competition (lessons)

From Indradhanu 2025–26 Grand Finale (Jan 30, 2026):

| Team | Project | Result | Lesson |
|------|---------|--------|--------|
| Byte_Pirates (MITAOE) | AgriDoot — IoT + satellite GIS + AI farming | **1st** | Polished end-to-end product, physical IoT demo, faculty mentor |
| Ecolooper (BVCOEP) | AI audio-enabled smart bin | **2nd** | Novel sensing method, physical hardware on stage |
| Ocean Sentinels | OceanMind AI — satellite + AIS + IoT | **Special Prize** | Multi-source data fusion |
| MathPent | CarbonMeter — carbon footprint web app | Finalist | Dashboard apps reached finale but **didn't win top 3** |
| EcoLens | Biodiversity monitoring (LSTM) | Finalist | ML models alone insufficient without tangible demo |

**Pattern:** Winners had **physical prototypes + clear technical novelty + working demo**. Dashboard-only projects were finalists, not winners.

---

## 4. The SHRAMLOOP Solution

### 4.1 Product vision

SHRAMLOOP is an **occupational heat action orchestrator** that:

1. **Ingests** authoritative heat data (SHRAM API, IMD, ward boundaries)
2. **Optimizes** work schedules constrained by Maharashtra SOP and physiological safety thresholds
3. **Generates** site-specific action plans (shift times, break schedules, cooling point placement)
4. **Delivers** multilingual supervisor briefings via Nugen-aligned AI agent (voice + SMS)
5. **Validates** with SitePod IoT sensors measuring local microclimate at actual work sites

### 4.2 User personas (who we serve)

| Persona | Pain today | SHRAMLOOP value |
|---------|-----------|-----------------|
| **Construction contractor** | Gets generic "avoid 12–4 PM" advisory, ignores it due to deadlines | Receives optimized shift plan that balances safety + productivity |
| **NREGA site supervisor** | No tool linking IMD alerts to muster-roll scheduling | Auto-generated daily work window + worker count limits |
| **PMC Labour Welfare officer** | Issues advisories but can't verify site compliance | Dashboard showing which sites received + acknowledged alerts |
| **Gig platform dispatcher** | Riders work through peak heat for earnings | Heat-adjusted delivery zone scheduling (Phase 2) |

**We explicitly do NOT target individual informal workers as app users** — this is intellectually honest and matches Prayas research showing workers prioritize income over health apps.

### 4.3 Core workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SHRAMLOOP WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [SHRAM API] ──→ [Shift Optimizer] ──→ [Nugen Agent] ──→ Supervisor │
│  [IMD Data]         ↑                      ↓                        │
│  [Ward KML]    [SitePod IoT] ──→ [Microclimate     Voice/SMS in    │
│  [SOP Rules]       (ESP32)        Correction]       Marathi/Hindi   │
│                                                                     │
│  OUTPUT: "Site Magarpatta-7: Work 6:00–10:30. Break 10:30–16:00.   │
│           Resume 16:00–19:00. ORS at lat/lon X. 42 workers max."   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 The shift optimization algorithm (technical core)

**Inputs:**
- `EHI_forecast[station][hour]` — from SHRAM 72-hour forecast API
- `site_location` — GPS coordinates
- `nearest_station` — mapped from SHRAM's 15 Pune stations
- `work_met_level` — 3 (light) to 6 (heavy labor), user-selected
- `sun_exposure` — boolean (shade vs direct sun)
- `worker_count` — for cooling capacity planning
- `maharashtra_sop` — work windows: 6–11 AM, 4–8 PM during orange/red alerts

**Constraints:**
- Never schedule heavy labor (MET 6, sun) when EHI-6* ≥ Zone 5
- Mandatory 10-minute rest per 20 minutes at Zone 4+ (per EHI-N* guidance)
- Total daily work hours ≥ contractor minimum (configurable soft constraint)
- Cooling point must be within 200m of site (PMC SOP: shade + water access)

**Output:**
```json
{
  "site_id": "MAG-007",
  "date": "2026-08-23",
  "shifts": [
    {"start": "06:00", "end": "10:30", "workers": 42, "met_level": 6},
    {"start": "16:00", "end": "19:00", "workers": 30, "met_level": 5}
  ],
  "mandatory_break": {"start": "10:30", "end": "16:00"},
  "cooling_point": {"lat": 18.5204, "lon": 73.9342, "type": "shade+ORS"},
  "risk_summary": "EHI-6* peaks Zone 5 at 13:00. Maharashtra SOP compliant.",
  "supervisor_briefing_mr": "..."
}
```

### 4.5 Differentiation matrix

| Feature | SHRAM | CHAITRA | Generic weather app | **SHRAMLOOP** |
|---------|-------|---------|----------------------|---------------|
| Occupational heat metric (EHI-N*) | ✅ | ❌ | ❌ (dry-bulb) | ✅ (via API) |
| Ward-level planning | ❌ | ✅ | ❌ | ✅ (Pune wards) |
| Site-level microclimate | ❌ | ❌ | ❌ | ✅ (SitePod IoT) |
| Shift schedule generation | ❌ | ❌ | ❌ | ✅ |
| Supervisor notification | ❌ (planned SMS) | ❌ | ❌ | ✅ (voice+SMS) |
| Multilingual (Marathi/Hindi) | ❌ | ❌ | Partial | ✅ (Nugen agent) |
| Maharashtra SOP compliance | ❌ | ❌ | ❌ | ✅ |
| Acknowledgment tracking | ❌ | ❌ | ❌ | ✅ |

---

## 5. Technical Architecture

### 5.1 System components

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
│  Next.js dashboard — supervisor view, PMC admin view, demo mode  │
├──────────────────────────────────────────────────────────────────┤
│                         BACKEND API                               │
│  FastAPI / Node.js                                                │
│  ├── SHRAM ingestion service (cron: hourly)                       │
│  ├── Ward geospatial service (PostGIS / Turf.js)                  │
│  ├── Shift optimizer (OR-Tools / custom constraint solver)      │
│  ├── SitePod telemetry receiver (MQTT/HTTP)                     │
│  └── Alert dispatch service (Twilio / Exotel for voice+SMS)       │
├──────────────────────────────────────────────────────────────────┤
│                      NUGEN INTELLIGENCE                           │
│  ├── Domain alignment on occupational heat SOPs + Marathi corpus  │
│  ├── Aligned model inference for briefing generation              │
│  └── Agent endpoint for supervisor Q&A ("Can we work Saturday?")  │
├──────────────────────────────────────────────────────────────────┤
│                      EDGE / IoT LAYER                             │
│  SitePod (ESP32) — DHT22 + globe thermometer + WiFi/MQTT         │
├──────────────────────────────────────────────────────────────────┤
│                      DATA SOURCES (all open)                      │
│  SHRAM API · IMD · PMC ward KML · OpenStreetMap · Open-Meteo     │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Tech stack (hackathon-realistic)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js + Tailwind + Mapbox/Leaflet | Matches winning teams' stack; fast to build |
| Backend | FastAPI (Python) | SHRAM data processing, OR-Tools integration |
| Database | PostgreSQL + PostGIS | Ward boundary queries, site registry |
| IoT | ESP32 + DHT22 + MQTT | Proven in academic literature; ~₹1,200/unit |
| AI/ML | Nugen aligned models + scikit-learn microclimate correction | Mandatory Nugen + lightweight local model |
| Voice/SMS | Exotel or Twilio (India) | Supervisor alert delivery |
| Deployment | Vercel (frontend) + Railway/Render (backend) | Free tier sufficient for prototype |

### 5.3 Data pipeline

```
Hourly cron:
  SHRAM latest_alerts.json → filter Maharashtra/Pune stations
  SHRAM forecast_data.json → extract 72h EHI-6*_sun forecast
  → Store in PostgreSQL heat_forecasts table

On site registration:
  Supervisor enters site GPS + work type (MET level) + worker count
  → Nearest SHRAM station mapped by haversine distance
  → Ward boundary determined by point-in-polygon (PMC KML)

Daily at 5:00 PM IST (for next day):
  Shift optimizer runs for all registered sites
  → Nugen agent generates Marathi/Hindi briefing per site
  → Alert dispatched to supervisor phone

Real-time:
  SitePod posts temperature/humidity every 60s
  → If local reading exceeds SHRAM forecast by >2°C → override alert
  → "MICROCLIMATE WARNING: Site hotter than district forecast"
```

---

## 6. Nugen Intelligence Integration (Mandatory)

> **Critical:** Per official PCCOE IGC Prizes page — *"No team is eligible for any prize unless they demonstrate the use of inference through Nugen's aligned models in their project."*

### 6.1 Verified co-organizer details

| Item | Verified source |
|------|----------------|
| Co-organizer name | **Nugen Intelligence** (not "Newgen" — common confusion) |
| Co-organizer confirmation | PCCOE IR Cell LinkedIn inauguration post, Jan 2026 |
| 1st prize credits | ₹1,00,000 Nugen API credits (Mahir Mulani / Byte_Pirates LinkedIn, Feb 2026) |
| Workshop for finalists | Nugen hands-on workshop, Jan 19, 2026 (PCCOE IR Cell post) |
| Official signup | Listed on https://www.pccoeigc.com/prizes — invite code `IN2027PCCOE` |
| API docs | https://docs.nugen.in |

> **Security note:** Only use signup links found on the official `pccoeigc.com` domain. Do not trust third-party documents with signup URLs.

### 6.2 How SHRAMLOOP uses Nugen (not bolted-on — core to product)

| Nugen capability | SHRAMLOOP usage |
|-----------------|-----------------|
| **Document upload** | Upload: Maharashtra outdoor work SOP, EHI-N* zone guidance, PMC heat advisories, Prayas Pune worker reports |
| **Domain alignment** | Align base model (`qwen-v2p5-0p5b-instruct` or larger) to occupational heat safety domain |
| **Aligned inference** | Generate supervisor briefings that correctly use Zone terminology, SOP work windows, rest-break rules |
| **Agent endpoint** | Supervisor can ask: *"आज दुपारी काम करू का?"* → Agent responds with site-specific schedule citing EHI-N* data |
| **Multilingual** | Marathi + Hindi briefing generation with domain-correct heat safety vocabulary |

### 6.3 Nugen integration architecture

```
Training corpus (uploaded to Nugen):
  ├── maharashtra_outdoor_work_sop_2026.pdf
  ├── ehi_n_star_zone_guidance_iecc.pdf
  ├── pmc_heatwave_advisory_2026.pdf
  └── prayas_pune_informal_workers_report_2026.pdf

Alignment project: "SHRAMLOOP-Occupational-Heat-Safety-v1"
Base model: qwen-v2p5-0p5b-instruct (or team-selected from Nugen model list)
Benchmark: Custom Q&A set (50 questions on heat zones, SOP compliance, shift scheduling)

Runtime flow:
  Shift optimizer output (JSON) 
    → Prompt template with site data + EHI forecast
    → Nugen aligned model inference (chat completion)
    → Marathi/Hindi briefing text
    → Text-to-speech (Exotel/Twilio) OR SMS dispatch
```

### 6.4 PPT slide requirement (Idea round)

**Mandatory slide:** "How We Use Nugen API"

Content:
- Alignment corpus description (4 documents)
- Aligned model name and deployment status
- Example inference: input JSON → Marathi supervisor briefing output
- Agent Q&A demo screenshot

---

## 7. SitePod — IoT Hardware Layer

### 7.1 Why hardware is non-negotiable for winning

Last year's winners both had **physical devices on stage**:
- AgriDoot: IoT soil sensor device
- Ecolooper: Smart bin with microphone

A pure software submission competes against 1,000+ teams with dashboards. SitePod is our **Ecolooper moment** — the tangible thing judges remember.

### 7.2 SitePod design

**Form factor:** Small box mounted on tripod at construction site edge (not wearable — simpler for hackathon)

| Component | Part | Cost (₹) | Purpose |
|-----------|------|----------|---------|
| Microcontroller | ESP32 DevKit | 400 | WiFi, MQTT, processing |
| Temp/Humidity | DHT22 | 260 | Ambient conditions |
| Globe temperature | Black-painted ping-pong ball + DS18B20 | 150 | WBGT approximation |
| Power | 18650 battery + TP4056 | 450 | 8-hour field operation |
| Enclosure | IP65 box | 200 | Weather protection |
| Alert | Buzzer + red LED | 50 | On-site visual/audio warning |
| **Total** | | **~₹1,510** | Per unit |

### 7.3 What SitePod does

1. Measures local temperature, humidity, and approximate globe temperature every 60 seconds
2. Computes simplified WBGT estimate on-device
3. Posts telemetry to SHRAMLOOP backend via MQTT
4. Triggers local buzzer if WBGT exceeds site-specific threshold
5. **Key demo moment:** Show SitePod reading vs SHRAM district forecast — prove microclimate can differ by 3–5°C (urban heat island effect)

### 7.4 On-stage demo script

1. Heat gun or warm lamp pointed at SitePod → temperature rises
2. Dashboard shows SHRAM says "Zone 4" but SitePod says "Zone 5 — OVERRIDE ALERT"
3. Nugen agent auto-generates new briefing: *"Site temperature 3°C above district forecast. Stop work immediately."*
4. Supervisor phone receives voice call in Marathi

---

## 8. Pune Pilot — Home-Turf Advantage

### 8.1 Why Pune, not "all of India"

| Reason | Detail |
|--------|--------|
| Finale location | PCCOE, Pimpri-Chinchwad — judges live here |
| Live SHRAM data | 15 Pune stations with hourly EHI-N* (verified Aug 22, 2026) |
| Open ward data | PMC electoral ward KML (2025, 41 wards) on OpenCity.in |
| Local research | Prayas Pune 2026 report on informal worker heat vulnerability |
| Active policy | Maharashtra SOP + PMC heat advisories issued 2026 |
| CHAITRA gap | Pune not in CHAITRA's 12 cities — we fill the ward-level gap |

### 8.2 Demo sites (pre-identified for prototype)

| Site type | Location | SHRAM station | Rationale |
|-----------|----------|---------------|-----------|
| Construction site | Magarpatta/Hadapsar corridor | Magarpatta Pune | High informal worker density |
| NREGA worksite | Pimpri-Chinchwad rural fringe | Chinchwad Pune | Government scheme integration story |
| Street vendor zone | FC Road / Camp area | Shivajinagar Pune | Prayas research coverage |

### 8.3 Ward-level overlay methodology

Since CHAITRA doesn't include Pune yet:

1. Download PMC ward KML from https://data.opencity.in/dataset/pune-wards-info
2. For each ward, compute vulnerability proxy score using:
   - Population density (Census 2011 + WorldPop)
   - Informal settlement proxy (night-time lights satellite data)
   - Distance to cooling infrastructure (OSM parks, hospitals)
   - SHRAM station EHI-N* for nearest station
3. Assign ward risk tier: Critical / High / Moderate / Low
4. This mirrors CHAITRA's IPCC AR6 approach without claiming to replicate their full 7-layer analysis

**Intellectual honesty in pitch:** *"We apply IPCC AR6-inspired ward scoring for Pune using open data, complementing CHAITRA's national rollout. Our contribution is not the ward map — it is converting ward-level risk into daily supervisor actions."*

---

## 9. Competition Fit Analysis

### 9.1 Official competition parameters

| Parameter | SHRAMLOOP fit |
|-----------|---------------|
| Theme: AI for Climate Change | ✅ Core AI: shift optimizer + Nugen aligned agent |
| SDG 13: Climate Action | ✅ Direct climate adaptation for heat |
| Domain: Disaster Resilience & Public Health | ✅ Early warning + health risk assessment |
| Nugen API mandatory | ✅ Core to briefing generation (not bolted on) |
| 3-stage: Idea → Prototype → Finale | ✅ PPT-ready now, prototype by Sept 30 |
| International participation | ✅ Scalable beyond Pune |
| Interdisciplinary | ✅ Needs CS + electronics + presenter |

### 9.2 Advisory board alignment

| Board member | Expertise | How SHRAMLOOP appeals |
|-------------|-----------|----------------------|
| Dr. Peter Groffman | Environmental scientist, CUNY | Rigorous EHI-N* (not wet-bulb), cites peer-reviewed IECC work honestly |
| Hemanth Noothalapati PhD | Environmental data scientist | Real data pipeline (SHRAM API), ward geospatial analysis |
| Prof. Matjaz Valant | AI ethics & sustainability | Equity framing: informal workers, supervisor-not-worker targeting |
| Mr. Ramesh Iyer | TCS Korea CEO | Scalability: API layer on existing infrastructure, no new hardware rollout nationally |
| Prof. Seeram Ramakrishna | Materials/engineering, NUS | SitePod IoT hardware innovation |
| Dr. Ashok V. Joshi | Climate tech ventures | Deployable product with clear go-to-market (PMC, contractors) |

### 9.3 Competition statistics (2025–26 edition, verified)

| Metric | Value | Source |
|--------|-------|--------|
| Teams registered | 1,002 | PCCOE IR Cell inauguration post |
| Prototype videos submitted | 481 | Same |
| Grand Finale presenters | 19 | Same |
| Winners | 5 (top 3 + 2 special) | Dr. Sandeep Patil LinkedIn |
| Shortlist rate | ~2.5% (25 of 1,002) | Estimated |
| Win rate | ~0.5% (5 of 1,002) | Estimated |

**Implication:** Topic alone wins nothing. Execution quality determines outcome. This idea maximizes competitive positioning; it does not guarantee victory against 1,000+ teams.

---

## 10. Why This Wins — Pattern Match to 2025–26 Winners

### 10.1 Scoring against winner criteria

| Criterion (inferred from winners) | AgriDoot (1st) | Ecolooper (2nd) | CarbonMeter (finalist) | **SHRAMLOOP** |
|----------------------------------|----------------|-----------------|--------------------------|---------------|
| Physical prototype | ✅ IoT device | ✅ Smart bin | ❌ Web only | ✅ SitePod |
| Technical novelty | Satellite+IoT+AI | Audio ML (not vision) | Standard ML | EHI-N* + shift optimizer + IoT override |
| Real-world problem | ✅ Farmers | ✅ Waste segregation | ✅ Carbon tracking | ✅ 380M workers |
| Polished demo | ✅ | ✅ | Partial | Target: ✅ |
| Nugen integration | Unknown | Unknown | Unknown | ✅ Core architecture |
| Faculty mentor | ✅ HoD CSE-AIML | Unknown | Unknown | **Required — recruit now** |
| Local relevance | Agriculture (universal) | Waste (universal) | Universal | **Pune-specific** |

### 10.2 Our "audio moment" (Ecolooper parallel)

Ecolooper won by using **sound instead of vision** for waste classification — a judge could hear it work live.

SHRAMLOOP's equivalent: **Nugen-generated Marathi voice briefing playing on stage** while dashboard shows EHI-N* zones updating in real-time. Judges hear the system talk to a supervisor in local language. This is visceral, memorable, and impossible to fake with slides.

### 10.3 Our "AgriDoot moment" (end-to-end product)

AgriDoot won with a complete stack: field device → cloud → mobile app → AI chatbot.

SHRAMLOOP's equivalent: SitePod → SHRAM API → shift optimizer → Nugen agent → supervisor phone. Every layer works in the demo.

---

## 11. Self-Critique: Flaws We Found and How We Fixed Them

This section documents every flaw identified during research and the specific fix applied. This is the intellectual honesty that wins Q&A.

### Flaw 1: "SHRAM already does this"

| Severity | 🔴 Critical |
|----------|------------|
| **Original pitch** | "Build a heat early warning system using wet-bulb temperature" |
| **Problem** | SHRAM (shram.info) launched 2026 with EHI-N* — superior to wet-bulb — covering 700+ districts with public API |
| **Fix** | SHRAMLOOP **consumes SHRAM API as data foundation**. We build the action layer SHRAM explicitly doesn't: shift optimization + supervisor dispatch. We cite SHRAM in pitch, not compete with it. |
| **Q&A line** | *"SHRAM tells you the risk. We tell you what to do about it."* |

### Flaw 2: "CHAITRA already does ward-level"

| Severity | 🔴 Critical |
|----------|------------|
| **Original pitch** | "Ward-level heat risk mapping for Pune" |
| **Problem** | CHAITRA (chaitra.info) launched Feb 2026 with IPCC AR6 ward-level planning for 12 cities |
| **Fix** | We do NOT claim ward-mapping novelty. Our ward overlay is an **input** to shift optimization, not the product. CHAITRA plans budgets; we schedule today's work. |
| **Q&A line** | *"CHAITRA answers 'what should the city build over 3 years.' We answer 'what should the contractor do at 6 AM tomorrow.'"* |

### Flaw 3: "Dashboard apps didn't win"

| Severity | 🟠 High |
|----------|--------|
| **Original pitch** | Web dashboard + WhatsApp alerts |
| **Problem** | CarbonMeter and similar dashboard finalists didn't win top 3 in 2025–26 |
| **Fix** | Added SitePod IoT hardware + voice delivery via Nugen. Dashboard exists but is not the hero — the **supervisor phone ringing in Marathi** is the hero. |
| **Q&A line** | *"The dashboard is for PMC officials. The product is the supervisor briefing."* |

### Flaw 4: "Workers won't use an app"

| Severity | 🟠 High |
|----------|--------|
| **Original pitch** | Target informal workers directly |
| **Problem** | Prayas Pune 2026 research: workers prioritize income over health; 29% have no fan at home |
| **Fix** | Target **supervisors and contractors** — the decision-makers Maharashtra SOP already holds responsible. |
| **Q&A line** | *"We don't ask workers to change behavior. We give their supervisor a legally compliant schedule."* |

### Flaw 5: "AgriTech already won 1st place"

| Severity | 🟡 Medium |
|----------|-----------|
| **Concern** | Should we pivot to agriculture? |
| **Analysis** | AgriDoot won on **execution** (polished existing product + IoT), not because agriculture is the only winning domain. Disaster resilience is an official domain with no winner yet. |
| **Fix** | Stay in disaster resilience / public health. Differentiate on execution, not domain hopping. |

### Flaw 6: "Groundwater dark extraction is more novel"

| Severity | 🟡 Medium |
|----------|-----------|
| **Alternative considered** | Satellite + electricity pattern estimation for unmonitored borewell extraction |
| **Problem** | Technically harder to prototype convincingly; no visceral live demo; judges can't "see" groundwater depletion in 5 minutes |
| **Fix** | Rejected as primary. Keep as backup if team has strong remote-sensing expertise. Heat + SitePod is more demo-friendly. |

### Flaw 7: "District-level SHRAM vs site-level need"

| Severity | 🟡 Medium |
|----------|-----------|
| **Problem** | SHRAM is district/station-level; construction sites have microclimates |
| **Fix** | SitePod IoT provides site-level correction. When local WBGT exceeds SHRAM forecast, system triggers override alert. This is genuine technical contribution. |

### Flaw 8: "Can you actually send voice calls?"

| Severity | 🟡 Medium |
|----------|-----------|
| **Problem** | Twilio/Exotel integration may be complex for hackathon |
| **Fix** | MVP: browser-based text-to-speech playback on stage (demo mode). Production: Exotel API. For prototype video: simulate with pre-recorded Marathi audio generated by Nugen. |

### Flaw 9: "Nugen vs Newgen confusion"

| Severity | 🟢 Low (clarified) |
|----------|-------------------|
| **Problem** | Some sources confused Nugen with Newgen (Indian enterprise software company) |
| **Verified** | Co-organizer is **Nugen Intelligence** (nugen.in) — confirmed by PCCOE IR Cell LinkedIn + winner posts mentioning "NuGen API credits" |
| **Fix** | Use only official pccoeigc.com/prizes page for signup links |

---

## 12. Q&A Defense Playbook

### Expected hard questions and prepared answers

**Q: "How is this different from SHRAM?"**
> SHRAM is a monitoring dashboard built by Berkeley IECC — we use their public API as our data source. SHRAM answers "what is the heat risk at district level?" We answer "what should Supervisor Rajesh do at Site 7 tomorrow morning?" — shift times, break schedules, cooling point routing, delivered as a voice briefing in Marathi. SHRAM's own policy paper states SMS alerts are "planned for 2026" — we deliver the action layer now.

**Q: "CHAITRA already does ward-level heat planning."**
> Correct — CHAITRA is for municipal budget planning over months and years. We operate on a daily operational horizon. CHAITRA tells Pune Municipal Corporation to invest ₹2 crore in cool roofs for Ward 15. We tell the contractor in Ward 15 to start work at 6 AM and stop at 10:30 AM today. Complementary, not competitive.

**Q: "Why not target workers directly?"**
> Prayas Pune's April 2026 research on 358 street vendors found that income takes precedence over health in informal work contexts — 46% never rest in shade during work. Pushing another app to workers ignores structural reality. Maharashtra's SOP correctly places responsibility on employers and supervisors. We automate compliance for the decision-maker, not the worker.

**Q: "Your IoT sensor is just a DHT22 — where's the innovation?"**
> The innovation is not the sensor — it's the integration. No existing system connects site-level microclimate readings to SHRAM's district EHI-N* forecasts to Nugen-generated multilingual supervisor briefings in a closed loop. The sensor proves that district forecasts can underestimate site-level heat by 3–5°C due to urban heat island effects — triggering automatic schedule overrides.

**Q: "Can this scale beyond Pune?"**
> Yes. SHRAM covers 700+ districts via API. PMC ward KML is replicable for any ULB with digitized boundaries — CHAITRA's own documentation states this scales to 5,000 urban local bodies. SitePod is a ₹1,500 device. The Nugen agent works in any Indian language. Pune is our pilot; the architecture is national.

**Q: "What's your business model?"**
> B2G: License to municipal corporations (PMC Labour Welfare Department). B2B: Subscription for construction companies and gig platforms. Freemium: Basic SHRAM data + shift recommendations free; premium for IoT monitoring + compliance reporting. Maharashtra SOP creates regulatory pull.

**Q: "Show me the Nugen integration — is it real or a slide?"**
> [Live demo] Here is our alignment project trained on Maharashtra SOP and EHI-N* guidance documents. Input: this JSON shift schedule. Output: this Marathi supervisor briefing generated by our aligned model via Nugen inference API. Here is the agent answering a follow-up question in Hindi.

---

## 13. Build Roadmap & Milestones

### 13.1 Competition timeline (verify on official site before planning)

| Date | Milestone | Deliverable |
|------|-----------|-------------|
| **Aug 22–31, 2026** | Team formation + Nugen signup | Registered team, API keys obtained |
| **Sept 1–9, 2026** | Idea PPT + registration submission | 12-slide PPT with Nugen slide |
| **Sept 10, 2026** | **Registration deadline** | Submitted on pccoeigc.com |
| **Sept 11–30, 2026** | Prototype sprint | Working demo + prototype video |
| **Sept 30, 2026** | **Prototype video deadline** | 3–5 min demo video |
| **Oct 1, 2026** | Shortlist announced | Top ~125 teams; Nugen $250 credits |
| **Oct–Nov 2026** | Refinement + Nugen workshop | Aligned model deployed, agent live |
| **Nov 15–30, 2026** | Judging period | — |
| **Dec 15, 2026** | Finale list announced | Top ~19 teams |
| **Jan 31–Feb 14, 2027** | **Grand Finale at PCCOE** | Live demo + pitch |

### 13.2 Build phases

**Phase 1: Data foundation (Week 1–2)**
- [ ] SHRAM API ingestion pipeline (Pune stations)
- [ ] PMC ward KML loaded into PostGIS
- [ ] Site registration UI (GPS + MET level + worker count)
- [ ] Basic dashboard showing live EHI-N* for Pune

**Phase 2: Intelligence core (Week 3–4)**
- [ ] Shift optimization algorithm with Maharashtra SOP constraints
- [ ] Nugen document upload + alignment project creation
- [ ] Aligned model inference for Marathi briefing generation
- [ ] Nugen agent endpoint for supervisor Q&A

**Phase 3: Action layer (Week 5–6)**
- [ ] SitePod ESP32 prototype (1–2 units)
- [ ] MQTT telemetry → backend → override logic
- [ ] Alert dispatch (SMS minimum; voice for demo)
- [ ] Acknowledgment tracking on dashboard

**Phase 4: Polish (Week 7–8)**
- [ ] Prototype video recording
- [ ] Demo script rehearsal
- [ ] Q&A defense practice
- [ ] PPT finalization

---

## 14. Team Composition & Roles

### Minimum viable team: 4 members

| Role | Skills needed | Responsibilities |
|------|--------------|------------------|
| **Team Lead / Full-stack** | Next.js, FastAPI, system design | Dashboard, API, SHRAM integration, demo orchestration |
| **AI / Nugen Engineer** | Python, Nugen API, prompt engineering | Alignment project, agent, briefing generation |
| **IoT Engineer** | ESP32, Arduino, MQTT, basic electronics | SitePod hardware, telemetry pipeline |
| **Pitch Lead / Research** | Public speaking, climate data literacy | PPT, demo script, Q&A defense, Prayas/SHRAM citations |

### Strongly recommended: Faculty mentor

AgriDoot (1st place) had Dr. Diptee Ghusse, HoD CSE-AIML, as mentor. Recruit a faculty member from:
- Environmental engineering / sustainability
- AI/ML department
- Electronics / IoT lab

### Optional 5th member
- GIS / geospatial specialist for ward overlay
- Marathi/Hindi native speaker for briefing quality review

---

## 15. Idea PPT Structure (Slide-by-Slide)

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Title | SHRAMLOOP — Last-Mile Occupational Heat Action System. Team name, members, institute |
| 2 | The Human Crisis | 380M workers. $78B lost wages/year. 3,400 deaths per heat day. Photo: Pune construction worker |
| 3 | The Data Paradox | SHRAM + CHAITRA + 250 HAPs exist — yet supervisors still guess. Show SHRAM dashboard screenshot |
| 4 | The Gap | Diagram: SHRAM (risk) → **???** → Supervisor action. The ??? is SHRAMLOOP |
| 5 | Our Solution | 3-layer architecture diagram. SitePod photo |
| 6 | How It Works | Workflow: forecast → optimize → brief → dispatch. Example JSON output |
| 7 | Technical Innovation | EHI-N* (not wet-bulb). Site-level IoT override. Shift constraint solver |
| 8 | **Nugen API Integration** | **MANDATORY SLIDE.** Alignment corpus, model name, example Marathi inference |
| 9 | Pune Pilot | Map with 3 demo sites, ward overlay, SHRAM stations marked |
| 10 | Competitive Landscape | Table: SHRAM vs CHAITRA vs SHRAMLOOP. "We build on, not compete with" |
| 11 | Impact & Scalability | 700+ districts via SHRAM API. ₹1,500 SitePod. Maharashtra SOP compliance |
| 12 | Roadmap & Ask | Prototype timeline. Team. "We close the loop." |

---

## 16. Live Demo Script (Grand Finale)

**Duration:** 5 minutes demo + 3 minutes Q&A

| Time | Action | What judges see |
|------|--------|----------------|
| 0:00 | "It's 5:45 AM in Pune. SHRAM forecasts Zone 5 for heavy labor today." | Dashboard: Pune map, EHI-N* zones, red highlighting |
| 0:30 | "Supervisor Rajesh registers his Magarpatta construction site." | Quick site registration on phone |
| 1:00 | "SHRAMLOOP generates an optimized shift plan compliant with Maharashtra SOP." | Shift schedule appears: 6:00–10:30, break, 16:00–19:00 |
| 1:30 | "Our Nugen-aligned model generates the supervisor briefing." | Marathi text appears on screen |
| 2:00 | **"Rajesh receives this."** | **Phone plays Marathi voice briefing through speaker** |
| 2:30 | "But district forecasts miss site-level heat. Watch SitePod." | Heat lamp on SitePod → temperature rises |
| 3:00 | "SitePod detects microclimate override — 3°C above SHRAM forecast." | Red alert on dashboard. Updated briefing auto-generated |
| 3:30 | "Rajesh acknowledges. PMC dashboard shows compliance." | Supervisor replies YES. Green checkmark |
| 4:00 | Impact slide: 380M workers. $78B. SHRAM API. National scale. | — |
| 4:30 | "SHRAM tells you the risk. SHRAMLOOP tells you what to do." | Closing line |

---

## 17. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SHRAM API changes or goes down | Low | High | Cache last 72h of data locally; demo works offline |
| Nugen alignment takes too long | Medium | Critical | Start alignment Week 1; use inference API as fallback |
| SitePod hardware failure on stage | Medium | High | Build 2 units; have recorded video backup |
| Judge asks about SHRAM/CHAITRA overlap | High | Medium | Prepared Q&A (Section 12); cite as partners, not competitors |
| Another team pitches similar idea | Medium | Medium | Our IoT + Nugen voice delivery is differentiated |
| Can't get Exotel/Twilio working | Medium | Low | Browser TTS for demo; pre-recorded Marathi audio |
| Team lacks IoT skills | Medium | High | Recruit electronics student; SitePod is simple ESP32 |
| No faculty mentor | High | Medium | Approach dept HOD immediately — AgriDoot precedent |
| Pune-specific limits perceived scalability | Low | Medium | Emphasize 700-district SHRAM API coverage |

---

## 18. References & Data Sources

### Climate & health data
1. IECC (2026). *EHI-N*: A Modified Extended Heat Index for Laboring Populations.* UC Berkeley. https://iecc.gspp.berkeley.edu/wp-content/uploads/2026/02/IECC-Shram-Tech-Report-WP-WEB.pdf
2. IECC (2026). *Manual Work Under Extreme Heat: Using EHI-N* to Protect Laboring Populations.* https://iecc.gspp.berkeley.edu/wp-content/uploads/2026/02/IECC-Shram-EHI-Policy-WP-WEB.pdf
3. SHRAM Dashboard & API. https://shram.info/ — API: https://iecc-io.github.io/SHRAM/weather_logs/latest_alerts.json
4. CHAITRA — City Heat Action Intelligence and Risk Atlas. https://iecc.gspp.berkeley.edu/resources/heat-action-planning-chaitra/
5. Frontiers in Environmental Health (2026). *Estimating heatwave-induced excess mortality in India's districts.* https://www.frontiersin.org/journals/environmental-health/articles/10.3389/fenvh.2026.1789071/full
6. IIED (2026). *Extreme heat costing Indian workers billions in lost wages.* https://www.iied.org/extreme-heat-costing-indian-workers-billions-lost-wages
7. The Guardian (2026). *Extreme heat saps health and wages of India's poorest workers.* https://www.theguardian.com/environment/2026/jul/20/extreme-heat-india-outdoor-workers-poverty

### Pune-specific
8. Prayas (2026). *Braving the Heat: Learning from the Voices of Street Vendors.* https://energy.prayaspune.org/our-work/article-and-blog/braving-the-heat-learning-from-the-voices-of-the-street-vendors
9. Prayas Health (2026). *Street Vendor Heat Vulnerability Report.* https://health.prayaspune.org/images/pdf/SV_Report_Online_150426._701200703_2.pdf
10. Indian Express (2026). *PMC Heatwave Advisory: Avoid Work 12–3 PM.* https://indianexpress.com/article/cities/pune/wear-light-colour-clothes-avoid-working-outside-between-12-pm-3-pm-pmc-advisory-to-workers-to-prevent-heatstroke-10642062/
11. PMC Ward Boundaries (KML). https://data.opencity.in/dataset/pune-wards-info

### Competition
12. PCCOE IGC Official Site. https://www.pccoeigc.com/
13. PCCOE IGC Prizes & Nugen Terms. https://www.pccoeigc.com/prizes
14. PCCOE IGC Challenge Topics. https://www.pccoeigc.com/topics
15. PCCOE IR Cell — Indradhanu 2025–26 Inauguration. https://www.linkedin.com/posts/pccoe-ir-cell_the-international-relations-cell-pccoe-activity-7425229011515064320-OKyp
16. Nugen Intelligence API Docs. https://docs.nugen.in
17. Nugen Cookbook. https://github.com/nugen-in/nugen-cookbook

### Previous winners (for pattern analysis)
18. AgriDoot / Byte_Pirates — 1st Prize, Indradhanu 2025–26. https://www.linkedin.com/posts/mahirmulani_indradhanu-international-firstprize-activity-7425791223807983616-A9mH
19. Ecolooper — 2nd Prize. https://www.linkedin.com/posts/arvind4z_indradhanu2025-pccoe-aiforclimatechange-activity-7424338666338123777-Jm0-

### IoT reference designs
20. HeatSense — ESP32 wearable heat stroke detection. https://github.com/muhdhady/heatsense
21. ESP32 Smart Helmet for construction safety. https://github.com/Mostakim52/ESP32-Smart-Helmet

---

## 19. Final Verdict

### Is this idea finalized? Yes.

### Can we guarantee a win? No — and any document that claims guaranteed victory is dishonest.

**What we can state with confidence:**

1. **The problem is real, urgent, and quantified** — not speculative. $78B/year, 3,400 deaths/day, 380M workers. Every statistic is citable from 2026 sources.

2. **The differentiation is honest and defensible** — we build the action layer on top of SHRAM/CHAITRA, not a duplicate of them. A judge can verify this in 30 seconds and respect the intellectual honesty.

3. **The competition fit is precise** — correct domain, mandatory Nugen integration as core (not bolt-on), physical IoT prototype, Pune local relevance, advisory board alignment.

4. **The winner pattern is matched** — AgriDoot (end-to-end IoT+AI product) + Ecolooper (novel sensing + hardware demo) = SHRAMLOOP (IoT + Nugen voice + shift optimizer + SHRAM data).

5. **Every identified flaw has a documented fix** — Section 11. We pressure-tested against SHRAM, CHAITRA, last year's finalists, and Prayas Pune research.

### Win probability assessment

| Factor | Rating |
|--------|--------|
| Idea quality | ⭐⭐⭐⭐⭐ |
| Differentiation honesty | ⭐⭐⭐⭐⭐ |
| Demo-ability | ⭐⭐⭐⭐ (if SitePod built) |
| Competition fit | ⭐⭐⭐⭐⭐ |
| Execution dependency | ⭐⭐⭐ (team must deliver) |
| **Overall competitive positioning** | **Top 5% of conceivable submissions** |

### The one sentence that wins the pitch

> **"India finally has the heat data. SHRAMLOOP delivers the heat decision."**

### Immediate next actions

1. **Today:** Register team on https://www.pccoeigc.com/registration
2. **Today:** Sign up for Nugen at https://nugen.in/signup?invite=IN2027PCCOE (verify on official prizes page first)
3. **This week:** Recruit faculty mentor + IoT team member
4. **By Sept 9:** Submit Idea PPT (Section 15 structure)
5. **By Sept 30:** Working prototype with SitePod + prototype video

---

*This document is the single source of truth for the SHRAMLOOP project. All team members should read Sections 3, 11, and 12 before any external pitch or Q&A.*
