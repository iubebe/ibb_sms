import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Rendered inside the shell when the user's role may not open the page. */
export function ForbiddenPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <ShieldAlert className="size-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Không có quyền truy cập</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        Trang này chỉ dành cho quản trị viên.
      </p>
      <Link to="/" replace className={cn(buttonVariants(), 'min-h-11 px-6')}>
        Về trang chủ
      </Link>
    </section>
  )
}
