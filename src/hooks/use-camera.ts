import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraStatus = 'idle' | 'starting' | 'live' | 'denied' | 'unsupported' | 'error'

const CAPTURE_WIDTH = 640
const JPEG_QUALITY = 0.85

/**
 * Front camera for selfies. Attach `videoRef` to a `<video playsInline muted>`
 * that stays mounted; `start()` must run from a tap (iOS requires a gesture).
 * The stream is always released on `stop()` and on unmount.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus((current) => (current === 'live' || current === 'starting' ? 'idle' : current))
  }, [])

  const start = useCallback(async () => {
    // Camera access needs HTTPS (or localhost); otherwise `mediaDevices` is missing.
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stop()
        return
      }
      video.srcObject = stream
      await video.play()
      setStatus('live')
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      const name = error instanceof DOMException ? error.name : ''
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error')
    }
  }, [stop])

  /** Grabs the current frame as a 640px-wide JPEG (not mirrored). */
  const capture = useCallback((): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return Promise.resolve(null)
    const canvas = document.createElement('canvas')
    canvas.width = CAPTURE_WIDTH
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * CAPTURE_WIDTH)
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  }, [])

  useEffect(() => stop, [stop])

  return { videoRef, status, start, stop, capture }
}
