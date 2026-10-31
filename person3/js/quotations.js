/* Quotation list, filtering and print-to-PDF deliverable. */
(function () {
  "use strict";
  const App = window.App;
  if (!App) throw new Error("admin.js must load before quotations.js");

  let quotations = [];
  const $ = id => document.getElementById(id);
  const endpoint = App.config.endpoints.quotations;

  function quotationStatus(record) {
    return String(App.pick(record, ["status", "state"], "unknown")).toLowerCase();
  }

  function quotationAmount(record) {
    return App.pick(record, ["grand_total", "total_amount", "amount", "total", "quote_total"], 0);
  }

  function customerName(record) {
    return App.pick(record, ["customer_name", "client_name", "customer.name", "customer.full_name", "client.name", "client.full_name"], "—");
  }

  function renderQuotations() {
    const body = $("quotationsTableBody");
    if (!body) return;
    const query = ($("quotationSearch")?.value || "").trim().toLowerCase();
    const status = $("quotationStatusFilter")?.value || "all";
    const filtered = quotations.filter(item => {
      const searchable = [App.getRecordId(item), customerName(item), App.pick(item, ["quotation_number", "quote_number", "number"], "")]
        .join(" ").toLowerCase();
      return (!query || searchable.includes(query)) && (status === "all" || quotationStatus(item) === status);
    });

    if (!filtered.length) {
      body.innerHTML = `<tr><td colspan="7" class="empty-state">No quotations match the selected search or filter.</td></tr>`;
      return;
    }

    body.innerHTML = filtered.map((item, index) => {
      const id = App.getRecordId(item);
      const displayId = App.pick(item, ["quotation_number", "quote_number", "number", "id", "uuid"], `Record ${index + 1}`);
      const statusValue = quotationStatus(item);
      const action = id
        ? `<button class="table-action" type="button" data-print-quotation="${App.escapeHTML(id)}">Print / PDF</button>`
        : `<span class="muted">Missing record ID</span>`;
      return `<tr>
        <td>${App.escapeHTML(displayId)}</td>
        <td>${App.escapeHTML(customerName(item))}</td>
        <td>${App.escapeHTML(App.formatDate(App.pick(item, ["issue_date", "created_at", "date"])) )}</td>
        <td>${App.escapeHTML(App.formatDate(App.pick(item, ["valid_until", "expiry_date", "expires_at"])) )}</td>
        <td>${App.escapeHTML(App.formatMoney(quotationAmount(item), App.pick(item, ["currency"], "INR")))}</td>
        <td><span class="status-pill ${App.escapeHTML(statusValue)}">${App.escapeHTML(statusValue)}</span></td>
        <td>${action}</td>
      </tr>`;
    }).join("");
  }

  function renderLineItems(items, currency) {
    if (!Array.isArray(items) || !items.length) {
      return `<tr><td colspan="5">Line-item details were not included in the API response.</td></tr>`;
    }
    return items.map(item => {
      const description = App.pick(item, ["description", "name", "product_name", "plan_name"], "—");
      const quantity = App.numberValue(App.pick(item, ["quantity", "qty"], 1));
      const unitPrice = App.numberValue(App.pick(item, ["unit_price", "price", "rate"], 0));
      const total = App.numberValue(App.pick(item, ["total", "line_total", "amount"], quantity * unitPrice));
      return `<tr>
        <td>${App.escapeHTML(description)}</td>
        <td class="numeric">${App.escapeHTML(quantity)}</td>
        <td class="numeric">${App.escapeHTML(App.formatMoney(unitPrice, currency))}</td>
        <td class="numeric">${App.escapeHTML(App.formatMoney(total, currency))}</td>
      </tr>`;
    }).join("");
  }

  function buildQuotationDocument(record) {
    const currency = App.pick(record, ["currency"], "INR");
    const customer = record.customer || record.client || {};
    const seller = record.seller || record.company || {};
    const items = App.pick(record, ["items", "line_items", "quotation_items"], []);
    const subtotal = App.pick(record, ["subtotal", "sub_total"], null);
    const tax = App.pick(record, ["tax_amount", "tax", "total_tax"], 0);
    const discount = App.pick(record, ["discount_amount", "discount"], 0);
    const total = quotationAmount(record);
    const id = App.pick(record, ["quotation_number", "quote_number", "number", "id"], "—");
    const sellerName = App.pick(seller, ["name", "company_name"], App.pick(record, ["seller_name", "company_name"], "Issuing organisation"));
    const sellerAddress = App.pick(seller, ["address", "billing_address"], App.pick(record, ["seller_address", "company_address"], ""));
    const customerAddress = App.pick(customer, ["address", "billing_address"], App.pick(record, ["customer_address", "client_address"], ""));
    const customerEmail = App.pick(customer, ["email"], App.pick(record, ["customer_email", "client_email"], ""));
    const itemRows = renderLineItems(items, currency);
    const subValue = subtotal === null ? App.numberValue(total) - App.numberValue(tax) + App.numberValue(discount) : subtotal;

    return `<article class="document-sheet">
      <header class="document-top">
        <div class="document-brand"><h1>${App.escapeHTML(sellerName)}</h1><p>${App.escapeHTML(sellerAddress)}</p></div>
        <div class="document-meta"><p><strong>Quotation:</strong> ${App.escapeHTML(id)}</p><p><strong>Issue date:</strong> ${App.escapeHTML(App.formatDate(App.pick(record, ["issue_date", "created_at", "date"])))}</p><p><strong>Valid until:</strong> ${App.escapeHTML(App.formatDate(App.pick(record, ["valid_until", "expiry_date", "expires_at"])))}</p></div>
      </header>
      <h2 class="document-title">QUOTATION</h2>
      <section class="document-parties"><div><h3>Prepared for</h3><p><strong>${App.escapeHTML(App.pick(customer, ["name", "full_name"], customerName(record)))}</strong></p><p>${App.escapeHTML(customerAddress)}</p><p>${App.escapeHTML(customerEmail)}</p></div><div><h3>Reference</h3><p>Quotation ${App.escapeHTML(id)}</p><p>Status: ${App.escapeHTML(quotationStatus(record))}</p></div></section>
      <table class="document-table"><thead><tr><th>Description</th><th class="numeric">Qty</th><th class="numeric">Unit price</th><th class="numeric">Line total</th></tr></thead><tbody>${itemRows}</tbody></table>
      <section class="document-totals"><div class="document-total-row"><span>Subtotal</span><strong>${App.escapeHTML(App.formatMoney(subValue, currency))}</strong></div><div class="document-total-row"><span>Discount</span><strong>${App.escapeHTML(App.formatMoney(discount, currency))}</strong></div><div class="document-total-row"><span>Tax</span><strong>${App.escapeHTML(App.formatMoney(tax, currency))}</strong></div><div class="document-total-row grand-total"><span>Total</span><strong>${App.escapeHTML(App.formatMoney(total, currency))}</strong></div></section>
      <section class="document-notes"><strong>Notes / Terms</strong>\n${App.escapeHTML(App.pick(record, ["notes", "terms", "description"], ""))}</section>
      <footer class="document-footer">This quotation was generated from the customer management system.</footer>
    </article>`;
  }

  async function printQuotation(id) {
    const record = quotations.find(item => String(App.getRecordId(item)) === String(id));
    if (!record) throw new Error("Quotation record is no longer available. Refresh the list and try again.");
    let detail = record;
    try {
      const result = await App.apiRequest(`${endpoint}/${encodeURIComponent(id)}`);
      if (result && typeof result === "object") {
        detail = result.quotation || result.data?.quotation || (result.data && !Array.isArray(result.data) ? result.data : result);
      }
    } catch (error) {
      const hasItems = Array.isArray(record.items) || Array.isArray(record.line_items) || Array.isArray(record.quotation_items);
      if (!hasItems) throw new Error(`Could not load full quotation details for printing. ${error.message}`);
    }
    const area = $("quotationPrintArea");
    area.innerHTML = buildQuotationDocument(detail);
    area.classList.add("is-visible");
    document.body.classList.add("printing-document");
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("printing-document");
      area.classList.remove("is-visible");
    }, { once: true });
    window.print();
  }

  async function loadQuotations() {
    App.showMessage("quotationsMessage", "Loading quotations…");
    try {
      const response = await App.apiRequest(endpoint);
      quotations = App.normalizeList(response, ["quotations"]);
      renderQuotations();
      App.showMessage("quotationsMessage", `${quotations.length} quotation record(s) loaded.`, "success");
    } catch (error) {
      quotations = [];
      renderQuotations();
      App.showMessage("quotationsMessage", error.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("quotationSearch")?.addEventListener("input", renderQuotations);
    $("quotationStatusFilter")?.addEventListener("change", renderQuotations);
    $("refreshQuotationsBtn")?.addEventListener("click", loadQuotations);
    $("quotationsTableBody")?.addEventListener("click", event => {
      const button = event.target.closest("[data-print-quotation]");
      if (!button) return;
      printQuotation(button.dataset.printQuotation).catch(error => App.showMessage("quotationsMessage", error.message, "error"));
    });
    loadQuotations();
  });
})();
