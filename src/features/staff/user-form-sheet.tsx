import { Dices, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateUser, useMe, useUpdateUser } from '@/api/hooks'
import type { ManagedUser, UserRole } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { generatePassword } from './generate-password'
import { ROLE_LABEL, ROLE_OPTIONS } from './role-labels'

interface UserFormSheetProps {
  /** `null` = creating a new account. */
  user: ManagedUser | null
  open: boolean
  onClose: () => void
}

export function UserFormSheet({ user, open, onClose }: UserFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remount per target so the form starts from the right values. */}
        {open && <UserForm key={user?.id ?? 'new'} user={user} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function UserForm({ user, onDone }: { user: ManagedUser | null; onDone: () => void }) {
  const { data: me } = useMe()
  const create = useCreateUser()
  const update = useUpdateUser()
  const mutation = user ? update : create
  // The backend refuses self role/disable changes; don't offer them.
  const isSelf = !!user && user.id === me?.id

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'staff')
  const [isActive, setIsActive] = useState(user?.isActive ?? true)
  const [password, setPassword] = useState(() => (user ? '' : generatePassword()))

  const valid = name.trim() !== '' && email.trim() !== '' && (user !== null || password.length >= 10)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const base = { name: name.trim(), email: email.trim() }
    if (user) {
      update.mutate({ id: user.id, input: { ...base, role, isActive } }, { onSuccess: onDone })
    } else {
      create.mutate({ ...base, role, password }, { onSuccess: onDone })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>{user ? 'Sửa tài khoản' : 'Thêm tài khoản'}</SheetTitle>
        <SheetDescription>
          {user ? 'Đổi vai trò hoặc khóa tài khoản sẽ đăng xuất người dùng.' : 'Người dùng phải đổi mật khẩu ở lần đăng nhập đầu.'}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="user-name">Họ tên</Label>
        <Input id="user-name" required maxLength={100} autoComplete="off" className="h-11 text-base" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="user-email">Email đăng nhập</Label>
        <Input
          id="user-email"
          type="email"
          inputMode="email"
          required
          maxLength={254}
          autoComplete="off"
          className="h-11 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label id="user-role-label">Vai trò</Label>
        <div role="group" aria-labelledby="user-role-label" className="grid grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={role === option ? 'default' : 'outline'}
              aria-pressed={role === option}
              disabled={isSelf}
              className="min-h-11"
              onClick={() => setRole(option)}
            >
              {ROLE_LABEL[option]}
            </Button>
          ))}
        </div>
        {isSelf && <p className="text-xs text-muted-foreground">Bạn không thể đổi vai trò của chính mình.</p>}
      </div>

      {!user && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-password">Mật khẩu tạm</Label>
          <div className="flex gap-2">
            <Input
              id="user-password"
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
      )}

      {user && (
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor="user-active">Cho phép đăng nhập</Label>
          <Switch id="user-active" checked={isActive} disabled={isSelf} onCheckedChange={setIsActive} />
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}

      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !valid}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {user ? 'Lưu thay đổi' : 'Thêm tài khoản'}
      </Button>
    </form>
  )
}
