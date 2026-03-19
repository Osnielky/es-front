'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'

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

export default function VehiclesListPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) {
          setError('Failed to load vehicles')
          return
        }
        const data = await res.json()
        // Get all vehicles by using the API directly
        const vehiclesRes = await fetch('/api/vehicles?limit=1000')
        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json()
          setVehicles(vehiclesData.vehicles || [])
        }
      } catch {
        setError('Error loading vehicles')
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Failed to delete vehicle')
        return
      }
      setVehicles(vehicles.filter((v) => v.id !== id))
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
          <span className="text-sm text-gray-500">Loading vehicles...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h1>
            <p className="text-sm text-gray-500">Manage all listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Vehicle
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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-900 font-semibold">No vehicles yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first listing to get started.</p>
            <Link
              href="/admin/inventory"
              className="btn-primary mt-6 inline-flex"
            >
              <Plus className="h-4 w-4" />
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-xs text-gray-500">{v.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{v.year}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${v.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          v.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : v.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/inventory/${v.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
