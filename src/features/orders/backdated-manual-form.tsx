import { CalendarDays, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateBackdatedOrders } from "@/api/hooks";
import { useProducts } from "@/api/hooks/use-products";
import { useTables } from "@/api/hooks/use-tables";
import type { PaymentMethod } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TimePicker } from "@/components/ui/time-picker";
import { formatPrice } from "@/lib/format-price";

interface DraftLine {
  key: number;
  productId: string;
  quantity: number;
}

interface DraftOrder {
  key: number;
  tableId: string;
  /** `HH:mm`, "" = backend default (12:00). */
  time: string;
  lines: DraftLine[];
}

const dayLabel = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "qr_manual", label: "Chuyển khoản" },
];

let nextKey = 1;
const newLine = (): DraftLine => ({ key: nextKey++, productId: "", quantity: 1 });
const newOrder = (): DraftOrder => ({
  key: nextKey++,
  tableId: "",
  time: "",
  lines: [newLine()],
});

function yesterday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
}

/** Local calendar day as `YYYY-MM-DD` (not `toISOString`, which shifts by timezone). */
function toDayString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Admin: type in several finished orders for one past day; they are saved as paid. */
export function BackdatedManualForm() {
  const tables = useTables();
  const products = useProducts();
  const create = useCreateBackdatedOrders();

  const [day, setDay] = useState<Date>(yesterday);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [drafts, setDrafts] = useState<DraftOrder[]>(() => [newOrder()]);
  const [doneCount, setDoneCount] = useState<number | null>(null);

  const menu = (products.data ?? []).filter((p) => p.isActive);
  const priceOf = new Map(menu.map((p) => [p.id, p.price]));
  const total = drafts.reduce(
    (sum, d) =>
      sum + d.lines.reduce((s, l) => s + (priceOf.get(l.productId) ?? 0) * l.quantity, 0),
    0,
  );
  const complete = drafts.every(
    (d) => d.tableId && d.lines.length > 0 && d.lines.every((l) => l.productId),
  );

  function patchOrder(key: number, patch: Partial<DraftOrder>) {
    setDrafts((all) => all.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function patchLine(orderKey: number, lineKey: number, patch: Partial<DraftLine>) {
    setDrafts((all) =>
      all.map((d) =>
        d.key === orderKey
          ? { ...d, lines: d.lines.map((l) => (l.key === lineKey ? { ...l, ...patch } : l)) }
          : d,
      ),
    );
  }

  function submit() {
    setDoneCount(null);
    create.mutate(
      {
        date: toDayString(day),
        paymentMethod: payment,
        orders: drafts.map((d) => ({
          tableId: d.tableId,
          time: d.time || undefined,
          items: d.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        })),
      },
      {
        onSuccess: (result) => {
          setDoneCount(result.created);
          setDrafts([newOrder()]);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Ngày của các đơn</Label>
        <Button
          variant="outline"
          className="min-h-11 justify-start capitalize"
          onClick={() => setPickerOpen(true)}
        >
          <CalendarDays />
          {dayLabel.format(day)}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Thanh toán</Label>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_OPTIONS.map((o) => (
            <Button
              key={o.value}
              variant={payment === o.value ? "default" : "outline"}
              className="min-h-11"
              onClick={() => setPayment(o.value)}
            >
              {o.label}
            </Button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {drafts.map((order, index) => (
          <li
            key={order.key}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">Đơn {index + 1}</p>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label={`Xóa đơn ${index + 1}`}
                disabled={drafts.length === 1}
                onClick={() => setDrafts((all) => all.filter((d) => d.key !== order.key))}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Select
                value={order.tableId}
                onValueChange={(tableId) => patchOrder(order.key, { tableId })}
              >
                <SelectTrigger className="min-h-11" aria-label="Bàn">
                  <SelectValue placeholder="Chọn bàn" />
                </SelectTrigger>
                <SelectContent>
                  {(tables.data ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TimePicker
                value={order.time}
                onChange={(time) => patchOrder(order.key, { time })}
                title="Giờ của đơn"
                placeholder="Giờ (12:00)"
                className="min-h-11 w-36"
              />
            </div>

            <ul className="flex flex-col gap-2">
              {order.lines.map((line) => (
                <li key={line.key} className="flex flex-col gap-2 border-t pt-2">
                  <Select
                    value={line.productId}
                    onValueChange={(productId) => patchLine(order.key, line.key, { productId })}
                  >
                    <SelectTrigger className="min-h-11" aria-label="Món">
                      <SelectValue placeholder="Chọn món" />
                    </SelectTrigger>
                    <SelectContent>
                      {menu.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} · {formatPrice(p.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="min-h-11 min-w-11"
                        aria-label="Giảm số lượng"
                        disabled={line.quantity <= 1}
                        onClick={() =>
                          patchLine(order.key, line.key, { quantity: line.quantity - 1 })
                        }
                      >
                        <Minus />
                      </Button>
                      <span className="w-10 text-center tabular-nums">{line.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="min-h-11 min-w-11"
                        aria-label="Tăng số lượng"
                        disabled={line.quantity >= 99}
                        onClick={() =>
                          patchLine(order.key, line.key, { quantity: line.quantity + 1 })
                        }
                      >
                        <Plus />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11"
                      aria-label="Xóa món"
                      disabled={order.lines.length === 1}
                      onClick={() =>
                        patchOrder(order.key, {
                          lines: order.lines.filter((l) => l.key !== line.key),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="min-h-11"
              disabled={order.lines.length >= 50}
              onClick={() => patchOrder(order.key, { lines: [...order.lines, newLine()] })}
            >
              <Plus />
              Thêm món
            </Button>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="min-h-11"
        disabled={drafts.length >= 200}
        onClick={() => setDrafts((all) => [...all, newOrder()])}
      >
        <Plus />
        Thêm đơn
      </Button>

      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">
          {drafts.length} đơn · tổng cộng
        </span>
        <span className="text-lg font-semibold tabular-nums">{formatPrice(total)}</span>
      </div>

      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {create.error.message}
        </p>
      )}
      {doneCount !== null && (
        <p role="status" className="text-sm text-green-600">
          Đã tạo {doneCount} đơn đã thanh toán.
        </p>
      )}

      <Button className="min-h-12" disabled={!complete || create.isPending} onClick={submit}>
        {create.isPending && <Loader2 className="animate-spin" />}
        Lưu {drafts.length} đơn
      </Button>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="flex flex-col items-center">
          <SheetHeader>
            <SheetTitle>Chọn ngày</SheetTitle>
          </SheetHeader>
          <Calendar
            mode="single"
            selected={day}
            defaultMonth={day}
            onSelect={(picked) => {
              if (picked) {
                setDay(picked);
                setPickerOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
