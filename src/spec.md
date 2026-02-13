# Specification

## Summary
**Goal:** Fix Checkout so order totals (Subtotal/Tax/Discount/Total) never show Rp 0 when the cart has priced items, and make payment Remaining/Change update live with consistent totals used across UI and transaction payload.

**Planned changes:**
- Update Checkout order summary to compute Subtotal, Discount, Tax (10% when enabled), and Total directly from the current cart state and keep it in sync on any cart changes without requiring a reload.
- Ensure Checkout tax/discount rounding and clamping behavior matches the cart store calculation logic so displayed totals match the cart’s computed total.
- Fix Checkout payment calculations so Remaining and Change update immediately when payments are added/removed/edited, and ensure “Complete Transaction” enable/disable state reacts instantly based on Remaining.
- Ensure the transaction payload created at checkout stores consistent monetary fields (subtotal/discount/tax/total) derived from the same values displayed in Checkout, so receipts and transaction details match.

**User-visible outcome:** On the Checkout screen, Subtotal/Tax/Discount/Total reflect the current cart correctly (no Rp 0 for priced carts), and Remaining/Change update live as payment amounts change; completing a transaction stores and displays the same totals in receipts and transaction details.
