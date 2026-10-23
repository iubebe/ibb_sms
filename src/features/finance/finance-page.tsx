import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useExportFinance } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadBlob } from '@/lib/download-blob'
import { formatMonth, monthOf, shiftMonth } from '@/lib/format-time'
import { ExpensesPanel } from './expenses-panel'
import { monthRange } from './finance-labels'
import { OverviewPanel } from './overview-panel'

/** Admin only (see `RoleRoute` in `src/router.tsx`): money figures are not for staff. */
export function FinancePage() {
  const [currentMonth] = useState(() => monthOf(new Date()))
  const [month, setMonth] = useState(currentMonth)
  const { from, to } = monthRange(month, shiftMonth(month, 1))
  const exporter = useExportFinance()

  function handleExport() {
    exporter.mutate({ from, to }, { onSuccess: (blob) => downloadBlob(blob, `tai-chinh-${month}.xlsx`) })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">Tài chính</h2>
        <div className="flex items-center gap-1 sm:ml-auto">
          <Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label="Tháng trước" onClick={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft />
          </Button>
          <p className="min-w-32 text-center font-medium" aria-live="polite">
            {formatMonth(month)}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Tháng sau"
            disabled={month >= currentMonth}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button variant="outline" className="min-h-11" disabled={exporter.isPending} onClick={handleExport}>
          {exporter.isPending ? <Loader2 className="animate-spin" /> : <Download />}
          Xuất Excel
        </Button>
      </div>
      {exporter.isError && (
        <p role="alert" className="text-sm text-destructive">
          {exporter.error.message}
        </p>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="overview" className="min-h-5 flex-1 md:px-6">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="expenses" className="min-h-5 flex-1 md:px-6">
            Chi phí vận hành
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-3">
          <OverviewPanel from={from} to={to} month={month} />
        </TabsContent>
        <TabsContent value="expenses" className="pt-3">
          <ExpensesPanel from={from} to={to} month={month} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
