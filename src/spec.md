# Specification

## Summary
**Goal:** Localize the POS UI to Bahasa Indonesia, fix Catalog category selection and category management, switch CSV delimiter to semicolon, add a PWA install guide, and refresh the app theme to be more colorful.

**Planned changes:**
- Translate all user-facing UI text across the POS app (including admin modules, checkout flow, reports, sync/returns/refunds, and receipt preview/print UI) to Bahasa Indonesia.
- Update CSV import/export for Reports and Products to use semicolon (;) delimiters, including updating any on-screen CSV examples and help text.
- Fix Add/Edit Product Category dropdown so it populates and is selectable; add admin UI to create/manage categories (name + active flag) and ensure categories persist offline and appear immediately in product forms.
- Audit admin pages for non-functional controls and either wire them to existing end-to-end flows or disable them with clear Bahasa Indonesia explanations to avoid blocked workflows.
- Add an in-app, discoverable PWA installation guide (Android Chrome, iOS Safari, Desktop Chrome/Edge) with troubleshooting, in Bahasa Indonesia, and integrate with existing install prompt handling where supported.
- Refresh visual styling to a more colorful, consistent theme across modules while keeping light/dark mode readable.

**User-visible outcome:** The app UI is fully in Bahasa Indonesia, CSV files use Indonesian-friendly semicolons, product categories can be created and selected reliably, admin actions no longer “do nothing,” users can follow an in-app guide to install the PWA, and the interface looks more colorful while remaining consistent in light and dark modes.
