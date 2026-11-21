# ShopLedger working notes

## Stack
- Node.js CommonJS application using Express 4 and body-parser; JSON is stored in `data/db.json`.
- Start: `npm start` (runs `node server.js`). Test: `node --test`.

## Module map
- `routes/orders.js` — order creation, lookup, listing, and cancellation endpoints.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/customers.js` — customer balances and Khata settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon code normalization, validation, and capped discount calculation.
- `lib/dates.js` — date formatting, normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, stock checks, reservation/release, and inventory summary.
- `lib/invoice.js` — invoice figure computation and printable HTML rendering.
- `lib/ledger.js` — customer Khata lookup, debit/reversal, settlement, and balances.
- `lib/orders.js` — order creation, retrieval, cancellation, and filtering.
- `lib/pricing.js` — subtotal, coupon discount, HSN-based tax, and checkout totals.
- `lib/reports.js` — dashboard totals and invoice-versus-ledger GST reconciliation.
- `lib/store.js` — reads/writes the JSON store and appends audit entries.
- `lib/tax.js` — HSN/GST-rate resolution and CGST/SGST splitting.

## Working rules
- Write characterization tests first.
- Restrict edits to the current ticket scope.
- Use in-memory data only; never modify or test against `data/db.json`.
- Add zero dependencies and do not modify `package-lock.json`.
- Make the smallest fix that satisfies the test.

## Current ticket
- Invoice & GST mismatch: make invoice figures match checkout's per-line HSN GST and pre-tax capped coupon discount.
- Allowed implementation files: `lib/invoice.js`; use `lib/tax.js` only if necessary.
