import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            csrfToken: null,

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

            register: async ({ email, password, first_name, last_name }) => {
                await get().setCsrfToken();
                const csrftoken = get().csrfToken || getCSRFToken();

                if (!csrftoken) {
                    console.error("CSRF token is missing. Cannot register.");
                    return false;
                }

                try {
                    const response = await fetch('http://localhost:8000/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        body: JSON.stringify({ email, password, first_name, last_name }),
                        credentials: 'include'
                    });

                    const data = await response.json();

                    if (response.ok) {
                        set({ user: data.user, isAuthenticated: true });
                        return true;
                    } else {
                        console.error("Registration failed:", data);
                        return false;
                    }
                } catch (error) {
                    console.error("Error during registration:", error);
                    return false;
                }
            },

            login: async (email, password) => {
                await get().setCsrfToken();
                const csrftoken = get().csrfToken || getCSRFToken();

                if (!csrftoken) {
                    console.error("CSRF token is missing. Cannot log in.");
                    return false;
                }

                try {
                    const response = await fetch('http://localhost:8000/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        body: JSON.stringify({ email, password }),
                        credentials: 'include'
                    });

                    const data = await response.json();
                    if (response.ok) {
                        set({ user: data.user, isAuthenticated: true });
                        return true;
                    } else {
                        set({ user: null, isAuthenticated: false });
                        return false;
                    }
                } catch (error) {
                    console.error("Login failed:", error);
                    return false;
                }

            },

            logout: async () => {
                try {
                    const {setCsrfToken, isAuthenticated} = get();

                    if (!isAuthenticated) {
                        console.warn("User is not authenticated, no need to logout.");
                        return false;
                    }

                    // Ensure CSRF token is up to date
                    await setCsrfToken();
                    const updatedCsrfToken = get().csrfToken || getCSRFToken();

                    if (!updatedCsrfToken) {
                        console.error("CSRF token is missing. Cannot log out.");
                        return false;
                    }

                     // 🔹 Debugging: Check if the user is still authenticated
                    const sessionCheck = await fetch('http://localhost:8000/api/user', {
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'}
                    });

                    if (sessionCheck.status === 401) {
                        console.warn("Session expired, forcing logout.");
                        set(() => ({ user: null, isAuthenticated: false, csrfToken: null }));
                        return false;
                    }

                    // Perform logout request
                    const response = await fetch('http://localhost:8000/api/logout', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': updatedCsrfToken,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        const responseData = await response.json();
                        console.error("Logout failed:", responseData);
                        return false;
                    }

                    // Logout successful
                    set(() => ({ user: null, isAuthenticated: false, csrfToken: null }));
                    console.log("Logout successful!");

                    return true;

                } catch (error) {
                    console.error('Logout error:', error);
                    return false;
                }
            },


            fetchUser: async () => {
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
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ✅ Use this function to get CSRF from cookies
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
    if (!cookieValue) {
        throw new Error('Missing CSRF cookie.');
    }
    return cookieValue;
};
