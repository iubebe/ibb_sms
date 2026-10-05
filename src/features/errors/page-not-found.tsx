import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PageNotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link to="/" replace className={cn(buttonVariants(), 'min-h-11 px-6')}>
        Về trang chủ
      </Link>
    </main>
  )
}
