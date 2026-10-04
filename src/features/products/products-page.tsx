import { Skeleton } from '@/components/ui/skeleton'

export function ProductsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Sản phẩm</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </section>
  )
}
