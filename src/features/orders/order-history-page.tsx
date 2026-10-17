import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useOrderHistory } from "@/api/hooks";
import type { StaffOrder } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ORDER_STATUS_LABEL } from "@/features/dashboard/order-status";
import { formatPrice } from "@/lib/format-price";
import { formatTime } from "@/lib/format-time";

const dayLabel = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const shortDay = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

function sameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

/** Admin: review orders of a day or a range of days, picked from a calendar. */
export function OrderHistoryPage() {
  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const today = startOfDay(new Date());
    return { start: today, end: today };
  });
  const [draft, setDraft] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);

  const from = range.start.toISOString();
  const to = addDays(range.end, 1).toISOString();
  const history = useOrderHistory(from, to);

  const orders = history.data ?? [];
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const today = startOfDay(new Date());
  const spanDays =
    Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000) + 1;
  const isSingleDay = sameDay(range.start, range.end);
  const reachesToday = range.end.getTime() >= today.getTime();

  function openPicker() {
    setDraft({ from: range.start, to: range.end });
    setPickerOpen(true);
  }

  function apply(start: Date, end: Date) {
    setRange({ start: startOfDay(start), end: startOfDay(end) });
    setPickerOpen(false);
  }

  function shift(direction: -1 | 1) {
    const delta = direction * spanDays;
    setRange({
      start: addDays(range.start, delta),
      end: addDays(range.end, delta),
    });
  }

  const rangeLabel = isSingleDay
    ? dayLabel.format(range.start)
    : `${shortDay.format(range.start)} – ${dayLabel.format(range.end)}`;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Lịch sử đơn hàng</h2>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11"
          aria-label="Kỳ trước"
          onClick={() => shift(-1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          className="min-h-11 flex-1 justify-center capitalize"
          onClick={openPicker}
        >
          <CalendarDays />
          {rangeLabel}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11"
          aria-label="Kỳ sau"
          disabled={reachesToday}
          onClick={() => shift(1)}
        >
          <ChevronRight />
        </Button>
      </div>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="flex flex-col items-center">
          <SheetHeader>
            <SheetTitle>Chọn ngày hoặc khoảng ngày</SheetTitle>
          </SheetHeader>
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            defaultMonth={range.start}
            disabled={{ after: new Date() }}
          />
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => apply(today, today)}
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => apply(addDays(today, -6), today)}
            >
              7 ngày qua
            </Button>
            <Button
              className="min-h-11"
              disabled={!draft?.from}
              onClick={() => draft?.from && apply(draft.from, draft.to ?? draft.from)}
            >
              Áp dụng
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Số đơn" value={String(orders.length)} />
        <Stat label="Doanh thu" value={formatPrice(revenue)} />
        <Stat label="Đã hủy" value={String(cancelled)} />
      </div>

      {history.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}
      {history.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{history.error.message}</p>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => void history.refetch()}
          >
            Thử lại
          </Button>
        </div>
      )}
      {history.data && orders.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Không có đơn hàng nào trong khoảng này.
        </p>
      )}
      {orders.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {orders.map((order) => (
            <HistoryCard key={order.id} order={order} showDate={!isSingleDay} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-card-foreground">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function HistoryCard({ order, showDate }: { order: StaffOrder; showDate: boolean }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {order.tableName ?? "Không có bàn"}
          </p>
          <p className="text-xs text-muted-foreground">
            {showDate && `${shortDay.format(new Date(order.createdAt))} · `}
            {formatTime(order.createdAt)}
          </p>
        </div>
        <Badge variant={order.status === "paid" ? "default" : "secondary"}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span className="min-w-0 wrap-break-word">{item.name}</span>
            <span className="tabular-nums text-muted-foreground">
              ×{item.quantity}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t pt-2">
        <span className="text-sm text-muted-foreground">Tổng cộng</span>
        <span className="font-semibold tabular-nums">
          {formatPrice(order.total)}
        </span>
      </div>
    </li>
  );
}
