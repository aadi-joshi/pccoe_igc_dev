/**
 * Plain-English glossary.
 *
 * This product sits on top of three ISO standards and a research heat index,
 * which means almost every label on screen is jargon to a first-time reader.
 * Every one of those terms gets an entry here, and the rule for writing them
 * is simple: if a first-year student would not understand the definition, it
 * is not finished.
 *
 * Definitions deliberately avoid defining jargon with more jargon.
 */

export interface GlossaryEntry {
  /** Short plain-language definition. One or two sentences, no equations. */
  body: string;
  /** Optional concrete example that makes it click. */
  example?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  met: {
    body: "How physically hard the work is. MET 3 is light work like sorting or selling; MET 6 is very heavy labour like digging or carrying loads all day.",
    example: "Harder work produces more body heat, so the same weather is far more dangerous at MET 6 than at MET 3.",
  },
  zone: {
    body: "A 1-to-6 danger rating for working outdoors, published by SHRAM. Zone 1 is safe, Zone 6 means the body cannot cope and work has to stop.",
    example: "Zone 5 means a worker can only safely work about 15 minutes in every hour.",
  },
  ehi: {
    body: "A heat score built for people doing physical work. Unlike an ordinary weather app, it accounts for humidity, sun, and how hard the job is.",
    example: "30 °C in humid, still air can be more dangerous than 38 °C in dry, breezy air — the score captures that; a thermometer does not.",
  },
  coreTemp: {
    body: "The temperature deep inside the body, not on the skin. It normally sits near 37 °C and barely moves.",
    example: "Once it passes 38.5 °C the risk of heat exhaustion and heat stroke rises sharply, which is why that line is the limit on the chart.",
  },
  iso7933: {
    body: "The international standard for working out how much heat strain a job puts on a person. We run it minute by minute across the whole shift.",
    example: "It is what turns 'it is hot outside' into 'this worker crosses the safe limit at 12:20'.",
  },
  effectiveHours: {
    body: "Hours of actual work you get, not hours people stand on site. In dangerous heat most of each hour has to be spent resting, so those hours produce very little.",
    example: "8 hours on site in Zone 5 gives only about 2 hours of real work per person — which is why a shorter, cooler shift often produces more.",
  },
  downscaling: {
    body: "Estimating conditions at one specific work site, rather than at the nearest weather station kilometres away.",
    example: "A concrete site with no trees runs several degrees hotter than the station reading suggests — that gap is exactly who gets hurt.",
  },
  biasCorrection: {
    body: "A live accuracy check. We compare the forecast against what the nearest real weather station is actually measuring right now, and carry that correction across to the site.",
    example: "If the forecast is running 2 °C cold at the station, it is probably running 2 °C cold at the site too.",
  },
  uhi: {
    body: "The urban heat island: concrete, asphalt and buildings absorb heat and release it slowly, so built-up places run hotter than open ground nearby.",
    example: "Tree cover and water push the other way and cool a site down.",
  },
  skyView: {
    body: "How much open sky is visible from the site. 1.0 is a wide-open field; a narrow street between tall buildings is closer to 0.2.",
    example: "Open sky means more direct sun during the day; a narrow street traps heat instead of letting it escape.",
  },
  sop: {
    body: "Maharashtra's official rule for outdoor work during heat alerts: work 06:00–11:00 and 16:00–20:00, and avoid the hours in between.",
    example: "A schedule outside those windows can be rejected by a labour inspector, so KAVACH prefers plans that stay inside them.",
  },
  cadence: {
    body: "How much of each hour is work and how much must be rest, to stop body heat building up.",
    example: "In Zone 5 that is 15 minutes of work and 45 minutes of rest — every hour.",
  },
  sweatLoss: {
    body: "How much water a worker sweats out over the shift, and therefore how much drinking water has to be on site for each person.",
    example: "Sweat is how the body cools itself. Without replacing it, the body overheats faster.",
  },
  standDown: {
    body: "A block of time when outdoor work stops completely and workers stay in shade with drinking water.",
    example: "It is not a lunch break — it is the part of the day the heat makes unworkable.",
  },
  shram: {
    body: "A free public service from UC Berkeley's India Energy & Climate Centre that publishes live heat-danger readings for about 780 Indian weather stations.",
    example: "KAVACH reads SHRAM for real measurements and builds the decision layer on top of it.",
  },
  unmanaged: {
    body: "What a normal working day looks like today: a straight 09:00–17:00 shift worked through the heat, with no enforced rest.",
    example: "It is the comparison point, not a strawman — research in Pune found most outdoor workers never rest in shade during a shift.",
  },
  nugen: {
    body: "The AI model that turns the finished plan into spoken Marathi or Hindi a supervisor can act on.",
    example: "It only rewrites the words. Every time and number is calculated before it is involved, so it cannot make a shift unsafe.",
  },
  meanRadiant: {
    body: "How much heat a worker absorbs by radiation — from the sun above and from hot surfaces around them.",
    example: "It is why standing on dark asphalt in direct sun feels far hotter than the air temperature alone.",
  },
};

export type GlossaryKey = keyof typeof GLOSSARY;
