
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Package,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    CalendarDays,
    Gift,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { API_URL, apiRequest } from "../../services/api.js";

function getListingType(item) {
    const type = item?.listingType;

    if (Array.isArray(type)) {
        return type[0] || "Sell";
    }

    return type || "Sell";
}

function getOwner(item) {
    return item?.ownerId || item?.owner || {};
}

function getImages(item) {
    if (!Array.isArray(item?.images)) return [];

    return item.images
        .map((image) =>
            typeof image === "string" ? image : image?.url
        )
        .filter(Boolean);
}

function getPrice(item, type) {
    if (type.toLowerCase() === "giveaway") {
        return "Free";
    }

    if (type.toLowerCase() === "rent") {
        const price =
            item?.rentDetails?.pricePerDay ??
            item?.rentDetails?.rentPerDay ??
            item?.price;

        return price != null
            ? `₹${Number(price).toLocaleString("en-IN")} / day`
            : "Contact owner";
    }

    return item?.price != null
        ? `₹${Number(item.price).toLocaleString("en-IN")}`
        : "Contact owner";
}

function getDistance(item, userLocation) {
    const coordinates = item?.location?.coordinates;

    if (
        !userLocation ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
    ) {
        return null;
    }

    const [longitude, latitude] = coordinates.map(Number);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return null;
    }

    const radians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371;

    const lat1 = radians(userLocation.latitude);
    const lat2 = radians(latitude);
    const deltaLat = lat2 - lat1;
    const deltaLng = radians(longitude - userLocation.longitude);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) ** 2;

    const distance =
        2 *
        earthRadius *
        Math.atan2(
            Math.sqrt(Math.min(1, a)),
            Math.sqrt(Math.max(0, 1 - a))
        );

    return distance < 1
        ? `${Math.round(distance * 1000)} m away`
        : `${distance.toFixed(1)} km away`;
}

function ListingIcon({ type }) {
    let Icon;
    switch (type.toLowerCase()) {
        case "barter":
            Icon = RefreshCw;
            break;
        case "rent":
            Icon = CalendarDays;
            break;
        case "giveaway":
            Icon = Gift;
            break;
        default:
            Icon = ShoppingBag;
    }
    return <Icon size={14} />;
}

