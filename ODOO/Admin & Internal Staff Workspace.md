# Subscript — Admin & Internal Staff Workspace

Frontend workspace for managing products, subscription plans, discounts, quotations, quotation pipeline, invoices, and payments.

> **Current status:** The 13 files listed below provide the initial HTML/CSS structure and JavaScript helper functions. This is not yet a fully functional or production-ready application. Form submission, table rendering, complete page interactions, and live FastAPI integration still need to be implemented and tested.

## 1. Technology

- HTML5
- CSS3
- Vanilla JavaScript
- FastAPI backend integration (handled separately by the backend developer)

No frontend framework is required by the current implementation.

## 2. Folder Structure

Place the files in this structure. This README is intended to live inside the `person3` folder.

```text
person3/
├── README.md
├── admin/
│   ├── admin-dashboard.html
│   ├── products.html
│   ├── plans.html
│   ├── discounts.html
│   ├── quotations.html
│   ├── quotation-pipeline.html
│   ├── invoices.html
│   └── payments.html
├── css/
│   └── admin.css
└── js/
    ├── admin.js
    ├── catalog.js
    ├── quotations.js
    └── billing.js
```

**Total: 13 application files** — 8 HTML pages, 1 CSS file, and 4 JavaScript files. This README is documentation and is not included in that count.

## 3. Page Overview

| File | Purpose |
|---|---|
| `admin/admin-dashboard.html` | Admin dashboard layout, summary cards, revenue chart area, and activity area |
| `admin/products.html` | Product list layout, filters, and add-product form modal |
| `admin/plans.html` | Subscription plan list and plan form modal |
| `admin/discounts.html` | Discount and coupon management layout |
| `admin/quotations.html` | Quotations list and search/status controls |
| `admin/quotation-pipeline.html` | Quotation stage summary and pipeline table |
| `admin/invoices.html` | Invoice list and invoice summary layout |
| `admin/payments.html` | Payment summary and transaction list layout |
| `css/admin.css` | Shared layout, sidebar, cards, tables, forms, modal, and responsive styles |
| `js/admin.js` | Common initialization, navigation state, modal controls, and generic API helper |
| `js/catalog.js` | Product, plan, and discount API helper functions and data filters |
| `js/quotations.js` | Quotation API helper functions, search/filter helpers, and pipeline summary |
| `js/billing.js` | Invoice/payment API helper functions, search/filter helpers, summaries, and basic print trigger |

## 4. Run the Frontend

### Option A — VS Code Live Server

1. Open the `person3` folder in Visual Studio Code.
2. Install or enable the **Live Server** extension.
3. Right-click `admin/admin-dashboard.html` and select **Open with Live Server**.
4. Use the sidebar links to open the other pages.

### Option B — Python static server

Run this command from inside the `person3` directory:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/admin/admin-dashboard.html
```

A local web server is recommended instead of opening the HTML files directly with `file://`, especially once API requests are added.

## 5. JavaScript File Loading

The current HTML pages include `admin.js`. The page-specific helper files must also be loaded, after `admin.js`, for their functions to be available.

Add the appropriate script tags just before `</body>`:

**Products, Plans, and Discounts** — in `products.html`, `plans.html`, and `discounts.html`:

```html
<script src="../js/admin.js"></script>
<script src="../js/catalog.js"></script>
```

**Quotations and Quotation Pipeline** — in `quotations.html` and `quotation-pipeline.html`:

```html
<script src="../js/admin.js"></script>
<script src="../js/quotations.js"></script>
```

**Invoices and Payments** — in `invoices.html` and `payments.html`:

```html
<script src="../js/admin.js"></script>
<script src="../js/billing.js"></script>
```

The dashboard currently only needs the shared `admin.js` for the common initialization provided so far. Its chart and dashboard data loading have not yet been implemented.

## 6. FastAPI Integration

The JavaScript files currently use assumed API paths. These are placeholders and must be checked against the backend developer's actual FastAPI routes and request/response schemas.

| Resource | Current placeholder path |
|---|---|
| Products | `/api/products` |
| Plans | `/api/plans` |
| Discounts | `/api/discounts` |
| Quotations | `/api/quotations` |
| Invoices | `/api/invoices` |
| Payments | `/api/payments` |

Before connecting the frontend to the backend:

1. Obtain the confirmed route list and HTTP methods from the backend developer.
2. Confirm request body fields, response JSON structure, ID format, and status values.
3. Update the placeholder paths and payload field names in the JavaScript files.
4. Configure the backend CORS policy or a development proxy if the frontend and API run on different origins.
5. Test successful responses, validation errors, unauthorized responses, missing records, and server errors.

The current `apiRequest()` helper in `admin.js` sends JSON content type by default and throws an error for non-success HTTP responses. Authentication headers, token refresh, and a configurable API base URL have not been implemented.

## 7. Current Implementation Status

### Present in the supplied code

- Eight HTML page structures and sidebar navigation links.
- Shared responsive CSS for the admin layout and common components.
- Basic open/close behavior for Product, Plan, and Discount modals.
- Generic JSON API request helper.
- CRUD request helper functions for catalog resources.
- Quotation and billing request helper functions.
- Search/filter helper functions and summary-count helper functions.
- Basic browser print trigger using `window.print()`.

### Still required

- Connect each page to its page-specific JavaScript file as shown above.
- Connect form submissions to create/update API requests.
- Fetch backend data and render rows and summary cards in each table/page.
- Connect search and filters to the visible tables.
- Implement quotation creation and quotation pipeline actions in the UI.
- Implement invoice details view and a proper invoice print/PDF layout.
- Implement payment details and any permitted payment actions.
- Implement dashboard chart and finance dashboard calculations.
- Add authentication/authorization handling according to the backend contract.
- Add loading, empty, success, and error states.
- Test all pages against the running FastAPI backend.
- Test responsive layouts and browser behavior.

## 8. Important Notes

- Do not add real business records directly to the HTML. Products, plans, discounts, quotations, invoices, and payments should be loaded from the backend API.
- The sample API paths and assumed field names are not confirmed backend contracts.
- The frontend currently has no verified database connection. Database operations are performed by the backend, not directly by this frontend.
- `window.print()` only opens the browser print dialog. It does not by itself provide a designed invoice PDF workflow.
- Do not treat the project as production-ready until authentication, API integration, error handling, and end-to-end testing are complete.

## 9. Ownership

This folder covers the **Person 3 — Client Interfaces & User Portals / Admin & Internal Staff Workspace** frontend scope. FastAPI backend implementation and database operations are handled separately by the backend developer/team.
