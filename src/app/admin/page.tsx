'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut,
  Plus,
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
} from 'lucide-react'

interface Statistics {
  totalVehicles: number
  availableVehicles: number
  soldVehicles: number
  pendingVehicles: number
  totalLeads: number
  avgPrice: number
  vehiclesThisMonth: number
}

interface Lead {
  id: string
  name: string
  email: string
  type: string
  createdAt: string
}

interface Vehicle {
  id: string
  slug: string
  make: string
  model: string
  year: number
  price: number
  status: string
  createdAt: string
}

interface DashboardData {
  statistics: Statistics
  leadsByType: Record<string, number>
  recentLeads: Lead[]
  recentVehicles: Vehicle[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) {
          setError('Failed to load dashboard')
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError('Error loading statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-sm text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-900 font-semibold">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    )
  }

  const { statistics, leadsByType, recentLeads, recentVehicles } = data
  const statusPct = statistics.totalVehicles
    ? Math.round((statistics.availableVehicles / statistics.totalVehicles) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Sales & Inventory Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Vehicles */}
          <div className="card p-6 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.totalVehicles}</p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">
                  {statistics.vehiclesThisMonth} added this month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <Car className="h-6 w-6 text-brand-600" />
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="card p-6 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.availableVehicles}</p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">{statusPct}% of inventory</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="card p-6 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.pendingVehicles}</p>
                <p className="mt-1 text-xs text-amber-600 font-semibold">In negotiation</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Sold */}
          <div className="card p-6 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sold</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.soldVehicles}</p>
                <p className="mt-1 text-xs text-blue-600 font-semibold">Completed sales</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Average Price */}
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Price</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ${statistics.avgPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </div>

          {/* Total Leads */}
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{statistics.totalLeads}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Leads by Type */}
          <div className="card p-6">
            <p className="text-sm font-medium text-gray-500 mb-3">Leads by Type</p>
            <div className="space-y-1.5">
              {Object.entries(leadsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Data Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Vehicles */}
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                <h2 className="font-bold text-gray-900">Recent Listings</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentVehicles.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No vehicles yet</p>
                </div>
              ) : (
                recentVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {v.status === 'AVAILABLE' && '✓ Available'}
                        {v.status === 'PENDING' && '⏱ Pending'}
                        {v.status === 'SOLD' && '✓ Sold'}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${v.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                <h2 className="font-bold text-gray-900">Recent Leads</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLeads.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No leads yet</p>
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                        <p className="mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          {lead.type}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
