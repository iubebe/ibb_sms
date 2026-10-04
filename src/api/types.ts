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
