# Brightloop — Authentication & Customer Portal (Person 3)

This repository section contains the **frontend code shared so far** for Person 3 of the Brightloop Subscription Management System.

The frontend is built with **HTML5, CSS3, and Vanilla JavaScript**. It is designed to connect to the team's FastAPI backend through HTTP/JSON APIs. The frontend does not implement the backend, database, password hashing, session creation, billing engine, or subscription business rules.

> **Current status:** The page markup and initial JavaScript have been written. This is not yet a fully tested, backend-connected application. Several JavaScript files still call proposed FastAPI endpoints, while the Invoice History page currently uses local sample data.

---

## 1. Scope covered

The current code covers these eight screens:

1. Signup
2. Login
3. Forgot Password
4. Reset Password
5. Customer Dashboard
6. My Subscriptions
7. Subscription Details
8. Invoice History

### What the current frontend code does

| Screen | Current behavior in the code | Dependency / limitation |
|---|---|---|
| Signup | Checks name, email format, password rules, and password confirmation; sends a registration request | Registration request needs the matching FastAPI endpoint |
| Login | Checks email and non-empty password; sends a login request; redirects to the customer dashboard on success | Needs the matching FastAPI login endpoint and session cookie behavior |
| Forgot Password | Checks email format and submits a reset request; displays a generic success message | Needs a backend endpoint that creates and delivers/logs a reset link |
| Reset Password | Reads `token` from the URL; checks password rules and confirmation; submits the new password | Needs a backend endpoint that validates the reset token and updates the password |
| Customer Dashboard | Loads customer details, subscription counts, upcoming billing, subscriptions, and invoices | All dashboard data is currently expected from FastAPI |
| My Subscriptions | Loads subscriptions, displays counts, supports search and status filtering, and links to details | Subscription list data is currently expected from FastAPI |
| Subscription Details | Loads one subscription and sends Pause/Resume requests | Details and Pause/Resume endpoints are currently expected from FastAPI |
| Invoice History | Shows sample invoices, summary counts, search, status filtering, invoice preview, and browser print | Uses hard-coded demo data; it is not yet connected to real invoice data |

### Important distinction

- **Frontend validation** improves the user experience; it is not a security boundary.
- The backend must enforce account uniqueness, password policy, authentication, authorization, reset-token expiry, and subscription ownership.
- A Pause/Resume button can only change real subscription state when the backend accepts and processes the request.
- The Invoice History page's **Print / Save PDF** button uses the browser print dialog. It is not a server-generated PDF document.

---

## 2. Project structure

Create the files using this structure:

```text
person3/
├── README.md
│
├── auth/
│   ├── signup.html
│   ├── login.html
│   ├── forgot-password.html
│   └── reset-password.html
│
├── customer/
│   ├── dashboard.html
│   ├── subscriptions.html
│   ├── subscription-details.html
│   └── invoices.html
│
├── css/
│   ├── auth.css
│   └── customer.css
│
└── js/
    ├── signup.js
    ├── login.js
    ├── forgot-password.js
    ├── reset-password.js
    ├── dashboard.js
    ├── subscriptions.js
    ├── subscription-details.js
    └── invoices.js
```

The tree above shows the intended `person3` folder. If this README is kept outside that folder, move or copy it into `person3/README.md` when assembling the project.

---

## 3. Technology used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and forms |
| CSS3 | Layout, styling, responsive behavior, and print styles |
| Vanilla JavaScript | Form validation, UI interactions, rendering, and API requests |
| Fetch API | HTTP requests to FastAPI |
| Browser Print | Print invoice or save it as PDF from the browser |

No React, Next.js, Node.js backend, or frontend package installation is required for the code written so far.

---

## 4. How to run the frontend

1. Open the `person3` folder in Visual Studio Code.
2. Check that the folders and filenames match the structure above.
3. Open the HTML pages using the VS Code **Live Server** extension (or another local static web server).
4. Start with `auth/signup.html` or `auth/login.html`.
5. Open `customer/invoices.html` to test the sample invoice screen without a backend.

### Pages that can be previewed without FastAPI

- The static design of all HTML pages can be viewed.
- Invoice History has local demo data and its search, status filter, preview, and print interactions are implemented in `invoices.js`.

### Pages that need FastAPI to complete their current JavaScript flows

Signup, Login, Forgot Password, Reset Password, Customer Dashboard, My Subscriptions, and Subscription Details currently make API requests. Without a matching backend, these requests will fail or the page will show an error/empty state. Their HTML and initial frontend validation are still available for visual review.

---

## 5. FastAPI connection settings

The JavaScript files currently use this development base URL:

