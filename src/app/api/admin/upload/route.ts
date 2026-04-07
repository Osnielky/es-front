import { NextRequest, NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'

const DEFAULT_MAX_UPLOAD_SIZE_MB = 5

function getMaxUploadSizeBytes() {
  const configuredMb = Number(process.env.MAX_UPLOAD_SIZE_MB)
  const safeMb = Number.isFinite(configuredMb) && configuredMb > 0
    ? configuredMb
    : DEFAULT_MAX_UPLOAD_SIZE_MB

  return Math.floor(safeMb * 1024 * 1024)
}

function getFriendlyUploadError(error: unknown, maxUploadSizeBytes: number) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()
  const maxUploadSizeMb = Math.floor(maxUploadSizeBytes / (1024 * 1024))

  if (
    normalized.includes('entity too large') ||
    normalized.includes('body exceeded') ||
    normalized.includes('request body too large') ||
    normalized.includes('failed to parse body as formdata')
  ) {
    return {
      status: 413,
      message: `Image is too large. Max allowed size is ${maxUploadSizeMb}MB.`,
    }
  }

  return {
    status: 500,
    message: 'Upload failed',
  }
}

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
    const maxUploadSizeBytes = getMaxUploadSizeBytes()
    const contentLengthHeader = request.headers.get('content-length')
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN

    if (Number.isFinite(contentLength) && contentLength > maxUploadSizeBytes) {
      return NextResponse.json(
        { error: `Image is too large. Max allowed size is ${Math.floor(maxUploadSizeBytes / (1024 * 1024))}MB.` },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string

    if (!file || !vehicleId) {
      return NextResponse.json({ error: 'Missing file or vehicleId' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > maxUploadSizeBytes) {
      return NextResponse.json(
        { error: `File size must be less than ${Math.floor(maxUploadSizeBytes / (1024 * 1024))}MB` },
        { status: 413 }
      )
    }

    const bucketName = process.env.GCS_BUCKET_NAME
    const projectId = process.env.GCS_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT

    if (!bucketName || !projectId) {
      return NextResponse.json({ error: 'GCS configuration missing' }, { status: 500 })
    }

    // Initialize Storage with Application Default Credentials (ADC)
    const storage = new Storage({ projectId })

    const bucket = storage.bucket(bucketName)
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${file.name.split('.')[0]}-${timestamp}.${ext}`
    const filepath = `vehicles/${vehicleId}/${filename}`
    const file_obj = bucket.file(filepath)

    const buffer = await file.arrayBuffer()

    await file_obj.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    })

    // Make file publicly readable
    await file_obj.makePublic()

    // Generate public URL (org policy now allows public access)
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filepath}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filepath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    const friendly = getFriendlyUploadError(error, getMaxUploadSizeBytes())
    return NextResponse.json({ error: friendly.message }, { status: friendly.status })
  }
}
