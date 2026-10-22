# Currency input with thousand separators

Date: 22/10/2026

## Done
- `src/components/currency-input.tsx`: shows `1.250.000` (vi-VN, `,` decimal mark) while state stays a plain numeric string (`1250000`, `25000.5`), so existing `parseDecimal`/`Number` logic is unchanged. Caret position is preserved while reformatting.
- Applied to: product price, checkout "Khách đưa", staff hourly rate, expense amount, unit cost in stock import form/draft/review.

## Pending
- Browser check on a phone viewport (caret behaviour, decimal entry with `,`).