```js
const API_BASE_URL = "http://127.0.0.1:8000";
```

This assumes that FastAPI is running locally on port `8000`. Update the value in the relevant JavaScript files when the backend runs at a different host or port.

### Proposed endpoints currently referenced

These paths were used as placeholders while writing the frontend. **They are not confirmed routes from the backend team.** Match them with the actual FastAPI API documentation before integration.

| Frontend file | Method | Proposed endpoint |
|---|---|---|
| `js/signup.js` | POST | `/api/v1/auth/register` |
| `js/login.js` | POST | `/api/v1/auth/login` |
| `js/forgot-password.js` | POST | `/api/v1/auth/forgot-password` |
| `js/reset-password.js` | POST | `/api/v1/auth/reset-password` |
| `js/dashboard.js` | GET | `/api/v1/customer/dashboard` |
| `js/subscriptions.js` | GET | `/api/v1/customer/subscriptions` |
| `js/subscription-details.js` | GET | `/api/v1/customer/subscriptions/{id}` |
| `js/subscription-details.js` | POST | `/api/v1/customer/subscriptions/{id}/pause` |
| `js/subscription-details.js` | POST | `/api/v1/customer/subscriptions/{id}/resume` |

### Expected request fields in the current frontend code

| Operation | JSON body currently sent |
|---|---|
| Signup | `full_name`, `email`, `password` |
| Login | `email`, `password` |
| Forgot Password | `email` |
| Reset Password | `token`, `new_password` |
| Pause / Resume | No JSON body is currently sent |

The backend may use different field names, route paths, or response structures. Coordinate the contract with the backend developer and update the frontend to match it.

### Session and CORS notes

- Login and customer data requests use `credentials: "include"`, expecting the backend to manage an HTTP-only session cookie.
- The backend must configure CORS for the frontend's local development origin and allow credentials when cookie-based sessions are used.
- Do not store an authentication JWT in `localStorage` when the agreed design uses HTTP-only cookies.

---

## 6. Expected customer dashboard response shape

`dashboard.js` currently expects a response broadly shaped like this. The values below are examples only:

```json
{
  "customer": {
    "full_name": "Rahul Sharma",
    "email": "rahul@example.com"
  },
  "summary": {
    "active_subscriptions": 2,
    "total_subscriptions": 3,
    "pending_invoices": 1,
    "outstanding_amount": "2500.00"
  },
  "next_billing": {
    "amount": "1500.00",
    "due_date": "2026-11-15"
  },
  "subscriptions": [
    {
      "plan_name": "Professional",
      "billing_cycle": "Monthly",
      "price": "1500.00",
      "status": "Active"
    }
  ],
  "invoices": [
    {
      "invoice_number": "INV-001",
      "issue_date": "2026-10-25",
      "total_amount": "1500.00",
      "status": "Paid"
    }
  ]
}
```

The Subscriptions and Subscription Details scripts also expect fields such as `id`, `subscription_number`, `plan_name`, `billing_cycle`, `amount`, `next_billing_date`, `start_date`, `expiry_date`, `product_name`, `quantity`, `payment_terms`, and `status`. Confirm the exact schema with the backend developer.

---

## 7. URL parameters used by the pages

- Reset Password reads the reset token from: `reset-password.html?token=...`
- Subscription Details reads the subscription identifier from: `subscription-details.html?id=...`

The corresponding pages require a valid token or subscription identifier to complete their current flow.

---

## 8. Known gaps before marking this module complete

- Confirm all proposed API routes and JSON schemas with the FastAPI developer.
- Run the full signup, login, password reset, and customer portal flows against the real backend.
- Confirm the backend sets and clears the expected HTTP-only cookie. The current Logout links only navigate to the login page; they do not call a logout API.
- Connect Invoice History to real invoice data if required; it currently uses three hard-coded demo invoices.
- Confirm status values returned by the backend match the frontend's expected values (`active`, `paused`, `closed`, `paid`, `pending`, `overdue`).
- Test mobile layouts, navigation, empty states, loading states, API failures, and browser print output.
- Review and test the shared `auth.css` selectors for all four forms and their button IDs (`signupButton`, `loginButton`, `forgotPasswordButton`, and `resetPasswordButton`).
- Verify the invoice page's inline styles and print stylesheet in the target browsers.

---

## 9. Current completion statement

**The initial frontend code for the Authentication & Customer Portal screens has been drafted.** The Invoice History page has local sample-data interactions. The other modules still depend on the proposed FastAPI endpoints in their current JavaScript implementation. Runtime testing against the actual project and backend has not yet been completed.

Do not describe the module as fully tested or production-ready until the gaps above are resolved.

