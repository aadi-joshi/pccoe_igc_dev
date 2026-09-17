# KAVACH — The Full Story

**A pitch document.** Everything you need to explain this project to a judge, a
professor, a municipal officer, a contractor or an investor — what it is, why it
had to exist, what is genuinely new about it, and where it falls short.

> **How to use this document.** Section 1 is the two-minute version. Sections 2–5 are
> the argument. Sections 6–9 are the technical substance. Sections 10–13 are for
> defending it under questioning. If you read nothing else, read §1, §5 and §12.
>
> The competition-strategy companion to this document is [IDEA.md](IDEA.md).
> The engineering reference is [README.md](README.md).

---

## Table of contents

1. [The two-minute version](#1-the-two-minute-version)
2. [The problem, and why it is not the problem you think](#2-the-problem-and-why-it-is-not-the-problem-you-think)
3. [Why nothing existing solves it](#3-why-nothing-existing-solves-it)
4. [What we built](#4-what-we-built)
5. [What is genuinely novel here](#5-what-is-genuinely-novel-here)
6. [Every design decision, and why we made it](#6-every-design-decision-and-why-we-made-it)
7. [The technical core in detail](#7-the-technical-core-in-detail)
8. [Proof: what we can actually demonstrate](#8-proof-what-we-can-actually-demonstrate)
9. [What we got wrong, and what we still cannot do](#9-what-we-got-wrong-and-what-we-still-cannot-do)
10. [Who this is for and how it reaches them](#10-who-this-is-for-and-how-it-reaches-them)
11. [Impact and scale](#11-impact-and-scale)
12. [How to pitch it: script, soundbites, demo](#12-how-to-pitch-it-script-soundbites-demo)
13. [Hard questions and honest answers](#13-hard-questions-and-honest-answers)
14. [Where this goes next](#14-where-this-goes-next)

---

## 1. The two-minute version

### The sentence

> **KAVACH turns a heat forecast into a specific answer: can this crew work outdoors
> today, and when — by simulating what the day would do to a worker's body.**

### The situation

Roughly **380 million Indians** work in outdoor heat. Heat costs them about
**$78 billion a year** in lost wages — close to 2% of GDP. A single day of extreme
heat is associated with roughly **3,400 excess deaths** nationally.

India's *data* on this is now world-class. SHRAM, built by UC Berkeley's India Energy
& Climate Centre, publishes live occupational heat-danger readings for about **786
weather stations**, free and open. Ward-level planning tools exist. More than 250
cities have Heat Action Plans.

### The gap

None of it answers the only question that changes what happens on a work site.

A supervisor standing at a gate at 6 AM with forty people waiting does not need a
risk map. They need to know whether to send the crew in, and until when. Today that
decision is made by guessing, and the guess is biased by the fact that stopping work
costs everyone money immediately while heat stroke is a risk that might not land
today.

### What we do about it

Five steps, all software, no hardware anywhere:

1. Read the live SHRAM measurements.
2. Estimate conditions at the **specific work site**, not the weather station four
   kilometres away.
3. Simulate a worker's **core body temperature** minute by minute across the shift,
   using the international standard for heat strain (ISO 7933).
4. Search thousands of possible schedules, discard every one that would push a body
   past the safe limit, and keep the one that delivers the **most actual work**.
5. Speak it to the supervisor in Marathi or Hindi.

### The part that makes it get adopted

Not safety. Economics.

Hours worked in severe heat produce very little — in Zone 5 a crew gets roughly
fifteen usable minutes per hour, because the rest has to be spent recovering. So the
safe schedule is usually also the *more productive* one.

On a recorded May heatwave day at a real Magarpatta construction site, at moderate
work intensity:

| | A normal 09:00–17:00 day | The KAVACH schedule |
|---|---|---|
| Real work delivered | **32 labour-hours** | **105 labour-hours** |
| Peak body temperature | 39.01 °C | 37.23 °C |
| Safe limit crossed | **yes, at 12:20** | no |

Three times the usable labour, and nobody goes to hospital. That is the pitch.

### And the part we refuse to hide

At the very heaviest work intensity, on that same day, the honest answer flips: the
safe schedule delivers **less** (53 → 37 labour-hours). Some days genuinely cannot
deliver eight hours of very heavy outdoor labour. KAVACH says so on screen instead
of quietly rigging the comparison — and then shows the way out, because dropping the
work intensity one step turns that −30% into +233%.

A safety tool that only ever produces good news is not a safety tool.

---

## 2. The problem, and why it is not the problem you think

### 2.1 The numbers

| What | Figure | Source |
|---|---|---|
| Outdoor / heat-exposed workers in India | ~380 million | IECC EHI-N* policy paper |
| Annual wage loss to heat | **~$78 billion** (≈2% of GDP) | IIED, 2026 — survey of 538 informal worker households |
| Workdays lost per outdoor worker per year | ~24 days (~9% of annual income) | IIED / The Guardian, 2026 |
| Excess deaths from one day of extreme heat | ~3,400 | Frontiers in Environmental Health, 2026 |
| Share of India reaching the most dangerous zone for heavy outdoor labour, Apr–Jun 2024 | **41.5%** — against only 9.6% flagged by the standard NOAA Heat Index | IECC technical report |
| Time to dangerous core temperature in that zone | **14–32 minutes** | IECC technical report |

That fifth row is the one to sit with. The heat index most weather services use was
built to describe how hot it *feels* to a person at rest. Applied to somebody
digging in the sun, it understates the danger by a factor of four. A large part of
this crisis has been invisible because we were measuring it with the wrong
instrument.

### 2.2 The problem is not ignorance

It is tempting to frame this as an awareness problem — that workers and employers do
not know heat is dangerous. That framing is wrong, and building on it produces
products nobody uses.

Prayas Pune's 2026 fieldwork with informal workers found:

- A workplace facilities score of **2.1 out of 10** — shade, water and toilets are
  structurally absent, not forgotten.
- **46% never rest in shade** during a working day.
- Income reliably takes precedence over health, because missing a day's wage means
  missing a day's food.

Everybody involved already knows the heat is dangerous. The worker knows. The
contractor knows. Maharashtra's government knows — it has an official rule telling
outdoor work to happen 06:00–11:00 and 16:00–20:00 during heat alerts.

### 2.3 The problem is that safety and income point in opposite directions

Under the current framing, every actor faces the same trap:

- The **worker** loses a day's pay by stopping, and the heat stroke is only a
  probability.
- The **contractor** loses a day's output by complying, and the penalty for
  non-compliance is unlikely to arrive.
- The **inspector** has no way to see which sites complied.

Any product that asks one of these people to simply absorb a loss for safety's sake
has lost before it launches. This is the real problem, and it is an economics
problem wearing a public-health costume.

### 2.4 So the actual problem statement

> Not: *"people do not know it is dangerous."*
>
> But: *"nobody has ever priced the alternative, at the level of a specific site on a
> specific day, in time for it to change what happens."*

That reframing is what the whole product is built on. Everything in §4 follows from
it.

---

## 3. Why nothing existing solves it

### 3.1 The landscape, honestly assessed

| System | What it does well | Where it stops |
|---|---|---|
| **IMD** | National heatwave alerts and seasonal outlooks | Dry-bulb temperature, no occupational context, no site granularity |
| **SHRAM** (shram.info) | Excellent live occupational heat danger for ~786 stations, free public API, uses a heat index built for labouring people | Reports **risk**. Does not produce a schedule, does not reach a supervisor, is station-level |
| **CHAITRA** (chaitra.info) | Rigorous ward-level heat planning for 12 cities using IPCC AR6 methods | Built for municipal **capital planning over years**. Not today's shift |
| **City Heat Action Plans** | Policy scaffolding in 250+ cities | Documents, not operations |
| **Maharashtra's SOP** | Legally places the duty on employers, with specific hours | No tool exists to comply with it or verify compliance |
| **Consumer weather apps** | Ubiquitous | Measure the wrong thing for this purpose entirely |

### 3.2 The honest version of our differentiation

We are not competing with SHRAM. **We depend on it.** It is our ground truth and we
cite it everywhere, including on screen in the product. A judge should be able to
check that claim in thirty seconds and find it accurate.

The distinction is one of *layer*, not quality:

- SHRAM answers **"what is the risk?"** — brilliantly, and better than we could.
- CHAITRA answers **"what should this city build over three years?"**
- KAVACH answers **"what does the contractor do at 06:00 tomorrow, and what does it
  cost him either way?"**

Nobody occupies that last layer. That is not because it is unimportant — it is the
only layer that touches an actual worker — but because it requires stitching together
three things that normally live in separate worlds: geospatial downscaling,
occupational physiology, and constraint optimisation.

### 3.3 Why the gap persisted

Worth understanding, because it is the answer to *"if this is so obvious, why hasn't
anyone done it?"*

1. **The data only recently became good enough.** SHRAM's occupational heat index is
   recent. Before it, the input to a system like this did not exist publicly.
2. **The disciplines do not usually meet.** Heat scientists publish indices.
   Ergonomists own ISO 7933 and mostly apply it inside factories and mines.
   Operations researchers schedule shifts. Very few projects sit at the intersection.
3. **The obvious solution is hardware, and hardware does not scale here.** The
   instinctive fix for "the station is too far away" is to put a sensor on the site.
   That instinct is a trap — see §6.1.
4. **The commercial case was never made.** Everyone framed this as safety, which is a
   cost. Nobody framed it as scheduling, which is a saving.

---

## 4. What we built

### 4.1 In one diagram

```
  SHRAM live readings  ─┐
  (786 stations)        │
                        ├──▶  ①  ESTIMATE THE SITE
  Open-Meteo forecast  ─┤        gridded forecast + live accuracy
  (any coordinates)     │        check + what the ground is made of
                        │                    │
  Site land cover      ─┘                    ▼
  (built-up, canopy,              ②  SIMULATE THE WORKER
   sky view, water)                  ISO 7933, minute by minute
                                     core body temperature + sweat
                                              │
                                              ▼
  Maharashtra SOP ─────────────▶   ③  BUILD THE SHIFT
                                     search schedules, reject unsafe,
                                     maximise real work delivered
                                              │
                                              ▼
                                  ④  SAY IT OUT LOUD
                                     Marathi / Hindi / English briefing
                                     → supervisor confirms → compliance record
```

### 4.2 In plain words

**A supervisor opens the console.** It says, in a sentence: *yes, your crew can work
today, in two windows — 06:00–10:00 and 16:00–20:00 — stand down in between, and put
1.8 litres of drinking water per person on site.*

Everything below that sentence is the reasoning: how hot the site will actually get,
what that does to a body hour by hour, and what it means for output. They can ignore
all of it. A judge, an inspector or a sceptic can read all of it.

**Then it speaks.** The plan is read aloud in Marathi. In deployment that is an SMS
or a phone call at 5:30 AM, before anyone travels to site.

### 4.3 The four engines

| Engine | Question it answers | Method |
|---|---|---|
| **Downscaling** | How hot will *this site* get? | Gridded forecast at the site's coordinates, corrected against the nearest live station, adjusted for local ground cover |
| **Heat strain (ISO 7933)** | What does that do to a person? | Whole-body heat balance stepped every minute; predicts core temperature and sweat loss |
| **Optimiser** | When should they work? | Exhaustive search over shift patterns, physiological constraints, legal work windows, maximise usable labour |
| **Briefing** | What do we tell them? | Structured plan → aligned language model → spoken Marathi/Hindi/English |

### 4.4 What it is *not*

Stating this clearly prevents half the objections in §13.

| It is not | Because |
|---|---|
| A weather dashboard | SHRAM already does that better; we consume it |
| A ward planning tool | CHAITRA already does that; different time horizon entirely |
| An app for workers | Workers will not install it, and asking them to choose health over income ignores reality. We target the person who already holds the legal duty |
| A new heat index | We consume SHRAM's and implement an ISO standard. We invented no science |
| An AI product | The AI writes sentences. It is deliberately excluded from every safety decision |

---

## 5. What is genuinely novel here

Be precise about this. Overclaiming novelty is the fastest way to lose credibility
with anyone who knows the field, and every item below is defensible under scrutiny.

### 5.1 The four claims we will make

**① Nobody is running a physiological simulation as the scheduling constraint.**

Heat dashboards classify conditions. We simulate a *person*. ISO 7933 is a
well-established standard — we did not invent it — but applying it as the live
constraint inside a shift optimiser, driven by public forecast data, for informal
outdoor labour at national scale, is not something we could find in use anywhere.

The difference in output is categorical. A dashboard says "Zone 5, high risk." We say
"this worker crosses the safe limit after 36 minutes; here is a schedule where they
do not."

**② Replacing site sensors with observation-anchored downscaling.**

The standard answer to "the weather station is 4 km away" is to install a sensor.
We do it in software: gridded forecast at the site's own coordinates, plus a live
bias correction measured against the nearest real station, plus a land-cover
adjustment. It covers 786 districts on day one at zero marginal cost, and it
*forecasts* 72 hours ahead rather than measuring heat after it has arrived.

**③ Recovering a proprietary index's response surface from its own public feed.**

SHRAM publishes heat-index values and danger zones per station, but not the formula.
We needed the index evaluated at *site* conditions no station reports.

Rather than guess, we fit a response surface to the live feed itself — roughly 780
stations reporting simultaneously across 12–32 °C and 18–100% humidity, which makes
it interpolation rather than extrapolation. Against the feed's own published values
it achieves **RMSE 1.17, mean absolute error 0.79, and 89.9% exact agreement with
SHRAM's published zone labels**.

This is a small, genuinely clever piece of work, and it is reproducible in one
command. It is also the kind of thing a technical judge will appreciate precisely
because it is *not* flashy.

**④ Pricing safety in labour-hours instead of preaching it.**

The productivity ledger is the most commercially important idea in the project and
the least technically glamorous. Treating heat safety as a scheduling optimisation
rather than a cost is what converts this from a compliance burden into something a
contractor would actually pay for.

### 5.2 What we explicitly do not claim

- We did not create a heat index. SHRAM's EHI-N* is theirs; we cite it.
- We did not create ISO 7933. It is an international standard we implemented.
- We are not the first to map heat risk in Indian cities. CHAITRA does that well.
- Our urban-heat-island coefficients are **not** trained on ground truth — see §9.2.

### 5.3 The one-line novelty statement

> *"The heat data problem is solved. We built the decision layer on top of it — and
> the decision is made by simulating a human body, not by colouring a map."*

---

## 6. Every design decision, and why we made it

This section exists because in a pitch, the *reasoning* is more persuasive than the
result. Anyone can build a dashboard. Being able to explain why each choice was made,
including the ones that cost us something, is what separates a project from a demo.

### 6.1 Why no hardware — the most important decision in the project

The first version of this idea included a sensor box on each site: an ESP32, a
temperature/humidity sensor, a battery, about ₹1,510 per unit. It was removed
deliberately, and the reasoning is the strongest argument in the pitch.

| The sensor | The software replacement |
|---|---|
| ₹1,510 per site, and someone must mount and maintain it | ₹0 per site, works the moment coordinates are entered |
| Covers one site | Covers every site in 786 districts on day one |
| **Measures** heat after it has arrived | **Forecasts** it 72 hours ahead |
| Needs power and WiFi at a construction site | Needs a phone number |
| Can fail on stage | Cannot |

India has tens of millions of work sites. A solution requiring a box at each one is
not a national system — it is a pilot that will never leave the pilot. Removing the
hardware made the product bigger, not smaller.

> **The line:** *"We considered putting a sensor at every work site. India has tens of
> millions of them. So we solved it in software instead — and it deployed nationally
> the day we finished writing it."*

### 6.2 Why we target supervisors, not workers

Three reasons, in increasing order of force:

1. **Workers will not install an app.** Low-end devices, data cost, and no reason to
   trust it.
2. **It would be asking the wrong person.** Prayas's research is unambiguous that
   income wins over health in informal work. Telling a worker to stop is telling them
   to lose a meal.
3. **The law already names the supervisor.** Maharashtra's SOP places the duty on the
   employer. We automate compliance for the person who already carries it.

> **The line:** *"We do not ask workers to choose health over income. We remove the
> choice by making the safe schedule the more productive one."*

### 6.3 Why the AI is deliberately kept out of the decision

The competition mandates using an aligned language model, and most entries will bolt
a chatbot onto a dashboard. We inverted it: the model sits at the very end of the
pipeline and only converts an already-finished plan into spoken Marathi.

This is not modesty, it is a **safety property**. Every time, temperature and water
volume is computed by the engines. The model cannot alter one. You can demonstrate
this live: switch the briefing source from the model to the deterministic renderer
and the schedule on screen does not move.

> **The line:** *"Our AI cannot make the schedule unsafe, because it does not make
> the schedule."*

### 6.4 Why we cap the optimiser's working day

A subtle but important integrity decision. An optimiser free to schedule twelve hours
would always beat an eight-hour baseline, regardless of heat, and the productivity
claim would be meaningless.

So total scheduled time is capped at the contractor's target plus one hour. The
comparison is like-for-like: same time on site, better hours chosen. The gain comes
from *which* hours, not how many.

Raise this yourself before a judge finds it.

### 6.5 Why the baseline is a 09:00–17:00 day worked straight through

Because that is what happens now. Prayas found 46% of outdoor workers never rest in
shade during a shift. It would be a strawman if it were invented; it is not.

### 6.6 Why the map is hand-drawn SVG rather than a real map library

A tile map needs a live tile server. That is a dependency that can fail on
conference-hall WiFi during a five-minute demo. Projecting real coordinates ourselves
costs nothing, cannot fail, and looks deliberate rather than default.

The same reasoning runs through the whole build: the four engines contain **no
network calls**, a real 217-station SHRAM snapshot is bundled, and voice uses the
browser's speech synthesis rather than telephony. The demo works with the WiFi
unplugged.

### 6.7 Why the interface leads with a sentence, not a chart

The first build opened with the core-temperature chart — technically the most
impressive thing on the page, and completely opaque to anyone seeing it for the first
time.

A supervisor at 6 AM needs an answer, not evidence. So the page now opens with *"Can
the crew work today? — Yes, but only in two windows"* in large type, with the hours
beside it. The charts remain directly underneath as the justification.

Every technical term on screen carries a dotted underline and reveals a plain-English
definition on hover or tap, and a dedicated **How does this work?** page explains the
entire system in five steps with no equations.

### 6.8 Why we show our least confident number

The land-cover term in the downscaling model is parametric, not trained. We put that
on screen, in the product, in a panel titled *"What we are less sure about."*

This costs nothing and buys a great deal. A judge who finds an unstated weakness
distrusts everything else on the page; a judge who finds it already labelled trusts
the rest more.

---

## 7. The technical core in detail

For the technical judge, the professor, or the engineer in the room. Everything here
is in the repository and can be run.

### 7.1 Estimating conditions at the site

```
T_site(hour) =  T_forecast(site coordinates, hour)      ← gridded model
              + B(nearest station)                       ← live bias correction
              + ΔUHI(land cover)                         ← local ground effect

where  B = (what the station measures now) − (what the model says for the station now)
```

- **Term 1** is a gridded forecast evaluated at the site's actual coordinates, which
  is already finer than assigning it to the nearest station.
- **Term 2** is standard Model Output Statistics bias correction. If the forecast is
  running 2 °C cold where we have a real observation, it is probably running 2 °C
  cold a few kilometres away too. This keeps us tethered to SHRAM's ground truth.
- **Term 3** covers built-up fraction, canopy cover, sky view factor, surface albedo
  and distance to water, with coefficients from published Indian urban heat island
  studies.

Two details that show care rather than cleverness:

- **Humidity is re-derived, not carried over.** Warming an air parcel without adding
  moisture lowers its relative humidity. We hold vapour pressure fixed and recompute
  RH, which stops the model inventing humid heat that is not there.
- **The bias term is switched off for the historical scenario.** Correcting a recorded
  May day against a September observation would be comparing dates, not microclimates.
  The interface says so rather than showing a meaningless number.

### 7.2 Simulating the worker (ISO 7933)

A whole-body heat balance solved every minute:

```
S = M − W − Cres − Eres − R − C − E          (watts per square metre)
```

| Term | What it is |
|---|---|
| `M` | Heat generated by working — MET 3 (light) to MET 6 (very heavy) |
| `W` | Mechanical work done |
| `Cres`, `Eres` | Heat lost through breathing |
| `R` | Radiation — from sun and hot surfaces, via estimated mean radiant temperature |
| `C` | Convection — depends on air movement |
| `E` | Evaporative cooling from sweat, limited by how humid the air already is |

Whatever does not balance is stored in the body, and raises core temperature:

```
ΔTcore per minute = S × body surface area × 60 / (mass × 3492 J·kg⁻¹·K⁻¹)
```

Outputs: the core-temperature curve, time until the 38.5 °C limit, cumulative sweat
loss, and skin wettedness.

**Three honesty measures built into the model:**

1. **Sweat rate is capped** at a physiological maximum. Without it the model happily
   predicts litres per hour no human sweat gland can deliver.
2. **The curve stops at the limit.** ISO 7933 is only valid up to the exposure limit —
   past that the worker has collapsed and the maths is extrapolating. The chart draws
   that section dashed and labels it *"past the point the model can predict."*
3. **Rest is modelled, not assumed.** During enforced rest the metabolic rate drops
   and the worker is placed in shade, because that is what the safety guidance
   actually requires.

### 7.3 Recovering the heat index response surface

SHRAM gives us an index value and a zone per station, but not the formula — and we
need the index at site conditions no station reports.

So we fit a quadratic surface in temperature and humidity to the live feed itself,
per work intensity. Details that matter:

- Features are **standardised before fitting**. Fitting on raw °C and %RH spans ten
  orders of magnitude across the design matrix and the solve degenerates.
- We fit the **shade** variant, which genuinely is a function of temperature and
  humidity, and add the solar component back separately — scaled by each hour's
  forecast radiation. Fitting the sun variant directly makes the model report full
  solar load at 05:00, when the sun is not up.
- Zone boundaries are recovered from where SHRAM's own published labels change, so
  our site classifications sit on exactly their scale.

**Result: RMSE 1.17, mean absolute error 0.79, 89.9% exact zone agreement.**

### 7.4 Building the schedule

Exhaustive search at half-hour resolution over single and split shifts. Each
candidate is simulated through ISO 7933; any schedule breaching a physiological limit
is discarded outright. Among survivors, the objective is **effective labour**:

```
effective hours = Σ over scheduled hours ( work capacity at that hour's danger zone ) × crew size
```

Work capacity comes from the standard work/rest allocation — 100% in the safest
zones, 50% at Zone 4, 25% at Zone 5, zero at Zone 6. Legal compliance with the
Maharashtra work windows is weighted heavily, because a schedule an inspector rejects
is worth nothing.

The search space is a few thousand candidates, which runs in milliseconds — no solver
dependency, and it can run in the browser.

### 7.5 Engineering choices

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js + TypeScript | One deploy, one language, no service to keep alive mid-demo |
| Engines | Pure functions, zero I/O | Testable, deterministic, and they work offline |
| Charts | Hand-written SVG | Chart-library defaults are recognisable on sight; this is the view the pitch rests on |
| Map | Hand-projected SVG | No tile server to fail |
| Voice | Web Speech API | Real synthesis on stage with no telephony integration |
| AI | Nugen aligned model, at the very end | Mandated, and correctly scoped |

---

## 8. Proof: what we can actually demonstrate

Everything in this section is reproducible. Nothing here is a mockup.

### 8.1 Live, in front of the audience

| Claim | How it is proved on stage |
|---|---|
| The data is real and current | 786 stations, 17 in Pune, with a timestamp from minutes ago |
| The model runs live, not from a recording | Change the work intensity and the whole plan recomputes — schedule, curve, ledger |
| The physiology is real | The core-temperature curve, its breach time, and the dashed section where the model stops claiming validity |
| The AI cannot cause harm | Switch the briefing source; the wording changes, the schedule does not |
| It reaches a human | A Marathi briefing played aloud in the room |
| It works offline | Unplug the network; the plan still computes from the bundled snapshot |

### 8.2 Reproducible from the command line

```bash
npx tsx scripts/engine-check.ts    # all sites, both scenarios, fit diagnostics
npx tsx scripts/demo-numbers.ts    # the exact figures quoted in this document
```

### 8.3 Validation figures

| Measure | Result |
|---|---|
| Heat-index surface RMSE against SHRAM's published values | **1.17** index units |
| Mean absolute error | **0.79** |
| Exact agreement with SHRAM's published danger zones | **89.9%** |
| Stations in the fit | 217 bundled / ~780 live |
| Conditions spanned | 12–32 °C, 18–100% relative humidity |

### 8.4 The headline result, with its context

Magarpatta Site 7 — a real location — 42 workers, direct sun, on a recorded May
heatwave day. Figures from the bundled snapshot so they are reproducible:

| Work intensity | Normal day | KAVACH | Change | Safe limit crossed? |
|---|---|---|---|---|
| **MET 4** (moderate) | 32 labour-hours | **105** | **+233%** | normal day: 12:20 · KAVACH: never |
| **MET 6** (very heavy) | 53 labour-hours | **37** | **−30%** | normal day: **09:36, after 36 min** · KAVACH: never |

> **Say this out loud when presenting:** the live numbers differ from these, because
> the response surface is refit from the feed on every request. On the September feed
> the same MET 4 case reads 53 → 95. The *direction* is stable; the exact figure moves
> with the weather. Quote the snapshot for reproducibility and say that it moves —
> that is the defensible position.

---

## 9. What we got wrong, and what we still cannot do

Lead with this section in any technical conversation. It is disarming, it is true,
and it makes everything else more credible.

### 9.1 Bugs the build process caught

We tested the engines before writing any interface, which found four real defects
that would each have produced confident, plausible, wrong output:

| Defect | Consequence if shipped |
|---|---|
| Indexing error in the least-squares solver | Every heat-index value silently became `NaN`, classifying **every hour of every day as the most dangerous zone** |
| Uncapped sweat rate | Predicted over 11 litres of water loss in a shift — physiologically impossible |
| Unbounded core temperature | Curve ran to 43 °C, far past where the standard is valid |
| Optimiser free to extend the working day | Would have "won" the productivity comparison by rostering 12 hours against an 8-hour baseline |

The first one is the instructive one. It did not crash. It produced a plausible,
alarming, entirely fictional dashboard. That is the characteristic failure mode of
data products, and it is the argument for testing the maths before building the
interface.

### 9.2 Real, current limitations

| Limitation | Honest status |
|---|---|
| **Land-cover coefficients are not trained** | They come from published Indian UHI literature, not from measurements at these sites — because no such measurements exist. The code isolates this term so a trained model drops straight in. Stated on screen in the product |
| **Site land-cover profiles are hand-derived** | From OpenStreetMap land use for three pilot sites. Automating this for arbitrary coordinates is real work, not yet done |
| **Physiology uses a standard body** | 65 kg, acclimatised, light clothing, free water. Real crews vary by age, health, pregnancy and acclimatisation. The model accepts these as parameters; we do not yet collect them |
| **No telephony** | Voice is browser speech synthesis. SMS/IVR via a provider like Exotel is the production path, documented but not built |
| **Nugen integration untested against live credentials** | The adapter is written and degrades gracefully, but the exact endpoint must be verified against the provider's docs with a real key |
| **No field validation** | Nobody has yet run a real shift on a KAVACH schedule. Until that happens this is a well-grounded simulation, not a proven intervention |
| **Compliance tracking is a prototype** | Acknowledgement is recorded in the interface, not in a durable municipal record system |

### 9.3 The limitation that matters most

**We have not validated against real workers.** Every number here comes from
established standards applied to real forecast data, which is a reasonable basis —
but the honest description of this project is *a rigorously-built decision tool
awaiting field validation*, not *a proven life-saving system*.

Say that before you are asked. It is the difference between a team that understands
its own work and a team that is overselling.

---

## 10. Who this is for and how it reaches them

### 10.1 The users

| User | What they get | Why they say yes |
|---|---|---|
| **Construction contractor** | A schedule that usually delivers more usable labour than working through the heat | Output and legal cover, not altruism |
| **NREGA site supervisor** | Daily work window, crew cap, rest cadence tied to muster-roll scheduling | It is a government scheme with a duty of care and no current tool |
| **Municipal labour officer** | A record of which sites were briefed and which confirmed | Turns an unenforceable advisory into something auditable |
| **Gig platform** | Heat-adjusted dispatch windows | Rider retention and liability |

### 10.2 Going to market

- **B2G** — licence to municipal corporations and state labour departments.
  Compliance reporting against the existing SOP is a statutory need with a budget
  line attached.
- **B2B** — subscription for construction firms and gig platforms. The productivity
  ledger is the sales pitch; safety is the side effect.
- **Freemium** — forecasts and basic schedules free; multi-site management,
  compliance export and agent Q&A paid.

The regulatory pull already exists. We are selling compliance automation to people
who are already legally obliged to comply and currently have no way to do it.

### 10.3 Why this could actually be adopted

Most climate-adaptation tools fail at the last mile because they require someone to
accept a loss on behalf of a diffuse future benefit. This one does not. On most days
the safe schedule is the profitable schedule, and on the days it is not, the tool
says so and shows the alternative. That is a fundamentally different adoption curve.

---

## 11. Impact and scale

### 11.1 Scale, with no new infrastructure

- **786 districts** covered on day one, because SHRAM already covers them.
- **Zero marginal cost per site.** Adding a site means typing coordinates.
- **Any Indian language**, because the last hop is a language model.
- **Any city with digitised boundaries**, for the ward-level layer.
- Open-Meteo is global, so the architecture is not India-specific. Only the legal
  work-window rules are.

### 11.2 The impact arithmetic

Heat costs Indian outdoor workers around **24 working days a year**. Much of that
loss is unmanaged rather than unavoidable — hours worked in Zone 5 that return a
quarter of their labour, or days abandoned entirely when a split shift would have
worked.

We are deliberately not publishing a headline "lives saved" figure. We have no field
data, and inventing one would undermine everything else in this document. What we can
say precisely is what the model shows: on the days we tested, a schedule exists that
delivers more usable labour and keeps predicted core temperature inside the safe
limit, and nobody is currently finding it.

### 11.3 The alignment with SDG 13

This is climate **adaptation**, which is the underfunded half of climate action. It
does not reduce emissions. It protects the people least responsible for the problem
and most exposed to it, using data that already exists and infrastructure that is
already deployed.

---

## 12. How to pitch it: script, soundbites, demo

### 12.1 The five-minute demo, in order

The sequence matters: establish the data is real, make the physiology visceral, show
the money, show the honesty, then make it speak.

| Time | What you say | What they see |
|---|---|---|
| 0:00 | "This is the live SHRAM feed — 786 stations, 17 in Pune, pulled minutes ago." | Station map, live timestamp |
| 0:30 | "Rajesh runs a construction site in Magarpatta. 42 workers, direct sun." | Site console, the plain-language answer at the top |
| 1:00 | "No weather station sits on his site. So we estimate it — forecast, live accuracy check against the nearest station, then what the ground is made of." | Downscaling panel, including the term we admit is uncertain |
| 1:30 | **"Here is what an ordinary nine-to-five does to one of his workers."** | **The core-temperature curve crossing the limit at 12:20, then going dashed where the model stops being valid** |
| 2:10 | "Now the optimiser." | Curve redraws under the limit; work blocks snap into place |
| 2:30 | "And it is not a sacrifice — 32 labour-hours becomes 105." | The productivity ledger |
| 2:50 | **"But let me show you the case we lose."** *(switch MET 4 → MET 6)* | **Curve breaks the limit again. Ledger flips to −30%. The system says so plainly** |
| 3:10 | "Some days cannot safely deliver eight hours of very heavy labour. We say that instead of pretending. And we show the way out." *(switch back)* | Schedule becomes viable again, computed live |
| 3:30 | "Rajesh does not read English dashboards." | Marathi briefing appears |
| 3:45 | **Play it aloud.** | **Marathi voice fills the room** |
| 4:05 | "Now switch the writer from the AI to the raw calculation. Watch the schedule." | Wording changes, **schedule does not move** |
| 4:25 | "786 districts. No hardware. Today." | Scale |
| 4:40 | "India has the heat data. KAVACH makes the heat decision." | Close |

**The moment at 2:50 is the spine of the demo.** It is the software equivalent of a
live hardware demonstration: something changes, computed in front of the audience,
and it proves the system is real precisely *because* it shows the system losing.

### 12.2 Soundbites

Keep these short and use them verbatim.

> "SHRAM tells you the risk. KAVACH tells you what to do about it — and what it costs
> either way."

> "Every other team will show you a red map. We show you what today does to a person."

> "Our AI cannot make the schedule unsafe, because it does not make the schedule."

> "We considered a sensor on every work site. India has tens of millions. So we solved
> it in software, and it deployed nationally the day we finished writing it."

> "We do not ask workers to choose health over income. We remove the choice by making
> the safe schedule the more productive one."

> "Some days cannot safely deliver eight hours of very heavy labour. We would rather
> tell the contractor that than rig the comparison."

> "India finally has the heat data. KAVACH makes the heat decision."

### 12.3 The elevator versions

**Ten seconds.** *"It tells a site supervisor whether their crew can work outdoors
today, by simulating what the heat would do to a worker's body."*

**Thirty seconds.** *"India has excellent live heat data now — 786 stations. What it
does not have is anything that tells a specific supervisor what to do at 6 AM.
KAVACH estimates conditions at the actual work site, runs an ISO-standard
physiological simulation to predict when a worker's core temperature would cross the
danger line, builds the shift that gets the most work done without that happening,
and reads it out in Marathi. No hardware anywhere."*

**Two minutes.** Read §1.

---

## 13. Hard questions and honest answers

**"How is this different from SHRAM?"**
> SHRAM is our data source and we cite it on screen. They publish station-level risk.
> We estimate it at a specific site, simulate the worker's body through the day,
> build a shift around the safe limit, and deliver it as a Marathi voice briefing.
> Their published roadmap lists SMS alerts as planned. We built the decision layer.

**"CHAITRA already does heat planning for Indian cities."**
> It does, well, and for a completely different time horizon. CHAITRA tells a
> municipality what to build over three years. We tell a contractor what to do at 6 AM
> tomorrow. Complementary, not competing.

**"Why no hardware? Last year's winners had devices."**
> Because ₹1,500 per site is a pilot, not a national system. We replaced the sensor
> with a downscaling model covering 786 districts at zero marginal cost, and it
> forecasts 72 hours ahead where the sensor only measured what had already arrived.
> Removing it made the product bigger.

**"Is the AI doing anything, or is it a chatbot?"**
> It is deliberately excluded from every safety decision. The schedule, the
> temperatures and the water volumes are computed by engines we wrote. The model
> phrases them in Marathi. You can verify it live — switch it off and the schedule is
> identical. We consider that a safety property, not a limitation.

**"Is your ISO 7933 implementation real?"**
> Yes, and it is inspectable. Those are the heat-balance terms — metabolic rate,
> respiratory losses, radiation using estimated mean radiant temperature, convection,
> and evaporative cooling capped by how humid the air already is. Change the work
> intensity and the curve breaks the limit two hours earlier. It is a simulation, not
> a lookup table.

**"How do you know your site temperature is right?"**
> Partly we do not, and we are specific about which part. Term one is a gridded
> forecast at the site. Term two is a live bias correction against a real station —
> standard practice. Term three, the ground-cover effect, is parametric with
> coefficients from published Indian studies, because no site-level ground truth
> exists to train on. That is stated in the product, not buried. We would rather tell
> you that than show you an accuracy score we invented.

**"Your tool sometimes reduces output. Isn't that a failure?"**
> It is the opposite. At the heaviest work intensity, some days genuinely cannot
> deliver eight safe hours. A tool that only ever produced good news would be useless
> as a safety tool. We report the trade-off and show the recovery path — one step down
> in work intensity turns −30% into +233% on the same day.

**"Couldn't you inflate the productivity gain by scheduling longer days?"**
> You could, which is why we capped it. Total scheduled time is limited to the
> contractor's target plus one hour, so the comparison is like-for-like. The gain comes
> from which hours are chosen, not how many.

**"Has this been tested with real workers?"**
> No, and that is the honest limitation. Everything is built on established standards
> applied to real forecast data, but nobody has yet run a shift on a KAVACH schedule.
> This is a rigorously-built decision tool awaiting field validation. The next step is
> a pilot with one contractor and one municipal labour department.

**"Can this scale beyond Pune?"**
> It already does. SHRAM covers 786 stations nationally, Open-Meteo is global, and
> there is no hardware to ship. Pune is the pilot because the local research is strong
> and the sites are real. The architecture is national from day one.

**"What is your business model?"**
> B2G licensing to municipal and state labour departments, where SOP compliance
> reporting is a statutory need. B2B subscription for contractors and gig platforms,
> sold on the productivity ledger. Freemium for small operators.

---

## 14. Where this goes next

### 14.1 The immediate gaps to close

1. **Verify the competition timeline.** An earlier version of the planning document
   listed dates that have since passed. Re-check the official source before anything
   else.
2. **Test the aligned-model integration against real credentials.**
3. **Automate land-cover profiling** so a new site needs only coordinates, not manual
   OpenStreetMap work.

### 14.2 The research step that would change everything

Deploy reference sensors at twenty sites for one summer. Not as a product — as a
**training set**. That single dataset would convert the land-cover term from a
literature-based estimate into a trained model, and it is the only thing standing
between this and a defensible accuracy claim.

Note the irony, and use it: the hardware we deliberately removed from the product is
exactly the right tool for *validating* it. Removing it from the product was correct.
Using it to calibrate the model is the obvious next research step.

### 14.3 Beyond the first version

- **Personalised risk** — age, acclimatisation, pregnancy and known conditions as
  model parameters, where a crew consents to share them.
- **Incident feedback** — supervisors report heat incidents; the system learns which
  sites consistently run hotter than predicted, which is a ground-truth signal.
- **Ward-level aggregation** for municipal officers: which wards have the most sites
  in danger tomorrow.
- **Gig-platform dispatch API** — the same engines, applied to delivery zones.
- **Other geographies.** Nothing but the legal work-window rules is India-specific.

---

## Appendix — the numbers, for quick reference

| Figure | Value |
|---|---|
| Outdoor workers in India | ~380 million |
| Annual wage loss to heat | ~$78 billion (≈2% of GDP) |
| Excess deaths per extreme heat day | ~3,400 |
| SHRAM stations nationally / in Pune | 786 / 17 |
| Heat-index surface accuracy | RMSE 1.17 · MAE 0.79 · **89.9% zone agreement** |
| Core temperature safety limit | 38.5 °C |
| Time to limit, very heavy labour, heatwave day | **36 minutes** |
| Best case demonstrated (MET 4, heatwave) | 32 → **105** labour-hours (**+233%**) |
| Honest worst case (MET 6, heatwave) | 53 → **37** labour-hours (−30%, zero breaches) |
| Hardware required | **None** |
| Marginal cost per additional site | **₹0** |

---

## Sources

**Heat, health and labour**
1. IECC, UC Berkeley — *EHI-N\*: A Modified Extended Heat Index for Laboring Populations*
2. IECC — *Manual Work Under Extreme Heat*
3. SHRAM dashboard and public feed — https://shram.info/
4. CHAITRA — City Heat Action Intelligence and Risk Atlas, IECC Berkeley
5. Frontiers in Environmental Health (2026) — heatwave-induced excess mortality in India's districts
6. IIED (2026) — *Extreme heat costing Indian workers billions in lost wages*
7. The Guardian (2026) — extreme heat and India's outdoor workers

**Standards**
8. ISO 7933 — analytical determination and interpretation of heat stress using predicted heat strain
9. ISO 7243 — assessment of heat stress using the WBGT index
10. ISO 8996 — determination of metabolic rate

**Pune**
11. Prayas (2026) — *Braving the Heat: Learning from the Voices of Street Vendors*
12. Prayas Health (2026) — Street Vendor Heat Vulnerability Report
13. PMC heatwave advisory coverage, Indian Express (2026)
14. PMC ward boundaries — https://data.opencity.in/dataset/pune-wards-info

**Platform**
15. Open-Meteo forecast and archive API — https://open-meteo.com/
16. Nugen Intelligence — https://docs.nugen.in

---

*Heat readings come from SHRAM (India Energy & Climate Centre, UC Berkeley) and
forecasts from Open-Meteo. The physiological simulation follows ISO 7933. The
site-level estimation, scheduling, productivity model and interface are ours.*
