import { AlertCircle, Clock, User } from 'lucide-react'
import { useState } from 'react'
import type { StaffSchedule } from '@/api/types'
import { useCancelSchedule } from '@/api/hooks/use-staff-schedules'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDayName } from '@/lib/date-utils'
import { EditShiftDialog } from './edit-shift-dialog'

interface SchedulesListProps {
  schedules: StaffSchedule[]
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  scheduled: 'default',
  cancelled: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Sẵn sàng',
  cancelled: 'Đã hủy',
  'no-show': 'Vắng',
  pending: 'Đang chờ'
}

export function SchedulesList({ schedules }: SchedulesListProps) {
  const [editingShift, setEditingShift] = useState<StaffSchedule | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const cancelMutation = useCancelSchedule()

  const handleEditClick = (shift: StaffSchedule) => {
    setEditingShift(shift)
    setEditDialogOpen(true)
  }

  const handleCancelShift = async (shiftId: string) => {
    if (!confirm('Bạn chắc chắn muốn hủy ca làm này?')) return
    await cancelMutation.mutateAsync(shiftId)
  }

  if (schedules.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Không có ca làm việc nào trong tuần này.
      </p>
    )
  }

  const groupedByDay = schedules.reduce(
    (acc, shift) => {
      if (!acc[shift.dayOfWeek]) {
        acc[shift.dayOfWeek] = []
      }
      acc[shift.dayOfWeek].push(shift)
      return acc
    },
    {} as Record<number, StaffSchedule[]>,
  )

  const dayStats = Object.entries(groupedByDay).map(([day, dayShifts]) => {
    const dayNum = parseInt(day, 10)
    const assigned = dayShifts.filter((s) => s.assignedToUser).length
    const total = dayShifts.length
    const unassigned = total - assigned
    const isUnderstaffed = unassigned > 0

    return {
      day: dayNum,
      total,
      assigned,
      unassigned,
      isUnderstaffed,
      shifts: dayShifts,
    }
  })

  dayStats.sort((a, b) => a.day - b.day)

  return (
    <>
      <EditShiftDialog
        open={editDialogOpen}
        shift={editingShift}
        onOpenChange={setEditDialogOpen}
      />

      <div className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7">
        {dayStats.map((stat) => {
          const fillPercentage = Math.round((stat.assigned / stat.total) * 100)
          const bgColor = stat.unassigned === 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-orange-50 dark:bg-orange-950'
          const borderColor =
            stat.unassigned === 0
              ? 'border-green-200 dark:border-green-800'
              : stat.unassigned >= 2
                ? 'border-red-200 dark:border-red-800'
                : 'border-orange-200 dark:border-orange-800'

          return (
            <div
              key={stat.day}
              className={`rounded-lg border-2 p-3 transition-colors ${bgColor} ${borderColor}`}
            >
              <p className="font-semibold text-sm">{getDayName(stat.day)}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ca gán:</span>
                  <span className="font-medium">{stat.assigned}/{stat.total}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      fillPercentage === 100
                        ? 'bg-green-500'
                        : fillPercentage >= 50
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
                {stat.unassigned > 0 && (
                  <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    Thiếu {stat.unassigned}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {dayStats.map((stat) =>
          stat.shifts.map((shift) => (
            <div
              key={shift.id}
              className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
                shift.assignedToUser ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              }`}
            >
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

              {shift.assignedToUser ? (
                <p className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                  <User className="h-3 w-3" />
                  Nhân viên: {shift.assignedToUser.name}
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Chưa gán nhân viên
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="min-h-8 flex-1 text-xs"
                  onClick={() => handleEditClick(shift)}
                >
                  Sửa
                </Button>
                {shift.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    className="min-h-8 flex-1 text-xs text-destructive"
                    onClick={() => handleCancelShift(shift.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </div>
          )),
        )}
      </div>
      </div>
    </>
  )
}
