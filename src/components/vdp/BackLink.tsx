'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// "Back to inventory": returns to the visitor's filtered results when they came from our site,
// otherwise links to /inventory
export default function BackLink() {
  const router = useRouter()
  return (
    <Link
      href="/inventory"
      onClick={(e) => {
        let sameOrigin = false
        try {
          sameOrigin = !!document.referrer && new URL(document.referrer).origin === window.location.origin
        } catch {}
        if (sameOrigin && window.history.length > 1 && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          router.back()
        }
      }}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ivory/90 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to inventory
    </Link>
  )
}
