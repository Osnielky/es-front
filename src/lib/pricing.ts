/**
 * Payment estimate shown on cards and the vehicle page.
 * These are display assumptions, not a lender offer; keep them in one place
 * so the "est. with $X down" copy always matches the math.
 */
export const PAYMENT_ASSUMPTIONS = {
  downPayment: 2000,
  termMonths: 72,
  apr: 0.089,
} as const

export function estimateMonthlyPayment(
  price: number,
  { downPayment, termMonths, apr } = PAYMENT_ASSUMPTIONS
): number {
  const principal = Math.max(price - downPayment, 0)
  if (principal === 0) return 0
  const r = apr / 12
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -termMonths)))
}

export function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function formatMiles(n: number): string {
  return `${n.toLocaleString('en-US')} mi`
}

export function shortMiles(n: number): string {
  return n < 1000 ? `${n} mi` : `${Math.round(n / 1000)}k mi`
}
