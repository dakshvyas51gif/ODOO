
// ======================================
// BRIGHTLOOP - CUSTOMER DASHBOARD
// File: js/dashboard.js
// ======================================

const API_BASE_URL = "http://127.0.0.1:8000";
const DASHBOARD_ENDPOINT = "/api/v1/customer/dashboard";

// DOM Elements
const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");

const activeSubscriptions = document.getElementById("activeSubscriptions");
const totalSubscriptions = document.getElementById("totalSubscriptions");
const pendingInvoices = document.getElementById("pendingInvoices");
const outstandingAmount = document.getElementById("outstandingAmount");

const nextBillingAmount = document.getElementById("nextBillingAmount");
const nextBillingDate = document.getElementById("nextBillingDate");

const subscriptionTable = document.getElementById("subscriptionTable");
const invoiceTable = document.getElementById("invoiceTable");

// Format INR without floating-point calculations
function formatINR(value) {
    let amount = String(value ?? "0").trim();
    const [integerPart = "0", decimalPart] = amount.split(".");

    const negative = integerPart.startsWith("-");
    const digits = negative ? integerPart.slice(1) : integerPart;

    const lastThree = digits.slice(-3);
    const remaining = digits.slice(0, -3);

    const grouped = remaining
        ? remaining.replace(/\B(?=(\d{2})+$)/g, ",") + "," + lastThree
        : lastThree;

    return `₹ ${negative ? "-" : ""}${grouped || "0"}${
        decimalPart ? "." + decimalPart : ""
    }`;
}

// Format date for display
function formatDate(value) {
    if (!value) return "Not available";

    const dateOnly = String(value).slice(0, 10);
    const date = new Date(`${dateOnly}T00:00:00Z`);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(date);
}

// Safely create table cells
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";
    return cell;
}

// Render subscriptions
function renderSubscriptions(subscriptions = []) {
    subscriptionTable.replaceChildren();

    if (!subscriptions.length) {
        subscriptionTable.innerHTML =
            '<tr><td colspan="4">No subscriptions found.</td></tr>';
        return;
    }

    subscriptions.forEach(subscription => {
        const row = document.createElement("tr");

        row.append(
            createCell(subscription.plan_name),
            createCell(subscription.billing_cycle),
            createCell(formatINR(subscription.price)),
            createCell(subscription.status)
        );

        subscriptionTable.appendChild(row);
    });
}

// Render invoices
function renderInvoices(invoices = []) {
    invoiceTable.replaceChildren();

    if (!invoices.length) {
        invoiceTable.innerHTML =
            '<tr><td colspan="4">No invoices found.</td></tr>';
        return;
    }

    invoices.forEach(invoice => {
        const row = document.createElement("tr");

        row.append(
            createCell(invoice.invoice_number),
            createCell(formatDate(invoice.issue_date)),
            createCell(formatINR(invoice.total_amount)),
            createCell(invoice.status)
        );

        invoiceTable.appendChild(row);
    });
}

// Show dashboard error
function showDashboardError(message) {
    subscriptionTable.innerHTML =
        `<tr><td colspan="4">${message}</td></tr>`;

    invoiceTable.innerHTML =
        `<tr><td colspan="4">${message}</td></tr>`;
}

// Load dashboard data from FastAPI
async function loadDashboard() {
    try {
        const response = await fetch(
            `${API_BASE_URL}${DASHBOARD_ENDPOINT}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                credentials: "include"
            }
        );

        if (response.status === 401 || response.status === 403) {
            window.location.replace("../auth/login.html");
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load dashboard data.");
        }

        const data = await response.json();

        // Customer information
        customerName.textContent =
            data.customer?.full_name || "Customer";

        customerEmail.textContent =
            data.customer?.email || "";

        // Summary information
        const summary = data.summary || {};

        activeSubscriptions.textContent =
            summary.active_subscriptions ?? 0;

        totalSubscriptions.textContent =
            summary.total_subscriptions ?? 0;

        pendingInvoices.textContent =
            summary.pending_invoices ?? 0;

        outstandingAmount.textContent =
            formatINR(summary.outstanding_amount);

        // Upcoming billing
        if (data.next_billing) {
            nextBillingAmount.textContent =
                formatINR(data.next_billing.amount);

            nextBillingDate.textContent =
                `Next billing date: ${formatDate(data.next_billing.due_date)}`;
        } else {
            nextBillingAmount.textContent = "No upcoming billing";
            nextBillingDate.textContent = "No scheduled payment.";
        }

        // Tables
        renderSubscriptions(data.subscriptions || []);
        renderInvoices(data.invoices || []);

    } catch (error) {
        console.error("Dashboard Error:", error);

        showDashboardError(
            "Unable to load data. Please refresh the page."
        );
    }
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", loadDashboard);

