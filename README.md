# KAVACH — Occupational Heat Decision Engine

Turns district-level heat forecasts into a defensible shift plan for a specific work site,
by simulating what the day will do to a worker's body.

Built for **Indradhanu — International Grand Challenge**, PCCOE Pune. Theme: AI for Climate
Change (UN SDG 13). Domain: Disaster Resilience, Public Health & Community Well-being.

- **[PITCH.md](PITCH.md)** — the full story: why this had to exist, what is genuinely
  new about it, every design decision and its reasoning, the demo script, and honest
  answers to the hard questions. Start here if you are presenting it.
- **[IDEA.md](IDEA.md)** — competition strategy, competitive analysis and Q&A defence.
- **How does this work?** — a plain-English walkthrough lives in the app itself at
  `/how-it-works`, with no equations and a full glossary.

---

## What it does

India already has excellent heat *data* — SHRAM publishes live occupational heat stress
(EHI-N\*) for ~780 stations. What it does not have is anything that answers the only
question a site supervisor asks at 6 AM: **can my crew work today, and for how long?**

KAVACH answers it in four steps, none of which need hardware in the field:

| Engine | What it does |
|---|---|
| **Downscaling** | Estimates site-level conditions from a gridded forecast + live MOS bias correction against the nearest SHRAM station + a land-cover urban-heat-island term |
| **ISO 7933 PHS** | Steps a whole-body heat balance minute by minute and predicts core body temperature and sweat loss across the shift |
| **Optimiser** | Searches candidate schedules, discards any that breach a physiological limit, and maximises *effective* labour under Maharashtra SOP constraints |
| **Briefing** | Renders the plan as a spoken Marathi / Hindi / English briefing via a Nugen aligned model, with a deterministic fallback |

**The AI is deliberately outside the safety decision path.** Every time, threshold and volume
is computed by the engines; the model only phrases them. Switch the briefing source in the UI
and the schedule does not move.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production
npx eslint src               # lint
npx tsc --noEmit             # typecheck
```

### Environment

Everything works with no configuration — the Nugen path degrades to a deterministic
renderer and the data layer falls back to a bundled snapshot. To enable aligned inference,
copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `NUGEN_API_KEY` | Enables Nugen aligned-model briefings |
| `NUGEN_BASE_URL` | Override the inference host |
| `NUGEN_MODEL` | The aligned model deployed for this project |

> Verify the exact endpoint path and model id against `docs.nugen.in` for your account
> before the demo. If they differ, only the two constants at the top of
> [`src/lib/nugen.ts`](src/lib/nugen.ts) need to change — the product keeps working from the
> deterministic renderer in the meantime.
>
> Obtain credentials only through the official `pccoeigc.com` prizes page. Do not use signup
> links from third-party documents.

---

## Verifying the engines

The engines are pure functions with no I/O, so they can be exercised without the app:

```bash
npx tsx scripts/engine-check.ts    # all sites, both scenarios, fit diagnostics
npx tsx scripts/demo-numbers.ts    # the exact figures quoted in IDEA.md
```

`engine-check` reports the EHI response-surface fit against SHRAM's own published values:
**RMSE 1.17, mean absolute error 0.79, 89.9% exact zone agreement**.

Both scripts run against the bundled station snapshot so their output is reproducible. The
running app refits the surface from the live feed on every request, so absolute values there
will differ from day to day — the comparison direction is what holds, not the exact figure.

---

## Demo-day resilience

A five-minute live demo cannot be allowed to fail on conference WiFi, so:

- The four engines contain **no network calls** — data is fetched at the route boundary and
  passed in, so everything still computes from a cached snapshot.
- A real SHRAM snapshot is **bundled** (`src/lib/fallback.ts`): 217 stations including all
  17 in Pune, spanning 12–32 °C and 18–100% RH so the response-surface fit stays
  well-conditioned offline.
- The map is a **hand-projected SVG**, not a tile map — no tile server to fail.
- Voice uses the **Web Speech API**, not telephony.

---

## Layout

```
src/
  lib/
    shram.ts        live SHRAM ingestion, caching, offline fallback
    openmeteo.ts    gridded forecast + archive (heatwave scenario)
    ehi.ts          EHI response-surface fit + solar increment
    downscale.ts    site-level microclimate estimation
    phs.ts          ISO 7933 predicted heat strain
    optimizer.ts    shift search + productivity ledger
    plan.ts         pipeline orchestration
    briefing.ts     deterministic multilingual briefing
    nugen.ts        Nugen aligned-model adapter (server only)
  components/       console UI, hand-drawn SVG charts
  app/api/          plan + brief route handlers
scripts/            engine verification (not part of the build)
```

---

## Data sources and credit

- **SHRAM** — India Energy & Climate Centre, UC Berkeley. Live EHI-N\* observations. This is
  our anchor observation source; KAVACH builds the decision layer on top of it and does not
  compete with it.
- **Open-Meteo** — gridded hourly forecast and historical archive.
- **ISO 7933 / ISO 7243 / ISO 8996** — thermal-stress and metabolic-rate standards.

Heat-stress zones and EHI-N\* are SHRAM's. The downscaling, physiological simulation,
scheduling and productivity model are ours.
