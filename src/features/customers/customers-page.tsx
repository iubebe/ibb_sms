import { MapPin, Pencil, Phone, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCustomers, useDeleteCustomer } from '@/api/hooks'
import type { Customer } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatDateTime } from '@/lib/format-time'
import { CustomerFormSheet } from './customer-form-sheet'

/** Admin only (see `RoleRoute` in `src/router.tsx`). Customers are created by orders. */
export function CustomersPage() {
  const [search, setSearch] = useState('')
  const customers = useCustomers(search.trim())
  const remove = useDeleteCustomer()
  const [editing, setEditing] = useState<Customer | null>(null)
  const [toDelete, setToDelete] = useState<Customer | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Khách hàng</h2>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm theo tên, số điện thoại, địa chỉ"
          aria-label="Tìm khách hàng"
          className="h-11 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {customers.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {customers.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{customers.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void customers.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {customers.data?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search.trim()
            ? 'Không tìm thấy khách hàng.'
            : 'Chưa có khách hàng. Khách hàng được tạo khi nhập thông tin lúc tạo đơn.'}
        </p>
      )}

      <ul className="grid gap-2 md:grid-cols-2">
        {customers.data?.map((customer) => (
          <li
            key={customer.id}
            className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground"
          >
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <p className="wrap-break-word font-medium">{customer.name ?? 'Chưa có tên'}</p>
                {customer.phone && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    {customer.phone}
                  </p>
                )}
                {customer.address && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span className="min-w-0 wrap-break-word">{customer.address}</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label={`Sửa ${customer.name ?? customer.phone ?? 'khách hàng'}`}
                onClick={() => setEditing(customer)}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 text-destructive"
                aria-label={`Xóa ${customer.name ?? customer.phone ?? 'khách hàng'}`}
                onClick={() => setToDelete(customer)}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-t pt-2 text-sm">
              <span className="text-muted-foreground">
                {customer.orderCount} đơn
                {customer.lastOrderAt && ` · gần nhất ${formatDateTime(customer.lastOrderAt)}`}
              </span>
              <span className="font-semibold tabular-nums">{formatPrice(customer.totalSpent)}</span>
            </div>
          </li>
        ))}
      </ul>

      <CustomerFormSheet customer={editing} onClose={() => setEditing(null)} />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa "${toDelete?.name ?? toDelete?.phone ?? 'khách hàng'}"?`}
        description="Các đơn của khách này vẫn được giữ lại cùng thông tin đã nhập."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </section>
  )
}
