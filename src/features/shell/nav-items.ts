import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  /** Route path, relative to the app root. */
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/products', label: 'Sản phẩm', icon: Package },
  { to: '/staff', label: 'Nhân sự', icon: Users },
]
