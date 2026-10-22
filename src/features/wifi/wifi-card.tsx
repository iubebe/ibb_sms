import { KeyRound, Trash2 } from 'lucide-react'
import { useSetWifiActive, wifiImageUrl } from '@/api/hooks'
import type { WifiNetwork } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { WIFI_SECURITY_LABELS } from './wifi-labels'

interface WifiCardProps {
  network: WifiNetwork
  onRotate: () => void
  onDelete: () => void
}

export function WifiCard({ network, onRotate, onDelete }: WifiCardProps) {
  const toggle = useSetWifiActive()

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-3">
      <img
        src={wifiImageUrl(network.id, network.updatedAt)}
        alt={`Mã QR WiFi ${network.ssid}`}
        loading="lazy"
        className="aspect-square w-full max-w-full rounded-md bg-white object-contain p-2"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{network.ssid}</p>
          <p className="truncate text-xs text-muted-foreground">
            {WIFI_SECURITY_LABELS[network.security]}
            {network.hidden && ' · Mạng ẩn'}
          </p>
          <Badge variant={network.isActive ? 'default' : 'secondary'} className="mt-1">
            {network.isActive ? 'Đang in trên mã QR bàn' : 'Đang tắt'}
          </Badge>
        </div>
        <label className="flex min-h-11 min-w-11 items-center justify-center gap-2 text-sm">
          <span className="sr-only">In mã WiFi {network.ssid} trên mã QR bàn</span>
          <Switch
            checked={network.isActive}
            disabled={toggle.isPending}
            onCheckedChange={(next) => toggle.mutate({ id: network.id, isActive: next })}
          />
        </label>
      </div>

      {toggle.isError && (
        <p role="alert" className="text-xs text-destructive">
          Lỗi: {toggle.error.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="min-h-11 flex-1 text-sm" onClick={onRotate}>
          <KeyRound className="size-4" />
          Đổi mật khẩu
        </Button>
        <Button variant="outline" className="min-h-11 flex-1 text-sm text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Xóa
        </Button>
      </div>
    </div>
  )
}
