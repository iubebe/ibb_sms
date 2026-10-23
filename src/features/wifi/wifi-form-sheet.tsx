import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateWifi, useReplaceWifiCredentials } from '@/api/hooks'
import type { WifiNetwork, WifiSecurity } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { WIFI_SECURITY_LABELS } from './wifi-labels'

interface WifiFormSheetProps {
  /** `null` = adding a network; otherwise the network whose password is being changed. */
  network: WifiNetwork | null
  open: boolean
  onClose: () => void
}

export function WifiFormSheet({ network, open, onClose }: WifiFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remounts per open, so the typed password never outlives the sheet. */}
        {open && <WifiForm key={network?.id ?? 'new'} network={network} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

/** Client-side mirror of the backend rules; the backend stays the authority. */
function passwordError(security: WifiSecurity, password: string): string | null {
  if (security === 'nopass') return null
  const hex = /^[0-9a-fA-F]+$/.test(password)
  if (security === 'WPA') {
    const ok = (password.length >= 8 && password.length <= 63) || (password.length === 64 && hex)
    return ok ? null : 'Mật khẩu WPA gồm 8-63 ký tự.'
  }
  const ok = [5, 13].includes(password.length) || ([10, 26].includes(password.length) && hex)
  return ok ? null : 'Khóa WEP gồm 5 hoặc 13 ký tự.'
}

function WifiForm({ network, onDone }: { network: WifiNetwork | null; onDone: () => void }) {
  const create = useCreateWifi()
  const replace = useReplaceWifiCredentials()
  const isCreate = network === null

  const [ssid, setSsid] = useState(network?.ssid ?? '')
  const [security, setSecurity] = useState<WifiSecurity>(network?.security ?? 'WPA')
  const [hidden, setHidden] = useState(network?.hidden ?? false)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const trimmedSsid = ssid.trim()
  const ssidValid = trimmedSsid !== '' && new TextEncoder().encode(trimmedSsid).length <= 32
  const pwError = password === '' && security !== 'nopass' ? 'required' : passwordError(security, password)
  const valid = ssidValid && pwError === null
  const mutation = isCreate ? create : replace
  const busy = mutation.isPending

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || busy) return
    const input = {
      ssid: trimmedSsid,
      security,
      hidden,
      ...(security === 'nopass' ? {} : { password }),
    }
    try {
      if (isCreate) await create.mutateAsync(input)
      else await replace.mutateAsync({ id: network.id, input })
      setPassword('')
      onDone()
    } catch {
      // surfaced below via mutation.error
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>{isCreate ? 'Thêm mạng WiFi' : 'Đổi mật khẩu WiFi'}</SheetTitle>
        <SheetDescription>
          Mật khẩu chỉ được dùng một lần để tạo mã QR và không được lưu lại. Muốn đổi, nhập lại thông tin đầy đủ.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wifi-ssid">Tên mạng (SSID)</Label>
        <Input
          id="wifi-ssid"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="h-11 text-base"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          disabled={busy}
        />
        {ssid !== '' && !ssidValid && (
          <p role="alert" className="text-sm text-destructive">
            Tên mạng tối đa 32 byte.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wifi-security">Bảo mật</Label>
        <select
          id="wifi-security"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          value={security}
          onChange={(e) => setSecurity(e.target.value as WifiSecurity)}
          disabled={busy}
        >
          {(Object.keys(WIFI_SECURITY_LABELS) as WifiSecurity[]).map((value) => (
            <option key={value} value={value}>
              {WIFI_SECURITY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {security !== 'nopass' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="wifi-password">Mật khẩu WiFi</Label>
          <div className="flex gap-2">
            <Input
              id="wifi-password"
              required
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={64}
              className="h-11 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11 min-w-11"
              aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShow((v) => !v)}
            >
              {show ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          {password !== '' && pwError && pwError !== 'required' && (
            <p role="alert" className="text-sm text-destructive">
              {pwError}
            </p>
          )}
        </div>
      )}

      <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
        <span>Mạng ẩn (không phát tên)</span>
        <Switch checked={hidden} onCheckedChange={setHidden} disabled={busy} />
      </label>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          Lỗi: {mutation.error.message}
        </p>
      )}

      <Button type="submit" className="min-h-11 w-full" disabled={!valid || busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? 'Đang tạo mã QR...' : isCreate ? 'Thêm mạng WiFi' : 'Lưu mật khẩu mới'}
      </Button>
    </form>
  )
}
