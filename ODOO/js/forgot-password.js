
// ======================================
// BRIGHTLOOP - FORGOT PASSWORD
// File: js/forgot-password.js
// ======================================

const API_BASE_URL = "http://127.0.0.1:8000";
const RESET_ENDPOINT = "/api/v1/auth/forgot-password";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");

const submitButton = document.getElementById("forgotPasswordButton");
const formMessage = document.getElementById("formMessage");
const emailError = document.getElementById("emailError");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Show error
function showError(message) {
    emailError.textContent = message;
    emailInput.classList.add("input-error");
}

// Clear error
function clearError() {
    emailError.textContent = "";
    emailInput.classList.remove("input-error");
}

// Show message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// Loading state
function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.textContent = loading
        ? "Sending..."
        : "Send Reset Link";
}

// Submit form
form.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearError();
    formMessage.textContent = "";
    formMessage.className = "form-message";

    const email = emailInput.value.trim().toLowerCase();

    // Validate email
    if (!emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        return;
    }

    try {
        setLoading(true);

        const response = await fetch(
            `${API_BASE_URL}${RESET_ENDPOINT}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.detail || "Unable to process your request."
            );
        }

        // Use a generic response to avoid revealing
        // whether an email belongs to an account.
        showMessage(
            "If an account exists for this email, password reset instructions will be sent.",
            "success"
        );

        form.reset();

    } catch (error) {

        console.error("Forgot password error:", error);

        showMessage(
            error.message || "Unable to connect to the server. Please try again.",
            "error"
        );

    } finally {
        setLoading(false);
    }
});

// Live email validation
emailInput.addEventListener("input", () => {
    if (emailPattern.test(emailInput.value.trim())) {
        clearError();
    }
});

console.log("Brightloop Forgot Password Module Initialized.");

