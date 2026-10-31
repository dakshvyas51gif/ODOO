
// ======================================
// BRIGHTLOOP - RESET PASSWORD
// File: js/reset-password.js
// ======================================

const API_BASE_URL = "http://127.0.0.1:8000";
const RESET_ENDPOINT = "/api/v1/auth/reset-password";

const form = document.getElementById("resetPasswordForm");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const submitButton = document.getElementById("resetPasswordButton");
const formMessage = document.getElementById("formMessage");

const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

// Password requirements
const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{9,}$/;

// Reset token from email link
const resetToken = new URLSearchParams(
    window.location.search
).get("token");

// Show field error
function showError(input, element, message) {
    element.textContent = message;
    input.classList.add("input-error");
}

// Clear field error
function clearError(input, element) {
    element.textContent = "";
    input.classList.remove("input-error");
}

// Show general message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// Button loading state
function setLoading(loading) {
    submitButton.disabled = loading;

    submitButton.textContent = loading
        ? "Updating Password..."
        : "Reset Password";
}

// Validate form
function validateForm() {
    let valid = true;

    clearError(newPassword, passwordError);
    clearError(confirmPassword, confirmPasswordError);

    if (!resetToken) {
        showMessage(
            "Invalid or missing reset link. Please request a new one.",
            "error"
        );

        return false;
    }

    if (!passwordPattern.test(newPassword.value)) {
        showError(
            newPassword,
            passwordError,
            "Password must contain more than 8 characters, uppercase, lowercase and a special character."
        );

        valid = false;
    }

    if (newPassword.value !== confirmPassword.value) {
        showError(
            confirmPassword,
            confirmPasswordError,
            "Passwords do not match."
        );

        valid = false;
    }

    return valid;
}

// Call FastAPI
async function updatePassword() {
    const response = await fetch(
        `${API_BASE_URL}${RESET_ENDPOINT}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                token: resetToken,
                new_password: newPassword.value
            })
        }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            typeof result.detail === "string"
                ? result.detail
                : result.message || "Password reset failed."
        );
    }

    return result;
}

// Submit form
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!validateForm()) return;

    try {
        setLoading(true);

        const result = await updatePassword();

        showMessage(
            result.message || "Password updated successfully. Please login.",
            "success"
        );

        form.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1800);

    } catch (error) {
        console.error("Reset password error:", error);

        showMessage(
            error.message || "Unable to connect to the server.",
            "error"
        );

    } finally {
        setLoading(false);
    }
});

// Live password validation
newPassword.addEventListener("input", () => {
    if (passwordPattern.test(newPassword.value)) {
        clearError(newPassword, passwordError);
    }

    if (
        confirmPassword.value &&
        confirmPassword.value !== newPassword.value
    ) {
        showError(
            confirmPassword,
            confirmPasswordError,
            "Passwords do not match."
        );
    }
});

// Live confirm password validation
confirmPassword.addEventListener("input", () => {
    if (confirmPassword.value === newPassword.value) {
        clearError(confirmPassword, confirmPasswordError);
    }
});

console.log("Brightloop Reset Password Module Initialized.");
