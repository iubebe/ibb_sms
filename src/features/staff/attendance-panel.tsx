import { ChevronLeft, ChevronRight, Download, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useAttendanceList, useAttendanceReport, useExportAttendance } from '@/api/hooks'
import type { AttendanceRecord, AttendanceStatus, AttendanceSummaryRow } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { downloadBlob } from '@/lib/download-blob'
import {
  formatDay,
  formatDuration,
  formatHours,
  formatMonth,
  formatTime,
  monthOf,
  shiftMonth,
} from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { AttendanceSessionSheet } from './attendance-session-sheet'
import { ROLE_LABEL } from './role-labels'

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  open: 'Đang làm',
  completed: 'Hoàn tất',
  incomplete: 'Thiếu check-out',
}

/** Admin: monthly hours per person (for salary), the sessions behind them, Excel export. */
export function AttendancePanel() {
  const [currentMonth] = useState(() => monthOf(new Date()))
  const [month, setMonth] = useState(currentMonth)
  const [userId, setUserId] = useState<string | undefined>()
  const [selected, setSelected] = useState<AttendanceRecord | null>(null)

  const report = useAttendanceReport(month)
  const sessions = useAttendanceList(month, userId)
  const exporter = useExportAttendance()
  const filteredName = report.data?.rows.find((row) => row.userId === userId)?.name

  function handleExport() {
    exporter.mutate(month, { onSuccess: (blob) => downloadBlob(blob, `cham-cong-${month}.xlsx`) })
  }

  function changeMonth(delta: number) {
    setMonth(shiftMonth(month, delta))
    setUserId(undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label="Tháng trước" onClick={() => changeMonth(-1)}>
            <ChevronLeft />
          </Button>
          <p className="min-w-32 text-center font-medium" aria-live="polite">
            {formatMonth(month)}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Tháng sau"
            disabled={month >= currentMonth}
            onClick={() => changeMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button variant="outline" className="min-h-11 sm:ml-auto" disabled={exporter.isPending} onClick={handleExport}>
          {exporter.isPending ? <Loader2 className="animate-spin" /> : <Download />}
          Xuất Excel
        </Button>
      </div>
      {exporter.isError && (
        <p role="alert" className="text-sm text-destructive">
          {exporter.error.message}
        </p>
      )}

      <section className="flex flex-col gap-2" aria-label="Tổng hợp giờ công">
        <h3 className="text-sm font-medium text-muted-foreground">Tổng hợp giờ công</h3>
        {report.isPending && <Skeleton className="h-24" />}
        {report.isError && <LoadError message={report.error.message} onRetry={() => void report.refetch()} />}
        {report.data?.rows.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Chưa có nhân viên hoặc thu ngân nào.</p>
        )}
        <ul className="flex flex-col gap-2 md:hidden">
          {report.data?.rows.map((row) => (
            <li key={row.userId}>
              <SummaryCard row={row} active={row.userId === userId} onPick={() => setUserId(row.userId === userId ? undefined : row.userId)} />
            </li>
          ))}
        </ul>
        {report.data && report.data.rows.length > 0 && (
          <div className="hidden overflow-hidden rounded-xl border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Nhân viên</th>
                  <th className="px-3 py-2 text-right font-medium">Ngày công</th>
                  <th className="px-3 py-2 text-right font-medium">Số ca</th>
                  <th className="px-3 py-2 text-right font-medium">Tổng giờ</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {report.data.rows.map((row) => (
                  <tr
                    key={row.userId}
                    className={cn('cursor-pointer border-t hover:bg-muted/50', row.userId === userId && 'bg-muted')}
                    onClick={() => setUserId(row.userId === userId ? undefined : row.userId)}
                  >
                    <td className="px-3 py-2">
                      <span className="font-medium">{row.name}</span>{' '}
                      <span className="text-muted-foreground">· {ROLE_LABEL[row.role]}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{row.days}</td>
                    <td className="px-3 py-2 text-right">{row.sessions}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatHours(row.minutes)}</td>
                    <td className="px-3 py-2">
                      {row.incomplete > 0 && <Badge variant="destructive">{row.incomplete} thiếu check-out</Badge>}
                      {!row.isActive && <Badge variant="outline">Đã khóa</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2" aria-label="Ca làm việc">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Ca làm việc</h3>
          {userId && (
            <Button variant="secondary" size="sm" className="min-h-9" onClick={() => setUserId(undefined)}>
              {filteredName ?? 'Nhân viên'}
              <X />
            </Button>
          )}
        </div>
        {sessions.isPending && <Skeleton className="h-16" />}
        {sessions.isError && <LoadError message={sessions.error.message} onRetry={() => void sessions.refetch()} />}
        {sessions.data?.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Không có ca nào trong tháng này.</p>}
        <ul className="flex flex-col gap-2">
          {sessions.data?.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-3 rounded-xl border bg-card p-3 text-left text-card-foreground active:bg-muted"
                onClick={() => setSelected(record)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{record.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDay(record.checkInAt)} · {formatTime(record.checkInAt)} –{' '}
                    {record.checkOutAt ? formatTime(record.checkOutAt) : '…'}
                    {record.minutes !== null && ` · ${formatDuration(record.minutes)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={record.status === 'incomplete' ? 'destructive' : 'secondary'}>{STATUS_LABEL[record.status]}</Badge>
                  {record.adjusted && <Badge variant="outline">Đã chỉnh</Badge>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <AttendanceSessionSheet record={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function SummaryCard({ row, active, onPick }: { row: AttendanceSummaryRow; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-xl border bg-card p-3 text-left text-card-foreground active:bg-muted',
        active && 'border-primary',
      )}
      onClick={onPick}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{row.name}</p>
        <p className="text-sm text-muted-foreground">
          {ROLE_LABEL[row.role]} · {row.days} ngày · {row.sessions} ca
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {row.incomplete > 0 && <Badge variant="destructive">{row.incomplete} thiếu check-out</Badge>}
          {!row.isActive && <Badge variant="outline">Đã khóa</Badge>}
        </div>
      </div>
      <p className="text-right text-lg font-semibold">
        {formatHours(row.minutes)}
        <span className="block text-xs font-normal text-muted-foreground">giờ</span>
      </p>
    </button>
  )
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 text-sm">
      <p className="text-destructive">{message}</p>
      <Button variant="outline" className="min-h-11" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  )
}
