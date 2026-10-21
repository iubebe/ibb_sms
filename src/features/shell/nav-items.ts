import type { UserRole } from "@/api/types";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  ScanFace,
  Package,
  Contact,
  Store,
  QrCode,
  Trash2,
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
  /** Pinned to the mobile bottom bar (the sheet menu and sidebar list everything). */
  bottom?: boolean;
  /** Label for the narrow bottom bar tab; falls back to `label`. */
  shortLabel?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, bottom: true },
  { to: "/orders", label: "Đơn hàng", icon: ClipboardList, bottom: true },
  {
    to: "/products",
    label: "Sản phẩm",
    icon: Package,
    roles: ["admin"],
    bottom: true,
  },
  {
    to: "/check-in",
    label: "Chấm công",
    icon: ScanFace,
    roles: ["staff", "cashier"],
    bottom: true,
  },
  {
    to: "/schedules/register",
    label: "Đăng ký ca làm",
    icon: Calendar,
    roles: ["staff"],
    bottom: true,
    shortLabel: "Ca làm",
  },
  {
    to: "/orders/history",
    label: "Lịch sử đơn",
    icon: History,
    roles: ["admin", "staff"],
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
    to: "/customers",
    label: "Khách hàng",
    icon: Contact,
    roles: ["admin"],
  },
  {
    to: "/payment-qr",
    label: "Mã QR",
    icon: CreditCard,
    roles: ["admin"],
    hiddenInNav: true,
  },
  {
    to: "/stock",
    label: "Kho",
    icon: Warehouse,
    roles: ["admin"],
    bottom: true,
  },
  { to: "/stock/drafts", label: "Nhập hàng", icon: Warehouse, roles: ["staff"] },
  { to: "/stock/write-offs", label: "Hủy hàng", icon: Trash2, roles: ["staff"] },
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

/** Roles that can create orders; they get the centre shortcut on the bottom bar. */
export const CREATE_ORDER_ROLES: UserRole[] = ["admin", "staff"];
