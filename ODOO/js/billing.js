
/* ===== Billing API ===== */

// Backend teammate ke actual FastAPI routes milne par
// endpoints update karna hai.

const BILLING_API = {
    invoices: "/api/invoices",
    payments: "/api/payments"
};


/* ===== Fetch Invoices ===== */

async function getInvoices() {
    return apiRequest(BILLING_API.invoices);
}


/* ===== Fetch Payments ===== */

async function getPayments() {
    return apiRequest(BILLING_API.payments);
}


/* ===== Invoice Details ===== */

async function getInvoice(id) {
    return apiRequest(`${BILLING_API.invoices}/${id}`);
}


/* ===== Generate Invoice ===== */

async function generateInvoice(data) {
    return apiRequest(BILLING_API.invoices, {
        method: "POST",
        body: JSON.stringify(data)
    });
}


/* ===== Update Invoice Status ===== */

async function updateInvoiceStatus(id, status) {
    return apiRequest(`${BILLING_API.invoices}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
}


/* ===== Search Invoices ===== */

function searchInvoices(items, searchText) {
    const search = searchText.toLowerCase().trim();

    if (!search) return items;

    return items.filter(item =>
        String(item.id ?? "").toLowerCase().includes(search) ||
        String(item.customer_name ?? "").toLowerCase().includes(search)
    );
}


/* ===== Filter Invoices ===== */

function filterInvoices(items, status) {
    if (status === "all") return items;

    return items.filter(item =>
        String(item.status ?? "").toLowerCase() === status
    );
}


/* ===== Search Payments ===== */

function searchPayments(items, searchText) {
    const search = searchText.toLowerCase().trim();

    if (!search) return items;

    return items.filter(item =>
        String(item.id ?? "").toLowerCase().includes(search) ||
        String(item.customer_name ?? "").toLowerCase().includes(search) ||
        String(item.invoice_id ?? "").toLowerCase().includes(search)
    );
}


/* ===== Filter Payments ===== */

function filterPayments(items, status) {
    if (status === "all") return items;

    return items.filter(item =>
        String(item.status ?? "").toLowerCase() === status
    );
}


/* ===== Invoice Summary ===== */

function getInvoiceSummary(items) {
    return {
        total: items.length,

        paid: items.filter(item =>
            item.status === "paid"
        ).length,

        pending: items.filter(item =>
            item.status === "pending"
        ).length,

        overdue: items.filter(item =>
            item.status === "overdue"
        ).length
    };
}


/* ===== Payment Summary ===== */

function getPaymentSummary(items) {
    return {
        total: items.length,

        successful: items.filter(item =>
            item.status === "successful"
        ).length,

        pending: items.filter(item =>
            item.status === "pending"
        ).length,

        failed: items.filter(item =>
            item.status === "failed"
        ).length
    };
}


/* ===== Print Invoice ===== */

function printInvoice() {
    window.print();
}
