import { Plus } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMe, useOrders } from "@/api/hooks";
import type { OrderStatus, StaffOrder } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { CheckoutSheet } from "./checkout-sheet";
import { OrderCard } from "./order-card";
import { TablePaymentPage } from "./table-payment-page";

/**
 * Order control. Admin/staff confirm, cancel and serve; admin/cashier check out.
 * Cashiers only see confirmed orders (nothing to do on the others).
 */
export function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();
  const role = me?.role;
  const canManage = role === "admin" || role === "staff";
  const canCheckout =
    role === "admin" || role === "staff" || role === "cashier";
  const canCreateOrder = role === "admin" || role === "staff";

  const [cancelTarget, setCancelTarget] = useState<StaffOrder | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<StaffOrder | null>(null);
  const defaultTab =
    (location.state as any)?.defaultTab ??
    (canManage ? "pending_confirmation" : "confirmed");
  const [selectedTab, setSelectedTab] = useState(defaultTab);

  const pending = useOrders("pending_confirmation");
  const confirmed = useOrders("confirmed");

  const cardProps = {
    canManage,
    canCheckout,
    onCancel: setCancelTarget,
    onCheckout: setCheckoutTarget,
  };

  const getTabLabel = (tabValue: string, count?: number) => {
    let label = "";
    if (tabValue === "pending_confirmation") {
      label = "Chờ xác nhận";
    } else if (tabValue === "confirmed") {
      label = canManage ? "Đang phục vụ" : "Chờ thanh toán";
    } else if (tabValue === "table_payment") {
      label = "Thanh toán theo bàn";
    }
    return count ? `${label} (${count})` : label;
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Đơn hàng</h2>
        {canCreateOrder && (
          <Button
            className="min-h-9 md:flex"
            onClick={() => navigate("/orders/create")}
          >
            <Plus />
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        {/* Mobile: Select dropdown */}
        <div className="md:hidden mb-4">
          <Select value={selectedTab} onValueChange={setSelectedTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {canManage && (
                <SelectItem value="pending_confirmation">
                  {getTabLabel("pending_confirmation", pending.data?.length)}
                </SelectItem>
              )}
              <SelectItem value="confirmed">
                {getTabLabel("confirmed", confirmed.data?.length)}
              </SelectItem>
              {canCheckout && (
                <SelectItem value="table_payment">
                  {getTabLabel("table_payment")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Horizontal tabs */}
        <TabsList className="hidden md:flex w-full">
          {canManage && (
            <TabsTrigger
              value="pending_confirmation"
              className="min-h-5 flex-1 px-6"
            >
              Chờ xác nhận
              {pending.data?.length ? ` (${pending.data.length})` : ""}
            </TabsTrigger>
          )}
          <TabsTrigger value="confirmed" className="min-h-5 flex-1 px-6">
            {canManage ? "Đang phục vụ" : "Chờ thanh toán"}
            {confirmed.data?.length ? ` (${confirmed.data.length})` : ""}
          </TabsTrigger>
          {canCheckout && (
            <TabsTrigger value="table_payment" className="min-h-5 flex-1 px-6">
              Thanh toán theo bàn
            </TabsTrigger>
          )}
        </TabsList>

        {canManage && (
          <TabsContent value="pending_confirmation" className="pt-3">
            <OrderList
              query={pending}
              status="pending_confirmation"
              {...cardProps}
            />
          </TabsContent>
        )}
        <TabsContent value="confirmed" className="pt-3">
          <OrderList query={confirmed} status="confirmed" {...cardProps} />
        </TabsContent>
        {canCheckout && (
          <TabsContent value="table_payment" className="pt-3">
            <TablePaymentPage />
          </TabsContent>
        )}
      </Tabs>

      <CancelOrderDialog
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
      />
      <CheckoutSheet
        order={checkoutTarget}
        onClose={() => setCheckoutTarget(null)}
      />
    </section>
  );
}

const EMPTY_TEXT: Partial<Record<OrderStatus, string>> = {
  pending_confirmation: "Không có đơn nào đang chờ xác nhận.",
  confirmed: "Không có đơn nào đang phục vụ.",
};

interface OrderListProps {
  query: ReturnType<typeof useOrders>;
  status: OrderStatus;
  canManage: boolean;
  canCheckout: boolean;
  onCancel: (order: StaffOrder) => void;
  onCheckout: (order: StaffOrder) => void;
}

function OrderList({ query, status, ...cardProps }: OrderListProps) {
  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="text-destructive">{query.error.message}</p>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => void query.refetch()}
        >
          Thử lại
        </Button>
      </div>
    );
  }
  if (query.data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{EMPTY_TEXT[status]}</p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {query.data.map((order) => (
        <OrderCard key={order.id} order={order} {...cardProps} />
      ))}
    </ul>
  );
}
