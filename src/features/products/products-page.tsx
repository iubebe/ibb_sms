import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryPanel } from './category-panel'
import { ProductPanel } from './product-panel'

/** Admin only (see `RoleRoute` in `src/router.tsx`). */
export function ProductsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Sản phẩm</h2>
      <Tabs defaultValue="products">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="products" className="min-h-5 flex-1 md:px-6">
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="categories" className="min-h-5 flex-1 md:px-6">
            Danh mục
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="pt-3">
          <ProductPanel />
        </TabsContent>
        <TabsContent value="categories" className="pt-3">
          <CategoryPanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
