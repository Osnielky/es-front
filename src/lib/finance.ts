// Assumptions behind every "Est. $X/mo" shown on the site. Keep FINANCE_DISCLAIMER in sync.
export const FINANCE_ASSUMPTIONS = {
  aprPercent: 9.99,
  termMonths: 72,
  downPaymentPercent: 10,
}

export const FINANCE_DISCLAIMER = `Estimated payment based on ${FINANCE_ASSUMPTIONS.aprPercent}% APR for ${FINANCE_ASSUMPTIONS.termMonths} months with ${FINANCE_ASSUMPTIONS.downPaymentPercent}% down. Excludes tax, title, registration, and dealer fees. Actual rate and terms depend on credit approval.`

export function estimateMonthlyPayment(price: number) {
  const { aprPercent, termMonths, downPaymentPercent } = FINANCE_ASSUMPTIONS
  const principal = price * (1 - downPaymentPercent / 100)
  const r = aprPercent / 100 / 12
  if (principal <= 0) return 0
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -termMonths)))
}
