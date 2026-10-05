import { TriangleAlert } from 'lucide-react'
import type { AttendanceStatus, MyAttendance } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { formatDay, formatDuration, formatHours, formatMonth, formatTime } from '@/lib/format-time'

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  open: 'Đang làm',
  completed: 'Hoàn tất',
  incomplete: 'Thiếu check-out',
}

/** Today's and this month's totals plus the latest sessions. */
export function MyAttendanceSummary({ data }: { data: MyAttendance }) {
  const { today, month, recent } = data

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Hôm nay" value={formatDuration(today.minutes)} hint={`${today.sessions} ca`} />
        <Stat
          label={formatMonth(month.month)}
          value={`${formatHours(month.minutes)} giờ`}
          hint={`${month.days} ngày · ${month.sessions} ca`}
        />
      </div>

      {month.incomplete > 0 && (
        <p role="status" className="flex items-start gap-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          Có {month.incomplete} ca chưa check-out nên chưa được tính giờ. Hãy báo quản lý để chỉnh lại.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Ca gần đây</h3>
        {recent.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Chưa có ca nào.</p>}
        <ul className="flex flex-col gap-2">
          {recent.map((record) => (
            <li key={record.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{formatDay(record.checkInAt)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(record.checkInAt)} – {record.checkOutAt ? formatTime(record.checkOutAt) : '…'}
                  {record.minutes !== null && ` · ${formatDuration(record.minutes)}`}
                </p>
              </div>
              <Badge variant={record.status === 'incomplete' ? 'destructive' : 'secondary'}>
                {STATUS_LABEL[record.status]}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-card-foreground">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
