import { Loader2, Plus, Wifi } from 'lucide-react'
import { useState } from 'react'
import { useDeleteWifi, useWifiList } from '@/api/hooks'
import type { WifiNetwork } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WifiCard } from './wifi-card'
import { WifiFormSheet } from './wifi-form-sheet'

type FormTarget = { network: WifiNetwork | null } | null

/** Admin only (see `RoleRoute` in `src/router.tsx`). */
export function WifiPage() {
  const networks = useWifiList()
  const remove = useDeleteWifi()
  const [form, setForm] = useState<FormTarget>(null)
  const [toDelete, setToDelete] = useState<WifiNetwork | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  const list = networks.data ?? []

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">WiFi cho khách</h2>
          <p className="text-sm text-muted-foreground">
            Mạng đang bật được in dưới mã QR của từng bàn. Hệ thống không lưu mật khẩu, chỉ lưu mã QR.
          </p>
        </div>
        {list.length > 0 && (
          <Button className="min-h-11 shrink-0" onClick={() => setForm({ network: null })}>
            <Plus />
            Thêm
          </Button>
        )}
      </div>

      {networks.isPending ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-72" />
        </div>
      ) : networks.isError ? (
        <div role="alert" className="flex flex-col gap-2 text-sm text-destructive">
          <p>Lỗi: {networks.error.message}</p>
          <Button variant="outline" className="min-h-11 w-fit" onClick={() => networks.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <Wifi className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chưa có mạng WiFi nào.</p>
          <Button className="min-h-11" onClick={() => setForm({ network: null })}>
            Thêm mạng WiFi đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((network) => (
            <WifiCard
              key={network.id}
              network={network}
              onRotate={() => setForm({ network })}
              onDelete={() => setToDelete(network)}
            />
          ))}
        </div>
      )}

      {networks.isFetching && !networks.isPending && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Đang cập nhật...
        </p>
      )}

      <WifiFormSheet network={form?.network ?? null} open={form !== null} onClose={() => setForm(null)} />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa mạng WiFi "${toDelete?.ssid ?? ''}"?`}
        description="Mã QR WiFi sẽ bị xóa và không còn được in trên mã QR bàn."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </section>
  )
}
