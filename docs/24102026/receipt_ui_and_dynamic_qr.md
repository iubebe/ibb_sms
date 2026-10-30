# Receipt UI redesign + dynamic QR

Date: 24/10/2026

Main doc: `ibb_shop_backend/docs/24102026/dynamic_payment_qr.md`.

## What was done
- `src/features/orders/receipt.tsx`: layout follows the reference photo: centered shop name/address, title, `Số`, labelled info block (Ngày with order-paid time range, Bàn, Thu ngân from `useMe`, KH, SĐT), dashed-border table `# | Tên món | SL | ĐG | TT`, bold "Tổng thanh toán", payment method line, "Trân trọng cảm ơn!", QR with `bank - holder - account` line. Sans font instead of monospace. No new data fields (guest count / server skipped on purpose).
- QR on receipt (provisional and paid) and in the checkout sheet comes from `useOrderPaymentQrs` and is rendered with `qrcode.react` (SVG, prints crisp). Static image fallback only on the provisional bill and checkout.
- `ZoomableQrCode` added next to `ZoomableQrImage`; admin QR card shows "QR động" / "QR tĩnh".
- New dep: `qrcode.react`.

## Pending
- Not checked in a browser or on a printer (typecheck + build pass); check 80mm print preview and a real scan.
- Re-upload existing QR images so they get a payload (see main doc).
