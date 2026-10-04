import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCategories, useCreateProduct, useUpdateProduct } from '@/api/hooks'
import type { Product, ProductInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/format-price'

interface ProductFormSheetProps {
  /** `null` = creating a new product. */
  product: Product | null
  open: boolean
  /** Category preselected when creating (the active list filter). */
  defaultCategoryId?: string | null
  onClose: () => void
}

export function ProductFormSheet({ product, open, defaultCategoryId, onClose }: ProductFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remount per target so the form starts from the right values. */}
        {open && (
          <ProductForm
            key={product?.id ?? 'new'}
            product={product}
            defaultCategoryId={defaultCategoryId ?? null}
            onDone={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

const MAX_PRICE = 100_000_000

function ProductForm({
  product,
  defaultCategoryId,
  onDone,
}: {
  product: Product | null
  defaultCategoryId: string | null
  onDone: () => void
}) {
  const categories = useCategories()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const mutation = product ? update : create

  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(product ? (product.categoryId ?? '') : (defaultCategoryId ?? ''))
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)

  const priceValue = price === '' ? null : Number(price)
  const priceError = priceValue !== null && priceValue > MAX_PRICE ? 'Giá tối đa 100.000.000 ₫.' : null
  const canSubmit = !!name.trim() && priceValue !== null && !priceError

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const input: ProductInput = {
      name: name.trim(),
      price: priceValue,
      categoryId: categoryId || null,
      imageUrl: imageUrl.trim() || null,
      isActive,
    }
    if (product) update.mutate({ id: product.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</SheetTitle>
        <SheetDescription>Sản phẩm đang tắt sẽ không hiện trên thực đơn của khách.</SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-name">Tên sản phẩm</Label>
        <Input
          id="product-name"
          required
          maxLength={150}
          autoComplete="off"
          className="h-11"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-price">Giá (₫)</Label>
        <Input
          id="product-price"
          required
          inputMode="numeric"
          autoComplete="off"
          className="h-11"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 9))}
          aria-invalid={!!priceError}
        />
        <p className={priceError ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
          {priceError ?? (priceValue !== null ? formatPrice(priceValue) : 'Nhập số tiền, không dấu chấm.')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-category">Danh mục</Label>
        <select
          id="product-category"
          className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Chưa phân loại</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-image">Ảnh (đường dẫn URL)</Label>
        <Input
          id="product-image"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoComplete="off"
          placeholder="https://"
          className="h-11"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4">
        <Label htmlFor="product-active">Đang bán</Label>
        <Switch id="product-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !canSubmit}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
      </Button>
    </form>
  )
}
