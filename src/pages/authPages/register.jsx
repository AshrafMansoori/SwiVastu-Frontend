import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../services/api.js";

const Register = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileImage, setProfileImage] = useState(null);

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        contactNumber: "",
        password: "",
        confirmPassword: "",
        locationName: "",
        longitude: "",
        latitude: "",
    });

    const [locationAllowed, setLocationAllowed] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------
    // Handle input changes
    // --------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    // --------------------------------
    // Profile image
    // --------------------------------

    const handleProfileImage = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Profile image must be less than 5MB.");
            return;
        }

        setProfileImage(file);
        setError("");
    };

    // --------------------------------
    // Get user location
    // --------------------------------

    const getLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError(
                "Location services are not supported by your browser."
            );
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    // Reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                Accept: "application/json",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Failed to fetch location name"
                        );
                    }

                    const data = await response.json();

                    const address = data.address || {};

                    const locationName =
                        address.city ||
                        address.town ||
                        address.village ||
                        address.suburb ||
                        address.city_district ||
                        address.county ||
                        "Location detected";

                    setFormData((prev) => ({
                        ...prev,
                        latitude,
                        longitude,
                        locationName,
                    }));

                    setLocationAllowed(true);
                } catch (error) {
                    console.error(
                        "Reverse geocoding error:",
                        error
                    );

                    setFormData((prev) => ({
                        ...prev,
                        latitude,
                        longitude,
                        locationName: "Location detected",
                    }));

                    setLocationAllowed(true);
                } finally {
                    setLocationLoading(false);
                }
            },

            (error) => {
                setLocationAllowed(false);
                setLocationLoading(false);

                if (error.code === 1) {
                    setError(
                        "Location permission is required to register. SwiVastu uses your location to show nearby items."
                    );
                } else if (error.code === 2) {
                    setError(
                        "Unable to determine your location. Please check your device location settings."
                    );
                } else if (error.code === 3) {
                    setError(
                        "Location request timed out. Please try again."
                    );
                } else {
                    setError(
                        "Unable to get your location. Please try again."
                    );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // --------------------------------
    // Register
    // --------------------------------

    const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Location is compulsory
    if (!locationAllowed || !formData.latitude || !formData.longitude) {
        setError(
            "Location permission is required because nearby items depend on your location."
        );
        getLocation();
        return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    // Contact number validation
    if (!/^\d{10}$/.test(formData.contactNumber)) {
        setError("Contact number must be exactly 10 digits.");
        return;
    }

    try {
        setLoading(true);

        const data = new FormData();

        // Basic information
        data.append("fullname", formData.fullname);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("contactNumber", formData.contactNumber);

        // Location
        const location = {
            type: "Point",
            coordinates: [
                Number(formData.longitude),
                Number(formData.latitude)
            ]
        };

        data.append("location", JSON.stringify(location));

        // Readable location name
        data.append("locationName", formData.locationName);

        // Profile image - optional
        if (profileImage) {
            data.append("avatar", profileImage);
        }

        const response = await fetch(
            `${API_URL}/users/register`,
            {
                method: "POST",
                body: data,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result?.message || "Registration failed"
            );
        }

        if (!result?.data) {
            throw new Error("The server returned an invalid registration response.");
        }
        navigate("/login", {
            state: { registrationComplete: true },
        });

    } catch (error) {
        console.error("Registration error:", error);
        setError(error.message || "Something went wrong.");
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="min-h-screen bg-gray-50 px-2 py-3 sm:px-3">

            <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-3xl items-center">

                <div className="grid w-full overflow-hidden rounded-xl bg-white shadow-md lg:grid-cols-[0.75fr_1.25fr]">

                    {/* ================= LEFT ================= */}

                    <section className="relative hidden overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white lg:flex lg:flex-col lg:justify-between">

                        <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10" />

                        <div className="absolute -bottom-16 -left-14 h-48 w-48 rounded-full bg-white/10" />

                        <div className="relative z-10">

                            {/* Logo */}

                            <div className="mb-5 flex items-center gap-2">

                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-sm font-bold text-blue-700">
                                    S
                                </div>

                                <span className="text-base font-bold">
                                    SwiVastu
                                </span>

                            </div>

                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-100">
                                Welcome to SwiVastu
                            </p>

                            <h1 className="text-xl font-bold leading-tight">
                                Exchange what you have.
                                <br />
                                Find what you need.
                            </h1>

                            <p className="mt-2 max-w-55 text-[11px] leading-4 text-blue-50">
                                Buy, sell, exchange, rent and give
                                away useful items around you.
                            </p>

                        </div>

                        {/* Features */}

                        <div className="relative z-10 grid grid-cols-3 gap-1.5 text-center">

                            <div className="rounded-md bg-white/10 p-2">
                                <p className="text-xs font-bold">
                                    Buy
                                </p>

                                <p className="text-[9px] text-blue-100">
                                    Find items
                                </p>
                            </div>

                            <div className="rounded-md bg-white/10 p-2">
                                <p className="text-xs font-bold">
                                    Swap
                                </p>

                                <p className="text-[9px] text-blue-100">
                                    Exchange
                                </p>
                            </div>

                            <div className="rounded-md bg-white/10 p-2">
                                <p className="text-xs font-bold">
                                    Rent
                                </p>

                                <p className="text-[9px] text-blue-100">
                                    Use items
                                </p>
                            </div>

                        </div>

                    </section>


                    {/* ================= RIGHT ================= */}

                    <section className="p-3.5 sm:p-4 lg:p-5">

                        {/* Mobile Logo */}

                        <Link to="/" className="mb-3 flex items-center gap-1.5 lg:hidden">

                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                                S
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                SwiVastu
                            </span>
                        </Link>

                        <Link to="/" className="mb-3 hidden text-xs font-semibold text-blue-700 hover:underline lg:inline-flex">
                            ← Back to home
                        </Link>


                        {/* Heading */}

                        <div className="mb-3">

                            <p className="mb-0.5 text-[9px] font-semibold tracking-widest text-blue-600">
                                CREATE ACCOUNT
                            </p>

                            <h2 className="text-lg font-bold text-gray-900">
                                Join SwiVastu
                            </h2>

                            <p className="text-[10px] text-gray-500">
                                Create your account and start exploring.
                            </p>

                        </div>


                        {/* ================= PROFILE ================= */}

                        <div className="mb-3 flex items-center gap-2.5">

                            <div className="relative">

                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">

                                    {profileImage ? (
                                        <img
                                            src={URL.createObjectURL(
                                                profileImage
                                            )}
                                            alt="Profile preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-blue-100 text-sm font-bold text-blue-700">
                                            {formData.fullname
                                                ? formData.fullname
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : "S"}
                                        </div>
                                    )}

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-indigo-600 text-[10px] text-white transition hover:scale-110 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    +
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImage}
                                    className="hidden"
                                />

                            </div>

                            <div>

                                <p className="text-[11px] font-semibold text-gray-800">
                                    Profile Picture
                                </p>

                                <p className="text-[9px] text-gray-500">
                                    Optional · JPG, PNG · Max 5MB
                                </p>

                                {!profileImage && (
                                    <p className="text-[9px] text-blue-600">
                                        Default avatar will be used
                                    </p>
                                )}

                            </div>

                        </div>


                        {/* ================= ERROR ================= */}

                        {error && (
                            <div className="mb-2.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] leading-4 text-red-600">
                                {error}
                            </div>
                        )}


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-2.5"
                        >

                            {/* ================= FULL NAME ================= */}

                            <div className="input-group">

                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    name="fullname"
                                    type="text"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                    className="form-input"
                                />

                            </div>


                            {/* ================= EMAIL + CONTACT ================= */}

                            <div className="grid gap-2.5 sm:grid-cols-2">

                                <div className="input-group">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="form-input"
                                    />

                                </div>


                                <div className="input-group">

                                    <label className="form-label">
                                        Contact Number
                                    </label>

                                    <input
                                        name="contactNumber"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength="10"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        required
                                        className="form-input"
                                    />

                                </div>

                            </div>


                            {/* ================= PASSWORD ================= */}

                            <div className="grid gap-2.5 sm:grid-cols-2">

                                {/* Password */}

                                <div className="input-group">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create password"
                                            required
                                            className="form-input pr-12"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-500 hover:text-blue-600"
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>


                                {/* Confirm Password */}

                                <div className="input-group">

                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                formData.confirmPassword
                                            }
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            required
                                            className="form-input pr-12"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-500 hover:text-blue-600"
                                        >
                                            {showConfirmPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* ================= LOCATION ================= */}

                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-1.5">

                                            <span className="text-[11px] font-semibold text-gray-800">
                                                Your Location
                                            </span>

                                            <span className="text-[10px] text-red-500">
                                                *
                                            </span>

                                        </div>

                                        <p className="mt-0.5 text-[9px] text-gray-500">
                                            Required for nearby items
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        disabled={locationLoading}
                                        className="shrink-0 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-[10px] font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {locationLoading
                                            ? "Detecting..."
                                            : locationAllowed
                                            ? "✓ Detected"
                                            : "Allow Location"}
                                    </button>

                                </div>


                                {/* ONLY LOCATION NAME */}

                                {locationAllowed && (
                                    <div className="mt-2 rounded-lg border border-blue-100 bg-white px-2.5 py-2">

                                        <p className="mb-0.5 text-[8px] font-medium uppercase tracking-wide text-gray-400">
                                            Detected Location
                                        </p>

                                        <p className="truncate text-[11px] font-semibold text-gray-700">
                                            {formData.locationName}
                                        </p>

                                    </div>
                                )}

                            </div>


                            {/* ================= TERMS ================= */}

                            <div className="flex items-start gap-1.5">

                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="mt-0.5 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <label
                                    htmlFor="terms"
                                    className="text-[9px] leading-3.5 text-gray-500"
                                >
                                    I agree to the SwiVastu Terms of
                                    Service and Privacy Policy.
                                </label>

                            </div>


                            {/* ================= SUBMIT ================= */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </button>

                        </form>


                        {/* ================= LOGIN ================= */}

                        <p className="mt-3 text-center text-[10px] text-gray-500">

                            Already have an account?{" "}

                            <button
                                type="button"
                                className="font-semibold text-blue-600 transition hover:text-indigo-700"
                            >
                                 <Link
                            to="/login"
                            className="font-semibold text-blue-600 hover:underline"
                        >Login</Link>
                            
                            </button>

                        </p>

                    </section>

                </div>

            </div>

        </main>
    );
};

export default Register;