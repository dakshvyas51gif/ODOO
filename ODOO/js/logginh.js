
// ======================================
// BRIGHTLOOP - LOGIN MODULE
// File: js/login.js
// ======================================

const API_BASE_URL = "http://127.0.0.1:8000";
const LOGIN_ENDPOINT = "/api/v1/auth/login";

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const formMessage = document.getElementById("formMessage");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

// Email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Display field errors
function showError(input, element, message) {
    element.textContent = message;
    input.classList.add("input-error");
}

// Clear field errors
function clearError(input, element) {
    element.textContent = "";
    input.classList.remove("input-error");
}

// Display general messages
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// Validate login form
function validateLogin() {
    let valid = true;

    clearError(emailInput, emailError);
    clearError(passwordInput, passwordError);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!emailPattern.test(email)) {
        showError(emailInput, emailError, "Enter a valid email address.");
        valid = false;
    }

    if (!password) {
        showError(passwordInput, passwordError, "Password is required.");
        valid = false;
    }

    return valid;
}

// Button loading state
function setLoading(loading) {
    loginButton.disabled = loading;
    loginButton.textContent = loading
        ? "Logging in..."
        : "Login to Account";
}

// Login API request
async function loginUser(credentials) {
    const response = await fetch(
        `${API_BASE_URL}${LOGIN_ENDPOINT}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(credentials)
        }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            typeof result.detail === "string"
                ? result.detail
                : result.message || "Invalid email or password."
        );
    }

    return result;
}

// Form submission
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!validateLogin()) {
        return;
    }

    const credentials = {
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value
    };

    try {
        setLoading(true);

        await loginUser(credentials);

        showMessage("Login successful! Redirecting...", "success");

        // Backend should set an HTTP-only session cookie.
        // No JWT is stored in localStorage.

        window.location.href = "../customer/dashboard.html";

    } catch (error) {
        console.error("Login error:", error);

        showMessage(
            error.message || "Unable to connect to the server.",
            "error"
        );

    } finally {
        setLoading(false);
    }
});

// Live validation
emailInput.addEventListener("input", () => {
    if (emailPattern.test(emailInput.value.trim())) {
        clearError(emailInput, emailError);
    }
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
        clearError(passwordInput, passwordError);
    }
});

console.log("Brightloop Login Module Initialized.");
