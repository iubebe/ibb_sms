import { Loader2, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useAddOrderItems } from '@/api/hooks'
import { useProducts } from '@/api/hooks/use-products'
import type { StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Thumb } from '@/features/products/product-panel'
import { formatPrice } from '@/lib/format-price'

interface AddItemsSheetProps {
  order: StaffOrder | null
  onClose: () => void
}

/** Pick more products for an order that is already open (served or still being served). */
export function AddItemsSheet({ order, onClose }: AddItemsSheetProps) {
  const products = useProducts()
  const addItems = useAddOrderItems()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const picked = (products.data ?? []).filter((p) => (quantities[p.id] ?? 0) > 0)
  const total = picked.reduce((sum, p) => sum + p.price * quantities[p.id], 0)

  function setQuantity(productId: string, quantity: number) {
    setQuantities((q) => ({ ...q, [productId]: Math.min(99, Math.max(0, quantity)) }))
  }

  function close() {
    setQuantities({})
    addItems.reset()
    onClose()
  }

  function submit() {
    if (!order || picked.length === 0) return
    addItems.mutate(
      {
        orderId: order.id,
        input: { items: picked.map((p) => ({ productId: p.id, quantity: quantities[p.id] })) },
      },
      { onSuccess: close },
    )
  }

  return (
    <Sheet open={order !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent side="bottom" className="flex max-h-[90svh] flex-col">
        <SheetHeader>
          <SheetTitle>Thêm món · {order?.tableName ?? 'Không có bàn'}</SheetTitle>
          <SheetDescription>Món thêm sẽ được cộng vào đơn đang phục vụ.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4">
          {products.isPending && (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          )}
          {products.isError && (
            <div role="alert" className="flex flex-col items-start gap-2 text-sm">
              <p className="text-destructive">{products.error.message}</p>
              <Button variant="outline" className="min-h-11" onClick={() => void products.refetch()}>
                Thử lại
              </Button>
            </div>
          )}
          {products.data?.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Chưa có sản phẩm.</p>
          )}
          {products.data?.map((product) => {
            const quantity = quantities[product.id] ?? 0
            return (
              <div
                key={product.id}
                className="flex items-center gap-2 rounded-lg border bg-card p-3 text-card-foreground"
              >
                <Thumb product={product} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium wrap-break-word">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
                {quantity === 0 ? (
                  <Button
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label={`Thêm ${product.name}`}
                    onClick={() => setQuantity(product.id, 1)}
                  >
                    <Plus />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-11 min-w-11"
                      aria-label={`Bớt ${product.name}`}
                      onClick={() => setQuantity(product.id, quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="min-w-8 text-center text-sm tabular-nums">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-11 min-w-11"
                      aria-label={`Thêm một ${product.name}`}
                      onClick={() => setQuantity(product.id, quantity + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Tiền thêm</span>
            <span className="text-lg font-semibold tabular-nums">{formatPrice(total)}</span>
          </div>
          {addItems.isError && (
            <p role="alert" className="text-sm text-destructive">
              {addItems.error.message}
            </p>
          )}
          <Button className="min-h-11 w-full" disabled={picked.length === 0 || addItems.isPending} onClick={submit}>
            {addItems.isPending && <Loader2 className="animate-spin" />}
            Thêm vào đơn
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
