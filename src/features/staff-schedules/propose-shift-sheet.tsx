import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useProposeShifts } from "@/api/hooks/use-staff-schedules";
import type { ShiftInput } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getDayName } from "@/lib/date-utils";

const MAX_SHIFTS = 10;
const DAYS = [1, 2, 3, 4, 5, 6, 7];

interface ProposeShiftSheetProps {
  weekStartDate: string;
  open: boolean;
  onClose: () => void;
}

interface ShiftRow {
  key: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  position: string;
}

let nextKey = 1;
const newRow = (dayOfWeek = 1): ShiftRow => ({
  key: nextKey++,
  dayOfWeek,
  startTime: "",
  endTime: "",
  position: "",
});

export function ProposeShiftSheet({
  weekStartDate,
  open,
  onClose,
}: ProposeShiftSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] flex flex-col">
        {/* Remount on each open so the form starts empty. */}
        {open && (
          <ProposeShiftForm
            key={weekStartDate}
            weekStartDate={weekStartDate}
            onDone={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProposeShiftForm({
  weekStartDate,
  onDone,
}: {
  weekStartDate: string;
  onDone: () => void;
}) {
  const propose = useProposeShifts();
  const [rows, setRows] = useState<ShiftRow[]>(() => [newRow()]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [rows]);

  const valid = rows.every(
    (r) => r.startTime !== "" && r.endTime !== "" && r.startTime !== r.endTime,
  );

  function updateRow(key: number, patch: Partial<ShiftRow>) {
    setRows((current) =>
      current.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((r) => r.key !== key));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid || propose.isPending) return;
    const shifts: ShiftInput[] = rows.map((r) => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      ...(r.position.trim() ? { position: r.position.trim() } : {}),
    }));
    propose.mutate({ weekStartDate, shifts }, { onSuccess: onDone });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 min-h-0"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>Đề xuất ca làm</SheetTitle>
        <SheetDescription>
          Ca đề xuất sẽ chờ quản lý duyệt trước khi mở để đăng ký.
        </SheetDescription>
      </SheetHeader>

      <div
        className="flex flex-1 flex-col gap-4 overflow-y-auto"
        ref={containerRef}
      >
        {rows.map((row, index) => (
          <div
            key={row.key}
            className="flex flex-col gap-3 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Ca {index + 1}</span>
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  aria-label={`Xóa ca ${index + 1}`}
                  onClick={() => removeRow(row.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Ngày</Label>
              <Select
                value={String(row.dayOfWeek)}
                onValueChange={(value) =>
                  updateRow(row.key, { dayOfWeek: Number(value) })
                }
              >
                <SelectTrigger className="h-11 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {getDayName(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`start-${row.key}`}>Bắt đầu</Label>
                <Input
                  id={`start-${row.key}`}
                  type="time"
                  required
                  className="h-11 text-base"
                  value={row.startTime}
                  onChange={(e) =>
                    updateRow(row.key, { startTime: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`end-${row.key}`}>Kết thúc</Label>
                <Input
                  id={`end-${row.key}`}
                  type="time"
                  required
                  className="h-11 text-base"
                  value={row.endTime}
                  onChange={(e) =>
                    updateRow(row.key, { endTime: e.target.value })
                  }
                />
              </div>
            </div>
            {row.startTime !== "" && row.startTime === row.endTime && (
              <p className="text-xs text-destructive">
                Giờ kết thúc phải khác giờ bắt đầu.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor={`position-${row.key}`}>
                Vị trí (không bắt buộc)
              </Label>
              <Input
                id={`position-${row.key}`}
                maxLength={100}
                autoComplete="off"
                placeholder="Ví dụ: thu ngân, phục vụ"
                className="h-11 text-base"
                value={row.position}
                onChange={(e) =>
                  updateRow(row.key, { position: e.target.value })
                }
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {rows.length < MAX_SHIFTS && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            onClick={() =>
              setRows((current) => [
                ...current,
                newRow(current[current.length - 1]?.dayOfWeek ?? 1),
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Thêm ca
          </Button>
        )}

        {propose.isError && (
          <p role="alert" className="text-sm text-destructive">
            Lỗi: {propose.error.message}
          </p>
        )}

        <Button
          type="submit"
          className="min-h-11 w-full"
          disabled={!valid || propose.isPending}
        >
          {propose.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {propose.isPending ? "Đang gửi..." : "Gửi đề xuất"}
        </Button>
      </div>
    </form>
  );
}
