import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, MapPin, Plus, X } from "lucide-react";
import { useSelector } from "react-redux";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { apiRequest } from "../../services/api.js";

const categories = [
    "electronics",
    "books",
    "vehicles",
    "furniture",
    "fashion",
    "gaming",
    "home",
    "other",
];

const listingOptions = [
    { value: "sell", label: "Sell" },
    { value: "barter", label: "Exchange" },
    { value: "rent", label: "Rent" },
    { value: "giveaway", label: "Give away" },
];

function getUserCoordinates(user) {
    const coordinates = user?.location?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

    const [longitude, latitude] = coordinates.map(Number);
    if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
    ) {
        return null;
    }

    return { longitude, latitude };
}

export default function CreateItem() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(categories[0]);
    const [condition, setCondition] = useState("Good");
    const [listingTypes, setListingTypes] = useState(["sell"]);
    const [price, setPrice] = useState("");
    const [rentPrice, setRentPrice] = useState("");
    const [securityDeposit, setSecurityDeposit] = useState("");
    const [maxDurationDays, setMaxDurationDays] = useState("");
    const [barterPreferences, setBarterPreferences] = useState("");
    const [images, setImages] = useState([]);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const location = detectedLocation || getUserCoordinates(user);
    const [locationLoading, setLocationLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const imagePreviews = useMemo(
        () => images.map((image) => URL.createObjectURL(image)),
        [images]
    );

    useEffect(
        () => () => imagePreviews.forEach((preview) => URL.revokeObjectURL(preview)),
        [imagePreviews]
    );

    function toggleListingType(type) {
        setListingTypes((current) =>
            current.includes(type)
                ? current.filter((value) => value !== type)
                : [...current, type]
        );
    }

    function handleImages(event) {
        const selected = Array.from(event.target.files || []);
        if (selected.length > 5) {
            setError("Choose up to 5 photos.");
            event.target.value = "";
            return;
        }
        if (
            selected.some(
                (file) =>
                    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
                    file.size > 10 * 1024 * 1024
            )
        ) {
            setError("Use JPG, PNG or WEBP photos, up to 10 MB each.");
            event.target.value = "";
            return;
        }

        setImages(selected);
        setError("");
    }

    function detectLocation() {
        setError("");
        if (!navigator.geolocation) {
            setError("Location services are not available in this browser.");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setDetectedLocation({
                    longitude: coords.longitude,
                    latitude: coords.latitude,
                });
                setLocationLoading(false);
            },
            () => {
                setError("Couldn't get your location. Allow access or try again.");
                setLocationLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (listingTypes.length === 0) {
            setError("Choose at least one way to list your item.");
            return;
        }
        if (images.length === 0) {
            setError("Add at least one clear photo.");
            return;
        }
        if (!location) {
            setError("Add a location so nearby members can find your item.");
            return;
        }
        if (listingTypes.includes("sell") && (!price || Number(price) < 0)) {
            setError("Enter a valid selling price.");
            return;
        }
        if (
            listingTypes.includes("rent") &&
            (!rentPrice || Number(rentPrice) < 0)
        ) {
            setError("Enter a valid daily rental price.");
            return;
        }
        if (
            listingTypes.includes("barter") &&
            !barterPreferences.split(",").some((value) => value.trim())
        ) {
            setError("Add at least one thing you would like in exchange.");
            return;
        }

        const data = new FormData();
        data.append("title", title.trim());
        data.append("description", description.trim());
        data.append("category", category);
        data.append("condition", condition);
        listingTypes.forEach((type) => data.append("listingType", type));
        data.append("location", JSON.stringify({
            type: "Point",
            coordinates: [location.longitude, location.latitude],
        }));
        if (listingTypes.includes("sell")) data.append("price", price);
        if (listingTypes.includes("rent")) {
            data.append(
                "rentDetails",
                JSON.stringify({
                    pricePerDay: Number(rentPrice),
                    ...(securityDeposit !== "" && {
                        securityDeposit: Number(securityDeposit),
                    }),
                    ...(maxDurationDays !== "" && {
                        maxDurationDays: Number(maxDurationDays),
                    }),
                })
            );
        }
        if (listingTypes.includes("barter")) {
            data.append(
                "barterPreferences",
                JSON.stringify(
                    barterPreferences
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                )
            );
        }
        images.forEach((image) => data.append("images", image));

        setSubmitting(true);
        try {
            const result = await apiRequest("/items/item", {
                method: "POST",
                body: data,
            });
            const item = result?.data?.item;
            navigate(item?._id ? `/item/${item._id}` : "/my-items", {
                replace: true,
            });
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
                <Link
                    to="/home"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
                >
                    <ArrowLeft size={17} /> Back to Explore
                </Link>
                <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                        Share with your community
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                        List an item
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Add clear details and choose how people can get it.
                    </p>

                    {error && (
                        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="mt-7 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="form-label" htmlFor="item-title">Item name</label>
                            <input
                                id="item-title"
                                className="form-input"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={120}
                                required
                                placeholder="e.g. A well-loved study desk"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="item-description">Description</label>
                            <textarea
                                id="item-description"
                                className="form-input min-h-28 resize-y"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                maxLength={5000}
                                required
                                placeholder="Share useful details, dimensions, or pickup information."
                            />
                            <p className="mt-1 text-right text-xs text-slate-400">{description.length}/5000</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="form-label" htmlFor="item-category">Category</label>
                                <select id="item-category" className="form-input" value={category} onChange={(event) => setCategory(event.target.value)}>
                                    {categories.map((value) => (
                                        <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="item-condition">Condition</label>
                                <select id="item-condition" className="form-input" value={condition} onChange={(event) => setCondition(event.target.value)}>
                                    {["New", "Like New", "Good", "Fair", "Poor"].map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <fieldset>
                            <legend className="form-label">How would you like to list it?</legend>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {listingOptions.map(({ value, label }) => (
                                    <label key={value} className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-semibold transition ${listingTypes.includes(value) ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={listingTypes.includes(value)}
                                            onChange={() => toggleListingType(value)}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {listingTypes.includes("sell") && (
                            <div>
                                <label className="form-label" htmlFor="item-price">Selling price (₹)</label>
                                <input id="item-price" className="form-input" type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} required />
                            </div>
                        )}

                        {listingTypes.includes("rent") && (
                            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                                <div>
                                    <label className="form-label" htmlFor="rent-price">Price per day (₹)</label>
                                    <input id="rent-price" className="form-input" type="number" min="0" step="1" value={rentPrice} onChange={(event) => setRentPrice(event.target.value)} required />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="rent-deposit">Security deposit (₹)</label>
                                    <input id="rent-deposit" className="form-input" type="number" min="0" step="1" value={securityDeposit} onChange={(event) => setSecurityDeposit(event.target.value)} />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="rent-duration">Max rental days</label>
                                    <input id="rent-duration" className="form-input" type="number" min="1" step="1" value={maxDurationDays} onChange={(event) => setMaxDurationDays(event.target.value)} />
                                </div>
                            </div>
                        )}

                        {listingTypes.includes("barter") && (
                            <div>
                                <label className="form-label" htmlFor="barter-preferences">What would you exchange for?</label>
                                <input id="barter-preferences" className="form-input" value={barterPreferences} onChange={(event) => setBarterPreferences(event.target.value)} maxLength={300} placeholder="Separate options with commas" />
                            </div>
                        )}

                        <div>
                            <span className="form-label">Photos (up to 5)</span>
                            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
                                <ImagePlus className="text-blue-700" size={26} />
                                <span className="mt-2 text-sm font-semibold text-slate-800">Choose photos</span>
                                <span className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP · up to 10 MB each</span>
                                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} />
                            </label>
                            {imagePreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {imagePreviews.map((src, index) => (
                                        <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                                            <img src={src} alt={`Selected item photo ${index + 1}`} className="h-full w-full object-cover" />
                                            <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-slate-700 shadow">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Item location</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {location ? "Location added for nearby discovery." : "Add your location to help people find it nearby."}
                                    </p>
                                </div>
                                <button type="button" onClick={detectLocation} disabled={locationLoading} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
                                    <MapPin size={15} /> {locationLoading ? "Finding location…" : location ? "Update location" : "Use my location"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                            <Plus size={18} /> {submitting ? "Publishing…" : "Publish item"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
