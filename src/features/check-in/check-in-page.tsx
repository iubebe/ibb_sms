import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCheckIn, useCheckOut, useMyAttendance } from '@/api/hooks'
import { CameraCapture } from '@/components/camera-capture'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDuration, formatTime, minutesSince } from '@/lib/format-time'
import { MyAttendanceSummary } from './my-attendance-summary'

/** Staff and cashier: take a photo to start or end the shift, plus own totals. */
export function CheckInPage() {
  const attendance = useMyAttendance()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  // Bumped after each successful send so the camera starts fresh.
  const [cameraKey, setCameraKey] = useState(0)
  // Kept here because the mutation in use flips as soon as the state refetches.
  const [done, setDone] = useState<'check-in' | 'check-out' | null>(null)

  const data = attendance.data
  const checkedIn = data?.state === 'checked_in'
  const mutation = checkedIn ? checkOut : checkIn

  function handleCapture(photo: Blob) {
    const kind = checkedIn ? 'check-out' : 'check-in'
    setDone(null)
    mutation.mutate(photo, {
      onSuccess: () => {
        setDone(kind)
        setCameraKey((key) => key + 1)
      },
    })
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h2 className="text-xl font-semibold">Chấm công</h2>

      {attendance.isPending && <Skeleton className="h-16" />}

      {attendance.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{attendance.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void attendance.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {data && (
        <>
          <ShiftStatus openSince={data.open?.checkInAt ?? null} />

          {/* After a failed send the photo stays on screen, so the user can just tap again. */}
          <CameraCapture
            key={cameraKey}
            confirmLabel={checkedIn ? 'Check out' : 'Check in'}
            pending={mutation.isPending}
            error={mutation.isError ? mutation.error.message : null}
            onCapture={handleCapture}
          />

          {done && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              {done === 'check-in' ? 'Đã check-in thành công.' : 'Đã check-out thành công.'}
            </p>
          )}

          <MyAttendanceSummary data={data} />
        </>
      )}
    </section>
  )
}

function ShiftStatus({ openSince }: { openSince: string | null }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!openSince) return
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [openSince])

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground">
      {openSince ? (
        <>
          <p className="font-medium">Đang làm việc</p>
          <p className="text-sm text-muted-foreground">
            Từ {formatTime(openSince)} · {formatDuration(minutesSince(openSince, now))}
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">Chưa check-in</p>
          <p className="text-sm text-muted-foreground">Chụp ảnh để bắt đầu ca làm.</p>
        </>
      )}
    </div>
  )
}
