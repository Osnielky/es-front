'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, AlertCircle, CheckCircle2, ArrowLeft, Upload, X } from 'lucide-react'
import Image from 'next/image'

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
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD']),
})

type VehicleInput = z.infer<typeof vehicleSchema>

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
  })

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/admin/vehicles/${id}`)
        if (!res.ok) {
          setError('Vehicle not found')
          return
        }
        const data = await res.json()
        reset(data)
        setImages(data.images || [])
      } catch {
        setError('Failed to load vehicle')
      } finally {
        setLoading(false)
      }
    }
    fetchVehicle()
  }, [id, reset])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > 10) {
      setError(`Maximum 10 images allowed (you have ${images.length})`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('vehicleId', id)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          setError('Failed to upload image')
          return
        }

        const data = await res.json()
        setImages((prev) => [...prev, data.url])
      }

      setSuccess('Images uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Error uploading images')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: VehicleInput) => {
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error?.message || 'Failed to update vehicle')
        return
      }

      setSuccess('Vehicle updated successfully!')
      setTimeout(() => {
        router.push('/admin/vehicles')
      }, 1500)
    } catch {
      setError('Something went wrong. Please try again.')
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
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm text-gray-500">Loading vehicle...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
              <p className="text-sm text-gray-500">Update vehicle details</p>
            </div>
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
                {errors.mileage && <p className="mt-1 text-xs text-red-500">{errors.mileage.message}</p>}
              </div>

              <div>
                <label htmlFor="condition" className="label">
                  Condition *
                </label>
                <select id="condition" className="input" {...register('condition')}>
                  <option value="NEW">New</option>
                  <option value="USED">Used</option>
                  <option value="CERTIFIED">Certified Pre-Owned</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="label">
                  Status
                </label>
                <select id="status" className="input" {...register('status')}>
                  <option value="AVAILABLE">Available</option>
                  <option value="PENDING">Pending</option>
                  <option value="SOLD">Sold</option>
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Images</h2>
            <p className="text-sm text-gray-500 mb-4">Upload up to 10 photos ({images.length}/10)</p>

            {/* Upload Area */}
            <div className="mb-6">
              <label className="relative block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 10}
                  className="hidden"
                />
                <div
                  className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                    uploading || images.length >= 10
                      ? 'border-gray-200 bg-gray-50 opacity-50'
                      : 'border-brand-300 bg-brand-50 hover:border-brand-500'
                  }`}
                >
                  <Upload className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">
                    {uploading ? 'Uploading...' : 'Drag images or click to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                </div>
              </label>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={url}
                        alt={`Vehicle ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Photo {idx + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">

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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary justify-center py-3.5 disabled:opacity-60 px-8"
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
                  Updating...
                </span>
              ) : (
                'Update Vehicle'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary justify-center py-3.5 px-8"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
