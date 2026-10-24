'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  value: string
  options: { value: string; label: string }[]
}

export default function SortSelect({ value, options }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (e.target.value === 'newest') params.delete('sort')
    else params.set('sort', e.target.value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-500">
      Sort
      <select id="inventory-sort" className="input w-auto py-2 pr-8" value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
