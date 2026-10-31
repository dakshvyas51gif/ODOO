
/* ===== Admin Initialization ===== */

document.addEventListener("DOMContentLoaded", () => {
    setActiveNavigation();
    initializeModals();
});


/* ===== Sidebar Active Link ===== */

function setActiveNavigation() {
    const currentPage = window.location.pathname
        .split("/")
        .pop();

    document.querySelectorAll(".admin-nav a").forEach(link => {
        const linkPage = link.getAttribute("href");

        link.classList.toggle(
            "active",
            linkPage === currentPage
        );
    });
}


/* ===== Modal Handling ===== */

function openModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}


/* ===== Initialize Modal Buttons ===== */

function initializeModals() {
    const modalButtons = [
        ["addProductBtn", "productModal"],
        ["addPlanBtn", "planModal"],
        ["addDiscountBtn", "discountModal"]
    ];

    modalButtons.forEach(([buttonId, modalId]) => {
        const button = document.getElementById(buttonId);

        button?.addEventListener("click", () => {
            openModal(modalId);
        });
    });


    const closeButtons = [
        ["closeProductModal", "productModal"],
        ["cancelProductBtn", "productModal"],

        ["closePlanModal", "planModal"],
        ["cancelPlanBtn", "planModal"],

        ["closeDiscountModal", "discountModal"],
        ["cancelDiscountBtn", "discountModal"]
    ];

    closeButtons.forEach(([buttonId, modalId]) => {
        const button = document.getElementById(buttonId);

        button?.addEventListener("click", () => {
            closeModal(modalId);
        });
    });


    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}


/* ===== API Helper ===== */

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
