
/* ===== Quotation API ===== */

// Backend teammate ke actual FastAPI routes milne par
// endpoint update karna hai.

const QUOTATION_API = "/api/quotations";


/* ===== Fetch Quotations ===== */

async function getQuotations() {
    return apiRequest(QUOTATION_API);
}


/* ===== Create Quotation ===== */

async function createQuotation(data) {
    return apiRequest(QUOTATION_API, {
        method: "POST",
        body: JSON.stringify(data)
    });
}


/* ===== Update Quotation ===== */

async function updateQuotation(id, data) {
    return apiRequest(`${QUOTATION_API}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}


/* ===== Delete Quotation ===== */

async function deleteQuotation(id) {
    return apiRequest(`${QUOTATION_API}/${id}`, {
        method: "DELETE"
    });
}


/* ===== Update Quotation Status ===== */

async function updateQuotationStatus(id, status) {
    return apiRequest(`${QUOTATION_API}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
}


/* ===== Search Quotations ===== */

function searchQuotations(items, searchText) {
    const search = searchText.toLowerCase().trim();

    if (!search) return items;

    return items.filter(item =>
        String(item.id ?? "").toLowerCase().includes(search) ||
        String(item.customer_name ?? "").toLowerCase().includes(search)
    );
}


/* ===== Filter Quotations ===== */

function filterQuotations(items, status) {
    if (status === "all") return items;

    return items.filter(item =>
        String(item.status ?? "").toLowerCase() === status
    );
}


/* ===== Pipeline Summary ===== */

function getQuotationSummary(items) {
    return {
        draft: items.filter(item => item.status === "draft").length,
        sent: items.filter(item => item.status === "sent").length,
        accepted: items.filter(item => item.status === "accepted").length,
        rejected: items.filter(item => item.status === "rejected").length
    };
}
