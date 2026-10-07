import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCategories, useCreateProduct, useUpdateProduct, useUploadProductImage } from '@/api/hooks'
import type { Product, ProductInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/format-price'
import { ProductImageField } from './product-image-field'

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
  const upload = useUploadProductImage()

  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(product ? (product.categoryId ?? '') : (defaultCategoryId ?? ''))
  const [pendingImage, setPendingImage] = useState<Blob | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  // Set once a new product is created, so a retry after a failed image upload updates it instead of duplicating it.
  const [createdId, setCreatedId] = useState<string | null>(null)
  const savedId = product?.id ?? createdId
  const mutation = savedId ? update : create
  const isPending = update.isPending || create.isPending || upload.isPending
  const error = upload.isError ? upload.error : mutation.isError ? mutation.error : null
  const [isActive, setIsActive] = useState(product?.isActive ?? true)

  const priceValue = price === '' ? null : Number(price)
  const priceError = priceValue !== null && priceValue > MAX_PRICE ? 'Giá tối đa 100.000.000 ₫.' : null
  const canSubmit = !!name.trim() && priceValue !== null && !priceError

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const input: ProductInput = {
      name: name.trim(),
      price: priceValue,
      categoryId: categoryId || null,
      // Untouched image: leave it out of the update. A replacement is uploaded below and sets the URL itself.
      imageUrl: null,
      isActive,
    }
    try {
      let id = savedId
      if (id) {
        const { imageUrl: _, ...rest } = input
        await update.mutateAsync({ id, input: imageRemoved && !pendingImage ? input : rest })
      } else {
        id = (await create.mutateAsync(input)).id
        setCreatedId(id)
      }
      if (pendingImage) {
        await upload.mutateAsync({ id, image: pendingImage })
      }
      onDone()
    } catch {
      // Shown through `error`.
    }
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

      <ProductImageField
        currentUrl={product?.imageUrl ?? null}
        pending={pendingImage}
        removed={imageRemoved}
        disabled={isPending}
        onPick={(image) => {
          setPendingImage(image)
          setImageRemoved(false)
        }}
        onRemove={() => {
          setPendingImage(null)
          setImageRemoved(true)
        }}
      />

      <div className="flex min-h-11 items-center justify-between gap-4">
        <Label htmlFor="product-active">Đang bán</Label>
        <Switch id="product-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {upload.isError ? `Đã lưu sản phẩm nhưng tải ảnh lên thất bại: ${error.message}` : error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={isPending || !canSubmit}>
        {isPending && <Loader2 className="animate-spin" />}
        {savedId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
      </Button>
    </form>
  )
}
