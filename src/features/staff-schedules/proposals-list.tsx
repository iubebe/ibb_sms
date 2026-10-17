import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { StaffSchedule } from '@/api/types'
import { useApproveProposal, useRejectProposal } from '@/api/hooks/use-staff-schedules'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDayName } from '@/lib/date-utils'

interface ProposalsListProps {
  proposals: StaffSchedule[]
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  proposed: 'default',
  scheduled: 'secondary',
  rejected: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  proposed: 'Chờ duyệt',
  scheduled: 'Đã duyệt',
  rejected: 'Từ chối',
}

export function ProposalsList({ proposals }: ProposalsListProps) {
  const approve = useApproveProposal()
  const reject = useRejectProposal()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  if (proposals.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Chưa có đề xuất ca làm nào trong tuần này.
      </p>
    )
  }

  const pending = proposals.filter((p) => p.status === 'proposed')
  const reviewed = proposals.filter((p) => p.status !== 'proposed')
  const busy = approve.isPending || reject.isPending

  function confirmReject(id: string) {
    reject.mutate({ id, notes: notes.trim() || undefined }, {
      onSuccess: () => {
        setRejectingId(null)
        setNotes('')
      },
    })
  }

  function renderCard(shift: StaffSchedule, isReviewed: boolean) {
    const proposer = shift.proposedByUser?.name ?? 'Nhân viên'
    return (
      <div key={shift.id} className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{proposer}</p>
            <p className="text-sm">{getDayName(shift.dayOfWeek)}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {shift.startTime} - {shift.endTime}
            </p>
          </div>
          <Badge variant={STATUS_VARIANTS[shift.status] || 'secondary'}>
            {STATUS_LABELS[shift.status] || shift.status}
          </Badge>
        </div>

        {shift.position && <p className="text-xs text-muted-foreground">Vị trí: {shift.position}</p>}
        {shift.reviewNotes && <p className="text-xs text-muted-foreground italic">Ghi chú: {shift.reviewNotes}</p>}

        {!isReviewed && rejectingId !== shift.id && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="min-h-11 flex-1 text-sm"
              disabled={busy}
              onClick={() => approve.mutate({ id: shift.id })}
            >
              {approve.isPending && approve.variables?.id === shift.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Duyệt
            </Button>
            <Button
              variant="outline"
              className="min-h-11 flex-1 text-sm text-destructive"
              disabled={busy}
              onClick={() => {
                setRejectingId(shift.id)
                setNotes('')
              }}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>
          </div>
        )}

        {!isReviewed && rejectingId === shift.id && (
          <div className="flex flex-col gap-2 pt-2">
            <Input
              aria-label="Lý do từ chối"
              placeholder="Lý do (không bắt buộc)"
              maxLength={500}
              className="h-11 text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="min-h-11 flex-1 text-sm" disabled={busy} onClick={() => setRejectingId(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                className="min-h-11 flex-1 text-sm"
                disabled={busy}
                onClick={() => confirmReject(shift.id)}
              >
                {reject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}

        {!isReviewed && approve.isError && approve.variables?.id === shift.id && (
          <p role="alert" className="text-xs text-destructive">Lỗi: {approve.error.message}</p>
        )}
        {!isReviewed && reject.isError && reject.variables?.id === shift.id && (
          <p role="alert" className="text-xs text-destructive">Lỗi: {reject.error.message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-sm">Chờ xét duyệt</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pending.map((shift) => renderCard(shift, false))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-sm">Lịch sử xét duyệt</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviewed.map((shift) => renderCard(shift, true))}
          </div>
        </div>
      )}
    </div>
  )
}
