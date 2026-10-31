# Document Generation & Finance Leadership Dashboard

Frontend module for the **Person 3 – Client Interfaces & User Portals** workstream. This module covers formal quotation/invoice print views and a finance overview for leadership.

> **Current status:** The frontend structure and client-side interactions are implemented in this bundle. Live API integration still depends on matching the assumed routes and response fields to the team's actual FastAPI backend. This README does not claim that the backend integration has been verified.

## 1. Included files

This package contains **7 source files**:

```text
Document_Generation_Leadership_Dashboard/
├── README.md
└── person3/
    ├── admin/
    │   ├── admin-dashboard.html
    │   ├── invoices.html
    │   └── quotations.html
    ├── css/
    │   └── admin.css
    └── js/
        ├── admin.js
        ├── billing.js
        └── quotations.js
```

The README is documentation and is additional to the 7 source files.

## 2. Features

### Finance leadership dashboard — `admin-dashboard.html`

- Revenue collected, outstanding balance, overdue balance and successful-payment count.
- Revenue trend chart with 7-day, 30-day, 90-day and 12-month ranges.
- Overdue-account list with quick filters for all overdue accounts, over 7 days and over 30 days.
- Refresh control to reload invoice and payment data.

### Invoice management and PDF/print — `invoices.html`

- Invoice list populated from the API.
- Search by invoice/customer and filter by status.
- Summary counts for total, paid, pending and overdue invoices.
- Per-invoice **Print / PDF** action that opens the browser print dialog.

### Quotation print/export — `quotations.html`

- Quotation list populated from the API.
- Search by quotation/customer and filter by status.
- Per-quotation **Print / PDF** action that opens the browser print dialog.

### Shared presentation and helpers

- `admin.css` supplies the admin layout, responsive styles, tables, status labels, document layout and A4 print styles.
- `admin.js` supplies shared API, formatting, safe HTML escaping and response-normalization helpers, plus active-navigation handling.
- `billing.js` supplies invoice rendering, finance calculations, overdue filtering, revenue chart rendering and invoice print-document generation.
- `quotations.js` supplies quotation rendering, filtering and quotation print-document generation.

## 3. Technology and dependencies

- HTML5
- CSS3
- Vanilla JavaScript
- Browser Fetch API and Canvas API
- Browser print dialog for saving a document as PDF

There is no npm package installation step and no third-party chart or PDF library in this bundle.

## 4. Setup

1. Extract the ZIP into the project workspace.
2. Merge the included `person3` directory into the existing project `person3` directory. Keep the relative folders (`admin`, `css`, `js`) unchanged.
3. Serve the frontend through a local web server (for example, VS Code Live Server). Avoid opening the HTML files directly using `file://` when testing API calls.
4. Start the FastAPI backend.
5. Open the pages through the local frontend server:
   - `person3/admin/admin-dashboard.html`
   - `person3/admin/invoices.html`
   - `person3/admin/quotations.html`

Example local static-server command, run from the project root:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/person3/admin/admin-dashboard.html` (adjust the path if your project folder differs).

## 5. FastAPI configuration

The API configuration is in `person3/js/admin.js`:

```javascript
const config = {
  apiBaseUrl: "",
  endpoints: {
    quotations: "/api/quotations",
    invoices: "/api/invoices",
    payments: "/api/payments"
  }
};
```

- If the frontend and backend are served from the same origin, `apiBaseUrl` can remain empty.
- If the frontend is served separately and FastAPI runs at `http://localhost:8000`, set `apiBaseUrl` to `"http://localhost:8000"`.
- The FastAPI server must allow the frontend origin through CORS when the frontend and backend use different origins.
- The route paths above are **assumptions/placeholders**. Confirm and update them to match the backend teammate's actual FastAPI routes before integration testing.

### Expected API operations

| Page / feature | Request used by this frontend |
|---|---|
| Finance dashboard | `GET /api/invoices` and `GET /api/payments` |
| Invoice list | `GET /api/invoices` |
| Invoice print details | `GET /api/invoices/{id}` |
| Quotation list | `GET /api/quotations` |
| Quotation print details | `GET /api/quotations/{id}` |

The list endpoint may return a JSON array or a wrapper containing an array under common keys such as `invoices`, `quotations`, `payments`, `transactions`, `items`, `results` or `data`. Confirm the exact response envelope and field names with the backend.

### Data fields used

The frontend accepts several common field aliases, but the backend contract should be aligned explicitly. Commonly read fields include:

- **Invoice:** record ID, invoice number, customer name/details, issue date, due date, status, currency, total, paid amount, balance due, tax, discount, notes and line items.
- **Payment:** status, amount and payment/creation date.
- **Quotation:** record ID, quotation number, customer details, issue date, validity date, status, currency, total, tax, discount, notes/terms and line items.

For a detailed print document, the detail endpoint should ideally return the record's customer/seller information and line items. If line items are absent, the print view displays a note that the API did not include them.

## 6. Saving quotations and invoices as PDF

1. Open the relevant Quotations or Invoices page.
2. Wait for the records to load from FastAPI.
3. Select **Print / PDF** on the required record.
4. In the browser print dialog, choose **Save as PDF** and save the file.

This implementation uses `window.print()` and print-specific CSS. It does **not** generate or download a PDF automatically on the server, nor does it store the PDF in the database.

## 7. Testing checklist

Before marking this module complete, verify:

- [ ] The three HTML pages load without missing CSS or JavaScript files.
- [ ] `apiBaseUrl` and all three endpoint paths match the running FastAPI backend.
- [ ] FastAPI CORS settings allow the frontend origin when required.
- [ ] Invoice, payment and quotation list response formats match the data expected by the UI.
- [ ] Date, currency, status, paid amount and outstanding-balance calculations match backend business rules.
- [ ] Revenue chart totals reconcile with the payment records used by Finance.
- [ ] Overdue filters use the intended timezone and due-date policy.
- [ ] Quotation and invoice detail endpoints return the fields needed for printing.
- [ ] A4 print previews are checked in the target browser and saved PDFs are reviewed.
- [ ] Empty, loading, API error and no-results states are checked.

JavaScript syntax and the relative CSS/JS references in the included HTML pages have been checked. This is not a substitute for browser testing or live FastAPI integration testing.

## 8. Known scope limits

- This bundle includes only the three pages listed above. Sidebar links to Products, Subscription Plans, Discounts, Quotation Pipeline and Payments are navigation links for the wider admin workspace; those page files are not included in this 7-source-file package.
- Authentication, authorization and role-based access are not implemented in this bundle.
- Creating/editing quotations, creating invoices, collecting payments and changing payment status are not implemented here.
- The finance metrics and chart are calculated in the browser from the invoice/payment records returned by the API. Confirm the formulas against the project's finance rules.
- The backend API contract, database records, deployment and real customer data have not been verified as part of this frontend package.

## 9. Ownership boundary

This is the **frontend** portion of the work. The backend teammate is responsible for the FastAPI routes, database queries, authentication/authorization, validation and persistence. Coordinate the API contract before connecting this module to production data.
