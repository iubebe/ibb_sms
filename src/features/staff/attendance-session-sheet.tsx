import { ImageOff, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { attendancePhotoUrl, useAdjustAttendance } from '@/api/hooks'
import type { AttendanceRecord, AttendancePhotoKind, FaceCheckStatus } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDateTime, fromLocalInput, toLocalInput } from '@/lib/format-time'

const FACE_LABEL: Record<FaceCheckStatus, string> = {
  pending: 'Chờ nhận diện',
  passed: 'Khớp khuôn mặt',
  failed: 'Không khớp',
}

interface AttendanceSessionSheetProps {
  record: AttendanceRecord | null
  onClose: () => void
}

/** One work session: both photos, and a form to correct the times. */
export function AttendanceSessionSheet({ record, onClose }: AttendanceSessionSheetProps) {
  return (
    <Sheet open={record !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {record && <SessionDetail key={record.id} record={record} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function SessionDetail({ record, onDone }: { record: AttendanceRecord; onDone: () => void }) {
  const adjust = useAdjustAttendance()
  const [checkIn, setCheckIn] = useState(toLocalInput(record.checkInAt))
  const [checkOut, setCheckOut] = useState(record.checkOutAt ? toLocalInput(record.checkOutAt) : '')

  const inChanged = checkIn !== toLocalInput(record.checkInAt)
  const outChanged = checkOut !== '' && checkOut !== (record.checkOutAt ? toLocalInput(record.checkOutAt) : '')
  const valid = checkIn !== '' && (!record.checkOutAt || checkOut !== '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    adjust.mutate(
      {
        id: record.id,
        input: {
          ...(inChanged && { checkInAt: fromLocalInput(checkIn) }),
          ...(outChanged && { checkOutAt: fromLocalInput(checkOut) }),
        },
      },
      { onSuccess: onDone },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <SheetHeader className="px-0">
        <SheetTitle>{record.userName ?? 'Ca làm việc'}</SheetTitle>
        <SheetDescription>
          {formatDateTime(record.checkInAt)}
          {record.checkOutAt ? ` – ${formatDateTime(record.checkOutAt)}` : ' – chưa check-out'}
          {record.adjusted && ' · đã chỉnh sửa'}
        </SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-2">
        <Photo recordId={record.id} kind="check-in" label="Check-in" face={record.checkInFaceStatus} present />
        <Photo
          recordId={record.id}
          kind="check-out"
          label="Check-out"
          face={record.checkOutFaceStatus}
          present={record.hasCheckOutPhoto}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="adjust-in">Giờ check-in</Label>
          <Input id="adjust-in" type="datetime-local" required className="h-11 text-base" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="adjust-out">Giờ check-out</Label>
          <Input
            id="adjust-out"
            type="datetime-local"
            required={record.checkOutAt !== null}
            className="h-11 text-base"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
          {record.status === 'incomplete' && (
            <p className="text-xs text-muted-foreground">Ca này quên check-out. Nhập giờ ra thực tế để tính giờ công.</p>
          )}
        </div>
        {adjust.isError && (
          <p role="alert" className="text-sm text-destructive">
            {adjust.error.message}
          </p>
        )}
        <Button type="submit" className="min-h-11 w-full" disabled={adjust.isPending || !valid || (!inChanged && !outChanged)}>
          {adjust.isPending && <Loader2 className="animate-spin" />}
          Lưu chỉnh sửa
        </Button>
      </form>
    </div>
  )
}

function Photo({
  recordId,
  kind,
  label,
  face,
  present,
}: {
  recordId: string
  kind: AttendancePhotoKind
  label: string
  face: FaceCheckStatus
  present: boolean
}) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className="flex flex-col gap-1">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
        {present && !failed ? (
          <img
            src={attendancePhotoUrl(recordId, kind)}
            alt={`Ảnh ${label}`}
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <ImageOff className="size-6" aria-label="Không có ảnh" />
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-1 text-xs">
        <span>{label}</span>
        {present && <Badge variant={face === 'failed' ? 'destructive' : 'secondary'}>{FACE_LABEL[face]}</Badge>}
      </figcaption>
    </figure>
  )
}
