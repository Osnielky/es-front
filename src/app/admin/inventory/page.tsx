'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Plus, LogOut, AlertCircle, CheckCircle2, X, Upload } from 'lucide-react'
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
})

type VehicleInput = z.infer<typeof vehicleSchema>

export default function AdminInventoryPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
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
    defaultValues: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      trim: 'XSE',
      price: 28995,
      mileage: 15000,
      condition: 'USED',
      bodyStyle: 'Sedan',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      engine: '2.5L 4-Cylinder',
      exteriorColor: 'Midnight Black',
      interiorColor: 'Black',
      vin: '',
      description: 'Excellent condition. One owner, accident-free. Fully loaded with leather, sunroof, backup camera, Apple CarPlay, and lane departure warning.',
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
          images,
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
        formData.append('vehicleId', 'temp')

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          setError('Failed to upload image')
          const errorData = await res.json()
          setError(`Upload failed: ${errorData.error || 'Unknown error'}`)
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
                  <select id="year" className="input" {...register('year')}>
                    <option value="">Select year</option>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
                </div>

                <div>
                  <label htmlFor="make" className="label">
                    Make *
                  </label>
                  <select id="make" className="input" {...register('make')}>
                    <option value="">Select make</option>
                    <option value="Acura">Acura</option>
                    <option value="Audi">Audi</option>
                    <option value="BMW">BMW</option>
                    <option value="Buick">Buick</option>
                    <option value="Cadillac">Cadillac</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Chrysler">Chrysler</option>
                    <option value="Dodge">Dodge</option>
                    <option value="Ford">Ford</option>
                    <option value="Genesis">Genesis</option>
                    <option value="GMC">GMC</option>
                    <option value="Honda">Honda</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Infiniti">Infiniti</option>
                    <option value="Jeep">Jeep</option>
                    <option value="Kia">Kia</option>
                    <option value="Lexus">Lexus</option>
                    <option value="Lincoln">Lincoln</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Ram">Ram</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Volvo">Volvo</option>
                  </select>
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
                  <select id="bodyStyle" className="input" {...register('bodyStyle')}>
                    <option value="">Select body style</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Wagon">Wagon</option>
                    <option value="SUV">SUV</option>
                    <option value="Crossover">Crossover</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Minivan">Minivan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="transmission" className="label">
                    Transmission
                  </label>
                  <select id="transmission" className="input" {...register('transmission')}>
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fuelType" className="label">
                    Fuel Type
                  </label>
                  <select id="fuelType" className="input" {...register('fuelType')}>
                    <option value="">Select fuel type</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  </select>
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
                  <select id="exteriorColor" className="input" {...register('exteriorColor')}>
                    <option value="">Select color</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Silver">Silver</option>
                    <option value="Gray">Gray</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Brown">Brown</option>
                    <option value="Gold">Gold</option>
                    <option value="Beige">Beige</option>
                    <option value="Orange">Orange</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interiorColor" className="label">
                    Interior Color
                  </label>
                  <select id="interiorColor" className="input" {...register('interiorColor')}>
                    <option value="">Select color</option>
                    <option value="Black">Black</option>
                    <option value="Gray">Gray</option>
                    <option value="Tan">Tan</option>
                    <option value="Beige">Beige</option>
                    <option value="Brown">Brown</option>
                    <option value="Red">Red</option>
                    <option value="Cognac">Cognac</option>
                  </select>
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
                  <p>Upload up to 10 vehicle photos during creation or edit. Images are stored in Google Cloud and available to customers immediately.</p>
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