function getActionText(type) {
    switch (type.toLowerCase()) {
        case "barter":
            return "Request Exchange";
        case "rent":
            return "Request to Rent";
        case "giveaway":
            return "Request Item";
        default:
            return "Request to Buy";
    }
}

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);

    const [item, setItem] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [requestType, setRequestType] = useState("");
    const [requestError, setRequestError] = useState("");
    const [requestNotice, setRequestNotice] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [ownItems, setOwnItems] = useState([]);
    const [ownItemsLoading, setOwnItemsLoading] = useState(false);
    const [offeredItemId, setOfferedItemId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchItem() {
            setLoading(true);
            setError("");
            setItem(null);
            setImages([]);
            setSelectedImage(0);

            try {
                // Assumes the backend exposes GET /items/:id.
                const response = await fetch(
                    `${API_URL}/items/${id}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message || "Unable to load this item."
                    );
                }

                const fetchedItem =
                    result?.data?.item ??
                    result?.data?.product ??
                    result?.data;

                if (
                    !fetchedItem ||
                    typeof fetchedItem !== "object" ||
                    !fetchedItem._id
                ) {
                    throw new Error(
                        "The item was not found or the server response is invalid."
                    );
                }

                setItem(fetchedItem);
                setImages(getImages(fetchedItem));
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(
                        fetchError.message ||
                            "Something went wrong while loading the item."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        if (id) {
            fetchItem();
        }

        return () => controller.abort();
    }, [id]);

    // Used only to calculate distance. Coordinates are never displayed.
    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                // The page still works when location permission is denied.
            },
            {
                timeout: 8000,
                maximumAge: 300000,
            }
        );
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AuthNavbar />

                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="grid animate-pulse gap-8 md:grid-cols-2">
                        <div className="aspect-square rounded-3xl bg-slate-200" />
                        <div className="space-y-5 py-3">
                            <div className="h-5 w-1/3 rounded bg-slate-200" />
                            <div className="h-9 w-4/5 rounded bg-slate-200" />
                            <div className="h-8 w-1/2 rounded bg-slate-200" />
                            <div className="h-24 rounded bg-slate-200" />
                            <div className="h-12 rounded-xl bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AuthNavbar />

                <main className="mx-auto max-w-xl px-4 py-20 text-center">
                    <AlertCircle
                        size={42}
                        className="mx-auto text-red-500"
                    />

                    <h1 className="mt-4 text-2xl font-bold text-slate-900">
                        Unable to open item
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error || "This item could not be found."}
                    </p>

                    <Link
                        to="/home"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        <ArrowLeft size={17} />
                        Back to Explore
                    </Link>
                </main>
            </div>
        );
    }

    const type = getListingType(item);
    const owner = getOwner(item);
    const distance = getDistance(item, userLocation);

    const isAvailable =
        !item.status || item.status.toLowerCase() === "available";

    const ownerName =
        owner?.fullname ||
        owner?.fullName ||
        owner?.username ||
        "SwiVastu member";

    const ownerImage =
        owner?.profileImage || owner?.avatar || "";
    const isOwner =
        currentUser?._id &&
        String(currentUser._id) === String(owner?._id || item.ownerId);
    const availableTypes = Array.isArray(item.listingType)
        ? item.listingType.map((value) => String(value).toLowerCase())
        : [String(item.listingType || type).toLowerCase()];

    async function openRequest(type) {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        if (isOwner) return;

        setRequestType(type);
        setRequestError("");
        setRequestNotice("");

        if (type === "barter") {
            setOwnItemsLoading(true);
            try {
                const result = await apiRequest("/items/my-items");
                setOwnItems(
                    (Array.isArray(result?.data) ? result.data : []).filter(
                        (ownedItem) =>
                            ownedItem.status === "Available" &&
                            ownedItem._id !== item._id
                    )
                );
            } catch (loadError) {
                setRequestError(loadError.message);
            } finally {
                setOwnItemsLoading(false);
            }
        }
    }

    async function submitRequest(event) {
        event.preventDefault();
        setRequestError("");
        setRequestLoading(true);

        try {
            let path;
            let body;

            if (requestType === "barter") {
                if (!offeredItemId) {
                    throw new Error("Choose one of your available items to offer.");
                }
                path = "/exchange-requests/";
                body = { requestedItemId: item._id, offeredItemId };
            } else if (requestType === "rent") {
                if (!startDate || !endDate) {
                    throw new Error("Choose the dates you would like to rent this item.");
                }
                path = "/rent/request";
                body = { itemId: item._id, startDate, endDate };
            } else {
                path = "/purchase/request";
                body = { itemId: item._id };
            }

            const result = await apiRequest(path, {
                method: "POST",
                body,
            });
            setRequestNotice(
                result?.message || "Your request has been sent to the owner."
            );
            setRequestType("");
            setOfferedItemId("");
            setStartDate("");
            setEndDate("");
        } catch (submitError) {
            setRequestError(submitError.message);
        } finally {
            setRequestLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f8faff] text-slate-900">
            <AuthNavbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
                {/* Breadcrumb */}
                <Link
                    to="/home"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
                >
                    <ArrowLeft size={16} />
                    Back to Explore
                </Link>

                <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Image gallery */}
                    <section>
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="flex aspect-square items-center justify-center bg-slate-100">
                                {images.length > 0 ? (
                                    <img
                                        src={images[selectedImage]}
                                        alt={item.title || "Item"}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <Package size={54} strokeWidth={1.3} />
                                        <span className="text-sm">
                                            No images available
                                        </span>
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Previous image"
                                        onClick={() =>
                                            setSelectedImage((current) =>
                                                current === 0
                                                    ? images.length - 1
                                                    : current - 1
                                            )
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-slate-700 shadow transition hover:bg-white"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Next image"
                                        onClick={() =>
                                            setSelectedImage((current) =>
                                                (current + 1) % images.length
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-slate-700 shadow transition hover:bg-white"
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-white">
                                        {selectedImage + 1} / {images.length}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        onClick={() => setSelectedImage(index)}
                                        aria-label={`View image ${index + 1}`}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                                            selectedImage === index
                                                ? "border-blue-600"
                                                : "border-transparent hover:border-slate-300"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Item information */}
                    <section className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            {availableTypes.map((availableType) => (
                                <span key={availableType} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700">
                                    <ListingIcon type={availableType} />
                                    {availableType}
                                </span>
                            ))}

                            {item.category && (
                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium capitalize text-slate-600">
                                    {item.category}
                                </span>
                            )}

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    isAvailable
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                            >
                                {item.status || "Available"}
                            </span>
                        </div>

                        <h1 className="mt-5 break-words text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                            {item.title || "Untitled item"}
                        </h1>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {availableTypes.map((availableType) => (
                                <p key={availableType} className="rounded-lg bg-white px-3 py-2 text-lg font-bold text-blue-700">
                                    {getPrice(item, availableType)}
                                </p>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                            {item.condition && (
                                <span className="capitalize">
                                    Condition:{" "}
                                    <strong className="font-semibold text-slate-700">
                                        {item.condition}
                                    </strong>
                                </span>
                            )}

                            {distance && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin
                                        size={15}
                                        className="text-blue-600"
                                    />
                                    {distance}
                                </span>
                            )}
                        </div>

                        {/* Primary action */}
                        <div className="mt-7 rounded-2xl border border-blue-100 bg-white p-4 sm:p-5">
                            {isOwner ? (
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-slate-600">
                                        This is your listing.
                                    </p>
                                    <Link to="/my-items" className="text-sm font-semibold text-blue-700 hover:underline">
                                        Manage my items
                                    </Link>
                                </div>
                            ) : isAvailable ? (
                                <>
                                    <p className="text-sm leading-6 text-slate-600">
                                        Choose how you would like to get this item.
                                    </p>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {availableTypes.map((availableType) => (
                                            <button
                                                key={availableType}
                                                type="button"
                                                onClick={() => openRequest(availableType)}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                {getActionText(availableType)}
                                                <ArrowRight size={17} />
                                            </button>
                                        ))}
                                    </div>
                                    {requestNotice && (
                                        <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                                            {requestNotice}{" "}
                                            <Link to="/requests" className="font-semibold underline">
                                                View requests
                                            </Link>
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <Package
                                        size={20}
                                        className="shrink-0"
                                    />
                                    This item is currently not available.
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mt-8">
                            <h2 className="text-lg font-bold text-slate-900">
                                About this item
                            </h2>

                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                                {item.description ||
                                    "The owner hasn't added a description yet."}
                            </p>
                        </div>

                        {/* Barter preferences */}
                        {availableTypes.includes("barter") &&
                            item.barterPreferences && (
                                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                                    <h2 className="font-semibold text-slate-900">
                                        Exchange preferences
                                    </h2>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {typeof item.barterPreferences === "string"
                                            ? item.barterPreferences
                                            : JSON.stringify(
                                                  item.barterPreferences,
                                                  null,
                                                  2
                                              )}
                                    </p>
                                </div>
                            )}

                        {/* Owner details */}
                        <div className="mt-8 border-t border-slate-200 pt-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Listed by
                            </h2>

                            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                {ownerImage ? (
                                    <img
                                        src={ownerImage}
                                        alt={ownerName}
                                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-700">
                                        {ownerName.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900">
                                        {ownerName}
                                    </p>

                                    {owner?.isVerified && (
                                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700">
                                            <ShieldCheck size={14} />
                                            Verified member
                                        </p>
                                    )}

                                    {owner?.trustScore != null && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Trust score:{" "}
                                            {Number(owner.trustScore).toFixed(1)}
                                            /5
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {requestType && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !requestLoading) {
                            setRequestType("");
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="request-dialog-title"
                        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="request-dialog-title" className="text-xl font-bold text-slate-950">
                                    {getActionText(requestType)}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">{item.title}</p>
                            </div>
                            <button type="button" disabled={requestLoading} onClick={() => setRequestType("")} aria-label="Close request dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                                <X size={19} />
                            </button>
                        </div>

                        {requestError && (
                            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {requestError}
                            </p>
                        )}

                        <form onSubmit={submitRequest} className="mt-5 space-y-4">
                            {requestType === "barter" && (
                                <div>
                                    <label htmlFor="offered-item" className="form-label">Choose an available item to offer</label>
                                    {ownItemsLoading ? (
                                        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Loading your items…</p>
                                    ) : ownItems.length > 0 ? (
                                        <select
                                            id="offered-item"
                                            className="form-input"
                                            value={offeredItemId}
                                            onChange={(event) => setOfferedItemId(event.target.value)}
                                            required
                                        >
                                            <option value="">Select an item</option>
                                            {ownItems.map((ownItem) => (
                                                <option key={ownItem._id} value={ownItem._id}>{ownItem.title}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                                            You need an available listing to offer.
                                            <Link to="/create-item" className="ml-1 font-semibold text-blue-700 hover:underline">List an item</Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {requestType === "rent" && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="rent-start" className="form-label">Start date</label>
                                        <input
                                            id="rent-start"
                                            className="form-input"
                                            type="date"
                                            min={new Date().toISOString().slice(0, 10)}
                                            value={startDate}
                                            onChange={(event) => setStartDate(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="rent-end" className="form-label">End date</label>
                                        <input
                                            id="rent-end"
                                            className="form-input"
                                            type="date"
                                            min={startDate || new Date().toISOString().slice(0, 10)}
                                            value={endDate}
                                            onChange={(event) => setEndDate(event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {requestType !== "barter" || (!ownItemsLoading && ownItems.length > 0) ? (
                                <button type="submit" disabled={requestLoading || ownItemsLoading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {requestLoading ? "Sending request…" : "Send request"}
                                </button>
                            ) : null}
                        </form>
                    </section>
                </div>
            )}

            <footer className="mt-12 border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="text-lg font-extrabold text-blue-800"
                    >
                        SwiVastu
                    </Link>

                    <p>Give unused things a new purpose.</p>

                    <p>© {new Date().getFullYear()} SwiVastu</p>
                </div>
            </footer>
        </div>
    );
}
