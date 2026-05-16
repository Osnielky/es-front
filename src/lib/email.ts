import { Resend } from 'resend'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eandscars.com'
const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? ''

const TYPE_LABEL: Record<string, string> = {
  GENERAL: 'General Inquiry',
  VEHICLE: 'Vehicle Inquiry',
  FINANCING: 'Financing Request',
  TRADE_IN: 'Trade-In Request',
  WHATSAPP: 'WhatsApp Click',
}

interface LeadData {
  name: string
  email: string
  phone?: string | null
  message?: string | null
  type: string
  vehicleId?: string | null
}

export async function sendLeadNotification(lead: LeadData): Promise<void> {
  if (!process.env.RESEND_API_KEY || !NOTIFY_TO) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const isWhatsApp = lead.type === 'WHATSAPP'
  const subject = isWhatsApp
    ? `📱 WhatsApp click — ${lead.message ?? 'vehicle inquiry'}`
    : `🔔 New lead: ${lead.name} — ${TYPE_LABEL[lead.type] ?? lead.type}`

  const rows = (
    [
      ['Type', TYPE_LABEL[lead.type] ?? lead.type],
      !isWhatsApp && ['Name', lead.name],
      !isWhatsApp && ['Email', lead.email],
      lead.phone && ['Phone', lead.phone],
      lead.message && ['Message', lead.message],
      lead.vehicleId && ['Vehicle ID', lead.vehicleId],
      ['Time', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })],
    ] as (string[] | false)[]
  )
    .filter((r): r is string[] => Boolean(r))
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#6b7280;white-space:nowrap">${label}</td><td style="padding:6px 12px;font-weight:600;color:#111827">${value}</td></tr>`)
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px">
      <div style="background:#1f3ee8;border-radius:8px;padding:20px 24px;margin-bottom:24px">
        <h1 style="color:#fff;margin:0;font-size:18px">${DEALER_NAME}</h1>
        <p style="color:#c2d4ff;margin:4px 0 0;font-size:13px">New lead notification</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        ${rows}
      </table>
      <div style="margin-top:20px;text-align:center">
        <a href="${SITE_URL}/admin" style="display:inline-block;background:#1f3ee8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Dashboard →
        </a>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">${DEALER_NAME} · Naples, FL</p>
    </div>
  `

  await resend.emails.send({
    from: `${DEALER_NAME} <leads@eandscars.com>`,
    to: NOTIFY_TO,
    subject,
    html,
  }).catch((e) => console.error('Email notification failed:', e))
}
