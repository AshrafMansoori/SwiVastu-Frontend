import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://swi-back.onrender.com/api/v1";

/* =========================
   LOGIN USER
========================= */

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${API_URL}/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    result?.message || "Login failed"
                );
            }

            return result.data;

        } catch (error) {
            return rejectWithValue(
                error.message || "Something went wrong"
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

            const result = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    result?.message || "Unable to get current user"
                );
            }

            return result.data;

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

const initialState = {
    user: null,
    isAuthenticated: false,

    loading: false,
    error: null,

    // Important for initial authentication check
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

        /* =========================
           LOGIN
        ========================= */

        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;

                state.user = action.payload.user;
                state.isAuthenticated = true;

                state.error = null;
                state.authChecked = true;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;

                state.user = null;
                state.isAuthenticated = false;

                state.error =
                    action.payload || "Login failed";

                state.authChecked = true;
            });


        /* =========================
           CURRENT USER
        ========================= */

        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;

                state.user = action.payload;
                state.isAuthenticated = true;

                state.error = null;
                state.authChecked = true;
            })

            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;

                state.user = null;
                state.isAuthenticated = false;

                // No error required for normal logged-out users
                state.error = null;

                state.authChecked = true;
            });
    },
});


export const {
    logout,
    clearError,
} = authSlice.actions;

export default authSlice.reducer;