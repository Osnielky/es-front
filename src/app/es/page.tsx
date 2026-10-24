import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, MapPin, Clock, Phone, ShieldCheck, CreditCard, Repeat, MessageCircle } from 'lucide-react'
import { getVehicles } from '@/lib/data'
import { BUSINESS_HOURS, DEALER_ADDRESS, LOCATION, buildBreadcrumbJsonLd, serializeJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF, whatsappHref } from '@/lib/contact'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import VehicleCard from '@/components/inventory/VehicleCard'
import type { Vehicle } from '@/types'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-dynamic'

// Spanish landing page for the large Spanish-speaking market in Naples / Collier County.
// The rest of the site stays in English; this page captures Spanish searches and hands off to WhatsApp.
export const metadata: Metadata = {
  title: `Carros usados en Naples, FL | ${DEALER_NAME}`,
  description: `${DEALER_NAME}: carros usados en Naples, Florida. Vehículos inspeccionados, precios honestos, financiamiento para todo tipo de crédito y atención en español por WhatsApp. Servimos Naples, Marco Island, Bonita Springs, Fort Myers y todo el suroeste de Florida.`,
  keywords: [
    'carros usados Naples FL',
    'autos usados Naples Florida',
    'dealer de carros Naples',
    'venta de carros Naples',
    'financiamiento de autos Naples',
    'carros usados Fort Myers',
    'carros usados Bonita Springs',
    'hablamos español dealer Naples',
  ].join(', '),
  alternates: {
    canonical: `${SITE_URL}/es`,
    languages: { en: SITE_URL, es: `${SITE_URL}/es` },
  },
  openGraph: {
    title: `Carros usados en Naples, FL | ${DEALER_NAME}`,
    description: 'Vehículos inspeccionados, precios honestos y atención en español por WhatsApp.',
    url: `${SITE_URL}/es`,
    locale: 'es_US',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${DEALER_NAME} - carros usados en Naples, FL` }],
  },
}

const PUNTOS = [
  { icon: ShieldCheck, title: 'Inspeccionados y con título limpio', desc: 'Revisamos cada carro y su historial de título antes de ponerlo a la venta.' },
  { icon: CreditCard, title: 'Financiamiento para todo crédito', desc: 'Buen crédito, mal crédito o sin crédito. Trabajamos con varios bancos y te decimos el pago real desde el principio.' },
  { icon: Repeat, title: 'Compramos tu carro', desc: 'Trae tu carro y recibe una oferta el mismo día. El valor se descuenta directo del precio.' },
  { icon: MessageCircle, title: 'Escríbenos por WhatsApp', desc: 'Pregunta por un carro, manda fotos del tuyo o agenda una prueba de manejo. Respondemos rápido, en español.' },
]

export default async function SpanishLandingPage() {
  let vehicles: Vehicle[] = []
  let total = 0
  try {
    const result = await getVehicles({ limit: 6 })
    vehicles = result.vehicles
    total = result.total
  } catch (error) {
    console.error('ES page: failed to load inventory', error)
  }

  const waHref = whatsappHref('¡Hola! Me interesa uno de sus carros. ¿Me pueden ayudar en español?')
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER_ADDRESS)}`
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', url: '/' },
    { name: 'Español', url: '/es' },
  ])

  return (
    <div lang="es">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <section className="hero-band">
        <div className="mx-auto max-w-site px-4 py-10 lg:py-14">
          <p className="eyebrow">Hablamos español · {LOCATION.city}, Florida</p>
          <h1 className="mt-4 max-w-[18ch] font-display text-[40px] font-extrabold leading-[1.02] text-brand-600 sm:text-6xl">
            Carros usados en {LOCATION.city}, <span className="highlight">con precios honestos.</span>
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg text-slate-500">
            Somos un lote familiar en {LOCATION.streetAddress}. Cada carro se inspecciona antes de publicarse, el precio que ves es el precio,
            y puedes escribirnos por WhatsApp en español sobre cualquiera.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-wa min-h-[54px] px-6 text-lg">
              <WhatsAppIcon className="h-5 w-5" />Escríbenos por WhatsApp
            </a>
            <Link href="/inventory" className="btn-primary min-h-[54px] px-6 text-lg">Ver los carros</Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {['Inspeccionados antes de publicar', 'Financiamiento para todo crédito', 'Aceptamos tu carro como parte de pago'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-accent-500" strokeWidth={2.5} aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="lote-heading" className="mx-auto max-w-site px-4 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Inventario</p>
            <h2 id="lote-heading" className="section-title mt-2">En el lote <span className="highlight">ahora mismo</span></h2>
            <p className="section-sub">{total > 0 ? `${total} ${total === 1 ? 'vehículo disponible' : 'vehículos disponibles'} en ${LOCATION.city}.` : `Nuestro lote de ${LOCATION.city}, en línea.`}</p>
          </div>
          <Link href="/inventory" className="btn-secondary btn-sm">Ver todos los carros</Link>
        </div>
        {vehicles.length > 0 ? (
          <div className="vehicle-grid">
            {vehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} priority={i < 3} headingLevel="h3" />)}
          </div>
        ) : (
          <div className="card px-6 py-12 text-center">
            <p className="font-display text-2xl font-bold text-brand-600">Nuevos carros cada semana</p>
            <p className="mt-1 text-sm text-slate-500">Escríbenos por WhatsApp y te contamos qué está por llegar.</p>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">Las fichas de cada carro están en inglés. Si prefieres, escríbenos y te explicamos todo en español.</p>
      </section>

      <section className="mx-auto max-w-site px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PUNTOS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <span className="icon-tile"><Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" /></span>
              <p className="mt-4 font-display text-xl font-bold leading-tight text-brand-600">{title}</p>
              <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="visita-heading" className="mx-auto max-w-site px-4 py-12">
        <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Visítanos</p>
            <h2 id="visita-heading" className="mt-3 font-display text-[36px] font-extrabold leading-[1.02] text-brand-600 sm:text-[44px]">
              Ven a ver los carros <span className="highlight">en persona</span>
            </h2>
            <p className="mt-3 max-w-[52ch] text-slate-500">
              Sin cita. Atendemos a compradores de todo el condado de Collier: {LOCATION.nearbyAreas.slice(0, -1).join(', ')} e {LOCATION.nearbyAreas.at(-1)}.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex gap-3">
                <span className="icon-tile"><MapPin className="h-6 w-6" aria-hidden="true" /></span>
                <div><dt className="text-sm text-slate-500">Dirección</dt><dd className="font-display text-[17px] font-bold text-ink">{LOCATION.streetAddress}<br /><span className="text-sm font-normal text-slate-600">{LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}</span></dd></div>
              </div>
              <div className="flex gap-3">
                <span className="icon-tile"><Clock className="h-6 w-6" aria-hidden="true" /></span>
                <div><dt className="text-sm text-slate-500">Horario</dt><dd className="tabular-nums">{BUSINESS_HOURS.map((h, i) => <span key={h.label} className={i === 0 ? 'block font-display text-[17px] font-bold text-ink' : 'block text-sm text-slate-600'}>{h.label === 'Sun' ? 'Dom' : 'Lun – Sáb'}: {h.display}</span>)}</dd></div>
              </div>
              <div className="flex gap-3">
                <span className="icon-tile"><Phone className="h-6 w-6" aria-hidden="true" /></span>
                <div><dt className="text-sm text-slate-500">Teléfono</dt><dd><a href={TEL_HREF} className="font-display text-[17px] font-bold text-ink tabular-nums hover:text-brand-600">{DEALER_PHONE}</a><br /><span className="text-sm text-slate-600">Llama o manda texto</span></dd></div>
              </div>
            </dl>
          </div>
          <div className="grid gap-3">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[54px] px-6 text-lg"><MapPin className="h-5 w-5" aria-hidden="true" />Cómo llegar</a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-wa min-h-[54px] px-6 text-lg"><WhatsAppIcon className="h-5 w-5" />WhatsApp</a>
          </div>
        </div>
      </section>
    </div>
  )
}
