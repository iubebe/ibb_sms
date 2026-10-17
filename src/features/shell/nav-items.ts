import type { UserRole } from "@/api/types";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  ScanFace,
  Package,
  Store,
  QrCode,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Route path, relative to the app root. */
  to: string;
  label: string;
  icon: LucideIcon;
  /** Hidden for other roles; omitted = every role. */
  roles?: UserRole[];
  hiddenInNav?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/orders", label: "Đơn hàng", icon: ClipboardList },
  { to: "/products", label: "Sản phẩm", icon: Package, roles: ["admin"] },
  {
    to: "/check-in",
    label: "Chấm công",
    icon: ScanFace,
    roles: ["staff", "cashier"],
  },
  {
    to: "/schedules/register",
    label: "Đăng ký ca làm",
    icon: Calendar,
    roles: ["staff"],
  },
  {
    to: "/orders/history",
    label: "Lịch sử đơn",
    icon: History,
    roles: ["admin"],
    hiddenInNav: true,
  },
  {
    to: "/tables",
    label: "Bàn",
    icon: QrCode,
    roles: ["admin"],
    hiddenInNav: true,
  },
  {
    to: "/payment-qr",
    label: "Mã QR",
    icon: CreditCard,
    roles: ["admin"],
    hiddenInNav: true,
  },
  { to: "/stock", label: "Kho", icon: Warehouse, roles: ["admin"] },
  { to: "/finance", label: "Tài chính", icon: Wallet, roles: ["admin"] },
  { to: "/staff", label: "Nhân sự", icon: Users, roles: ["admin"] },
  {
    to: "/shop",
    label: "Cửa hàng",
    icon: Store,
    roles: ["admin"],
    hiddenInNav: true,
  },
];
