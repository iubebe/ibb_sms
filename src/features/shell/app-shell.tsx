import { LogOut, Menu, Store } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

interface AppShellProps {
  userName: string
  onLogout: () => void
}

/**
 * Layout route for every authenticated page; pages render in the `<Outlet />`.
 * Mobile: sticky top bar + bottom tab bar (thumb reach).
 * md and up: fixed sidebar, no bottom bar.
 */
export function AppShell({ userName, onLogout }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const title = NAV_ITEMS.find((item) => isActive(item.to, pathname))?.label

  return (
    <div className="min-h-svh md:grid md:grid-cols-[14rem_1fr]">
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
        <div className="sticky top-0 flex h-svh flex-col gap-4 p-4">
          <Brand />
          <SideNav />
          <UserMenu userName={userName} onLogout={onLogout} className="mt-auto" />
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  aria-label="Mở menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <SideNav className="px-4" onNavigate={() => setMenuOpen(false)} />
              <UserMenu
                userName={userName}
                onLogout={onLogout}
                className="mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              />
            </SheetContent>
          </Sheet>
          <h1 className="truncate text-base font-semibold">{title}</h1>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
          <Outlet />
        </main>

        <nav
          aria-label="Điều hướng chính"
          className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs transition-colors active:bg-muted',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

function isActive(to: string, pathname: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

function SideNav({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              buttonVariants({ variant: isActive ? 'secondary' : 'ghost' }),
              'min-h-11 justify-start gap-3 px-3',
            )
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <Store className="size-5" />
      Iubebe SMS
    </div>
  )
}

function UserMenu({
  userName,
  onLogout,
  className,
}: {
  userName: string
  onLogout: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="truncate text-sm text-muted-foreground">{userName}</p>
      <Button variant="outline" className="min-h-11 justify-start gap-3 px-3" onClick={onLogout}>
        <LogOut />
        Đăng xuất
      </Button>
    </div>
  )
}
