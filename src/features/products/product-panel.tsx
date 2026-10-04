import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCategories, useDeleteProduct, useProducts, useUpdateProduct } from '@/api/hooks'
import type { Product } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import { ProductFormSheet } from './product-form-sheet'

/** Filter value for products without a category. */
const UNCATEGORIZED = 'none'

type FormTarget = { product: Product | null } | null

export function ProductPanel() {
  const products = useProducts()
  const categories = useCategories()
  const remove = useDeleteProduct()
  const toggle = useUpdateProduct()
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState<FormTarget>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const categoryName = new Map(categories.data?.map((c) => [c.id, c.name]))
  const visible = products.data?.filter((p) =>
    filter === 'all' ? true : filter === UNCATEGORIZED ? p.categoryId === null : p.categoryId === filter,
  )

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="min-h-11 self-start"
        onClick={() => setForm({ product: null })}
      >
        <Plus />
        Thêm sản phẩm
      </Button>

      {/* Horizontal chips: one scroll row instead of a dropdown, easy on touch. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Lọc theo danh mục">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          Tất cả
        </FilterChip>
        {categories.data?.map((category) => (
          <FilterChip key={category.id} active={filter === category.id} onClick={() => setFilter(category.id)}>
            {category.name}
          </FilterChip>
        ))}
        <FilterChip active={filter === UNCATEGORIZED} onClick={() => setFilter(UNCATEGORIZED)}>
          Chưa phân loại
        </FilterChip>
      </div>

      {products.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
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

      {visible?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Không có sản phẩm nào.</p>
      )}

      {toggle.isError && (
        <p role="alert" className="text-sm text-destructive">
          {toggle.error.message}
        </p>
      )}

      {/* Mobile: cards. md and up: table. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {visible?.map((product) => (
          <li key={product.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground">
            <Thumb product={product} />
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-medium', !product.isActive && 'text-muted-foreground')}>{product.name}</p>
              <p className="text-sm">{formatPrice(product.price)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {(product.categoryId && categoryName.get(product.categoryId)) || 'Chưa phân loại'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <ActiveSwitch product={product} disabled={toggle.isPending} onChange={(isActive) => toggle.mutate({ id: product.id, input: { isActive } })} />
              <div className="flex">
                <EditButton product={product} onClick={() => setForm({ product })} />
                <DeleteButton product={product} onClick={() => setToDelete(product)} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visible && visible.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Sản phẩm</th>
                <th className="px-3 py-2 font-medium">Danh mục</th>
                <th className="px-3 py-2 text-right font-medium">Giá</th>
                <th className="px-3 py-2 font-medium">Đang bán</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Thumb product={product} />
                      <span className={cn('font-medium', !product.isActive && 'text-muted-foreground')}>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {product.categoryId ? (
                      <Badge variant="secondary">{categoryName.get(product.categoryId) ?? '—'}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Chưa phân loại</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPrice(product.price)}</td>
                  <td className="px-3 py-2">
                    <ActiveSwitch product={product} disabled={toggle.isPending} onChange={(isActive) => toggle.mutate({ id: product.id, input: { isActive } })} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <EditButton product={product} onClick={() => setForm({ product })} />
                      <DeleteButton product={product} onClick={() => setToDelete(product)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormSheet
        product={form?.product ?? null}
        open={!!form}
        defaultCategoryId={filter !== 'all' && filter !== UNCATEGORIZED ? filter : null}
        onClose={() => setForm(null)}
      />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa sản phẩm "${toDelete?.name ?? ''}"?`}
        description="Sản phẩm đã có trong đơn hàng không thể xóa; hãy tắt 'Đang bán' để ẩn khỏi thực đơn."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      aria-pressed={active}
      className="min-h-11 shrink-0 rounded-full px-4"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function Thumb({ product }: { product: Product }) {
  return product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt=""
      loading="lazy"
      className="size-12 shrink-0 rounded-lg bg-muted object-cover"
    />
  ) : (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <ImageOff className="size-5" />
    </div>
  )
}

function ActiveSwitch({
  product,
  disabled,
  onChange,
}: {
  product: Product
  disabled: boolean
  onChange: (isActive: boolean) => void
}) {
  return (
    <Switch
      checked={product.isActive}
      disabled={disabled}
      aria-label={`${product.isActive ? 'Tắt' : 'Bật'} bán ${product.name}`}
      onCheckedChange={onChange}
    />
  )
}

function EditButton({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`Sửa ${product.name}`} onClick={onClick}>
      <Pencil />
    </Button>
  )
}

function DeleteButton({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-destructive" aria-label={`Xóa ${product.name}`} onClick={onClick}>
      <Trash2 />
    </Button>
  )
}
