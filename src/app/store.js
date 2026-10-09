import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AUTH_STORAGE_KEY } from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

let previousUser = store.getState().auth.user;

store.subscribe(() => {
    const user = store.getState().auth.user;
    if (user === previousUser) return;

    previousUser = user;

    try {
        if (user) {
            const cachedProfile = {
                _id: user._id,
                fullname: user.fullname,
                profileImage: user.profileImage,
                isVerified: user.isVerified,
                trustScore: user.trustScore,
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cachedProfile));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch (error) {
        console.error("Unable to save cached profile:", error);
    }
});