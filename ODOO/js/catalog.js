
/* ===== Catalog API ===== */

// Backend teammate ke actual FastAPI routes milne par
// in URLs ko update karna hai.

const CATALOG_API = {
    products: "/api/products",
    plans: "/api/plans",
    discounts: "/api/discounts"
};


/* ===== Fetch Data ===== */

async function getCatalog(type) {
    const url = CATALOG_API[type];

    if (!url) {
        throw new Error("Invalid catalog type");
    }

    return apiRequest(url);
}


/* ===== Create Data ===== */

async function createCatalog(type, data) {
    const url = CATALOG_API[type];

    if (!url) {
        throw new Error("Invalid catalog type");
    }

    return apiRequest(url, {
        method: "POST",
        body: JSON.stringify(data)
    });
}


/* ===== Update Data ===== */

async function updateCatalog(type, id, data) {
    const url = CATALOG_API[type];

    if (!url) {
        throw new Error("Invalid catalog type");
    }

    return apiRequest(`${url}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}


/* ===== Delete Data ===== */

async function deleteCatalog(type, id) {
    const url = CATALOG_API[type];

    if (!url) {
        throw new Error("Invalid catalog type");
    }

    return apiRequest(`${url}/${id}`, {
        method: "DELETE"
    });
}


/* ===== Search Data ===== */

function searchCatalog(items, searchText) {
    const search = searchText.toLowerCase().trim();

    if (!search) {
        return items;
    }

    return items.filter(item =>
        Object.values(item).some(value =>
            String(value ?? "")
                .toLowerCase()
                .includes(search)
        )
    );
}


/* ===== Filter By Status ===== */

function filterCatalog(items, status) {
    if (status === "all") {
        return items;
    }

    return items.filter(item =>
        String(item.status).toLowerCase() === status
    );
}
