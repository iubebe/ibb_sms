/** Response shapes of `ibb_shop_backend` (`src/auth`, `src/modules/orders/orders.types.ts`). */

export type UserRole = 'admin' | 'staff' | 'cashier'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  branchId: string
  /** When true, only change-password/me/logout work until the password is changed. */
  mustChangePassword: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  /** 10-128 characters */
  newPassword: string
}

export type OrderStatus = 'pending_confirmation' | 'confirmed' | 'paid' | 'cancelled'

export interface StaffOrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  /** Units already delivered to the table (0..quantity). */
  servedQuantity: number
  notes: string | null
}

export interface StaffOrder {
  id: string
  status: OrderStatus
  tableId: string | null
  tableName: string | null
  /** VND */
  total: number
  /** ISO timestamp */
  createdAt: string
  confirmedAt: string | null
  items: StaffOrderItem[]
}

export interface CreateOrderItemInput {
  productId: string
  quantity: number
  notes?: string
}

export interface CreateOrderStaffInput {
  tableId: string
  items: CreateOrderItemInput[]
}

export type PaymentMethod = 'cash' | 'qr_manual'

export interface PaymentQrCode {
  id: string
  label: string
  imagePath: string
  isActive: boolean
}

/** Result of confirm / cancel / pay on an order. */
export interface OrderTransition {
  id: string
  status: OrderStatus
  confirmedAt: string | null
  paidAt: string | null
  paymentMethod: PaymentMethod | null
}

export interface ServedItem {
  id: string
  quantity: number
  servedQuantity: number
}

/** `ibb_shop_backend/src/modules/categories` (admin only). */
export interface Category {
  id: string
  name: string
  /** Products in the category, active or not. */
  productCount: number
  createdAt: string
}

export interface CategoryInput {
  name: string
}

/** `ibb_shop_backend/src/modules/tables` (admin only). */
export interface DiningTable {
  id: string
  name: string
  /** Printed in the table QR as `{guest app}/t/{qrToken}`. */
  qrToken: string
  createdAt: string
}

export interface TableInput {
  name: string
}

export interface TableQrPdfOptions {
  columns: number
  rows: number
}

/** `ibb_shop_backend/src/modules/products` (admin only). */
export interface Product {
  id: string
  categoryId: string | null
  name: string
  /** VND, whole number */
  price: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  price: number
  /** `null` = uncategorized */
  categoryId: string | null
  /** `null` = no image */
  imageUrl: string | null
  isActive: boolean
}

/** `ibb_shop_backend/src/modules/dashboard` (all roles; `sales` is admin only). */
export interface DashboardQueue {
  pendingConfirmation: number
  confirmed: number
  /** Units still to deliver across confirmed orders. */
  unservedItems: number
}

export interface DashboardRecentOrder {
  id: string
  status: OrderStatus
  tableName: string | null
  total: number
  itemCount: number
  createdAt: string
}

export interface DashboardTopProduct {
  productId: string
  name: string
  quantity: number
  revenue: number
}

export interface DashboardSales {
  revenue: number
  paidOrders: number
  topProducts: DashboardTopProduct[]
}

export interface Dashboard {
  /** Start of the shop-local day the figures cover (ISO). */
  since: string
  queue: DashboardQueue
  recentOrders: DashboardRecentOrder[]
  /** `null` unless the user is an admin. */
  sales: DashboardSales | null
}

/** `ibb_shop_backend/src/modules/users` (admin only). */
export interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  /** Still on a temporary password. */
  mustChangePassword: boolean
  createdAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  role: UserRole
  /** Temporary password, 10-128 characters; the user changes it at first login. */
  password: string
}

export type UpdateUserInput = Partial<Pick<ManagedUser, 'name' | 'email' | 'role' | 'isActive'>>

export type FaceCheckStatus = 'pending' | 'passed' | 'failed'
/** `incomplete` = open longer than the max shift, i.e. a forgotten check-out. */
export type AttendanceStatus = 'open' | 'completed' | 'incomplete'
export type AttendancePhotoKind = 'check-in' | 'check-out'

/** `ibb_shop_backend/src/modules/attendance`. */
export interface AttendanceRecord {
  id: string
  userId: string
  /** Only filled on admin lists. */
  userName: string | null
  checkInAt: string
  checkOutAt: string | null
  /** Worked minutes; `null` until the session is completed. */
  minutes: number | null
  status: AttendanceStatus
  checkInFaceStatus: FaceCheckStatus
  checkOutFaceStatus: FaceCheckStatus
  hasCheckOutPhoto: boolean
  /** An admin corrected the times. */
  adjusted: boolean
}

export interface MonthTotals {
  /** Calendar days with at least one session. */
  days: number
  sessions: number
  /** Completed sessions only. */
  minutes: number
  /** Forgotten check-outs. */
  incomplete: number
}

export interface MyAttendance {
  timezone: string
  state: 'idle' | 'checked_in'
  open: { id: string; checkInAt: string } | null
  today: { minutes: number; sessions: number }
  month: MonthTotals & { month: string }
  recent: AttendanceRecord[]
}

export interface AttendanceSummaryRow extends MonthTotals {
  userId: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface AttendanceReport {
  month: string
  rows: AttendanceSummaryRow[]
}

export interface AdjustAttendanceInput {
  /** ISO timestamps */
  checkInAt?: string
  checkOutAt?: string
}
