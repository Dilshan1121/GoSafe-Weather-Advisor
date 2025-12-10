// auth.js - Dedicated script for login/registration page

const API_CONFIG = {
    backendBase: 'http://localhost:3000/api'
};

// =========================================================================
// I. GLOBAL UTILITY FUNCTIONS (Accessible by Google SDK)
// =========================================================================

/**
 * Utility to display error messages on the login page.
 */
function showErrorInAuthPage(message) {
    const errorTextSpan = document.getElementById('errorTextLogin');
    const errorMsgDiv = document.getElementById('loginErrorMsg');
    if (errorTextSpan && errorMsgDiv) {
        errorTextSpan.textContent = message;
        errorMsgDiv.style.display = 'block';
    }
}

/**
 * Redirects to the main application page after a delay.
 */
function redirectToMainApp() {
    setTimeout(() => {
        window.location.href = 'main.html';
    }, 500);
}

/**
 * Global function called by the Google SDK upon successful Sign-In.
 * Sends the ID token to our backend for verification.
 */
async function handleGoogleLogin(response) {
    console.log("Google ID Token received.");
    const id_token = response.credential;
    
    showErrorInAuthPage("Verifying credentials with server...");

    try {
        // Send the Google ID token to our backend for verification and custom JWT issuance
        const res = await fetch(`${API_CONFIG.backendBase}/auth/google-signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token })
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Google sign-in failed on server.');
        
        // Success: Store our custom JWT and user info
        localStorage.setItem('goSafeToken', result.token);
        localStorage.setItem('goSafeUserId', result.userId);
        localStorage.setItem('goSafeUsername', result.username || 'Google User');
        
        showErrorInAuthPage(`Login successful! Redirecting...`);
        redirectToMainApp();
        
    } catch (error) {
        showErrorInAuthPage(`Google Sign-In Error: ${error.message}`);
        console.error('Google Backend Error:', error);
    }
}


// =========================================================================
// II. DOM CONTENT LOADED (Username/Password Logic)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check immediately if the user is already logged in
    if (localStorage.getItem('goSafeToken')) {
        window.location.href = 'main.html';
        return;
    }

    // --- DOM Elements ---
    const authForm = document.getElementById('authForm');
    const loginButton = document.getElementById('loginBtn');
    const registerButton = document.getElementById('registerBtn');
    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    // Note: errorMsgDiv and errorTextSpan are handled by the global showErrorInAuthPage

    // --- Authentication Handlers ---

    async function handleRegister(username, password) {
        // Use the global function defined above
        showErrorInAuthPage("Registering user...");
        
        try {
            const response = await fetch(`${API_CONFIG.backendBase}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // Store token and user info
            localStorage.setItem('goSafeToken', result.token);
            localStorage.setItem('goSafeUserId', result.userId);
            localStorage.setItem('goSafeUsername', username); 
            showErrorInAuthPage(`Registration successful! Redirecting...`);
            redirectToMainApp();

        } catch (error) {
            showErrorInAuthPage(`Registration failed: ${error.message}`);
        }
    }

    async function handleLogin(username, password) {
        showErrorInAuthPage("Logging in...");
        
        try {
            const response = await fetch(`${API_CONFIG.backendBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // Store token and user info
            localStorage.setItem('goSafeToken', result.token);
            localStorage.setItem('goSafeUserId', result.userId);
            localStorage.setItem('goSafeUsername', username); 
            showErrorInAuthPage(`Login successful! Redirecting...`);
            redirectToMainApp();

        } catch (error) {
            showErrorInAuthPage(`Login failed: ${error.message}`);
        }
    }

    // --- Event Listeners ---
    loginButton.addEventListener('click', () => {
        handleLogin(usernameInput.value, passwordInput.value);
    });
    
    registerButton.addEventListener('click', () => {
        handleRegister(usernameInput.value, passwordInput.value);
    });
    
    // Override form submission default behavior
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Default action is Login when form is submitted by enter key
        handleLogin(usernameInput.value, passwordInput.value);
    });
});