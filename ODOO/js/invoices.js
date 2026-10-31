
/* ======================================
   BRIGHTLOOP - INVOICE HISTORY
   File: js/invoices.js
   Frontend-only demo implementation
====================================== */

// Sample invoice data
const invoices = [
    {
        id: "INV-2026-001",
        issueDate: "2026-10-05",
        dueDate: "2026-10-15",
        amount: "1500.00",
        subtotal: "1500.00",
        tax: "0.00",
        status: "paid",
        customer: "Rahul Sharma",
        email: "rahul@example.com",
        items: [
            {
                description: "Professional Monthly Plan",
                quantity: 1,
                price: "1500.00",
                total: "1500.00"
            }
        ]
    },
    {
        id: "INV-2026-002",
        issueDate: "2026-10-12",
        dueDate: "2026-11-05",
        amount: "2500.00",
        subtotal: "2200.00",
        tax: "300.00",
        status: "pending",
        customer: "Rahul Sharma",
        email: "rahul@example.com",
        items: [
            {
                description: "Business Plan",
                quantity: 1,
                price: "2200.00",
                total: "2200.00"
            }
        ]
    },
    {
        id: "INV-2026-003",
        issueDate: "2026-09-01",
        dueDate: "2026-09-15",
        amount: "3500.00",
        subtotal: "3500.00",
        tax: "0.00",
        status: "overdue",
        customer: "Rahul Sharma",
        email: "rahul@example.com",
        items: [
            {
                description: "Enterprise Plan",
                quantity: 1,
                price: "3500.00",
                total: "3500.00"
            }
        ]
    }
];

// DOM elements
const invoiceList = document.getElementById("invoiceList");
const invoiceSearch = document.getElementById("invoiceSearch");
const statusFilter = document.getElementById("invoiceStatusFilter");

const invoicePreview = document.getElementById("invoicePreview");
const invoiceMessage = document.getElementById("invoiceMessage");

let selectedInvoice = null;

// Convert rupee string to paise without floats
function toPaise(value) {
    const [rupees = "0", paise = ""] = String(value).split(".");
    const fraction = (paise + "00").slice(0, 2);

    return BigInt(rupees) * 100n + BigInt(fraction);
}

// Convert paise to display string
function fromPaise(value) {
    const negative = value < 0n;
    const absolute = negative ? -value : value;

    const rupees = absolute / 100n;
    const paise = String(absolute % 100n).padStart(2, "0");

    return `${negative ? "-" : ""}${rupees}.${paise}`;
}

// Format Indian Rupees
function formatINR(value) {
    const amount = String(value ?? "0");
    const [integer = "0", decimal] = amount.split(".");

    const grouped = integer.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
    );

    return `₹ ${grouped}${decimal ? "." + decimal : ".00"}`;
}

// Format date
function formatDate(value) {
    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(date);
}

// Create safe table cell
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Update summary cards
function updateSummary() {
    const paid = invoices.filter(i => i.status === "paid").length;

    const pending = invoices.filter(
        i => i.status === "pending"
    ).length;

    const outstanding = invoices
        .filter(i => ["pending", "overdue"].includes(i.status))
        .reduce((total, invoice) => {
            return total + toPaise(invoice.amount);
        }, 0n);

    document.getElementById("totalInvoices").textContent =
        invoices.length;

    document.getElementById("paidInvoices").textContent =
        paid;

    document.getElementById("pendingInvoices").textContent =
        pending;

    document.getElementById("outstandingAmount").textContent =
        formatINR(fromPaise(outstanding));
}

// Render invoices
function renderInvoices(items) {
    invoiceList.replaceChildren();

    if (items.length === 0) {
        const row = document.createElement("tr");
        const cell = createCell("No invoices found.");

        cell.colSpan = 6;
        row.appendChild(cell);
        invoiceList.appendChild(row);
        return;
    }

    items.forEach(invoice => {
        const row = document.createElement("tr");

        row.append(
            createCell(invoice.id),
            createCell(formatDate(invoice.issueDate)),
            createCell(formatDate(invoice.dueDate)),
            createCell(formatINR(invoice.amount))
        );

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = `invoice-status status-${invoice.status}`;
        badge.textContent = invoice.status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const button = document.createElement("button");

        button.type = "button";
        button.className = "view-invoice-btn";
        button.textContent = "View Invoice";
        button.dataset.invoiceId = invoice.id;

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        invoiceList.appendChild(row);
    });
}

// Search and status filtering
function applyFilters() {
    const query = invoiceSearch.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = invoices.filter(invoice => {
        const matchesSearch =
            invoice.id.toLowerCase().includes(query);

        const matchesStatus =
            status === "all" || invoice.status === status;

        return matchesSearch && matchesStatus;
    });

    renderInvoices(filtered);

    invoiceMessage.textContent =
        `${filtered.length} invoice(s) found.`;
}

// Show invoice preview
function showInvoice(invoiceId) {
    const invoice = invoices.find(item => item.id === invoiceId);

    if (!invoice) return;

    selectedInvoice = invoice;

    document.getElementById("previewInvoiceNumber").textContent =
        `Invoice: ${invoice.id}`;

    document.getElementById("previewStatus").textContent =
        `Status: ${invoice.status.toUpperCase()}`;

    document.getElementById("previewCustomer").textContent =
        `Customer: ${invoice.customer}`;

    document.getElementById("previewEmail").textContent =
        `Email: ${invoice.email}`;

    document.getElementById("previewIssueDate").textContent =
        `Issue Date: ${formatDate(invoice.issueDate)}`;

    document.getElementById("previewDueDate").textContent =
        `Due Date: ${formatDate(invoice.dueDate)}`;

    // Invoice line items
    const itemsContainer = document.getElementById("previewItems");

    itemsContainer.replaceChildren();

    invoice.items.forEach(item => {
        const row = document.createElement("tr");

        row.append(
            createCell(item.description),
            createCell(item.quantity),
            createCell(formatINR(item.price)),
            createCell(formatINR(item.total))
        );

        itemsContainer.appendChild(row);
    });

    document.getElementById("previewSubtotal").textContent =
        `Subtotal: ${formatINR(invoice.subtotal)}`;

    document.getElementById("previewTax").textContent =
        `Tax: ${formatINR(invoice.tax)}`;

    document.getElementById("previewTotal").textContent =
        `Total: ${formatINR(invoice.amount)}`;

    invoicePreview.hidden = false;

    invoicePreview.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Print invoice / save as PDF
function printInvoice() {
    if (!selectedInvoice) return;

    document.body.classList.add("printing");

    window.print();
}

// Close invoice preview
function closePreview() {
    invoicePreview.hidden = true;
    selectedInvoice = null;
}

// Event listeners
invoiceSearch.addEventListener("input", applyFilters);

statusFilter.addEventListener("change", applyFilters);

invoiceList.addEventListener("click", event => {
    const button = event.target.closest("[data-invoice-id]");

    if (!button) return;

    showInvoice(button.dataset.invoiceId);
});

document.getElementById("printInvoice")
    .addEventListener("click", printInvoice);

document.getElementById("closePreview")
    .addEventListener("click", closePreview);

window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing");
});

// Initialize
updateSummary();
renderInvoices(invoices);

console.log("Brightloop Invoice Module Initialized.");
