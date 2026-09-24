// Display helpers for vehicle cards (swatches, short spec labels)

// Max vehicles in a comparison (shared by the client compare store and the server compare page)
export const MAX_COMPARE = 3

const COLOR_SWATCHES: Array<[RegExp, string]> = [
  [/white|pearl|ivory|frost/i, '#F7F7F4'],
  [/black|ebony|onyx|obsidian|jet/i, '#1F2024'],
  [/silver|platinum|chrome/i, '#C3C7CC'],
  [/gr[ae]y|graphite|gunmetal|charcoal|slate|steel/i, '#7A7F87'],
  [/red|crimson|ruby|maroon|burgundy/i, '#A5242A'],
  [/blue|navy|azure|cobalt|sapphire/i, '#23466E'],
  [/green|emerald|olive/i, '#3F6B4A'],
  [/beige|tan|sand|champagne|cream/i, '#D8C7A6'],
  [/brown|mocha|bronze|espresso|saddle/i, '#6B4A33'],
  [/gold|yellow/i, '#C9A33B'],
  [/orange|copper/i, '#C8672B'],
]

// Best-effort swatch for a manufacturer color name ("Midnight Black" → near-black); undefined when unknown
export function colorSwatch(name?: string | null) {
  if (!name) return undefined
  return COLOR_SWATCHES.find(([pattern]) => pattern.test(name))?.[1]
}

// "2.5L 4-Cylinder" → "4 cylinders", "3.5L V6" → "V6 engine"; falls back to the raw engine text
export function engineLabel(engine?: string | null) {
  if (!engine) return undefined
  const cylinders = engine.match(/(\d{1,2})[\s-]*cyl/i)
  if (cylinders) return `${cylinders[1]} cylinders`
  const vee = engine.match(/\b([VWI])-?(\d{1,2})\b/i)
  if (vee) return `${vee[1].toUpperCase()}${vee[2]} engine`
  return engine
}

// Cylinder count from the recorded engine text: "2.5L 4-Cylinder" → "4 cylinders", "3.5L V6" → "6 cylinders".
// Undefined when the engine text doesn't state it (never guessed).
export function cylinderLabel(engine?: string | null) {
  if (!engine) return undefined
  const count = engine.match(/(\d{1,2})[\s-]*cyl/i)?.[1] ?? engine.match(/\b[VWIH]-?(\d{1,2})\b/i)?.[1]
  return count ? `${Number(count)} cylinders` : undefined
}

export function vehicleName(vehicle: { year: number; make: string; model: string; trim?: string | null }) {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')
}
