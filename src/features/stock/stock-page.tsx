import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImportsPanel } from './imports-panel'
import { StockItemsPanel } from './stock-items-panel'
import { SuppliersPanel } from './suppliers-panel'

/** Admin only (see `RoleRoute` in `src/router.tsx`): costs are not for staff. */
export function StockPage() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Kho</h2>
      <Tabs defaultValue="items">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="items" className="min-h-5 flex-1 md:px-6">
            Tồn kho
          </TabsTrigger>
          <TabsTrigger value="imports" className="min-h-5 flex-1 md:px-6">
            Phiếu nhập
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="min-h-5 flex-1 md:px-6">
            Nhà cung cấp
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="pt-3">
          <StockItemsPanel />
        </TabsContent>
        <TabsContent value="imports" className="pt-3">
          <ImportsPanel />
        </TabsContent>
        <TabsContent value="suppliers" className="pt-3">
          <SuppliersPanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
