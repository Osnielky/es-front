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

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const projectId = process.env.GCS_PROJECT_ID
    const bucketName = process.env.GCS_BUCKET_NAME

    if (!projectId || !bucketName) {
      return NextResponse.json({ error: 'GCS configuration missing' }, { status: 500 })
    }

    const storage = new Storage({ projectId })
    const bucket = storage.bucket(bucketName)

    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${file.name.split('.')[0]}-${timestamp}.${ext}`
    const filepath = `vehicles/${vehicleId}/${filename}`
    const file_obj = bucket.file(filepath)

    const buffer = await file.arrayBuffer()
    await file_obj.save(Buffer.from(buffer), {
      metadata: { contentType: file.type },
    })

    // Generate signed URL valid for 30 days
    const [signedUrl] = await file_obj.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    })

    return NextResponse.json(
      { success: true, url: signedUrl, filepath },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
