import { Clock, User } from 'lucide-react'
import type { StaffSchedule } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDayName } from '@/lib/date-utils'

interface SchedulesListProps {
  schedules: StaffSchedule[]
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  scheduled: 'default',
  cancelled: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Đang tuyển',
  cancelled: 'Đã hủy',
  'no-show': 'Vắng',
}

export function SchedulesList({ schedules }: SchedulesListProps) {
  if (schedules.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Không có ca làm việc nào trong tuần này.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {schedules.map((shift) => (
        <div key={shift.id} className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{getDayName(shift.dayOfWeek)}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {shift.startTime} - {shift.endTime}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[shift.status] || 'secondary'}>
              {STATUS_LABELS[shift.status] || shift.status}
            </Badge>
          </div>

          {shift.shiftType && (
            <p className="text-xs text-muted-foreground">
              {shift.shiftType}
              {shift.position && ` • ${shift.position}`}
            </p>
          )}

          {shift.assignedToUserId ? (
            <p className="flex items-center gap-1 text-xs font-medium text-green-600">
              <User className="h-3 w-3" />
              Đã gán nhân viên
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa gán nhân viên</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="min-h-8 flex-1 text-xs" onClick={() => {
              // TODO: Open edit dialog
            }}>
              Sửa
            </Button>
            {shift.status === 'scheduled' && (
              <Button variant="outline" className="min-h-8 flex-1 text-xs text-destructive" onClick={() => {
                // TODO: Cancel shift
              }}>
                Hủy
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
