/* Shared helpers for Person 3 finance pages. */
(function () {
  "use strict";

  const config = {
    // Leave empty when frontend and FastAPI are served from the same origin.
    // For a separate local frontend, set for example: "http://localhost:8000".
    apiBaseUrl: "",
    endpoints: {
      quotations: "/api/quotations",
      invoices: "/api/invoices",
      payments: "/api/payments"
    }
  };

  function buildUrl(path) {
    const base = String(config.apiBaseUrl || "").replace(/\/$/, "");
    const route = String(path || "");
    if (/^https?:\/\//i.test(route)) return route;
    return `${base}${route.startsWith("/") ? route : `/${route}`}`;
  }

  async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response;
    try {
      response = await fetch(buildUrl(path), {
        ...options,
        headers,
        credentials: options.credentials || "same-origin"
      });
    } catch (error) {
      throw new Error(`Could not reach the API. Check the FastAPI server, API base URL and CORS settings. ${error.message}`);
    }

    const raw = await response.text();
    let payload = null;
    if (raw) {
      try { payload = JSON.parse(raw); }
      catch { payload = raw; }
    }

    if (!response.ok) {
      const detail = payload && typeof payload === "object"
        ? (payload.detail || payload.message || payload.error)
        : payload;
      throw new Error(`API request failed (${response.status})${detail ? `: ${detail}` : ""}`);
    }
    return payload;
  }

  function normalizeList(payload, preferredKeys = []) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    for (const key of [...preferredKeys, "items", "results", "data"]) {
      if (Array.isArray(payload[key])) return payload[key];
      if (payload[key] && typeof payload[key] === "object") {
        const nested = normalizeList(payload[key], preferredKeys);
        if (nested.length) return nested;
      }
    }
    return [];
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>\"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[char]);
  }

  function pick(object, keys, fallback = "") {
    for (const key of keys) {
      const value = key.split(".").reduce((current, part) => current == null ? undefined : current[part], object);
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
  }

  function numberValue(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value, currency = "INR") {
    const amount = numberValue(value);
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency", currency, maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function showMessage(elementId, message, type = "info") {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message || "";
    element.className = `page-message${type === "error" ? " error" : type === "success" ? " success" : ""}`;
  }

  function getRecordId(record) {
    return pick(record, ["id", "uuid", "invoice_id", "quotation_id", "_id"], "");
  }

  window.App = {
    config,
    apiRequest,
    normalizeList,
    escapeHTML,
    pick,
    numberValue,
    formatMoney,
    formatDate,
    showMessage,
    getRecordId,
    buildUrl
  };

  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".admin-nav a").forEach(link => {
      const target = link.getAttribute("href");
      link.classList.toggle("active", target === currentPage);
    });
  });
})();
