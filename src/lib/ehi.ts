import type { MetLevel, Station, SunExposure, Zone } from "./types";
import { zoneKey } from "./zones";

/**
 * EHI response surface.
 *
 * SHRAM publishes EHI-N* and its zone for each station, but not the closed
 * form of the index. We need EHI at *site* conditions — temperatures and
 * humidities that no station is reporting, because we have downscaled them.
 *
 * Rather than guess at the formula, we fit a quadratic response surface to
 * the live feed itself. With ~780 stations reporting simultaneously across
 * the whole country, the feed spans a wide temperature/humidity range, which
 * makes this a well-conditioned fit rather than an extrapolation.
 *
 * Zone thresholds are recovered the same way: from where the published
 * zone labels actually change along the fitted EHI axis. That keeps site
 * classifications on exactly the same scale SHRAM uses for stations.
 */

export interface EhiSurface {
  /** [1, t, r, t², t·r, r²] coefficients, in standardised feature space. */
  coeffs: number[];
  /** Feature standardisation, recorded so eval matches the fit. */
  norm: { tMean: number; tStd: number; rMean: number; rStd: number };
  /** Five boundaries separating zones 1..6. */
  thresholds: number[];
  samples: number;
  rmse: number;
}

/**
 * Design row in *standardised* feature space.
 *
 * Fitting on raw °C and %RH makes the normal equations badly conditioned —
 * the RH² column runs to 10⁴ while the intercept is 1, so XᵀX spans ten
 * orders of magnitude and the solve degenerates. Centring and scaling both
 * inputs first keeps every column O(1) and the fit stable.
 */
function designRow(
  tempC: number,
  rhPct: number,
  norm: EhiSurface["norm"],
): number[] {
  const t = (tempC - norm.tMean) / norm.tStd;
  const r = (rhPct - norm.rMean) / norm.rStd;
  return [1, t, r, t * t, t * r, r * r];
}

function standardisation(
  temps: number[],
  rhs: number[],
): EhiSurface["norm"] {
  const mean = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / xs.length;
  const std = (xs: number[], m: number) =>
    Math.max(1e-6, Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length));
  const tMean = mean(temps);
  const rMean = mean(rhs);
  return {
    tMean,
    tStd: std(temps, tMean),
    rMean,
    rStd: std(rhs, rMean),
  };
}

/** Solve A·x = b for small dense systems by Gaussian elimination with partial pivoting. */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  // After Gauss-Jordan the matrix is diagonal, so each unknown is the
  // augmented column divided by that row's own pivot.
  return M.map((row, i) => row[n] / M[i][i]);
}

/** Ordinary least squares via normal equations, with light ridge regularisation. */
function leastSquares(X: number[][], y: number[]): number[] | null {
  const p = X[0].length;
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);

  for (let i = 0; i < X.length; i++) {
    for (let a = 0; a < p; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < p; b++) XtX[a][b] += X[i][a] * X[i][b];
    }
  }
  // Ridge term keeps the normal equations conditioned when the live feed
  // happens to be clustered (e.g. every station reporting similar humidity).
  for (let a = 0; a < p; a++) XtX[a][a] += 1e-6;

  return solve(XtX, Xty);
}

export function fitEhiSurface(
  stations: Station[],
  met: MetLevel,
  exposure: SunExposure,
): EhiSurface | null {
  const key = zoneKey(met, exposure);
  const temps: number[] = [];
  const rhs: number[] = [];
  const y: number[] = [];
  const pairs: { ehi: number; zone: Zone }[] = [];

  for (const s of stations) {
    const ehi = s.ehi[key];
    const zone = s.zones[key];
    if (!Number.isFinite(ehi) || !Number.isFinite(s.tempC) || !Number.isFinite(s.rhPct)) {
      continue;
    }
    temps.push(s.tempC);
    rhs.push(s.rhPct);
    y.push(ehi);
    if (zone) pairs.push({ ehi, zone });
  }

  if (y.length < 30) return null;

  const norm = standardisation(temps, rhs);
  const X = temps.map((t, i) => designRow(t, rhs[i], norm));

  const coeffs = leastSquares(X, y);
  if (!coeffs || coeffs.some((c) => !Number.isFinite(c))) return null;

  let sse = 0;
  for (let i = 0; i < X.length; i++) {
    const pred = X[i].reduce((acc, v, j) => acc + v * coeffs[j], 0);
    sse += (pred - y[i]) ** 2;
  }
  const rmse = Math.sqrt(sse / X.length);

  return {
    coeffs,
    norm,
    thresholds: deriveThresholds(pairs),
    samples: y.length,
    rmse,
  };
}

