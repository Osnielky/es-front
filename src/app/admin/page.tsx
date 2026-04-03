'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronDown,
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
  allVehicles: Vehicle[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        setError('Failed to load dashboard')
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      setError('Error loading dashboard')
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Status update failed:', res.status, errorData)
        setError(`Failed to update status: ${errorData.error || res.status}`)
        return
      }

      // Update local state
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          allVehicles: prev.allVehicles.map((v) =>
            v.id === vehicleId ? { ...v, status: newStatus } : v
          ),
          statistics: {
            ...prev.statistics,
            availableVehicles: prev.allVehicles.filter((v) =>
              v.id === vehicleId ? newStatus === 'AVAILABLE' : v.status === 'AVAILABLE'
            ).length,
            pendingVehicles: prev.allVehicles.filter((v) =>
              v.id === vehicleId ? newStatus === 'PENDING' : v.status === 'PENDING'
            ).length,
            soldVehicles: prev.allVehicles.filter((v) =>
              v.id === vehicleId ? newStatus === 'SOLD' : v.status === 'SOLD'
            ).length,
          },
        }
      })
    } catch {
      setError('Error updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(vehicleId)
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(`Failed to delete: ${errorData.error || res.status}`)
        return
      }

      // Remove from local state
      setData((prev) => {
        if (!prev) return prev
        const updatedVehicles = prev.allVehicles.filter((v) => v.id !== vehicleId)
        return {
          ...prev,
          allVehicles: updatedVehicles,
          statistics: {
            ...prev.statistics,
            totalVehicles: updatedVehicles.length,
            availableVehicles: updatedVehicles.filter((v) => v.status === 'AVAILABLE').length,
            pendingVehicles: updatedVehicles.filter((v) => v.status === 'PENDING').length,
            soldVehicles: updatedVehicles.filter((v) => v.status === 'SOLD').length,
          },
        }
      })
    } catch {
      setError('Error deleting vehicle')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Filter vehicles
  const filteredVehicles = data?.allVehicles.filter((v) => {
    const matchesSearch =
      searchQuery === '' ||
      `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter

    return matchesSearch && matchesStatus
  }) ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { statistics } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
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

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{statistics.totalVehicles}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <Car className="h-5 w-5 text-brand-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{statistics.availableVehicles}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{statistics.pendingVehicles}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{statistics.soldVehicles}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-bold text-gray-900">All Vehicles</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or VIN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-40 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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

          {/* Table */}
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
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'No vehicles match your filters'
                        : 'No vehicles in inventory'}
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {vehicle.images[0] ? (
                              <Image
                                src={vehicle.images[0]}
                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Car className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added {new Date(vehicle.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* VIN */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-600">
                          {vehicle.vin || '—'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          ${vehicle.price.toLocaleString()}
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            vehicle.condition === 'NEW'
                              ? 'bg-blue-100 text-blue-700'
                              : vehicle.condition === 'CERTIFIED'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {vehicle.condition}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={vehicle.status}
                          onChange={(e) =>
                            handleStatusChange(vehicle.id, e.target.value as 'AVAILABLE' | 'PENDING' | 'SOLD')
                          }
                          disabled={updatingId === vehicle.id}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            vehicle.status === 'AVAILABLE'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-500'
                              : vehicle.status === 'PENDING'
                              ? 'border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500'
                              : 'border-red-200 bg-red-50 text-red-700 focus:ring-red-500'
                          } ${updatingId === vehicle.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          <option value="AVAILABLE">✓ Available</option>
                          <option value="PENDING">⏱ Pending</option>
                          <option value="SOLD">✕ Sold</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/inventory/${vehicle.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)
                            }
                            disabled={deletingId === vehicle.id}
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ${
                              deletingId === vehicle.id ? 'opacity-50 cursor-wait' : ''
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === vehicle.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
            <p className="text-sm text-gray-500">
              Showing {filteredVehicles.length} of {data.allVehicles.length} vehicles
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
