// Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";

const Login = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const { loading } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email.trim() || !formData.password.trim()) {
            setError("Email and password are required.");
            return;
        }

        try {

            // Redux login
            const result = await dispatch(
                loginUser({
                    email: formData.email.trim(),
                    password: formData.password,
                })
            ).unwrap();

            console.log("Login successful:", result);

            // User data
            console.log("User:", result.user);

            // Login successful → Home
            navigate("/home");

        } catch (error) {

            console.error("Login Error:", error);

            setError(
                typeof error === "string"
                    ? error
                    : "Something went wrong."
            );
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 flex items-center justify-center">

            <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg lg:grid lg:grid-cols-2">

                {/* LEFT SECTION */}
                <div className="hidden lg:flex bg-blue-600 p-8 text-white flex-col justify-center">

                    <div className="mb-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 font-bold text-lg">
                                S
                            </div>

                            <h1 className="text-xl font-bold">
                                SwiVastu
                            </h1>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold leading-tight">
                        Welcome Back!
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-blue-50">
                        Login to continue exchanging, buying, selling and
                        discovering items near you.
                    </p>

                    <div className="mt-8 space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300">
                                ✓
                            </span>
                            Find items nearby
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300">
                                ✓
                            </span>
                            Exchange with trusted users
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300">
                                ✓
                            </span>
                            Chat with other users
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="px-5 py-6 sm:px-8 sm:py-8">

                    {/* Mobile Logo */}
                    <Link to="/" className="mb-5 flex items-center justify-center gap-2 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                            S
                        </div>

                        <span className="text-lg font-bold text-gray-800">
                            SwiVastu
                        </span>
                    </Link>

                    <Link to="/" className="mb-4 hidden text-xs font-semibold text-blue-700 hover:underline lg:inline-flex">
                        ← Back to home
                    </Link>

                    {/* Heading */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Login
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="form-input"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-2">
                            <label className="form-label">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="form-input pr-16"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-blue-600 hover:text-blue-700"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="mb-5 text-right">
                            <button
                                type="button"
                                className="text-[10px] font-medium text-blue-600 hover:underline"
                                onClick={() => {
                                    // Add forgot password later
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    {/* Register */}
                    <div className="mt-5 text-center text-[11px] text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Create Account
                        </Link>
                    </div>

                </div>
            </div>

        </main>
    );
};

export default Login;