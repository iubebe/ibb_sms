import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCreateOrder } from '@/api/hooks'
import { useTables } from '@/api/hooks/use-tables'
import { useProducts } from '@/api/hooks/use-products'
import type { CreateOrderItemInput, DiningTable, Product } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderItem {
  product: Product
  quantity: number
  notes: string
}

export function CreateOrderPage() {
  const navigate = useNavigate()
  const tables = useTables()
  const products = useProducts()
  const createOrder = useCreateOrder()

  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  function addItem(product: Product) {
    const existing = orderItems.find((i) => i.product.id === product.id)
    if (existing) {
      setOrderItems(orderItems.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setOrderItems([...orderItems, { product, quantity: 1, notes: '' }])
    }
  }

  function removeItem(productId: string) {
    setOrderItems(orderItems.filter((i) => i.product.id !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      removeItem(productId)
    } else {
      setOrderItems(orderItems.map((i) => (i.product.id === productId ? { ...i, quantity } : i)))
    }
  }

  function calculateTotal(): number {
    return orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  async function handleSubmit() {
    if (!selectedTable || orderItems.length === 0) return

    const input = {
      tableId: selectedTable.id,
      items: orderItems.map((item): CreateOrderItemInput => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes || undefined,
      })),
    }

    await createOrder.mutateAsync(input, {
      onSuccess: () => {
        navigate('/orders')
      },
    })
  }

  if (!selectedTable) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tạo đơn hàng</h2>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Chọn bàn</p>
          {tables.isPending && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          )}
          {tables.isError && (
            <div role="alert" className="flex flex-col items-start gap-2 text-sm">
              <p className="text-destructive">{tables.error.message}</p>
              <Button variant="outline" className="min-h-11" onClick={() => void tables.refetch()}>
                Thử lại
              </Button>
            </div>
          )}
          {tables.data && tables.data.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Chưa có bàn nào.</p>
          )}
          {tables.data && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {tables.data.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className="rounded-lg border bg-card p-4 text-center text-card-foreground transition hover:bg-accent"
                >
                  <p className="font-medium">{table.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={() => setSelectedTable(null)}
        >
          <ChevronLeft />
        </Button>
        <h2 className="text-xl font-semibold">{selectedTable.name}</h2>
      </div>

      <div className="flex flex-col gap-4 pb-24">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Thêm sản phẩm</p>
          {products.isPending && (
            <div className="grid gap-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          )}
          {products.isError && (
            <div role="alert" className="flex flex-col items-start gap-2 text-sm">
              <p className="text-destructive">{products.error.message}</p>
              <Button variant="outline" className="min-h-11" onClick={() => void products.refetch()}>
                Thử lại
              </Button>
            </div>
          )}
          {products.data && (
            <div className="grid gap-2">
              {products.data.map((product) => {
                const inOrder = orderItems.find((i) => i.product.id === product.id)
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 text-card-foreground"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.price.toLocaleString('vi-VN')}₫</p>
                    </div>
                    {!inOrder ? (
                      <Button size="sm" className="min-h-9 min-w-9" onClick={() => addItem(product)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-9 min-w-9"
                          onClick={() => updateQuantity(product.id, inOrder.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{inOrder.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-9 min-w-9"
                          onClick={() => updateQuantity(product.id, inOrder.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col gap-3 border-t bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tổng cộng:</span>
            <span className="text-lg font-semibold">{calculateTotal().toLocaleString('vi-VN')}₫</span>
          </div>

          {orderItems.length > 0 && (
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.product.id} className="flex items-start gap-2 rounded border bg-muted p-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x {item.product.price.toLocaleString('vi-VN')}₫
                    </p>
                    {item.notes && <p className="text-xs text-muted-foreground">Ghi chú: {item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button className="min-h-11 w-full" onClick={handleSubmit} disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
          </Button>

          {createOrder.isError && <p className="text-sm text-destructive">{createOrder.error.message}</p>}
        </div>
      )}
    </section>
  )
}
