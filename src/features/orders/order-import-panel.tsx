import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useImportOrders, useOrderImportTemplate } from "@/api/hooks";
import { ApiError } from "@/api/client";
import type { OrderImportResult, OrderImportRowError } from "@/api/types";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download-blob";
import { formatPrice } from "@/lib/format-price";

const MAX_BYTES = 2 * 1_048_576;

function rowErrorsOf(error: Error): OrderImportRowError[] {
  if (!(error instanceof ApiError)) return [];
  const errors = (error.data as { errors?: OrderImportRowError[] } | undefined)?.errors;
  return Array.isArray(errors) ? errors : [];
}

/** Admin: download the Excel template and upload a filled one to create many orders (any day). */
export function OrderImportPanel() {
  const template = useOrderImportTemplate();
  const importOrders = useImportOrders();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderImportResult | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    setResult(null);
    importOrders.reset();
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("Chỉ nhận file .xlsx");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("File tối đa 2 MB");
      return;
    }
    setFileError(null);
    importOrders.mutate(file, { onSuccess: setResult });
  }

  const rowErrors = importOrders.error ? rowErrorsOf(importOrders.error) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm text-card-foreground">
        <p className="font-semibold">Cách dùng</p>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>Tải file mẫu (có sẵn danh sách bàn và món).</li>
          <li>Mỗi dòng là một món. Các dòng cùng "Mã đơn" thành một đơn.</li>
          <li>
            Cột "Ngày" (dd/mm/yyyy hoặc dd/mm/yyyy HH:mm): có ngày thì đơn đã xong và đã thanh toán
            vào ngày đó. Để trống thì đơn tạo ngay bây giờ, đang phục vụ.
          </li>
          <li>Có dòng lỗi thì không đơn nào được tạo.</li>
        </ol>
      </div>

      <Button
        variant="outline"
        className="min-h-11"
        disabled={template.isPending}
        onClick={() =>
          template.mutate(undefined, {
            onSuccess: (blob) => downloadBlob(blob, "mau-nhap-don.xlsx"),
          })
        }
      >
        {template.isPending ? <Loader2 className="animate-spin" /> : <Download />}
        Tải file mẫu
      </Button>
      {template.isError && (
        <p role="alert" className="text-sm text-destructive">
          {template.error.message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button
        className="min-h-12"
        disabled={importOrders.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {importOrders.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
        Chọn file Excel để nhập
      </Button>

      {fileError && (
        <p role="alert" className="text-sm text-destructive">
          {fileError}
        </p>
      )}

      {importOrders.isError && (
        <div role="alert" className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-destructive">{importOrders.error.message}</p>
          {rowErrors.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-xl border border-destructive/40 p-3">
              {rowErrors.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-semibold tabular-nums">Dòng {e.row}</span>
                  <span className="min-w-0 wrap-break-word">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && (
        <div role="status" className="flex flex-col gap-2 text-sm">
          <p className="flex items-center gap-2 font-medium text-green-600">
            <FileSpreadsheet className="size-4" />
            Đã tạo {result.created} đơn.
          </p>
          <ul className="flex flex-col gap-1 rounded-xl border p-3">
            {result.orders.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">
                  {o.orderKey} · {o.tableName}
                  {o.orderedAt ? " · đã thanh toán" : " · đang phục vụ"}
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
