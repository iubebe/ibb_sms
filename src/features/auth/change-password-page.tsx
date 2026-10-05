import { Loader2, Store } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useChangePassword, useLogout } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MIN_LENGTH = 10
const MAX_LENGTH = 128

/** Shown while `user.mustChangePassword` is true; all other API calls return 403 until done. */
export function ChangePasswordPage() {
  const change = useChangePassword()
  const logout = useLogout()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_LENGTH
  const tooLong = newPassword.length > MAX_LENGTH
  const mismatch = confirm.length > 0 && confirm !== newPassword
  const localError = tooShort
    ? `Mật khẩu mới tối thiểu ${MIN_LENGTH} ký tự.`
    : tooLong
      ? `Mật khẩu mới tối đa ${MAX_LENGTH} ký tự.`
      : mismatch
        ? 'Mật khẩu xác nhận không khớp.'
        : null
  const canSubmit =
    !!currentPassword && newPassword.length >= MIN_LENGTH && !tooLong && confirm === newPassword

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (canSubmit) change.mutate({ currentPassword, newPassword })
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Store className="size-5" />
            Iubebe SMS
          </div>
          <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
          <CardDescription>Bạn cần đặt mật khẩu mới trong lần đăng nhập đầu tiên.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="h-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={tooShort || tooLong}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Nhập lại mật khẩu mới</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="h-11"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={mismatch}
              />
            </div>
            {(localError || change.isError) && (
              <p role="alert" className="text-sm text-destructive">
                {localError ?? change.error?.message}
              </p>
            )}
            <Button type="submit" className="min-h-11 w-full" disabled={change.isPending || !canSubmit}>
              {change.isPending && <Loader2 className="animate-spin" />}
              Đổi mật khẩu
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 w-full"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Đăng xuất
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
