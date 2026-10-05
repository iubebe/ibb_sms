import { Dices, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useResetUserPassword } from '@/api/hooks'
import type { ManagedUser } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { generatePassword } from './generate-password'

interface ResetPasswordSheetProps {
  user: ManagedUser | null
  onClose: () => void
}

export function ResetPasswordSheet({ user, onClose }: ResetPasswordSheetProps) {
  return (
    <Sheet open={user !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {user && <ResetForm key={user.id} user={user} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function ResetForm({ user, onDone }: { user: ManagedUser; onDone: () => void }) {
  const reset = useResetUserPassword()
  const [password, setPassword] = useState(() => generatePassword())

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    reset.mutate({ id: user.id, password }, { onSuccess: onDone })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>Đặt lại mật khẩu</SheetTitle>
        <SheetDescription>
          {user.name} sẽ bị đăng xuất và phải đổi mật khẩu khi đăng nhập lại.
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-password">Mật khẩu tạm</Label>
        <div className="flex gap-2">
          <Input
            id="reset-password"
            required
            minLength={10}
            maxLength={128}
            autoComplete="off"
            spellCheck={false}
            className="h-11 flex-1 font-mono text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Tạo mật khẩu ngẫu nhiên"
            onClick={() => setPassword(generatePassword())}
          >
            <Dices />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Ít nhất 10 ký tự. Hãy gửi mật khẩu này cho nhân viên.</p>
      </div>
      {reset.isError && (
        <p role="alert" className="text-sm text-destructive">
          {reset.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={reset.isPending || password.length < 10}>
        {reset.isPending && <Loader2 className="animate-spin" />}
        Đặt lại mật khẩu
      </Button>
    </form>
  )
}
