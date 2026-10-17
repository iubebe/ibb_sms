import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { StaffShiftRegistration } from '@/api/types'
import { useApproveRegistration, useRejectRegistration } from '@/api/hooks/use-staff-schedules'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RegistrationsListProps {
  registrations: StaffShiftRegistration[]
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

export function RegistrationsList({ registrations }: RegistrationsListProps) {
  const approve = useApproveRegistration()
  const reject = useRejectRegistration()

  if (registrations.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Không có đơn đăng ký nào.
      </p>
    )
  }

  const pending = registrations.filter((r) => r.status === 'pending')
  const reviewed = registrations.filter((r) => r.status !== 'pending')

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-sm">Chờ xét duyệt</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pending.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                onApprove={() => approve.mutate({ id: reg.id })}
                onReject={() => reject.mutate({ id: reg.id })}
                isLoading={approve.isPending || reject.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-sm">Lịch sử xét duyệt</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviewed.map((reg) => (
              <RegistrationCard key={reg.id} registration={reg} isReviewed />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface RegistrationCardProps {
  registration: StaffShiftRegistration
  isReviewed?: boolean
  onApprove?: () => void
  onReject?: () => void
  isLoading?: boolean
}

function RegistrationCard({
  registration,
  isReviewed,
  onApprove,
  onReject,
  isLoading,
}: RegistrationCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">Đơn đăng ký ca làm</p>
          <p className="text-xs text-muted-foreground">Mã: {registration.scheduleId.slice(0, 8)}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[registration.status] || 'secondary'}>
          {STATUS_LABELS[registration.status] || registration.status}
        </Badge>
      </div>

      {registration.adminNotes && (
        <p className="text-xs text-muted-foreground italic">
          Ghi chú: {registration.adminNotes}
        </p>
      )}

      {!isReviewed && onApprove && onReject && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="min-h-8 flex-1 text-xs"
            disabled={isLoading}
            onClick={onApprove}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
            Duyệt
          </Button>
          <Button
            variant="outline"
            className="min-h-8 flex-1 text-xs text-destructive"
            disabled={isLoading}
            onClick={onReject}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Từ chối
          </Button>
        </div>
      )}
    </div>
  )
}
