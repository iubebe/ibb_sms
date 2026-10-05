import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AttendancePanel } from './attendance-panel'
import { UserPanel } from './user-panel'

/** Admin only (see `RoleRoute` in `src/router.tsx`). */
export function StaffPage() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Nhân sự</h2>
      <Tabs defaultValue="accounts">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="accounts" className="min-h-5 flex-1 md:px-6">
            Tài khoản
          </TabsTrigger>
          <TabsTrigger value="attendance" className="min-h-5 flex-1 md:px-6">
            Chấm công
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="pt-3">
          <UserPanel />
        </TabsContent>
        <TabsContent value="attendance" className="pt-3">
          <AttendancePanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
