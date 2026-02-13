# Specification

## Summary
**Goal:** Refresh the entire app with a modern glassmorphism + subtle 3D theme, complete the Bahasa Indonesia localization for all user-facing text, fix Checkout total/remaining/change calculations to update live, and ensure stock automatically decrements after completed sales (including backend support for atomic transaction + inventory updates).

**Planned changes:**
- Apply a consistent glassmorphism/3D visual style across all major UI surfaces (layout, cards, tables, dialogs/sheets, buttons, inputs) for all app routes, supporting both light and dark mode with readable contrast.
- Replace remaining hardcoded English UI text with the existing Indonesian i18n helper/strings across POS, Checkout, admin modules, and shared components (labels, placeholders, empty states, validation, toasts).
- Rework Checkout calculations so Total is always correctly auto-populated and updates immediately with cart/discount/tax changes; show live Remaining and Change due as payment amounts are typed; block completion until fully paid, with Bahasa Indonesia messaging.
- Implement automatic stock reduction after a successful sale: decrement on-hand inventory per sold variant, persist updates in offline master data, and reflect changes immediately in Inventory views with clear Bahasa Indonesia errors on inconsistencies.
- Add a backend Motoko method to create a completed transaction and decrement inventory atomically with existing user authorization, compatible with the existing offline sync queue pattern.

**User-visible outcome:** The app has a cohesive modern glass/3D look in light/dark mode, all screens display 100% Bahasa Indonesia text, Checkout totals and change/remaining update instantly as the cart and payments change, and inventory stock decreases automatically right after completing a sale (with reliable backend support).
