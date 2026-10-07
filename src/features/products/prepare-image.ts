/** Longest side after downscaling; plenty for a menu thumbnail, keeps uploads small on mobile data. */
const MAX_SIDE = 1280
const QUALITY = 0.85

/** The backend accepts JPEG/PNG/WebP up to 5 MB; we always send a downscaled JPEG. */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

/** Decodes the picked file and re-encodes it as a JPEG within `MAX_SIDE`. Throws if it is not a readable image. */
export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    // JPEG has no alpha; paint white so transparent PNGs don't turn black.
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Encode failed'))), 'image/jpeg', QUALITY),
    )
  } finally {
    bitmap.close()
  }
}
