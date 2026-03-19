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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!vehicleId) {
      return NextResponse.json({ error: 'No vehicleId provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const projectId = process.env.GCS_PROJECT_ID
    const bucketName = process.env.GCS_BUCKET_NAME

    if (!projectId || !bucketName) {
      return NextResponse.json(
        { error: 'GCS configuration missing' },
        { status: 500 }
      )
    }

    // Initialize Storage with Application Default Credentials (ADC)
    const storage = new Storage({ projectId })
    const bucket = storage.bucket(bucketName)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${file.name.split('.')[0]}-${timestamp}.${file.name.split('.').pop()}`
    const filepath = `vehicles/${vehicleId}/${filename}`
    const file_obj = bucket.file(filepath)

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload to GCS
    await file_obj.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    })

    // Make file publicly readable
    await file_obj.makePublic()

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filepath}`

    return NextResponse.json(
      { success: true, url: publicUrl, filepath },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
