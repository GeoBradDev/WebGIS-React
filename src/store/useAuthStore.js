import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

const allAuthEndpoint = 'http://localhost:8000/_allauth/app/v1/auth';

export const useAuthStore = create(
        persist(
            (set, get) => ({
                user: null,
                isAuthenticated: false,
                csrfToken: null,

                authStage: 'signin',
                setAuthStage: (stage) => set({authStage: stage}),

                // ✅ Set CSRF Token before making requests
                setCsrfToken: async () => {
                    try {
                        const response = await fetch('http://localhost:8000/api/set-csrf-token', {
                            method: 'GET',
                            credentials: 'include'
                        });
                        const data = await response.json();
                        if (data.csrftoken) {
                            set({csrfToken: data.csrftoken});
                        }
                    } catch (error) {
                        console.error("Failed to fetch CSRF token", error);
                    }
                },

// ✅ Register User using Allauth's default signup endpoint
                register: async ({email, password, first_name, last_name}) => {
                    // Ensure CSRF token is set
                    await get().setCsrfToken();
                    const csrftoken = get().csrfToken || getCSRFToken();

                    if (!csrftoken) {
                        console.error("🚨 CSRF token is missing. Cannot register.");
                        return {success: false, errors: [{message: "CSRF token missing"}]};
                    }

                    // Prepare payload
                    const username = email; // Using email as username
                    const requestBody = JSON.stringify({
                        email,
                        username,
                        password,
                        first_name,
                        last_name
                    });

                    try {
                        const response = await fetch(`${allAuthEndpoint}/signup`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken
                            },
                            body: requestBody,
                            credentials: 'include'
                        });

                        const data = await response.json();

                        if (response.status === 401 && data.data && data.data.flows) {
                            const verifyFlow = data.data.flows.find(
                                (flow) => flow.id === "verify_email" && flow.is_pending
                            );
                            if (verifyFlow) {
                                return {
                                    success: false,
                                    verification_pending: true,
                                    message: "A verification email has been sent. Please check your inbox."
                                };
                            }
                        }
                        return {
                            success: false,
                            errors: data.errors || [{message: data.error || "Registration failed"}]
                        };
                    } catch (error) {
                        console.error("🚨 Error during registration:", error);
                        return {success: false, errors: [{message: "Server error. Please try again later."}]};
                    }
                },

                // ✅ Login User
                login: async (email, password) => {
                    await get().setCsrfToken();
                    const csrftoken = get().csrfToken || getCSRFToken();

                    if (!csrftoken) {
                        console.error("CSRF token is missing. Cannot log in.");
                        return {success: false, message: "CSRF token missing"};
                    }

                    try {
                        const response = await fetch(`${allAuthEndpoint}/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken
                            },
                            body: JSON.stringify({email, password}),
                            credentials: 'include'
                        });

                        const data = await response.json();

                        if (response.ok) {
                            set({
                                user: data.user,
                                isAuthenticated: true,
                                sessionToken: data.meta.session_token
                            });
                            return {success: true, message: "Login successful!"};
                        } else {
                            return {success: false, message: data.error || "Invalid credentials"};
                        }
                    } catch (error) {
                        console.error("Login failed:", error);
                        return {success: false, message: "Server error. Please try again later."};
                    }
                },

// ✅ Logout User
                logout:
                    async () => {
                        try {

                            await get().setCsrfToken();
                            const csrfToken = get().csrfToken || getCSRFToken();

                            if (!csrfToken) {
                                console.error("🚨 CSRF token missing. Cannot log out.");
                                return {success: false, message: "CSRF token missing. Cannot log out."};
                            }

                            const sessionToken = get().sessionToken;
                            if (!sessionToken) {
                                console.error("🚨 Session token missing. Cannot log out.");
                                return {success: false, message: "Session token missing. Cannot log out."};
                            }

                            // Send DELETE request to the logout endpoint.
                            const response = await fetch(`${allAuthEndpoint}/session`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': csrfToken,
                                    'X-Session-Token': sessionToken,
                                },
                                credentials: 'include',
                            });

                            // A successful logout returns a 401 response (no authenticated session).
                            if (response.status === 401) {
                                set({user: null, isAuthenticated: false, sessionToken: null});
                                return {success: true, message: "Logout successful!"};
                            } else {
                                return {success: false, message: "Logout completed, but API returned an error."};
                            }
                        } catch (error) {
                            console.error("🚨 Logout error:", error);
                            return {success: false, message: "Server error. Try again later."};
                        }
                    },

                verifyEmail: async (verificationKey) => {
                    try {
                        const decodedKey = decodeURIComponent(verificationKey);
                        const response = await fetch(`${allAuthEndpoint}/email/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({key: decodedKey}),
                            credentials: 'include',
                        });
                        const data = await response.json();
                        if (response.status === 401 && data.data && data.data.flows) {
                            const verifyFlow = data.data.flows.find(flow => flow.id === "verify_email");
                            if (!verifyFlow) {
                                return {success: true, message: "Email verified successfully!"};
                            } else {
                                return {success: false, error: data.error || "Verification is still pending."};
                            }
                        } else {
                            // If the response is not a 401 with flows, treat it as a failure.
                            return {success: false, error: data.error || "Verification failed."};
                        }
                    } catch (error) {
                        console.error("Error in verifyEmail:", error);
                        return {success: false, error: "Server error during verification."};
                    }
                },


                // ✅ Fetch User Session
                fetchUser:
                    async () => {
                        try {
                            await get().setCsrfToken();
                            const csrftoken = get().csrfToken || getCSRFToken();

                            const response = await fetch('http://localhost:8000/api/user', {
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': csrftoken
                                },
                            });

                            if (response.ok) {
                                const data = await response.json();
                                set({user: data, isAuthenticated: true});
                            } else {
                                set({user: null, isAuthenticated: false});
                            }
                        } catch (error) {
                            console.error('Failed to fetch user', error);
                            set({user: null, isAuthenticated: false});
                        }
                    },
            }),
            {
                name: 'auth-storage',
                storage:
                    createJSONStorage(() => localStorage),
            }
        )
    )
;

// ✅ Improved CSRF Token Retrieval Function
export const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue || null; // Return null instead of throwing an error
};
