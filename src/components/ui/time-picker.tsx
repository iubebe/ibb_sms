import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface TimePickerProps {
  /** `HH:mm`, or "" when nothing is picked yet. */
  value: string
  onChange: (value: string) => void
  id?: string
  title?: string
  placeholder?: string
  /** Minute grid step; defaults to 5. */
  minuteStep?: number
  className?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

function Cell({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "size-10 p-0 font-normal",
        selected && "bg-primary text-primary-foreground hover:bg-primary",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function TimePicker({
  value,
  onChange,
  id,
  title = "Chọn giờ",
  placeholder = "--:--",
  minuteStep = 5,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, minute] = value ? value.split(":").map(Number) : [null, null]

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  )

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn(
          "h-11 w-full justify-start text-base font-normal",
          !value && "text-muted-foreground",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <Clock />
        {value || placeholder}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="flex flex-col items-center">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col gap-2">
              <span className="text-[0.8rem] text-muted-foreground">Giờ</span>
              <div className="grid grid-cols-6 gap-2">
                {hours.map((h) => (
                  <Cell
                    key={h}
                    selected={h === hour}
                    onClick={() => onChange(`${pad(h)}:${pad(minute ?? 0)}`)}
                  >
                    {pad(h)}
                  </Cell>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[0.8rem] text-muted-foreground">Phút</span>
              <div className="grid grid-cols-6 gap-2">
                {minutes.map((m) => (
                  <Cell
                    key={m}
                    selected={m === minute}
                    onClick={() => onChange(`${pad(hour ?? 0)}:${pad(m)}`)}
                  >
                    {pad(m)}
                  </Cell>
                ))}
              </div>
            </div>
          </div>
          <Button
            type="button"
            className="min-h-11 w-full max-w-sm"
            disabled={!value}
            onClick={() => setOpen(false)}
          >
            Xong
          </Button>
        </SheetContent>
      </Sheet>
    </>
  )
}

export { TimePicker }