/**
 * Recover zone boundaries from the published (EHI, zone) pairs by taking the
 * midpoint between the top of one zone and the bottom of the next.
 */
function deriveThresholds(pairs: { ehi: number; zone: Zone }[]): number[] {
  const ranges = new Map<Zone, { min: number; max: number }>();
  for (const { ehi, zone } of pairs) {
    const r = ranges.get(zone);
    if (!r) ranges.set(zone, { min: ehi, max: ehi });
    else {
      r.min = Math.min(r.min, ehi);
      r.max = Math.max(r.max, ehi);
    }
  }

  const fallback = [30, 36, 42, 48, 66];
  const out: number[] = [];

  for (let z = 1 as Zone; z <= 5; z = (z + 1) as Zone) {
    const lower = ranges.get(z);
    const upper = ranges.get((z + 1) as Zone);
    if (lower && upper) {
      out.push((lower.max + upper.min) / 2);
    } else if (upper) {
      out.push(upper.min);
    } else if (lower) {
      out.push(lower.max);
    } else {
      out.push(fallback[z - 1]);
    }
  }

  // Guarantee monotonicity — a non-monotonic banding would misclassify.
  for (let i = 1; i < out.length; i++) {
    if (out[i] <= out[i - 1]) out[i] = out[i - 1] + 0.5;
  }
  return out;
}

/**
 * Full-sun EHI increment for a given work intensity.
 *
 * SHRAM publishes a sun and a shade EHI per station. The difference between
 * them is the solar load, which depends on radiation — a variable the station
 * records do not carry, so a regression on temperature and humidity alone
 * cannot reproduce it. Worse, fitting directly on the sun variant makes the
 * model report full solar load at 05:00, when the sun is not up.
 *
 * So we fit the *shade* surface (genuinely a function of temperature and
 * humidity) and add this increment back, scaled by the actual direct
 * radiation forecast for the hour. The increment is the median observed
 * sun-minus-shade gap across the live feed, which makes it measured rather
 * than assumed.
 */
export function solarIncrement(
  stations: Station[],
  met: MetLevel,
): number {
  const sunKey = zoneKey(met, "sun");
  const shadeKey = zoneKey(met, "shade");
  const gaps: number[] = [];

  for (const s of stations) {
    const sun = s.ehi[sunKey];
    const shade = s.ehi[shadeKey];
    if (Number.isFinite(sun) && Number.isFinite(shade) && sun > shade) {
      gaps.push(sun - shade);
    }
  }
  if (gaps.length === 0) return 0;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

/** Reference direct radiation treated as "full sun", W/m². */
export const FULL_SUN_WM2 = 800;

/**
 * Site EHI for a given hour, combining the fitted shade surface with a
 * radiation-scaled solar increment.
 */
export function evalEhiWithSun(
  shadeSurface: EhiSurface,
  tempC: number,
  rhPct: number,
  solarWm2: number,
  exposure: SunExposure,
  increment: number,
): number {
  const base = evalEhi(shadeSurface, tempC, rhPct);
  const solarFraction = Math.min(1.15, Math.max(0, solarWm2 / FULL_SUN_WM2));
  // Shade still receives diffuse and reflected radiation, just far less of it.
  const exposureFactor = exposure === "sun" ? 1 : 0.2;
  return base + increment * solarFraction * exposureFactor;
}

export function evalEhi(surface: EhiSurface, tempC: number, rhPct: number): number {
  const row = designRow(tempC, Math.min(100, Math.max(0, rhPct)), surface.norm);
  const value = row.reduce((acc, v, i) => acc + v * surface.coeffs[i], 0);
  return Number.isFinite(value) ? value : NaN;
}

export function zoneFor(surface: EhiSurface, ehi: number): Zone {
  // A non-finite EHI must not silently classify as the most dangerous zone —
  // that would turn a numerical failure into a plausible-looking alert.
  if (!Number.isFinite(ehi)) return 1;
  for (let i = 0; i < surface.thresholds.length; i++) {
    if (ehi < surface.thresholds[i]) return (i + 1) as Zone;
  }
  return 6;
}
