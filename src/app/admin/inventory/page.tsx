'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Plus, LogOut, AlertCircle, CheckCircle2, X } from 'lucide-react'

const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1900).max(2100),
  trim: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  mileage: z.coerce.number().int().nonnegative('Mileage cannot be negative'),
  condition: z.enum(['NEW', 'USED', 'CERTIFIED']),
  bodyStyle: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  engine: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
})

type VehicleInput = z.infer<typeof vehicleSchema>

export default function AdminInventoryPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      condition: 'USED',
    },
  })

  const onSubmit = async (data: VehicleInput) => {
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          features: [],
          images: [],
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error?.message || 'Failed to create vehicle')
        return
      }

      const result = await res.json()
      setSuccess(`Vehicle created successfully! Slug: ${result.slug}`)
      reset()
      setTimeout(() => {
        setSuccess(null)
      }, 4000)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-500">Create and manage vehicle listings</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_350px] lg:gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {error && (
              <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="label">
                    Year *
                  </label>
                  <input
                    id="year"
                    type="number"
                    className="input"
                    placeholder="2023"
                    {...register('year')}
                  />
                  {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
                </div>

                <div>
                  <label htmlFor="make" className="label">
                    Make *
                  </label>
                  <input
                    id="make"
                    type="text"
                    className="input"
                    placeholder="Toyota"
                    {...register('make')}
                  />
                  {errors.make && <p className="mt-1 text-xs text-red-500">{errors.make.message}</p>}
                </div>

                <div>
                  <label htmlFor="model" className="label">
                    Model *
                  </label>
                  <input
                    id="model"
                    type="text"
                    className="input"
                    placeholder="Camry"
                    {...register('model')}
                  />
                  {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model.message}</p>}
                </div>

                <div>
                  <label htmlFor="trim" className="label">
                    Trim
                  </label>
                  <input
                    id="trim"
                    type="text"
                    className="input"
                    placeholder="XSE"
                    {...register('trim')}
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Condition</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="label">
                    Price *
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="29999"
                    {...register('price')}
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>

                <div>
                  <label htmlFor="mileage" className="label">
                    Mileage *
                  </label>
                  <input
                    id="mileage"
                    type="number"
                    className="input"
                    placeholder="35000"
                    {...register('mileage')}
                  />
                  {errors.mileage && (
                    <p className="mt-1 text-xs text-red-500">{errors.mileage.message}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label htmlFor="condition" className="label">
                    Condition *
                  </label>
                  <select id="condition" className="input" {...register('condition')}>
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                    <option value="CERTIFIED">Certified Pre-Owned</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bodyStyle" className="label">
                    Body Style
                  </label>
                  <input
                    id="bodyStyle"
                    type="text"
                    className="input"
                    placeholder="Sedan"
                    {...register('bodyStyle')}
                  />
                </div>

                <div>
                  <label htmlFor="transmission" className="label">
                    Transmission
                  </label>
                  <input
                    id="transmission"
                    type="text"
                    className="input"
                    placeholder="Automatic"
                    {...register('transmission')}
                  />
                </div>

                <div>
                  <label htmlFor="fuelType" className="label">
                    Fuel Type
                  </label>
                  <input
                    id="fuelType"
                    type="text"
                    className="input"
                    placeholder="Gasoline"
                    {...register('fuelType')}
                  />
                </div>

                <div>
                  <label htmlFor="engine" className="label">
                    Engine
                  </label>
                  <input
                    id="engine"
                    type="text"
                    className="input"
                    placeholder="2.5L 4-Cylinder"
                    {...register('engine')}
                  />
                </div>

                <div>
                  <label htmlFor="exteriorColor" className="label">
                    Exterior Color
                  </label>
                  <input
                    id="exteriorColor"
                    type="text"
                    className="input"
                    placeholder="Black"
                    {...register('exteriorColor')}
                  />
                </div>

                <div>
                  <label htmlFor="interiorColor" className="label">
                    Interior Color
                  </label>
                  <input
                    id="interiorColor"
                    type="text"
                    className="input"
                    placeholder="Black"
                    {...register('interiorColor')}
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="vin" className="label">
                    VIN
                  </label>
                  <input
                    id="vin"
                    type="text"
                    className="input"
                    placeholder="4T1BZ1HK5NU090001"
                    {...register('vin')}
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>

              <div>
                <label htmlFor="description" className="label">
                  Vehicle Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe the vehicle, its features, and condition..."
                  {...register('description')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 lg:w-auto lg:px-8"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Listing
                </>
              )}
            </button>
          </form>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0">
            <div className="card overflow-hidden">
              <div className="bg-brand-50 p-4">
                <h3 className="font-bold text-gray-900">Quick Tips</h3>
              </div>
              <div className="space-y-3 p-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Required Fields</p>
                  <p>Year, Make, Model, Price, Mileage, and Condition must be filled.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing</p>
                  <p>Enter the vehicle price in USD. Decimals are supported.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Images & Features</p>
                  <p>Image upload and features will be added in a future update.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Slug Generation</p>
                  <p>A unique URL slug is auto-generated from year, make, and model.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
