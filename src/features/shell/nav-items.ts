import type { UserRole } from '@/api/types'
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  ScanFace,
  Package,
  QrCode,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  /** Route path, relative to the app root. */
  to: string
  label: string
  icon: LucideIcon
  /** Hidden for other roles; omitted = every role. */
  roles?: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/products', label: 'Sản phẩm', icon: Package, roles: ['admin'] },
  { to: '/check-in', label: 'Chấm công', icon: ScanFace, roles: ['staff', 'cashier'] },
  { to: '/schedules/register', label: 'Đăng ký ca làm', icon: Calendar, roles: ['staff'] },
  { to: '/tables', label: 'Bàn', icon: QrCode, roles: ['admin'] },
  { to: '/staff', label: 'Nhân sự', icon: Users, roles: ['admin'] },
]
