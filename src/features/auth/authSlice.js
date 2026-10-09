import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../../services/api.js";

export const AUTH_STORAGE_KEY = "swivastu.auth.user";

const loadCachedUser = () => {
    try {
        const cachedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const user = cachedUser ? JSON.parse(cachedUser) : null;

        return user && typeof user === "object" && !Array.isArray(user)
            ? user
            : null;
    } catch (error) {
        console.error("Unable to restore cached profile:", error);
        return null;
    }
};

/* =========================
   LOGIN USER
========================= */

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            let result;
            try {
                result = await response.json();
            } catch {
                if (response.ok) {
                    return rejectWithValue(
                        "The server returned an invalid response."
                    );
                }
                return rejectWithValue(
                    `Login failed with status ${response.status}.`
                );
            }

            if (!response.ok) {
                return rejectWithValue(
                    result?.message || "Login failed"
                );
            }

            return result.data;
        } catch (error) {
            return rejectWithValue(
                error instanceof TypeError
                    ? "Could not connect to the login service. Check your internet connection and try again."
                    : error.message || "Something went wrong"
            );
        }
    }
);

/* =========================
   GET CURRENT USER
========================= */

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${API_URL}/users/current-user`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            // Not logged in or session expired
            if (response.status === 401) {
                return rejectWithValue("UNAUTHENTICATED");
            }

            const result = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    result?.message || "Unable to get current user"
                );
            }

            const user =
                result?.data?.user ??
                result?.data ??
                result?.user ??
                null;

            if (!user || typeof user !== "object" || Array.isArray(user)) {
                return rejectWithValue("Invalid current-user response");
            }

            return user;
        } catch (error) {
            return rejectWithValue(
                error.message || "Something went wrong"
            );
        }
    }
);

/* =========================
   INITIAL STATE
========================= */

const cachedUser = loadCachedUser();

const initialState = {
    user: cachedUser,
    isAuthenticated: Boolean(cachedUser),
    loading: false,
    error: null,
    authChecked: false,
};

/* =========================
   AUTH SLICE
========================= */

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.authChecked = true;
        },

        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        /* LOGIN */

        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;

                const payload = action.payload;
                state.user = payload?.user ?? payload;
                state.isAuthenticated = Boolean(state.user);

                state.error = null;
                state.authChecked = true;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload || "Login failed";
                state.authChecked = true;
            });

        /* CURRENT USER */

        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.error = null;
            })

            .addCase(getCurrentUser.fulfilled, (state, action) => {
                const payload = action.payload;

                state.user = payload?.user ?? payload;
                state.isAuthenticated = Boolean(state.user);

                state.error = null;
                state.authChecked = true;
            })

            .addCase(getCurrentUser.rejected, (state, action) => {
                state.authChecked = true;

                if (action.payload === "UNAUTHENTICATED") {
                    state.user = null;
                    state.isAuthenticated = false;
                    state.error = null;
                } else {
                    // Keep existing auth state during a temporary
                    // network or server error.
                    state.error =
                        action.payload || action.error?.message || null;
                }
            });
    },
});

/* =========================
   EXPORTS
========================= */

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;