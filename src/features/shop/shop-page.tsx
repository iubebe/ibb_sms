import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useBranch, useUpdateBranch } from '@/api/hooks'
import type { Branch } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

/** Admin only (see `RoleRoute` in `src/router.tsx`). */
export function ShopPage() {
  const branch = useBranch()

  return (
    <section className="flex max-w-lg flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Thông tin cửa hàng</h2>
        <p className="text-sm text-muted-foreground">Tên cửa hàng hiện trên ứng dụng, hóa đơn và trang gọi món.</p>
      </div>

      {branch.isPending ? (
        <Skeleton className="h-40" />
      ) : branch.isError ? (
        <div role="alert" className="flex flex-col gap-2 text-sm text-destructive">
          <p>Lỗi: {branch.error.message}</p>
          <Button variant="outline" className="min-h-11 w-fit" onClick={() => branch.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <ShopForm key={`${branch.data.name}|${branch.data.address}`} branch={branch.data} />
      )}
    </section>
  )
}

function ShopForm({ branch }: { branch: Branch }) {
  const update = useUpdateBranch()
  const [name, setName] = useState(branch.name)
  const [address, setAddress] = useState(branch.address ?? '')

  const trimmed = name.trim()
  const dirty = trimmed !== branch.name || address.trim() !== (branch.address ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!trimmed || !dirty) return
    update.mutate({ name: trimmed, address: address.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shop-name">Tên cửa hàng</Label>
        <Input
          id="shop-name"
          className="min-h-11 text-base"
          maxLength={100}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shop-address">Địa chỉ (không bắt buộc)</Label>
        <Input
          id="shop-address"
          className="min-h-11 text-base"
          maxLength={255}
          autoComplete="off"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {update.isError && (
        <p role="alert" className="text-sm text-destructive">
          {update.error.message}
        </p>
      )}
      {update.isSuccess && !dirty && (
        <p role="status" className="text-sm text-muted-foreground">
          Đã lưu.
        </p>
      )}

      <Button type="submit" className="min-h-12 w-full text-base" disabled={!trimmed || !dirty || update.isPending}>
        {update.isPending && <Loader2 className="animate-spin" />}
        Lưu thay đổi
      </Button>
    </form>
  )
}
