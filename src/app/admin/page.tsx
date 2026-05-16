'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LogOut, Plus, Car, CheckCircle2, AlertCircle, Clock,
  DollarSign, TrendingUp, Users, Edit2, Trash2, Search,
  Filter, ChevronDown, MessageCircle, Phone, Mail, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Statistics {
  totalVehicles: number
  availableVehicles: number
  soldVehicles: number
  pendingVehicles: number
  totalLeads: number
  leadsThisMonth: number
  leadsThisWeek: number
  leadGrowth: number
  whatsappTotal: number
  whatsappThisMonth: number
  avgPrice: number
  vehiclesThisMonth: number
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  type: string
  vehicleId: string | null
  createdAt: string
}

interface Vehicle {
  id: string
  slug: string
  vin: string | null
  make: string
  model: string
  year: number
  price: number
  status: 'AVAILABLE' | 'PENDING' | 'SOLD'
  condition: string
  images: string[]
  createdAt: string
}

interface DashboardData {
  statistics: Statistics
  leadsByType: Record<string, number>
  recentLeads: Lead[]
  allVehicles: Vehicle[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEAD_TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  GENERAL:   { label: 'General',   color: 'bg-gray-100 text-gray-700',    icon: Mail },
  VEHICLE:   { label: 'Vehicle',   color: 'bg-brand-100 text-brand-700',  icon: Car },
  FINANCING: { label: 'Financing', color: 'bg-amber-100 text-amber-700',  icon: DollarSign },
  TRADE_IN:  { label: 'Trade-In',  color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
  WHATSAPP:  { label: 'WhatsApp',  color: 'bg-green-100 text-green-700',  icon: MessageCircle },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'vehicles' | 'leads'>('vehicles')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin/login'); return }
        const body = await res.text().catch(() => '')
        setError(`Stats API error ${res.status}: ${body.slice(0, 200)}`)
        return
      }
      setData(await res.json())
    } catch (e) {
      setError(`Network error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (vehicleId: string, newStatus: 'AVAILABLE' | 'PENDING' | 'SOLD') => {
    setUpdatingId(vehicleId)
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      })
      if (!res.ok) { setError('Failed to update status'); return }
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          allVehicles: prev.allVehicles.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v),
          statistics: {
            ...prev.statistics,
            availableVehicles: prev.allVehicles.filter(v => (v.id === vehicleId ? newStatus : v.status) === 'AVAILABLE').length,
            pendingVehicles:   prev.allVehicles.filter(v => (v.id === vehicleId ? newStatus : v.status) === 'PENDING').length,
            soldVehicles:      prev.allVehicles.filter(v => (v.id === vehicleId ? newStatus : v.status) === 'SOLD').length,
          },
        }
      })
    } catch { setError('Error updating status') }
    finally { setUpdatingId(null) }
  }

  const handleDelete = async (vehicleId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(vehicleId)
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setError('Failed to delete vehicle'); return }
      setData(prev => {
        if (!prev) return prev
        const updated = prev.allVehicles.filter(v => v.id !== vehicleId)
        return {
          ...prev,
          allVehicles: updated,
          statistics: {
            ...prev.statistics,
            totalVehicles: updated.length,
            availableVehicles: updated.filter(v => v.status === 'AVAILABLE').length,
            pendingVehicles:   updated.filter(v => v.status === 'PENDING').length,
            soldVehicles:      updated.filter(v => v.status === 'SOLD').length,
          },
        }
      })
    } catch { setError('Error deleting vehicle') }
    finally { setDeletingId(null) }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const filteredVehicles = data?.allVehicles.filter(v => {
    const matchSearch = searchQuery === '' ||
      `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter
    return matchSearch && matchStatus
  }) ?? []

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="h-8 w-8 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm text-gray-500">Loading dashboard…</span>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card p-8 text-center max-w-sm">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">{error ?? 'Failed to load dashboard'}</p>
        <button onClick={fetchData} className="mt-4 btn-primary">Retry</button>
      </div>
    </div>
  )

  const { statistics, leadsByType, recentLeads } = data

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-[90px] sm:top-[108px] z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">E&S Car Sales</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/inventory" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* ── Inventory stats row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Inventory', value: statistics.totalVehicles, icon: Car, color: 'bg-brand-50 text-brand-600' },
            { label: 'Available',       value: statistics.availableVehicles, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending',         value: statistics.pendingVehicles, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Sold',            value: statistics.soldVehicles, icon: TrendingUp, color: 'bg-red-50 text-red-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Lead stats row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{statistics.totalLeads}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{statistics.leadsThisMonth}</p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${statistics.leadGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {statistics.leadGrowth >= 0
                  ? <ArrowUpRight className="h-3.5 w-3.5" />
                  : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(statistics.leadGrowth)}% vs last month
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Week</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{statistics.leadsThisWeek}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{statistics.whatsappTotal}</p>
              <p className="mt-0.5 text-xs text-gray-400">{statistics.whatsappThisMonth} this month</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ── Secondary stats: avg price + lead type breakdown ────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Avg price + vehicles this month */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Inventory Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. Price</p>
                <p className="mt-1 text-xl font-bold text-gray-900">${statistics.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Added (30d)</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{statistics.vehiclesThisMonth}</p>
              </div>
            </div>
          </div>

          {/* Lead type breakdown */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Channel</h3>
            <div className="space-y-2">
              {Object.entries(LEAD_TYPE_META).map(([type, meta]) => {
                const count = leadsByType[type] ?? 0
                const total = statistics.totalLeads || 1
                const pct = Math.round((count / total) * 100)
                const Icon = meta.icon
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-28 shrink-0 ${meta.color}`}>
                      <Icon className="h-3 w-3" />{meta.label}
                    </span>
                    <div className="flex-1 rounded-full bg-gray-100 h-2">
                      <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Tab switcher: Vehicles / Leads ──────────────────────────────── */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {(['vehicles', 'leads'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'vehicles' ? `Vehicles (${data.allVehicles.length})` : `Leads (${statistics.totalLeads})`}
            </button>
          ))}
        </div>

        {/* ── Vehicles tab ────────────────────────────────────────────────── */}
        {activeTab === 'vehicles' && (
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold text-gray-900">All Vehicles</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name or VIN…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full sm:w-56 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="PENDING">Pending</option>
                      <option value="SOLD">Sold</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">VIN</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Condition</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVehicles.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No vehicles match your filters</td></tr>
                  ) : filteredVehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {vehicle.images[0]
                              ? <Image src={vehicle.images[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} fill className="object-cover" />
                              : <div className="flex h-full items-center justify-center"><Car className="h-5 w-5 text-gray-400" /></div>}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            <p className="text-xs text-gray-400">Added {new Date(vehicle.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="font-mono text-xs text-gray-500">{vehicle.vin || '—'}</span></td>
                      <td className="px-6 py-4"><span className="font-bold text-gray-900">${vehicle.price.toLocaleString()}</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${vehicle.condition === 'NEW' ? 'bg-blue-100 text-blue-700' : vehicle.condition === 'CERTIFIED' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {vehicle.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={vehicle.status}
                          onChange={e => handleStatusChange(vehicle.id, e.target.value as 'AVAILABLE' | 'PENDING' | 'SOLD')}
                          disabled={updatingId === vehicle.id}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none ${vehicle.status === 'AVAILABLE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : vehicle.status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700'} ${updatingId === vehicle.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          <option value="AVAILABLE">✓ Available</option>
                          <option value="PENDING">⏱ Pending</option>
                          <option value="SOLD">✕ Sold</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/inventory/${vehicle.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                            <Edit2 className="h-3.5 w-3.5" />Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                            disabled={deletingId === vehicle.id}
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 ${deletingId === vehicle.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />{deletingId === vehicle.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
              <p className="text-sm text-gray-500">Showing {filteredVehicles.length} of {data.allVehicles.length} vehicles</p>
            </div>
          </div>
        )}

        {/* ── Leads tab ───────────────────────────────────────────────────── */}
        {activeTab === 'leads' && (
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent Leads</h2>
              <span className="text-xs text-gray-400">Last 20 contacts (WhatsApp clicks excluded)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Message</th>
                    <th className="px-6 py-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLeads.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No leads yet</td></tr>
                  ) : recentLeads.map(lead => {
                    const meta = LEAD_TYPE_META[lead.type] ?? LEAD_TYPE_META.GENERAL
                    const Icon = meta.icon
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                          <a href={`mailto:${lead.email}`} className="text-xs text-brand-600 hover:underline">{lead.email}</a>
                        </td>
                        <td className="px-6 py-4">
                          {lead.phone
                            ? <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-gray-700 hover:text-brand-600"><Phone className="h-3.5 w-3.5" />{lead.phone}</a>
                            : <span className="text-gray-400 text-sm">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                            <Icon className="h-3 w-3" />{meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-xs text-gray-500 truncate">{lead.message || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-400">{timeAgo(lead.createdAt)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
