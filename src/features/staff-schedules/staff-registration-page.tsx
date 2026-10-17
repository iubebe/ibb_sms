import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Plus, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSchedulesByWeek, useMyRegistrations, useMyProposals, useRegisterForShift, useCancelProposal } from '@/api/hooks/use-staff-schedules'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getWeekStartDate, addWeeks, getDayName } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { ProposeShiftSheet } from './propose-shift-sheet'

const PROPOSAL_LABELS: Record<string, string> = {
  proposed: 'Chờ duyệt',
  scheduled: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
}

export function StaffRegistrationPage() {
  const today = new Date()
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(today))
  const schedules = useSchedulesByWeek(weekStartDate)
  const myRegistrations = useMyRegistrations(weekStartDate)
  const register = useRegisterForShift()
  const myProposals = useMyProposals(weekStartDate)
  const cancelProposal = useCancelProposal()
  const [proposeOpen, setProposeOpen] = useState(false)

  const handlePrevWeek = () => {
    setWeekStartDate(addWeeks(weekStartDate, -1))
  }

  const handleNextWeek = () => {
    setWeekStartDate(addWeeks(weekStartDate, 1))
  }

  const scheduleList = schedules.data || []
  const registeredIds = new Set(myRegistrations.data?.map((r) => r.scheduleId) || [])
  const availableShifts = scheduleList.filter((s) => s.status === 'scheduled' && !registeredIds.has(s.id))

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Đăng ký ca làm</h2>
        <Button className="min-h-11 min-w-11" aria-label="Đề xuất ca làm" onClick={() => setProposeOpen(true)}>
          <Plus />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="min-h-9 min-w-9"
          onClick={handlePrevWeek}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-48 text-center text-sm font-medium">Tuần {weekStartDate}</span>
        <Button
          variant="outline"
          size="icon"
          className="min-h-9 min-w-9"
          onClick={handleNextWeek}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ProposeShiftSheet weekStartDate={weekStartDate} open={proposeOpen} onClose={() => setProposeOpen(false)} />

      {schedules.isPending || myRegistrations.isPending || myProposals.isPending ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : schedules.isError ? (
        <div role="alert" className="text-sm text-destructive">
          Lỗi: {schedules.error.message}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {availableShifts.length > 0 && (
            <div>
              <h3 className="mb-3 font-medium text-sm">Ca làm việc có sẵn</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {availableShifts.map((shift) => (
                  <div key={shift.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{getDayName(shift.dayOfWeek)}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <Badge variant="secondary">{shift.status}</Badge>
                    </div>

                    {shift.shiftType && (
                      <p className="text-xs text-muted-foreground">
                        {shift.shiftType}
                        {shift.position && ` • ${shift.position}`}
                      </p>
                    )}

                    <Button
                      className="min-h-9 w-full text-sm"
                      disabled={register.isPending}
                      onClick={() => register.mutate(shift.id)}
                    >
                      {register.isPending ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>

                    {register.isError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Lỗi: {register.error.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {registeredIds.size > 0 && (
            <div>
              <h3 className="mb-3 font-medium text-sm">Đơn đăng ký của tôi</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {scheduleList
                  .filter((s) => registeredIds.has(s.id))
                  .map((shift) => {
                    const reg = myRegistrations.data?.find((r) => r.scheduleId === shift.id)
                    const statusLabels: Record<string, string> = {
                      pending: 'Chờ duyệt',
                      approved: 'Đã duyệt',
                      rejected: 'Từ chối',
                    }
                    return (
                      <div key={shift.id} className="flex flex-col gap-2 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{getDayName(shift.dayOfWeek)}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <Badge
                            variant={
                              reg?.status === 'approved'
                                ? 'default'
                                : reg?.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {statusLabels[reg?.status || 'pending'] || reg?.status}
                          </Badge>
                        </div>

                        {reg?.adminNotes && (
                          <p className="text-xs text-muted-foreground italic">
                            Ghi chú: {reg.adminNotes}
                          </p>
                        )}

                        {reg?.status === 'approved' && (
                          <p className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Đã xác nhận
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {myProposals.isError && (
            <p role="alert" className="text-sm text-destructive">
              Lỗi: {myProposals.error.message}
            </p>
          )}

          {(myProposals.data?.length ?? 0) > 0 && (
            <div>
              <h3 className="mb-3 font-medium text-sm">Đề xuất của tôi</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {myProposals.data!.map((shift) => (
                  <div key={shift.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{getDayName(shift.dayOfWeek)}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <Badge
                        variant={
                          shift.status === 'scheduled'
                            ? 'default'
                            : shift.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {PROPOSAL_LABELS[shift.status] || shift.status}
                      </Badge>
                    </div>
                    {shift.position && <p className="text-xs text-muted-foreground">{shift.position}</p>}
                    {shift.reviewNotes && (
                      <p className="text-xs text-muted-foreground italic">Ghi chú: {shift.reviewNotes}</p>
                    )}

                    {shift.status === 'proposed' && (
                      <Button
                        variant="outline"
                        className="min-h-9 w-full text-sm text-destructive gap-1"
                        disabled={cancelProposal.isPending}
                        onClick={() => cancelProposal.mutate(shift.id)}
                      >
                        {cancelProposal.isPending && cancelProposal.variables === shift.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Hủy đề xuất
                      </Button>
                    )}

                    {cancelProposal.isError && cancelProposal.variables === shift.id && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Lỗi: {cancelProposal.error.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableShifts.length === 0 && registeredIds.size === 0 && (myProposals.data?.length ?? 0) === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không có ca làm việc nào trong tuần này.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
