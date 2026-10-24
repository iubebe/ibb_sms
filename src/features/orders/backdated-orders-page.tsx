import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackdatedManualForm } from "./backdated-manual-form";
import { OrderImportPanel } from "./order-import-panel";

/** Admin: record orders that already happened (typed in, or from an Excel sheet). */
export function BackdatedOrdersPage() {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          aria-label="Quay lại"
          onClick={() => navigate("/orders")}
        >
          <ChevronLeft />
        </Button>
        <h2 className="text-xl font-semibold">Nhập đơn cũ</h2>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="w-full">
          <TabsTrigger value="manual" className="min-h-9 flex-1">
            Nhập tay
          </TabsTrigger>
          <TabsTrigger value="excel" className="min-h-9 flex-1">
            Từ Excel
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="pt-3">
          <BackdatedManualForm />
        </TabsContent>
        <TabsContent value="excel" className="pt-3">
          <OrderImportPanel />
        </TabsContent>
      </Tabs>
    </section>
  );
}
