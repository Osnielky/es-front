import { NextRequest, NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(getAdminCookieName())?.value
  if (!token) return false
  return Boolean(await verifyAdminToken(token))
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string

    if (!file || !vehicleId) {
      return NextResponse.json({ error: 'Missing file or vehicleId' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Initialize Storage with Application Default Credentials (ADC)
    const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID })

    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)
    const timestamp = Date.now()
    const filename = `vehicles/${vehicleId}/${timestamp}-${file.name}`
    const file_obj = bucket.file(filename)

    const buffer = await file.arrayBuffer()

    await file_obj.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    })

    const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
