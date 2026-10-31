
/* ==========================================
   BRIGHTLOOP - SIGNUP JAVASCRIPT
   File: js/signup.js
========================================== */

// ---------- API CONFIGURATION ----------

// Replace endpoint with the actual FastAPI route
// provided by the backend team.

const API_BASE_URL = "http://127.0.0.1:8000";
const REGISTER_ENDPOINT = "/api/v1/auth/register";

// ---------- DOM ELEMENTS ----------

const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const signupButton = document.getElementById("signupButton");
const formMessage = document.getElementById("formMessage");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

// ---------- VALIDATION PATTERNS ----------

const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{9,}$/;

// ---------- ERROR HELPERS ----------

function showError(input, errorElement, message) {

    errorElement.textContent = message;

    input.classList.add("input-error");
    input.classList.remove("input-success");
}

function clearError(input, errorElement) {

    errorElement.textContent = "";

    input.classList.remove("input-error");
    input.classList.add("input-success");
}

function clearAllErrors() {

    const fields = [
        [fullNameInput, nameError],
        [emailInput, emailError],
        [passwordInput, passwordError],
        [confirmPasswordInput, confirmPasswordError]
    ];

    fields.forEach(([input, error]) => {
        error.textContent = "";
        input.classList.remove("input-error", "input-success");
    });
}

function showMessage(message, type) {

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// ---------- FORM VALIDATION ----------

function validateForm() {

    clearAllErrors();

    let isValid = true;

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Full name validation

    if (fullName.length < 2) {

        showError(
            fullNameInput,
            nameError,
            "Please enter your full name."
        );

        isValid = false;
    }

    // Email validation

    if (!emailPattern.test(email)) {

        showError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );

        isValid = false;
    }

    // Password validation

    if (!passwordPattern.test(password)) {

        showError(
            passwordInput,
            passwordError,
            "Password must contain more than 8 characters, uppercase, lowercase and a special character."
        );

        isValid = false;
    }

    // Confirm password validation

    if (password !== confirmPassword) {

        showError(
            confirmPasswordInput,
            confirmPasswordError,
            "Passwords do not match."
        );

        isValid = false;
    }

    return isValid;
}

// ---------- BUTTON LOADING STATE ----------

function setLoading(isLoading) {

    signupButton.disabled = isLoading;

    signupButton.textContent = isLoading
        ? "Creating Account..."
        : "Create Account";
}

// ---------- FASTAPI SIGNUP REQUEST ----------

async function registerUser(userData) {

    const response = await fetch(
        `${API_BASE_URL}${REGISTER_ENDPOINT}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            credentials: "include",

            body: JSON.stringify(userData)
        }
    );

    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {

        let errorMessage = "Unable to create account.";

        if (typeof result.detail === "string") {
            errorMessage = result.detail;
        }

        else if (Array.isArray(result.detail)) {

            errorMessage = result.detail
                .map(error => error.msg || "Invalid input")
                .join(", ");
        }

        else if (result.message) {
            errorMessage = result.message;
        }

        throw new Error(errorMessage);
    }

    return result;
}

// ---------- SIGNUP FORM SUBMISSION ----------

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    // Validate all inputs

    if (!validateForm()) {

        showMessage(
            "Please correct the errors before continuing.",
            "error"
        );

        return;
    }

    const userData = {
        full_name: fullNameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value
    };

    try {

        setLoading(true);

        const result = await registerUser(userData);

        showMessage(
            result.message || "Account created successfully. Please login.",
            "success"
        );

        signupForm.reset();

        clearAllErrors();

    }

    catch (error) {

        console.error("Signup Error:", error);

        showMessage(
            error.message || "Unable to connect to the server. Please try again.",
            "error"
        );

    }

    finally {

        setLoading(false);

    }

});

// ---------- LIVE INPUT VALIDATION ----------

fullNameInput.addEventListener("input", function () {

    if (this.value.trim().length >= 2) {
        clearError(this, nameError);
    }

});

emailInput.addEventListener("input", function () {

    if (emailPattern.test(this.value.trim())) {
        clearError(this, emailError);
    }

});

passwordInput.addEventListener("input", function () {

    if (passwordPattern.test(this.value)) {
        clearError(this, passwordError);
    }

});

confirmPasswordInput.addEventListener("input", function () {

    if (
        this.value.length > 0 &&
        this.value === passwordInput.value
    ) {
        clearError(this, confirmPasswordError);
    }

});

console.log("Brightloop Signup Module Initialized.");
