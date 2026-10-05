import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteUser, useMe, useUsers } from '@/api/hooks'
import type { ManagedUser } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDeleteDialog } from '@/features/products/confirm-delete-dialog'
import { cn } from '@/lib/utils'
import { ResetPasswordSheet } from './reset-password-sheet'
import { ROLE_LABEL } from './role-labels'
import { UserFormSheet } from './user-form-sheet'

type FormTarget = { user: ManagedUser | null } | null

export function UserPanel() {
  const users = useUsers()
  const { data: me } = useMe()
  const remove = useDeleteUser()
  const [form, setForm] = useState<FormTarget>(null)
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const [toDelete, setToDelete] = useState<ManagedUser | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-3">
      <Button className="min-h-11 self-start" onClick={() => setForm({ user: null })}>
        <Plus />
        Thêm tài khoản
      </Button>

      {users.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}

      {users.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{users.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void users.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {users.data?.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có tài khoản nào.</p>}

      {/* Mobile: cards. md and up: table. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {users.data?.map((user) => (
          <li key={user.id} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-card-foreground">
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-medium', !user.isActive && 'text-muted-foreground')}>{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <UserBadges user={user} className="mt-1" />
            </div>
            <UserActions
              user={user}
              isSelf={user.id === me?.id}
              onEdit={() => setForm({ user })}
              onReset={() => setResetTarget(user)}
              onDelete={() => setToDelete(user)}
            />
          </li>
        ))}
      </ul>

      {users.data && users.data.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Họ tên</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className={cn('px-3 py-2 font-medium', !user.isActive && 'text-muted-foreground')}>{user.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2">
                    <UserBadges user={user} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <UserActions
                        user={user}
                        isSelf={user.id === me?.id}
                        onEdit={() => setForm({ user })}
                        onReset={() => setResetTarget(user)}
                        onDelete={() => setToDelete(user)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserFormSheet user={form?.user ?? null} open={form !== null} onClose={() => setForm(null)} />
      <ResetPasswordSheet user={resetTarget} onClose={() => setResetTarget(null)} />
      <ConfirmDeleteDialog
        open={toDelete !== null}
        title={`Xóa ${toDelete?.name ?? 'tài khoản'}?`}
        description="Tài khoản đã có lịch sử chấm công không thể xóa; hãy khóa đăng nhập thay vào đó."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
        onClose={closeDelete}
      />
    </div>
  )
}

function UserBadges({ user, className }: { user: ManagedUser; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{ROLE_LABEL[user.role]}</Badge>
      {!user.isActive && <Badge variant="destructive">Đã khóa</Badge>}
      {user.mustChangePassword && <Badge variant="outline">Mật khẩu tạm</Badge>}
    </div>
  )
}

interface UserActionsProps {
  user: ManagedUser
  /** The backend refuses reset/delete on your own account. */
  isSelf: boolean
  onEdit: () => void
  onReset: () => void
  onDelete: () => void
}

function UserActions({ user, isSelf, onEdit, onReset, onDelete }: UserActionsProps) {
  return (
    <div className="flex">
      <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`Sửa ${user.name}`} onClick={onEdit}>
        <Pencil />
      </Button>
      {!isSelf && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={`Đặt lại mật khẩu ${user.name}`}
            onClick={onReset}
          >
            <KeyRound />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-destructive"
            aria-label={`Xóa ${user.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
  )
}
