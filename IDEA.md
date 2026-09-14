# KAVACH — Occupational Heat Decision Engine

**Competition:** Indradhanu — International Grand Challenge (PCCOE Pune, International Relations Cell)
**Theme:** AI for Climate Change (UN SDG 13)
**Domain:** Disaster Resilience, Public Health & Community Well-being
**Sub-tracks:** Early Warning Systems · Climate-Induced Health Risk Assessment · Community Resilience Solutions
**Document version:** 2.0 — software-only rebuild
**Status:** Finalized. Build in progress.

> ⚠️ **Timeline check required.** Version 1.0 of this document listed a registration deadline of
> 10 September 2026 and a prototype deadline of 30 September 2026. Today is **15 September 2026**.
> Before anything else, re-verify the current edition's dates on `pccoeigc.com` — the build plan in
> Section 13 assumes a live submission window and must be re-based on the real one.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [Where India's Heat Stack Stops](#3-where-indias-heat-stack-stops)
4. [The KAVACH Solution](#4-the-kavach-solution)
5. [The Four Engines](#5-the-four-engines)
6. [Architecture](#6-architecture)
7. [Nugen Intelligence Integration](#7-nugen-intelligence-integration)
8. [Pune Pilot](#8-pune-pilot)
9. [Differentiation](#9-differentiation)
10. [Competition Fit — Winning Without Hardware](#10-competition-fit--winning-without-hardware)
11. [Self-Critique](#11-self-critique)
12. [Q&A Defence Playbook](#12-qa-defence-playbook)
13. [Build Roadmap](#13-build-roadmap)
14. [Live Demo Script](#14-live-demo-script)
15. [Risk Register](#15-risk-register)
16. [References](#16-references)

---

## 1. Executive Summary

### One line

> **KAVACH turns district heat forecasts into a defensible shift plan for a specific work site —
> by simulating what the day will do to a worker's body, then scheduling around it.**

### The insight

India's heat-data problem is solved. SHRAM publishes live occupational heat stress (EHI-N*) for
786 stations. CHAITRA does IPCC AR6 ward-level planning. 250+ cities have Heat Action Plans.

None of them answer the only question a site supervisor actually has at 6 AM:

> *"Can my crew work today, and for how long?"*

KAVACH answers it — and, critically, answers it in the currency the supervisor responds to.
Not "Zone 5, avoid exertion." Instead:

> *Magarpatta Site 7 · 42 workers, moderate labour, direct sun, recorded heatwave day.*
> *An unmanaged 09:00–17:00 shift drives predicted core body temperature past the 38.5 °C
> safety limit at **12:20**, and yields **32 effective labour-hours** after heat-related
> work-capacity loss.*
> *The KAVACH schedule — 06:00–10:00, stand-down, 16:00–20:00 — peaks at **37.2 °C**, stays
> inside Maharashtra SOP, and yields **105 effective labour-hours**.*
> *Safer **and** 3× the usable labour.*

Those are figures the engine actually produces, not illustrations — reproduce them with
`npx tsx scripts/demo-numbers.ts`.

That comparison is the adoption thesis. Safety advice gets ignored; output does not.

### Where the thesis does *not* hold — and why we say so

At the very highest work intensity the trade-off reverses, and the product reports it
plainly rather than hiding it. Same site, same day, at MET 6 (sustained very heavy labour):

| | Unmanaged 09:00–17:00 | KAVACH |
|---|---|---|
| Effective labour | 53 h | **37 h** |
| Peak core temperature | 40.5 °C | 38.4 °C |
| Limit breach | **09:36** — after 36 minutes | none |

Some days genuinely cannot deliver eight hours of very heavy outdoor labour safely, and a
system that claimed otherwise would be lying. KAVACH says so, and then shows the way out:
drop the intensity from MET 6 to MET 4 and the same day goes from −30% to **+233%**. That
single control is the most honest thing in the product and the most persuasive thing in the
demo — the trade-off is real, and it is *manageable*.

### Why this is a software problem, not a hardware one

Version 1.0 of this idea included an ESP32 sensor box ("SitePod") at each work site. It is removed.
This is not a compromise — it is a strict upgrade, and the pitch says so explicitly:

| SitePod (v1) | KAVACH downscaling engine (v2) |
|---|---|
| ₹1,510 per site, 8-hour battery, someone must mount it | ₹0 per site, works the moment coordinates are entered |
| Covers 1 site | Covers every site in 786 SHRAM districts on day one |
| Measures heat *after* it arrives | *Forecasts* site-level heat 72 hours ahead |
| Needs WiFi at a construction site | Needs a phone number |
| "Nice sensor" | Observation-anchored downscaling + ISO 7933 physiology |

> **The Q&A line:** *"We considered putting a sensor at every work site. India has tens of
> millions of them. So we solved it in software instead — and it deployed nationally the day
> we finished writing it."*

### What we are NOT building

| Not | Because |
|---|---|
| Another heat dashboard | SHRAM already does district monitoring, better than we could |
| Another ward planning tool | CHAITRA already does IPCC AR6 ward budgeting |
| A worker-facing app | Informal workers won't install apps; we target **supervisors and contractors** |
| A new heat index | We consume **EHI-N*** and implement **ISO 7933**, both peer-reviewed/standardised |
| A SHRAM competitor | SHRAM is our anchor observation source. We cite them as foundation |

---

## 2. The Problem

### 2.1 Scale

| Statistic | Source |
|---|---|
| ~380 million outdoor/heat-exposed workers in India | IECC EHI-N* policy paper |
| **$78 billion/year** in lost wages from heat (≈2% of GDP) | IIED, 2026 — 538 informal worker households |
| Outdoor workers lose **~24 workdays/year** (~9% of annual income) | IIED / The Guardian, 2026 |
| **~3,400 excess deaths** from a single day of extreme heat nationally | Frontiers in Environmental Health, 2026 |
| **41.5% of India** hit Zone 6 (physiological failure) for heavy outdoor labour Apr–Jun 2024 — vs only 9.6% flagged by the NOAA Heat Index | IECC technical report |
| In Zone 6, core temperature reaches dangerous levels in **14–32 minutes** | IECC EHI-N* technical report |

### 2.2 The structural gap

Maharashtra's SOP already mandates rescheduling outdoor work to 06:00–11:00 and 16:00–20:00
during heat alerts. PMC issues advisories to avoid 12:00–15:00. The policy exists.

Compliance does not — because compliance currently costs the contractor a day's output and
the worker a day's wage, with no tool to show either of them a third option.

Prayas Pune's 2026 fieldwork found informal workers score their workplace facilities at
**2.1/10** and that **income reliably takes precedence over health**. Any intervention that
asks a worker or a contractor to simply *lose money for safety* has already failed.

> **The failure mode is not missing data. It is that nobody has priced the alternative.**

### 2.3 Verified live data (checked 15 Sept 2026)

The SHRAM feed is live and richer than v1.0 of this document assumed:

```
https://shram.info/weather_logs/latest_alerts.json    → 786 stations, 623 active alerts
https://shram.info/weather_logs/forecast_data.json    → 72-hour forecast
https://shram.info/weather_logs/alerts_24h.json       → 24-hour history
```

Each station record carries `LAT`, `LON`, `TEMP`, `RH`, and **EHI + Zone for every MET level
3–6 in both sun and shade** (`EHI_6_sun`, `Zone_6_sun`, …). That is 8 heat-stress readings per
station, not one.

**17 live stations in Pune district**, including Magarpatta, Chinchwad, DPS Hadapsar,
MTI Pashan, Wadgaonsheri, NDA, Talegaon, Lonikalbhor.

---

## 3. Where India's Heat Stack Stops

| System | Answers | Horizon | Stops at |
|---|---|---|---|
| **IMD** | "Is there a heatwave?" | Days | Dry-bulb alerts, no occupational context |
| **SHRAM** (shram.info) | "What is the heat stress risk at this station?" | Now + 72h | Station-level risk zones. No schedule, no dispatch |
| **CHAITRA** (chaitra.info) | "Which ward needs Rs 2cr of cool roofs?" | Months-years | Municipal capital planning. Not today's shift |
| **Heat Action Plans** | "What should the city do in a heatwave?" | Seasonal | Policy text, not site operations |
| **KAVACH** | **"Can Site 7's crew work today, for how long, and what does it cost?"** | **Tomorrow, 06:00** | — |

SHRAM answers *what is the risk*. KAVACH answers *what do I do about it, and why it is worth it*.

---

## 4. The KAVACH Solution

### 4.1 Who we serve

| Persona | Pain today | KAVACH value |
|---|---|---|
| **Construction contractor** | Generic "avoid 12-4 PM" advisory; ignores it, deadlines do not move | A schedule proven to yield *more* effective labour-hours than working through the heat |
| **NREGA site supervisor** | No link between IMD alerts and muster-roll scheduling | Auto-generated work window + worker-count cap + rest cadence |
| **PMC Labour Welfare officer** | Issues advisories, cannot verify site compliance | Compliance ledger: which sites were briefed, which acknowledged |
| **Gig platform dispatcher** | Riders ride through peak heat for earnings | Heat-adjusted zone scheduling (Phase 2) |

We deliberately do **not** target individual workers as app users. Maharashtra's SOP already
places the legal duty on the employer. We automate the duty-holder's decision.

### 4.2 The loop

```
   SHRAM station obs ---+
   Open-Meteo forecast -+--> (1) DOWNSCALE --> site-level hourly heat (72h)
   Site land-cover -----+                              |
                                                       v
                                          (2) PHYSIOLOGY (ISO 7933)
                                        predicted core temp + water loss
                                                       |
                                                       v
                        Maharashtra SOP --->  (3) OPTIMISE --> shift plan
                                                       |        + productivity delta
                                                       v
                                          (4) BRIEF (Nugen aligned model)
                                        Marathi / Hindi / English + voice
                                                       |
                                                       v
                                       supervisor ack ---> compliance ledger
```

---

## 5. The Four Engines

This is the technical core. Each engine is independently defensible and none of them requires
a device in the field.

### 5.1 Engine 1 — Observation-Anchored Microclimate Downscaling

**Problem it solves:** SHRAM is station-level. A construction site 4 km from the nearest station,
surrounded by concrete with no tree cover, can run 3-5 degC hotter (urban heat island). Using the
station value directly *under-protects* exactly the sites that need protection most.

**Method** — three terms, each independently justifiable:

```
T_site(h) = T_openmeteo(site_lat, site_lon, h)     <- ~1-11 km gridded forecast at the site
          + B(nearest_station)                     <- live bias correction
          + dUHI(site land-cover features)         <- local built-environment delta

where  B = T_station_observed(now) - T_openmeteo(station_lat, station_lon, now)
```

- **Term 1 — gridded forecast at the actual site.** Open-Meteo returns hourly temperature,
  humidity, wind, and direct/shortwave radiation for arbitrary coordinates. Already finer than
  nearest-station assignment.
- **Term 2 — live bias anchoring.** We compute the model's current error *at the station where
  we have a real observation*, and carry that correction to the site. This is standard MOS
  (Model Output Statistics) bias correction. It keeps us tethered to SHRAM's ground truth instead
  of drifting into pure model output.
- **Term 3 — urban heat island delta.** A parametric function of site land-cover:
  built-up fraction, green-cover fraction, sky-view factor, surface albedo class, and distance
  to water. Coefficients are taken from published Indian UHI literature, **not invented**, and the
  interface accepts a trained residual model the moment ground-truth site data exists.

**Intellectual honesty (state this in the pitch):** Term 3 is a physically-grounded parametric
model, not a trained ML model — we do not have site-level ground truth to train on, and inventing
one would be dishonest. The architecture is built so that a learned residual drops into exactly
that slot. Saying this out loud is worth more in Q&A than a fabricated accuracy score.

**Validation we can actually quote.** SHRAM publishes EHI and its zone per station but not the
closed form of the index, and we need EHI at *site* conditions no station reports. So we fit a
quadratic response surface to the live feed itself — ~780 simultaneous stations spanning
12–32 °C and 18–100% RH, which makes it an interpolation rather than an extrapolation. Against
the feed's own published values it reaches **RMSE 1.17 EHI units, mean absolute error 0.79, and
89.9% exact agreement with SHRAM's published zone labels**. The solar component is handled
separately: we fit the *shade* surface, which genuinely is a function of temperature and
humidity, and add back the measured median sun-minus-shade increment scaled by each hour's
forecast radiation — otherwise the model reports full solar load at 05:00.

**Radiant load.** Because we have direct solar radiation from Open-Meteo, we estimate mean radiant
temperature rather than assuming it — which is what separates a sun-exposed site from a shaded one
by more than a checkbox.

### 5.2 Engine 2 — ISO 7933 Predicted Heat Strain *(the hero)*

**Problem it solves:** "Zone 5" is a category. A human body is a continuous system. A supervisor
needs to know *when* the danger arrives, not that it exists somewhere in the day.

We implement the **ISO 7933 Predicted Heat Strain (PHS)** model — the international standard for
analytical determination of thermal stress — stepping a body heat balance minute by minute across
the planned shift.

**Heat balance:**

```
S = M - W - Cres - Eres - R - C - E          (W/m2)
```

| Term | Meaning | Computation |
|---|---|---|
| `M` | metabolic rate | MET x 58.2 W/m2  (MET 3 = light, MET 6 = heavy labour) |
| `W` | external work | fraction of M |
| `Cres` | respiratory convection | `0.0014 * M * (35 - Ta)` |
| `Eres` | respiratory evaporation | `0.0173 * M * (5.624 - Pa)` |
| `R` | radiation | `hr * Fcl * (Tsk - Tr)` — uses estimated mean radiant temp |
| `C` | convection | `hc * Fcl * (Tsk - Ta)` — wind-speed dependent |
| `E` | evaporative cooling achieved | `min(Ereq, Emax)`, capped by skin wettedness `wmax` |

**Core temperature integration:**

```
dTcore/dt = S * A_Du / (m_body * c_body)      c_body ~ 3492 J/(kg K)
```

**Outputs — this is what the supervisor sees:**

| Output | Meaning |
|---|---|
| `Tcore(t)` | predicted core body temperature curve across the shift |
| `D_lim,Tre` | minutes until core temp reaches the **38.5 degC** limit |
| `water_loss(t)` | cumulative sweat loss (litres) |
| `D_lim,loss` | minutes until the dehydration limit |
| `w(t)` | skin wettedness — how close the body is to its evaporative ceiling |

**Why this wins the room.** Every other team will show a red map. We show a line climbing toward
a dashed limit, then show the optimiser *bending it back down*. It is the difference between
"it is hot" and "here is what today does to a person, and here is how we stop it."

It is also the honest answer to the hardest possible question — *"is this just an LLM wrapper?"* —
because the number on screen came from an ISO standard we implemented, not from a prompt.

### 5.3 Engine 3 — Shift Optimiser + Productivity Ledger

**Constraints:**

- Reject any window where PHS predicts core temp above 38.5 degC before the window ends
- Reject any window breaching the dehydration limit without a mandated water break
- Enforce Maharashtra SOP work windows during orange/red alerts
- Enforce ISO 7243 work/rest cadence per heat-stress zone
- Respect a configurable minimum daily work-hour target (the contractor's real constraint)

**Work-capacity model** — effective labour is not the same as hours on site. Derived from the
zone to work/rest allocation:

| Zone | Work fraction per hour | Meaning |
|---|---|---|
| 1-2 | 100% | continuous work |
| 3 | 75% | 45 min work / 15 min rest |
| 4 | 50% | 30 / 30 |
| 5 | 25% | 15 / 45 |
| 6 | 0% | stop work |

```
effective_hours = SUM over h of  scheduled(h) * work_fraction(zone(h)) * workers
```

**The ledger the contractor actually reads:**

```
Magarpatta Site 7 - 42 workers, MET 4, direct sun, 20 May (recorded heatwave day)

UNMANAGED   09:00-17:00   8.0 h x 42 workers   ->   32 effective labour-hours
                                                    core temp limit breached 12:20
                                                    peak core temperature 39.01 degC

KAVACH      06:00-10:00 + 16:00-20:00          ->  105 effective labour-hours
                                                    peak core temperature 37.23 degC
                                                    [OK] Maharashtra SOP compliant

            +74 effective hours   |   +233%   |   0 heat-limit breaches
```

The gain is this large because midday hours in Zone 5 and 6 return almost no usable labour
at all. Eight hours on site is not eight hours of work; the ledger prices that honestly, in
both directions.

The optimiser is capped so it can never "win" by simply rostering a longer day than the
baseline: total scheduled time is constrained to the contractor's target plus one hour. The
comparison is like-for-like - same time on site, better hours chosen.

This reframes heat safety from a cost into a scheduling optimisation. That is the difference
between a product that gets mandated and one that gets adopted.

### 5.4 Engine 4 — Nugen Briefing Agent

The schedule is worthless if it arrives as an English JSON payload. The last hop is language.

- Structured plan to prompt template to **Nugen aligned model** to Marathi/Hindi/English briefing
  using correct SOP and zone vocabulary
- Browser speech synthesis for on-stage voice playback; SMS/IVR (Exotel) as the production path
- **Agent Q&A**: supervisor asks *"आज दुपारी काम करू का?"* and gets a site-specific answer
  grounded in that site's own PHS numbers
- Acknowledgement captured back into the compliance ledger — closing the loop

---

## 6. Architecture

### 6.1 System

```
+------------------------------------------------------------------+
|  WEB APP  (Next.js App Router, TypeScript)                        |
|  Supervisor console · Site detail · Strain simulator · PMC ledger |
+------------------------------------------------------------------+
|  ROUTE HANDLERS  (/api)                                           |
|  /api/stations   live SHRAM ingest + Pune filter + cache          |
|  /api/sites      site registry, land-cover profile                |
|  /api/plan       downscale -> PHS -> optimise -> ledger           |
|  /api/brief      Nugen aligned inference, MR/HI/EN                |
|  /api/ack        acknowledgement + compliance ledger              |
+------------------------------------------------------------------+
|  ENGINES  (pure TypeScript, unit-testable, no I/O)                |
|  downscale.ts · phs.ts (ISO 7933) · optimizer.ts · productivity.ts|
+------------------------------------------------------------------+
|  DATA SOURCES  (all open)                                         |
|  SHRAM JSON feed · Open-Meteo forecast · OSM land-cover           |
+------------------------------------------------------------------+
```

### 6.2 Stack and why

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | One deploy, no CORS, server + client in one repo. Hackathon speed |
| Styling | Tailwind CSS v4 | Fast, but driven by a hand-built token layer — see 6.3 |
| Engines | Pure TypeScript modules | No Python service to keep alive during a live demo. Deterministic, testable |
| Charts | Hand-written SVG | Recharts/Chart.js have a recognisable default look. Custom SVG reads as designed |
| Map | Custom SVG projection over real station coordinates | No tile-server dependency at demo time. Cannot fail on venue WiFi |
| AI | Nugen aligned model (mandatory) | Briefing generation + agent Q&A |
| Voice | Web Speech API on stage, Exotel in production | Zero-dependency live demo |
| Deploy | Vercel | Free tier is sufficient |

**A deliberate architectural decision:** the four engines are pure functions with no network
calls inside them. Data is fetched at the route boundary and passed in. This means the strain
simulator and optimiser still run if the venue WiFi dies mid-demo — a cached snapshot is enough.
Section 15 treats demo-day network failure as a real risk, not an afterthought.

### 6.3 Design direction

The UI is deliberately *not* the default dashboard look. No purple gradients, no glassmorphism,
no emoji icons, no uniform grid of rounded cards.

Instead: a warm paper ground, hairline rules, a typographic hierarchy built on the IBM Plex
family (Serif for display, Sans for interface, Mono for every number), and **colour used only
to encode heat data — never for decoration**. The heat ramp is the only saturated colour in the
product. When something turns red on screen, it means a body is in danger, not that a button is
primary.

Numbers are set in tabular monospace so columns align and values do not jitter as they update.

---

## 7. Nugen Intelligence Integration

> **Mandatory.** Per the official PCCOE IGC prizes page: *"No team is eligible for any prize
> unless they demonstrate the use of inference through Nugen's aligned models in their project."*

> **Security note:** only use signup links found on the official `pccoeigc.com` domain.
> Do not trust signup URLs from third-party documents. Verify the invite code on the prizes page
> before use.

### 7.1 Why ours is not bolted on

A large number of teams will use the mandated API as a chatbot pasted onto a dashboard. Judges
will see that pattern dozens of times. Ours is load-bearing in a way that is hard to fake:

| Nugen capability | KAVACH usage |
|---|---|
| **Document upload** | Maharashtra outdoor-work SOP, EHI-N* zone guidance, PMC heat advisories, Prayas Pune worker reports |
| **Domain alignment** | Align a base model to occupational heat safety so it uses zone terminology and SOP windows *correctly*, not plausibly |
| **Aligned inference** | Convert a structured plan into a briefing that a supervisor with limited literacy can act on |
| **Agent endpoint** | Site-specific Q&A grounded in that site's own PHS output |
| **Multilingual** | Marathi and Hindi with domain-correct heat-safety vocabulary |

The distinction that matters in Q&A: **the model never decides anything.** Core temperature,
work windows, and effective-hour deltas are computed by the engines. Nugen's job is translation
of a decision into language a human will act on. That is a genuine, checkable division of
responsibility, and it means a model hallucination cannot produce an unsafe schedule.

### 7.2 Integration shape

```
Alignment corpus (uploaded to Nugen)
  maharashtra_outdoor_work_sop.pdf
  ehi_n_star_zone_guidance_iecc.pdf
  pmc_heatwave_advisory.pdf
  prayas_pune_informal_workers_report.pdf
  iso7933_phs_summary.pdf

Project:    KAVACH-Occupational-Heat-Safety-v1
Benchmark:  50-question Q&A set on zones, SOP compliance, rest cadence

Runtime:
  optimiser output (JSON)
    -> prompt template with site + PHS numbers
    -> Nugen aligned model
    -> Marathi / Hindi / English briefing
    -> Web Speech API on stage  |  Exotel IVR in production
```

The app ships with a deterministic template renderer behind the same interface, so the briefing
panel still produces correct text if the API key is absent or the network drops. The Nugen path
is the product; the fallback exists so a demo cannot be killed by venue WiFi.

---

## 8. Pune Pilot

### 8.1 Why Pune

| Reason | Detail |
|---|---|
| Finale venue | PCCOE, Pimpri-Chinchwad — judges know this city |
| Live data | 17 SHRAM stations in Pune district, verified 15 Sept 2026 |
| Open ward data | PMC electoral ward boundaries on OpenCity.in |
| Local research | Prayas Pune 2026 fieldwork on informal worker heat vulnerability |
| Active policy | Maharashtra SOP + PMC heat advisories |
| CHAITRA gap | Pune is not in CHAITRA's 12-city rollout |

### 8.2 Demo sites

| Site | Location | Nearest SHRAM station | Why |
|---|---|---|---|
| Construction | Magarpatta / Hadapsar corridor | Magarpatta Pune, DPS Hadapsar | High informal-worker density, dense built-up |
| NREGA worksite | Pimpri-Chinchwad rural fringe | Chinchwad Pune | Government-scheme integration story |
| Street vendor zone | FC Road / Camp | Blindschool KP Pune | Prayas research coverage |

The three sites are chosen so the downscaling engine visibly *disagrees* with the station
reading in different directions — dense built-up runs hot, the rural fringe runs closer to
station values. That contrast is the proof the engine is doing something real.

---

## 9. Differentiation

| Capability | SHRAM | CHAITRA | Weather app | Typical hackathon entry | **KAVACH** |
|---|---|---|---|---|---|
| Occupational heat metric (EHI-N*) | Yes | No | No | Rare | Yes (consumed) |
| Site-level downscaling | No | No | No | No | **Yes** |
| Physiological simulation (ISO 7933) | No | No | No | No | **Yes** |
| Shift schedule generation | No | No | No | No | **Yes** |
| Productivity / wage ledger | No | No | No | No | **Yes** |
| Multilingual voice briefing | Planned | No | Partial | Sometimes | **Yes** |
| SOP compliance tracking | No | No | No | No | **Yes** |
| Hardware required | — | — | — | Often | **None** |

---

## 10. Competition Fit — Winning Without Hardware

### 10.1 Honest read of the precedent

Last edition's top two both had a device on stage. That is a real signal and we should not
pretend otherwise. The question is *why* it worked. It worked because the device made the
system's intelligence **visible and falsifiable in real time** — a judge could watch it respond.

Hardware is one way to achieve that. It is not the only one, and it is the expensive, fragile one.

### 10.2 What we do instead

| What hardware provided | How KAVACH provides it in software |
|---|---|
| Something changes live on stage | Change the work intensity from MET 4 to MET 6 and the core-temp curve visibly breaks through the limit — live, computed, not a video |
| Proof the system is real | An ISO standard implemented in code, with intermediate terms inspectable on screen |
| A memorable moment | A Marathi voice briefing playing aloud in the hall |
| Local specificity | 17 real Pune stations, live, timestamped in front of the judges |

**The reframe for the pitch:** every rupee of hardware is a rupee of deployment friction.
A solution requiring a ₹1,500 box at each of India's work sites is not a national solution —
it is a pilot that will never leave the pilot. KAVACH covers 786 districts the day it ships.

> *"AgriDoot needed a device in every field. We deliberately built something that needs nothing
> in any field — because that is the only version of this that reaches 380 million workers."*

### 10.3 Domain and advisory-board fit

| Board expertise | KAVACH appeal |
|---|---|
| Environmental science | EHI-N* and ISO 7933 — standards, not invented metrics |
| Environmental data science | Real ingestion pipeline, MOS bias correction, honest model limitations |
| AI ethics & sustainability | Equity framing; supervisor-not-worker targeting; AI explicitly not in the safety decision path |
| Enterprise scale | Zero-hardware national deployment, API-first |
| Climate tech ventures | Clear go-to-market: B2G (municipal labour departments), B2B (contractors, gig platforms) |

### 10.4 Business model

- **B2G** — licence to municipal corporations and state labour departments; SOP compliance
  reporting is a statutory need with a budget line
- **B2B** — subscription for construction firms and gig platforms; the productivity ledger is
  the sales pitch, safety is the side effect
- **Freemium** — free tier: forecasts and basic schedules. Paid: multi-site management,
  compliance export, agent Q&A

Maharashtra's SOP is regulatory pull that already exists. We are selling compliance
automation to people who are already legally obliged to comply.

---

## 11. Self-Critique

### Flaw 1 — "SHRAM already does this"

| Severity | Critical |
|---|---|
| Problem | SHRAM covers 786 stations with a public API and a superior heat index |
| Fix | We consume SHRAM as our anchor observation source and build the three layers it explicitly does not have: site downscaling, physiological simulation, and scheduling. We cite them as foundation |
| Line | *"SHRAM tells you the risk. KAVACH tells you what to do, and what it costs either way."* |

### Flaw 2 — "CHAITRA already does ward-level"

| Severity | Critical |
|---|---|
| Problem | CHAITRA does IPCC AR6 ward planning for 12 cities |
| Fix | Different time horizon entirely. CHAITRA plans capital spend over years. We schedule tomorrow morning. We do not claim ward-mapping novelty |
| Line | *"CHAITRA answers what the city should build over three years. We answer what the contractor does at 06:00 tomorrow."* |

### Flaw 3 — "Removing hardware removes your differentiator"

| Severity | Critical — this was the biggest risk in the rewrite |
|---|---|
| Problem | v1.0's entire win-argument rested on a physical device matching last year's winners |
| Fix | Replaced one ₹1,510 sensor with three software engines that are individually harder to build than the sensor was: observation-anchored downscaling, ISO 7933 PHS, and a constraint optimiser with a productivity model. The scalability argument gets strictly better |
| Line | See 10.2 |

### Flaw 4 — "Workers will not use an app"

| Severity | High |
|---|---|
| Problem | Prayas Pune 2026: income takes precedence over health; 46% never rest in shade |
| Fix | We never ask a worker to change behaviour. We target the supervisor, who already holds the legal duty — and we give them a commercial reason to act, not a moral one |
| Line | *"We do not ask workers to choose health over income. We remove the choice by making the safe schedule the more productive one."* |

### Flaw 5 — "Is this just a wrapper around an LLM?"

| Severity | High |
|---|---|
| Problem | Mandated AI APIs produce a lot of thin chatbot projects |
| Fix | The model is explicitly outside the safety decision path. Every number is computed by the engines; Nugen only renders language. This is checkable — turn the API off and the schedule is unchanged |
| Line | *"Our AI cannot make the schedule unsafe, because it does not make the schedule."* |

### Flaw 6a — "Your own tool sometimes reduces output"

| Severity | High — and we lead with it rather than wait to be caught |
|---|---|
| Problem | At MET 6 in extreme heat the optimised schedule returns *fewer* effective labour-hours than working through, because no safe schedule reaches the target hours |
| Fix | Report it. The ledger states the trade-off in plain language whenever it is negative, and the work-intensity control shows the recovery path (MET 6 → MET 4 turns −30% into +233% on the same day). A tool that only ever produced good news would not be a safety tool |
| Line | *"Some days cannot safely deliver eight hours of very heavy labour. We would rather tell the contractor that than quietly rig the comparison."* |

### Flaw 6b — "You could inflate the productivity gain by scheduling a longer day"

| Severity | Medium — a judge who reads the method will look for this |
|---|---|
| Problem | An optimiser free to roster 12 hours will always beat an 8-hour baseline, regardless of heat |
| Fix | Total scheduled time is capped at the contractor's target plus one hour, so the comparison is like-for-like. The gain comes from *which* hours are chosen, not how many |

### Flaw 7 — "Your UHI coefficients are not trained"

| Severity | Medium — and we raise it before the judges do |
|---|---|
| Problem | Term 3 of the downscaling model is parametric, not learned |
| Fix | We say so explicitly, cite the literature the coefficients come from, and show the interface where a trained residual model plugs in. Terms 1 and 2 are live data and standard MOS bias correction — the majority of the signal is real |

### Flaw 8 — "Can you actually deliver voice calls?"

| Severity | Medium |
|---|---|
| Problem | Telephony integration is heavy for a hackathon |
| Fix | Web Speech API for the live demo — real synthesis, on stage, zero dependencies. Exotel documented as the production path. We do not claim a telephony integration we have not built |

### Flaw 9 — "Nugen vs Newgen"

| Severity | Low, clarified |
|---|---|
| Note | The co-organiser is **Nugen Intelligence** (nugen.in), not Newgen. Use only the official pccoeigc.com prizes page for signup links |

### Flaw 10 — Dates in v1.0 do not match the calendar

| Severity | Blocking, administrative |
|---|---|
| Problem | v1.0 listed a 10 Sept 2026 registration deadline. Today is 15 Sept 2026 |
| Fix | Re-verify the live timeline on pccoeigc.com before committing to Section 13. This is an unresolved item, not a solved one |

---

## 12. Q&A Defence Playbook

**"How is this different from SHRAM?"**
> SHRAM is our data source — we use their public feed and cite them. SHRAM publishes station-level
> risk zones. We downscale that to a specific site, run an ISO 7933 physiological simulation to
> predict when a worker's core temperature crosses 38.5 °C, optimise a shift around that limit,
> and deliver it as a Marathi voice briefing. SHRAM's own roadmap lists SMS alerts as planned.
> We built the decision layer.

**"Why no hardware? Last year's winners had devices."**
> Because a ₹1,500 box per site is a pilot, not a national system — India has tens of millions of
> work sites. We replaced the sensor with an observation-anchored downscaling model, which covers
> 786 districts on day one at zero marginal cost. The sensor measured heat after it arrived; we
> forecast it 72 hours ahead. Removing the hardware made the product bigger, not smaller.

**"Is the AI actually doing anything, or is it a chatbot?"**
> The AI is deliberately not in the safety decision path. Core temperature, work windows and
> productivity deltas are computed by engines we wrote. Nugen's aligned model turns that decision
> into Marathi a supervisor can act on. You can verify this: turn the API key off and the schedule
> is byte-identical — only the language disappears. We consider that a safety property.

**"Your ISO 7933 implementation — is it real?"**
> Yes, and it is inspectable. [Open the strain panel] These are the heat-balance terms —
> metabolic rate, respiratory convection and evaporation, radiation using estimated mean radiant
> temperature, convection, and evaporative cooling capped by skin wettedness. Change MET from 4 to
> 6 and watch the curve break the limit two hours earlier. It is a simulation, not a lookup table.

**"How do you know your site-level number is right?"**
> Partly we do not, and we are explicit about which part. Term 1 is a gridded forecast at the site.
> Term 2 is a live bias correction against a real SHRAM observation — that is standard MOS. Term 3,
> the urban heat island delta, is parametric with coefficients from published Indian UHI studies,
> because we have no site-level ground truth to train on. We built the interface so a learned
> residual drops in when that data exists. We would rather tell you that than show you a fake R².

**"Why would a contractor adopt this?"**
> Not for safety. For output. Our ledger shows an unmanaged 9-to-5 in Zone 5 yields fewer effective
> labour-hours than a split shift, because work capacity collapses to 25% in the heat. The safe
> schedule is also the more productive one. Maharashtra's SOP then provides the regulatory floor.

**"Can this scale beyond Pune?"**
> It already does. SHRAM covers 786 stations nationally, Open-Meteo is global, and there is no
> hardware to ship. Pune is the pilot because the finale is here and the local research is strong.
> The architecture is national from day one — and the language layer works in any Indian language.

**"Show me the Nugen integration."**
> [Live] Here is the alignment corpus — Maharashtra SOP, EHI-N* guidance, PMC advisories.
> Input: this plan JSON. Output: this Marathi briefing. Here is the agent answering a follow-up
> in Hindi, grounded in this specific site's core-temperature numbers.

---

## 13. Build Roadmap

> Re-base these against the verified official timeline before committing (see Flaw 10).

| Stage | Deliverable |
|---|---|
| **Stage 1** | Design system, app shell, live SHRAM ingestion for Pune |
| **Stage 2** | Engines: downscaling, ISO 7933 PHS, optimiser, productivity ledger |
| **Stage 3** | Strain simulator UI (hero), site console, station map |
| **Stage 4** | Nugen briefing + agent Q&A + voice + acknowledgement ledger |
| **Stage 5** | Polish, responsive pass, demo rehearsal, prototype video |

### Team

| Role | Responsibility |
|---|---|
| Full-stack lead | App, API routes, SHRAM ingestion, demo orchestration |
| Engine / modelling | ISO 7933 implementation, downscaling, optimiser, validation |
| AI engineer | Nugen alignment project, briefing prompts, agent endpoint |
| Pitch / research | Deck, demo script, Q&A defence, citations, Marathi review |

A faculty mentor is strongly recommended — last edition's winning team had one.

---

## 14. Live Demo Script

**5 minutes.** The order is deliberate: establish the data is real, then make the physiology
visceral, then show the money, then make it speak.

| Time | Action | What judges see |
|---|---|---|
| 0:00 | "This is the live SHRAM feed. 786 stations, 17 of them in Pune, pulled minutes ago." | Station map, live timestamp, real zone values |
| 0:30 | "Rajesh runs a construction site in Magarpatta. 42 workers, direct sun." | Site console |
| 1:00 | "No station sits on his site. So we downscale — gridded forecast, live bias correction against the nearest station, then a land-cover term. His site runs 3.3 °C above open ground." | Downscaling panel, all terms broken out, including the one we admit is parametric |
| 1:30 | **"Here is what an ordinary 9-to-5 does to one of his workers."** | **Core temperature curve climbing and crossing the 38.5 °C dashed limit at 12:20. Past the breach it goes dashed — we stop claiming validity.** |
| 2:10 | "Now the optimiser." | Curve redraws under the limit; blocks snap to 06:00–10:00 and 16:00–20:00 |
| 2:30 | "And it is not a sacrifice — 32 effective labour-hours becomes 105." | Productivity ledger, side by side |
| 2:50 | **"But let me show you the case we lose."** Switch MET 4 → MET 6. | **Curve breaks the limit again. Ledger flips to −30%. The system says so plainly.** |
| 3:10 | "Some days cannot safely deliver eight hours of very heavy labour. We say that instead of pretending. And we show the way out." Switch back to MET 4. | Schedule becomes viable again, live, computed |
| 3:30 | "Rajesh does not read English dashboards." | Marathi briefing appears |
| 3:45 | **Play it aloud.** | **Marathi voice fills the hall** |
| 4:05 | "Switch the source to the deterministic renderer. Watch the schedule." | Text changes, **schedule does not move** — the AI is outside the safety path |
| 4:25 | "786 districts. No hardware. Today." | Scale |
| 4:40 | "India has the heat data. KAVACH makes the heat decision." | Close |

**The MET switch at 2:50 is the demo's spine.** It is the software equivalent of the heat
gun: something changes live, computed in front of the judges, and it is the moment that
proves the model is real rather than a recording — precisely *because* it shows the system
losing.

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Venue WiFi fails mid-demo | Medium | Critical | Engines are pure functions over cached snapshots. Ship a bundled data fixture; demo runs fully offline |
| SHRAM feed changes shape or goes down | Low | High | Parse defensively, cache last good response, bundled fallback fixture |
| Nugen alignment not ready in time | Medium | High | Deterministic template renderer behind the same interface; start alignment in Stage 1, not Stage 4 |
| Judge presses on untrained UHI coefficients | High | Medium | We raise it first (Flaw 7). Honesty is the defence |
| "No hardware" reads as less effort | Medium | High | Section 10.2 reframe, rehearsed. Show the ISO implementation on screen |
| Another team pitches heat + LLM | High | Medium | Physiological simulation + productivity ledger is the moat. A chatbot on a heat map is not close |
| Official timeline already passed | Unknown | Blocking | Verify on pccoeigc.com immediately (Flaw 10) |
| Marathi briefing quality is poor | Medium | Medium | Native-speaker review of every demo string before recording |

---

## 16. References

**Heat, health, labour**
1. IECC. *EHI-N*: A Modified Extended Heat Index for Laboring Populations.* UC Berkeley.
2. IECC. *Manual Work Under Extreme Heat: Using EHI-N* to Protect Laboring Populations.*
3. SHRAM dashboard and feed — https://shram.info/
4. CHAITRA — City Heat Action Intelligence and Risk Atlas, IECC Berkeley.
5. Frontiers in Environmental Health (2026). *Estimating heatwave-induced excess mortality in India's districts.*
6. IIED (2026). *Extreme heat costing Indian workers billions in lost wages.*
7. The Guardian (2026). *Extreme heat saps health and wages of India's poorest workers.*

**Standards**
8. ISO 7933 — *Ergonomics of the thermal environment: analytical determination and interpretation of heat stress using calculation of the predicted heat strain.*
9. ISO 7243 — *Ergonomics of the thermal environment: assessment of heat stress using the WBGT index.*
10. ISO 8996 — *Determination of metabolic rate.*

**Pune**
11. Prayas (2026). *Braving the Heat: Learning from the Voices of Street Vendors.*
12. Prayas Health (2026). *Street Vendor Heat Vulnerability Report.*
13. PMC heatwave advisory coverage, Indian Express (2026).
14. PMC ward boundaries — https://data.opencity.in/dataset/pune-wards-info

**Data / platform**
15. Open-Meteo forecast API — https://open-meteo.com/
16. Nugen Intelligence API docs — https://docs.nugen.in
17. PCCOE IGC official site — https://www.pccoeigc.com/

---

## 17. Final Position

**Is the idea finalised?** Yes.

**Does removing hardware weaken it?** No — and the pitch attacks that question head-on rather
than defending against it. One ₹1,510 sensor covering one site was replaced by three engines
covering 786 districts. The scalability story, which is what actually gets asked in Q&A, is
strictly stronger.

**What we can state honestly:**

1. **The problem is quantified, not speculative.** $78B/year, ~3,400 deaths per extreme heat day,
   380 million exposed workers — every figure citable.
2. **The data is live.** 786 SHRAM stations, 17 in Pune, verified 15 September 2026.
3. **The technical core is a standard, not a claim.** ISO 7933 implemented in code, inspectable
   on screen, with an LLM deliberately excluded from the safety decision path.
4. **The adoption argument is commercial, not moral.** The safe schedule is the productive one.
   That is why it gets used.
5. **Every known weakness is documented with its fix** — including the two we would rather not
   volunteer (untrained UHI coefficients, and a calendar that needs re-verifying).

**No guarantees.** Against a thousand-team field, execution decides this, not the idea.
This document maximises position; it does not promise a result.

### The line

> **"India finally has the heat data. KAVACH makes the heat decision."**
