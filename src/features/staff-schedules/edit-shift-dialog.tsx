import { useState } from 'react'
import type { StaffSchedule, UpdateStaffScheduleInput } from '@/api/types'
import { useUpdateSchedule } from '@/api/hooks/use-staff-schedules'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDayName } from '@/lib/date-utils'

interface EditShiftDialogProps {
  open: boolean
  shift: StaffSchedule | null
  onOpenChange: (open: boolean) => void
}

export function EditShiftDialog({ open, shift, onOpenChange }: EditShiftDialogProps) {
  const [startTime, setStartTime] = useState(shift?.startTime || '')
  const [endTime, setEndTime] = useState(shift?.endTime || '')
  const [shiftType, setShiftType] = useState(shift?.shiftType || '')
  const [position, setPosition] = useState(shift?.position || '')
  const updateMutation = useUpdateSchedule()

  const handleSave = async () => {
    if (!shift) return

    const updates: UpdateStaffScheduleInput = {}
    if (startTime !== shift.startTime) updates.startTime = startTime
    if (endTime !== shift.endTime) updates.endTime = endTime
    if (shiftType !== (shift.shiftType || '')) updates.shiftType = shiftType || undefined
    if (position !== (shift.position || '')) updates.position = position || undefined

    if (Object.keys(updates).length === 0) {
      onOpenChange(false)
      return
    }

    await updateMutation.mutateAsync({ id: shift.id, input: updates })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa ca làm</DialogTitle>
          <DialogDescription>
            {shift && `${getDayName(shift.dayOfWeek)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startTime" className="text-xs">
                Giờ bắt đầu
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endTime" className="text-xs">
                Giờ kết thúc
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="shiftType" className="text-xs">
              Loại ca (tùy chọn)
            </Label>
            <Input
              id="shiftType"
              type="text"
              placeholder="Sáng, chiều, tối"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="position" className="text-xs">
              Vị trí (tùy chọn)
            </Label>
            <Input
              id="position"
              type="text"
              placeholder="Thu ngân, bếp, phục vụ"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-8"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
