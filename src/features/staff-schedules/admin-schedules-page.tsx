import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRegistrationsByWeek, useSchedulesByWeek } from '@/api/hooks/use-staff-schedules'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getWeekStartDate, addWeeks } from '@/lib/date-utils'
import { RegistrationsList } from './registrations-list'
import { SchedulesList } from './schedules-list'

export function AdminSchedulesPage() {
  const today = new Date()
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(today))
  const schedules = useSchedulesByWeek(weekStartDate)
  const registrations = useRegistrationsByWeek(weekStartDate)

  const handlePrevWeek = () => {
    setWeekStartDate(addWeeks(weekStartDate, -1))
  }

  const handleNextWeek = () => {
    setWeekStartDate(addWeeks(weekStartDate, 1))
  }

  const scheduleList = schedules.data || []
  const registrationList = registrations.data || []

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="min-h-9 min-w-9" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-48 text-center text-sm font-medium">Tuần {weekStartDate}</span>
          <Button variant="outline" size="icon" className="min-h-9 min-w-9" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="schedules" className="min-h-5 flex-1 md:px-6">
            Ca làm việc {scheduleList.length ? `(${scheduleList.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="registrations" className="min-h-5 flex-1 md:px-6">
            Đơn đăng ký {registrationList.filter((r) => r.status === 'pending').length ? `(${registrationList.filter((r) => r.status === 'pending').length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="pt-3">
          {schedules.isPending ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : schedules.isError ? (
            <div role="alert" className="text-sm text-destructive">
              Lỗi: {schedules.error.message}
            </div>
          ) : (
            <SchedulesList schedules={scheduleList} />
          )}
        </TabsContent>

        <TabsContent value="registrations" className="pt-3">
          {registrations.isPending ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : registrations.isError ? (
            <div role="alert" className="text-sm text-destructive">
              Lỗi: {registrations.error.message}
            </div>
          ) : (
            <RegistrationsList registrations={registrationList} />
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
