/* Finance dashboard, invoice listing and print-to-PDF deliverable. */
(function () {
  "use strict";
  const App = window.App;
  if (!App) throw new Error("admin.js must load before billing.js");

  let invoices = [];
  let payments = [];
  const $ = id => document.getElementById(id);
  const invoiceEndpoint = App.config.endpoints.invoices;
  const paymentEndpoint = App.config.endpoints.payments;

  function invoiceAmount(item) {
    return App.numberValue(App.pick(item, ["grand_total", "total_amount", "amount", "total", "invoice_total"], 0));
  }
  function invoicePaid(item) {
    const explicit = App.pick(item, ["paid_amount", "amount_paid", "paid", "payment_received"], null);
    if (explicit !== null) return Math.max(0, App.numberValue(explicit));
    return isPaid(item) ? invoiceAmount(item) : 0;
  }
  function invoiceBalance(item) {
    if (isPaid(item)) return 0;
    const explicit = App.pick(item, ["balance_due", "remaining_amount", "outstanding_amount", "amount_due"], null);
    if (explicit !== null) return Math.max(0, App.numberValue(explicit));
    return Math.max(0, invoiceAmount(item) - invoicePaid(item));
  }
  function recordStatus(item) {
    return String(App.pick(item, ["status", "payment_status", "state"], "pending")).toLowerCase();
  }
  function isPaid(item) {
    return ["paid", "success", "successful", "completed", "captured"].includes(recordStatus(item));
  }
  function isOverdue(item) {
    if (isPaid(item) || invoiceBalance(item) <= 0) return false;
    if (["overdue", "past_due"].includes(recordStatus(item))) return true;
    const due = new Date(App.pick(item, ["due_date", "due_at", "payment_due_date"], ""));
    if (Number.isNaN(due.getTime())) return false;
    due.setHours(23, 59, 59, 999);
    return due.getTime() < Date.now();
  }
  function customerName(item) {
    return App.pick(item, ["customer_name", "client_name", "customer.name", "customer.full_name", "client.name", "client.full_name"], "—");
  }
  function invoiceLabel(item) {
    return App.pick(item, ["invoice_number", "number", "reference", "id", "uuid"], "—");
  }
  function paymentAmount(item) {
    return App.numberValue(App.pick(item, ["amount", "paid_amount", "total_amount", "payment_amount"], 0));
  }
  function paymentSuccessful(item) {
    return ["success", "successful", "paid", "completed", "captured"].includes(recordStatus(item));
  }
  function invoiceStatusLabel(item) {
    if (isPaid(item)) return "paid";
    if (isOverdue(item)) return "overdue";
    return recordStatus(item) === "unknown" ? "pending" : recordStatus(item);
  }

  function renderInvoiceSummary() {
    const paid = invoices.filter(isPaid).length;
    const overdue = invoices.filter(isOverdue).length;
    const pending = invoices.filter(item => !isPaid(item) && !isOverdue(item)).length;
    if ($("totalInvoices")) $("totalInvoices").textContent = String(invoices.length);
    if ($("paidInvoices")) $("paidInvoices").textContent = String(paid);
    if ($("pendingInvoices")) $("pendingInvoices").textContent = String(pending);
    if ($("overdueInvoices")) $("overdueInvoices").textContent = String(overdue);
  }

  function renderInvoices() {
    const body = $("invoicesTableBody");
    if (!body) return;
    const query = ($("invoiceSearch")?.value || "").trim().toLowerCase();
    const status = $("invoiceStatusFilter")?.value || "all";
    const filtered = invoices.filter(item => {
      const searchable = [invoiceLabel(item), customerName(item), App.getRecordId(item)].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) && (status === "all" || invoiceStatusLabel(item) === status);
    });
    if (!filtered.length) {
      body.innerHTML = `<tr><td colspan="8" class="empty-state">No invoices match the selected search or filter.</td></tr>`;
      return;
    }
    body.innerHTML = filtered.map((item, index) => {
      const id = App.getRecordId(item);
      const currency = App.pick(item, ["currency"], "INR");
      const statusValue = invoiceStatusLabel(item);
      const action = id ? `<button class="table-action" type="button" data-print-invoice="${App.escapeHTML(id)}">Print / PDF</button>` : `<span>Missing record ID</span>`;
      return `<tr>
        <td>${App.escapeHTML(invoiceLabel(item) || `Record ${index + 1}`)}</td>
        <td>${App.escapeHTML(customerName(item))}</td>
        <td>${App.escapeHTML(App.formatDate(App.pick(item, ["issue_date", "created_at", "date"])))}</td>
        <td>${App.escapeHTML(App.formatDate(App.pick(item, ["due_date", "due_at"])))}</td>
        <td>${App.escapeHTML(App.formatMoney(invoiceAmount(item), currency))}</td>
        <td>${App.escapeHTML(App.formatMoney(invoiceBalance(item), currency))}</td>
        <td><span class="status-pill ${App.escapeHTML(statusValue)}">${App.escapeHTML(statusValue)}</span></td>
        <td>${action}</td>
      </tr>`;
    }).join("");
  }

  function renderInvoiceDocument(record) {
    const currency = App.pick(record, ["currency"], "INR");
    const customer = record.customer || record.client || {};
    const seller = record.seller || record.company || {};
    const items = App.pick(record, ["items", "line_items", "invoice_items"], []);
    const subtotal = App.pick(record, ["subtotal", "sub_total"], null);
    const tax = App.pick(record, ["tax_amount", "tax", "total_tax"], 0);
    const discount = App.pick(record, ["discount_amount", "discount"], 0);
    const total = invoiceAmount(record);
    const amountPaid = invoicePaid(record);
    const balance = invoiceBalance(record);
    const id = invoiceLabel(record);
    const sellerName = App.pick(seller, ["name", "company_name"], App.pick(record, ["seller_name", "company_name"], "Issuing organisation"));
    const itemRows = Array.isArray(items) && items.length ? items.map(item => {
      const description = App.pick(item, ["description", "name", "product_name", "plan_name"], "—");
      const quantity = App.numberValue(App.pick(item, ["quantity", "qty"], 1));
      const unitPrice = App.numberValue(App.pick(item, ["unit_price", "price", "rate"], 0));
      const lineTotal = App.numberValue(App.pick(item, ["total", "line_total", "amount"], quantity * unitPrice));
      return `<tr><td>${App.escapeHTML(description)}</td><td class="numeric">${App.escapeHTML(quantity)}</td><td class="numeric">${App.escapeHTML(App.formatMoney(unitPrice, currency))}</td><td class="numeric">${App.escapeHTML(App.formatMoney(lineTotal, currency))}</td></tr>`;
    }).join("") : `<tr><td colspan="4">Line-item details were not included in the API response.</td></tr>`;
    const subValue = subtotal === null ? total - App.numberValue(tax) + App.numberValue(discount) : subtotal;
    const customerNameValue = App.pick(customer, ["name", "full_name"], customerName(record));
    const customerAddress = App.pick(customer, ["address", "billing_address"], App.pick(record, ["customer_address", "billing_address"], ""));
    const customerEmail = App.pick(customer, ["email"], App.pick(record, ["customer_email"], ""));

    return `<article class="document-sheet">
      <header class="document-top"><div class="document-brand"><h1>${App.escapeHTML(sellerName)}</h1><p>${App.escapeHTML(App.pick(seller, ["address", "billing_address"], App.pick(record, ["seller_address", "company_address"], "")))}</p><p>${App.escapeHTML(App.pick(seller, ["email", "phone"], ""))}</p></div>
      <div class="document-meta"><p><strong>Invoice:</strong> ${App.escapeHTML(id)}</p><p><strong>Issue date:</strong> ${App.escapeHTML(App.formatDate(App.pick(record, ["issue_date", "created_at", "date"])))}</p><p><strong>Due date:</strong> ${App.escapeHTML(App.formatDate(App.pick(record, ["due_date", "due_at"])))}</p></div></header>
      <h2 class="document-title">TAX INVOICE</h2>
      <section class="document-parties"><div><h3>Bill to</h3><p><strong>${App.escapeHTML(customerNameValue)}</strong></p><p>${App.escapeHTML(customerAddress)}</p><p>${App.escapeHTML(customerEmail)}</p></div><div><h3>Payment details</h3><p>Status: ${App.escapeHTML(invoiceStatusLabel(record))}</p><p>Payment method: ${App.escapeHTML(App.pick(record, ["payment_method", "method"], "—"))}</p><p>Reference: ${App.escapeHTML(App.pick(record, ["payment_reference", "transaction_id"], "—"))}</p></div></section>
      <table class="document-table"><thead><tr><th>Description</th><th class="numeric">Qty</th><th class="numeric">Unit price</th><th class="numeric">Line total</th></tr></thead><tbody>${itemRows}</tbody></table>
      <section class="document-totals"><div class="document-total-row"><span>Subtotal</span><strong>${App.escapeHTML(App.formatMoney(subValue, currency))}</strong></div><div class="document-total-row"><span>Discount</span><strong>${App.escapeHTML(App.formatMoney(discount, currency))}</strong></div><div class="document-total-row"><span>Tax</span><strong>${App.escapeHTML(App.formatMoney(tax, currency))}</strong></div><div class="document-total-row"><span>Paid</span><strong>${App.escapeHTML(App.formatMoney(amountPaid, currency))}</strong></div><div class="document-total-row grand-total"><span>Balance due</span><strong>${App.escapeHTML(App.formatMoney(balance, currency))}</strong></div></section>
      <section class="document-notes"><strong>Notes</strong>\n${App.escapeHTML(App.pick(record, ["notes", "terms", "description"], ""))}</section>
      <footer class="document-footer">This invoice was generated from the customer management system. Please retain it for your records.</footer>
    </article>`;
  }

  async function printInvoice(id) {
    const record = invoices.find(item => String(App.getRecordId(item)) === String(id));
    if (!record) throw new Error("Invoice record is no longer available. Refresh the list and try again.");
    let detail = record;
    try {
      const result = await App.apiRequest(`${invoiceEndpoint}/${encodeURIComponent(id)}`);
      if (result && typeof result === "object") {
        detail = result.invoice || result.data?.invoice || (result.data && !Array.isArray(result.data) ? result.data : result);
      }
    } catch (error) {
      const hasItems = Array.isArray(record.items) || Array.isArray(record.line_items) || Array.isArray(record.invoice_items);
      if (!hasItems) throw new Error(`Could not load full invoice details for printing. ${error.message}`);
    }
    const area = $("invoicePrintArea");
    area.innerHTML = renderInvoiceDocument(detail);
    area.classList.add("is-visible");
    document.body.classList.add("printing-document");
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("printing-document");
      area.classList.remove("is-visible");
    }, { once: true });
    window.print();
  }

  function renderOverdueAccounts() {
    const body = $("overdueAccountsBody");
    if (!body) return;
    const threshold = $("overdueQuickFilter")?.value || "all";
    const now = new Date();
    const results = invoices.filter(item => isOverdue(item)).filter(item => {
      if (threshold === "all") return true;
      const due = new Date(App.pick(item, ["due_date", "due_at", "payment_due_date"], ""));
      if (Number.isNaN(due.getTime())) return threshold === "all";
      const ageDays = Math.floor((now.getTime() - due.getTime()) / 86400000);
      return ageDays >= Number(threshold);
    }).sort((a, b) => new Date(App.pick(a, ["due_date", "due_at"], 0)) - new Date(App.pick(b, ["due_date", "due_at"], 0)));

    if (!results.length) {
      body.innerHTML = `<tr><td colspan="4" class="empty-state">No overdue accounts for this filter.</td></tr>`;
      return;
    }
    body.innerHTML = results.map(item => `<tr>
      <td>${App.escapeHTML(customerName(item))}</td>
      <td>${App.escapeHTML(invoiceLabel(item))}</td>
      <td>${App.escapeHTML(App.formatDate(App.pick(item, ["due_date", "due_at"])))}</td>
      <td>${App.escapeHTML(App.formatMoney(invoiceBalance(item), App.pick(item, ["currency"], "INR")))}</td>
    </tr>`).join("");
  }

  function renderDashboardMetrics() {
    const collected = payments.filter(paymentSuccessful).reduce((sum, item) => sum + paymentAmount(item), 0);
    const outstanding = invoices.reduce((sum, item) => sum + (isPaid(item) ? 0 : invoiceBalance(item)), 0);
    const overdue = invoices.filter(isOverdue).reduce((sum, item) => sum + invoiceBalance(item), 0);
    if ($("collectedRevenue")) $("collectedRevenue").textContent = App.formatMoney(collected);
    if ($("outstandingRevenue")) $("outstandingRevenue").textContent = App.formatMoney(outstanding);
    if ($("overdueRevenue")) $("overdueRevenue").textContent = App.formatMoney(overdue);
    if ($("successfulPaymentCount")) $("successfulPaymentCount").textContent = String(payments.filter(paymentSuccessful).length);
    renderOverdueAccounts();
    renderRevenueChart();
  }

  function renderRevenueChart() {
    const canvas = $("revenueChart");
    if (!canvas) return;
    const message = $("chartMessage");
    const days = Number($("revenueRange")?.value || 30);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - days + 1);
    const buckets = new Map();
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      buckets.set(localDateKey(date), 0);
    }
    for (const payment of payments) {
      if (!paymentSuccessful(payment)) continue;
      const dateValue = App.pick(payment, ["payment_date", "paid_at", "created_at", "date", "processed_at"], "");
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) continue;
      const key = localDateKey(date);
      if (buckets.has(key)) buckets.set(key, buckets.get(key) + paymentAmount(payment));
    }
    const values = [...buckets.values()];
    const hasData = values.some(value => value > 0);
    if (message) message.textContent = hasData ? "" : "No successful payment data is available for this period.";

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || 600));
    const height = Math.max(200, Math.floor(rect.height || 270));
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);

    const pad = { left: 58, right: 14, top: 15, bottom: 32 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const max = Math.max(1, ...values) * 1.15;
    ctx.font = "11px Arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e6ebf2";
    ctx.fillStyle = "#667085";
    for (let line = 0; line <= 4; line++) {
      const y = pad.top + plotH * line / 4;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      const value = max * (4 - line) / 4;
      ctx.fillText(formatCompact(value), 4, y + 4);
    }
    if (hasData) {
      const points = values.map((value, index) => ({
        x: pad.left + (values.length === 1 ? plotW / 2 : plotW * index / (values.length - 1)),
        y: pad.top + plotH - (value / max) * plotH
      }));
      ctx.beginPath();
      points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.strokeStyle = "#2459d3"; ctx.lineWidth = 2.5; ctx.stroke();
      points.forEach(point => { ctx.beginPath(); ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = "#2459d3"; ctx.fill(); });
    }
    const labels = [...buckets.keys()];
    const labelCount = Math.min(5, labels.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.round((labels.length - 1) * i / Math.max(1, labelCount - 1));
      const date = new Date(`${labels[index]}T00:00:00`);
      const label = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
      const x = pad.left + (labels.length === 1 ? plotW / 2 : plotW * index / (labels.length - 1));
      ctx.fillStyle = "#667085"; ctx.textAlign = i === 0 ? "left" : i === labelCount - 1 ? "right" : "center";
      ctx.fillText(label, x, height - 8);
    }
    ctx.textAlign = "left";
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function formatCompact(value) {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${Math.round(value)}`;
  }

  async function loadInvoiceData() {
    App.showMessage("invoicesMessage", "Loading invoices…");
    try {
      const response = await App.apiRequest(invoiceEndpoint);
      invoices = App.normalizeList(response, ["invoices"]);
      renderInvoiceSummary();
      renderInvoices();
      App.showMessage("invoicesMessage", `${invoices.length} invoice record(s) loaded.`, "success");
    } catch (error) {
      invoices = [];
      renderInvoiceSummary();
      renderInvoices();
      App.showMessage("invoicesMessage", error.message, "error");
    }
  }

  async function loadDashboardData() {
    App.showMessage("dashboardMessage", "Loading finance data…");
    try {
      const [invoiceResponse, paymentResponse] = await Promise.all([
        App.apiRequest(invoiceEndpoint),
        App.apiRequest(paymentEndpoint)
      ]);
      invoices = App.normalizeList(invoiceResponse, ["invoices"]);
      payments = App.normalizeList(paymentResponse, ["payments", "transactions"]);
      renderDashboardMetrics();
      App.showMessage("dashboardMessage", "Finance data loaded from the API.", "success");
    } catch (error) {
      invoices = [];
      payments = [];
      renderDashboardMetrics();
      App.showMessage("dashboardMessage", error.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if ($("invoicesTableBody")) {
      $("invoiceSearch")?.addEventListener("input", renderInvoices);
      $("invoiceStatusFilter")?.addEventListener("change", renderInvoices);
      $("refreshInvoicesBtn")?.addEventListener("click", loadInvoiceData);
      $("invoicesTableBody")?.addEventListener("click", event => {
        const button = event.target.closest("[data-print-invoice]");
        if (!button) return;
        printInvoice(button.dataset.printInvoice).catch(error => App.showMessage("invoicesMessage", error.message, "error"));
      });
      loadInvoiceData();
    }

    if ($("revenueChart")) {
      $("refreshDashboardBtn")?.addEventListener("click", loadDashboardData);
      $("revenueRange")?.addEventListener("change", renderRevenueChart);
      $("overdueQuickFilter")?.addEventListener("change", renderOverdueAccounts);
      window.addEventListener("resize", renderRevenueChart);
      loadDashboardData();
    }
  });
})();
