
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Search,
    MapPin,
    ArrowRight,
    RefreshCw,
    Package,
    AlertCircle,
    Plus,
    X,
    ChevronDown,
    SlidersHorizontal,
    Compass,
    Heart,
} from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { API_URL, apiRequest } from "../../services/api.js";
const PAGE_SIZE = 20;

const categories = [
    { label: "All categories", value: "All" },
    { label: "Electronics", value: "electronics" },
    { label: "Books", value: "books" },
    { label: "Vehicles", value: "vehicles" },
    { label: "Furniture", value: "furniture" },
    { label: "Fashion", value: "fashion" },
    { label: "Gaming", value: "gaming" },
    { label: "Home", value: "home" },
    { label: "Other", value: "other" },
];

const sortOptions = [
    { label: "Newest first", value: "newest" },
    { label: "Nearest to me", value: "nearest" },
    { label: "Recommended", value: "recommended" },
];

function readCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject({ code: "unsupported" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
                resolve({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }),
            reject,
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    });
}

function getLocationErrorMessage(geoError) {
    if (geoError.code === "unsupported") {
        return "Your browser does not support location access.";
    }
    if (geoError.code === geoError.PERMISSION_DENIED) {
        return "Location permission is disabled. Allow location access to sort items by distance.";
    }
    if (geoError.code === geoError.TIMEOUT) {
        return "Your location request timed out. Please try again.";
    }
    return "We couldn't get your location. Please try again.";
}

function getListingTypes(item) {
    const types = item?.listingType;

    if (Array.isArray(types)) {
        return types.map((type) => String(type).toLowerCase());
    }

    if (typeof types === "string") {
        return [types.toLowerCase()];
    }

    return [];
}

function getPriceLabel(item) {
    const types = getListingTypes(item);

    if (types.includes("giveaway")) {
        return "Free";
    }

    if (types.includes("rent")) {
        const rentPrice = item?.rentDetails?.pricePerDay;

        if (rentPrice != null) {
            return `₹${Number(rentPrice).toLocaleString("en-IN")} / day`;
        }

        if (item?.price != null) {
            return `₹${Number(item.price).toLocaleString("en-IN")} / day`;
        }
    }

    if (item?.price != null) {
        return `₹${Number(item.price).toLocaleString("en-IN")}`;
    }

    return "Contact owner";
}

function getItemImage(item) {
    const image = item?.images?.[0];
    return typeof image === "string" ? image : "";
}

// Used for searching, not displayed on product cards.
function getLocationName(item) {
    return (
        item?.locationName ||
        item?.ownerId?.locationName ||
        item?.ownerId?.address ||
        ""
    );
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

    const [longitude, latitude] = coordinates;

    if (
        !Number.isFinite(Number(longitude)) ||
        !Number.isFinite(Number(latitude))
    ) {
        return null;
    }

    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const lat1 = toRadians(userLocation.latitude);
    const lat2 = toRadians(Number(latitude));
    const latDifference = lat2 - lat1;

    const lngDifference = toRadians(
        Number(longitude) - userLocation.longitude
    );

    const a =
        Math.sin(latDifference / 2) ** 2 +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(lngDifference / 2) ** 2;

    const safeA = Math.min(1, Math.max(0, a));

    const distance =
        2 *
        earthRadiusKm *
        Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA));

    if (!Number.isFinite(distance)) {
        return null;
    }

    return distance < 1
        ? `${Math.round(distance * 1000)} m away`
        : `${distance.toFixed(1)} km away`;
}

function matchesSearch(item, query) {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
        return true;
    }

    const values = [
        item?.title,
        item?.description,
        item?.category,
        item?.condition,
        getLocationName(item),
    ];

    return values.filter(Boolean).some((value) =>
        String(value).toLowerCase().includes(searchText)
    );
}

// Product card
function ItemCard({ item, userLocation, liked, onToggleLike }) {
    const [imageFailed, setImageFailed] = useState(false);
    const [savingLike, setSavingLike] = useState(false);

    const image = getItemImage(item);
    const price = getPriceLabel(item);
    const distance = getDistance(item, userLocation);

    return (
        <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/[0.06]">
            <button
                type="button"
                aria-label={liked ? "Remove from saved items" : "Save item"}
                aria-pressed={liked}
                disabled={savingLike}
                onClick={async () => {
                    setSavingLike(true);
                    try {
                        await onToggleLike(item._id, !liked);
                    } finally {
                        setSavingLike(false);
                    }
                }}
                className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow transition hover:text-rose-600 disabled:opacity-60"
            >
                <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-600" : ""} />
            </button>
            <Link
                to={`/item/${item?._id}`}
                aria-label={`View details for ${item?.title || "item"}`}
                className="block"
            >
                <div className="relative aspect-[5/3] overflow-hidden bg-slate-50">
                    {image && !imageFailed ? (
                        <img src={image} alt={item?.title || "Listed item"} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
                            <Package size={27} strokeWidth={1.4} />
                            <span className="text-[11px]">Image unavailable</span>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 min-h-9 min-w-0 flex-1 text-[13px] font-semibold leading-[18px] text-slate-800 transition group-hover:text-blue-700">{item?.title || "Untitled item"}</h3>
                        <span className="shrink-0 text-xs font-bold leading-5 text-blue-700">{price}</span>
                    </div>
                    {item?.condition && <p className="mt-1 text-[11px] capitalize text-slate-500">{item.condition}</p>}
                    {item?.description && <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-500">{item.description}</p>}
                    {distance && (
                        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">
                            <MapPin size={13} className="shrink-0 text-blue-600" />
                            <span>{distance}</span>
                        </div>
                    )}
                </div>
            </Link>
        </article>
    );
}

// Loading skeleton
function ProductSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <div className="aspect-[5/3] animate-pulse bg-slate-100" />

            <div className="space-y-2.5 p-3">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
        </div>
    );
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);

    const [sort, setSort] = useState("newest");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const search = searchParams.get("q") || "";
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const [location, setLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [likedIds, setLikedIds] = useState(() => new Set());
    const [wishlistError, setWishlistError] = useState("");

    // Infinite-scroll refs
    const observerRef = useRef(null);
    const loadingMoreRef = useRef(false);
    const loadMoreControllerRef = useRef(null);
    const feedRequestIdRef = useRef(0);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let active = true;
        apiRequest("/items/liked-items")
            .then((result) => {
                if (active) {
                    setLikedIds(new Set((result?.data || []).map((item) => String(item._id))));
                }
            })
            .catch((loadError) => {
                if (active) setWishlistError(loadError.message);
            });
        return () => {
            active = false;
        };
    }, []);

    async function toggleLike(itemId, liked) {
        setWishlistError("");
        try {
            await apiRequest(`/items/${itemId}/like`, {
                method: "PUT",
                body: { liked },
            });
            setLikedIds((current) => {
                const next = new Set(current);
                if (liked) next.add(String(itemId));
                else next.delete(String(itemId));
                return next;
            });
        } catch (likeError) {
            setWishlistError(likeError.message);
        }
    }

    // Get user's current location
    const getLocation = useCallback(() => {
        setLocationLoading(true);
        setLocationError("");
        readCurrentLocation()
            .then((currentLocation) => {
                setLocation(currentLocation);
                setLocationError("");
                setLocationLoading(false);
                setProducts([]);
                setPage(1);
                setHasMore(true);
                setError("");
                setLoading(true);
            })
            .catch((geoError) => {
                setLocation(null);
                setLocationLoading(false);
                setLocationError(getLocationErrorMessage(geoError));
                if (sort === "nearest") {
                    setHasMore(false);
                    setLoading(false);
                }
            });
    }, [sort]);

    useEffect(() => {
        let active = true;
        readCurrentLocation()
            .then((currentLocation) => {
                if (!active) return;
                setLocation(currentLocation);
                setLocationError("");
                setLocationLoading(false);
            })
            .catch((geoError) => {
                if (!active) return;
                setLocation(null);
                setLocationLoading(false);
                setLocationError(getLocationErrorMessage(geoError));
            });

        return () => {
            active = false;
        };
    }, []);

    // Fetch one page of products
    const fetchProducts = useCallback(
        async (pageNumber, signal) => {
            const params = new URLSearchParams();

            params.set("sort", sort);
            params.set("page", String(pageNumber));
            params.set("limit", String(PAGE_SIZE));
            if (debouncedSearch.trim()) {
                params.set("q", debouncedSearch.trim());
            }

            if (selectedCategory !== "All") {
                params.set("category", selectedCategory);
            }

            if (sort === "nearest") {
                if (!location) {
                    throw new Error(
                        "Allow location access to find the nearest items."
                    );
                }

                params.set("latitude", String(location.latitude));
                params.set("longitude", String(location.longitude));
            }

            const response = await fetch(
                `${API_URL}/items/home?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    signal,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message || "Failed to load items."
                );
            }

            const data = result?.data?.products || [];

            // Supports backend responses with or without hasMore.
            const moreAvailable =
                typeof result?.data?.hasMore === "boolean"
                    ? result.data.hasMore
                    : data.length === PAGE_SIZE;

            return {
                products: data,
                hasMore: moreAvailable,
            };
        },
        [sort, selectedCategory, location, debouncedSearch]
    );

    // Load the first page whenever filters or sorting change.
    useEffect(() => {
        const controller = new AbortController();
        const requestId = ++feedRequestIdRef.current;

        // Cancel any pending next-page request.
        loadMoreControllerRef.current?.abort();
        loadMoreControllerRef.current = null;
        loadingMoreRef.current = false;

        if (sort === "nearest" && !location) {
            return () => {
                controller.abort();
            };
        }

        async function loadFirstPage() {
            setLoading(true);

            try {
                const result = await fetchProducts(
                    1,
                    controller.signal
                );

                if (
                    controller.signal.aborted ||
                    requestId !== feedRequestIdRef.current
                ) {
                    return;
                }

                setProducts(result.products);
                setHasMore(result.hasMore);
                setPage(1);
            } catch (fetchError) {
                if (
                    controller.signal.aborted ||
                    requestId !== feedRequestIdRef.current
                ) {
                    return;
                }

                setProducts([]);
                setHasMore(false);
                setError(
                    fetchError.message ||
                    "Something went wrong. Please try again."
                );
            } finally {
                if (
                    !controller.signal.aborted &&
                    requestId === feedRequestIdRef.current
                ) {
                    setLoading(false);
                }
            }
        }

        loadFirstPage();

        return () => {
            controller.abort();
            loadMoreControllerRef.current?.abort();
        };
    }, [fetchProducts, refreshKey, sort, location]);

    // Automatically fetch the next page.
    const loadMoreProducts = useCallback(async () => {
        if (
            loading ||
            loadingMoreRef.current ||
            !hasMore ||
            error ||
            (sort === "nearest" && !location)
        ) {
            return;
        }

        loadingMoreRef.current = true;
        setLoadingMore(true);

        const controller = new AbortController();
        loadMoreControllerRef.current = controller;

        const requestId = feedRequestIdRef.current;
        const nextPage = page + 1;

        try {
            const result = await fetchProducts(
                nextPage,
                controller.signal
            );

            if (
                controller.signal.aborted ||
                requestId !== feedRequestIdRef.current
            ) {
                return;
            }

            const newItems = result.products;

            // Prevent duplicate products from being appended.
            setProducts((previous) => {
                const existingIds = new Set(
                    previous.map((item) => item._id)
                );

                const uniqueItems = newItems.filter(
                    (item) => !existingIds.has(item._id)
                );

                return [...previous, ...uniqueItems];
            });

            setPage(nextPage);
            setHasMore(result.hasMore);
        } catch (fetchError) {
            if (
                !controller.signal.aborted &&
                requestId === feedRequestIdRef.current
            ) {
                console.error(
                    "Failed to load more items:",
                    fetchError
                );
            }
        } finally {
            if (requestId === feedRequestIdRef.current) {
                loadingMoreRef.current = false;
                setLoadingMore(false);

                if (loadMoreControllerRef.current === controller) {
                    loadMoreControllerRef.current = null;
                }
            }
        }
    }, [
        loading,
        hasMore,
        error,
        sort,
        location,
        page,
        fetchProducts,
    ]);

    // Observe the bottom of the product feed.
    useEffect(() => {
        const target = observerRef.current;

        if (
            !target ||
            loading ||
            loadingMore ||
            !hasMore ||
            error ||
            (sort === "nearest" && !location)
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMoreProducts();
                }
            },
            {
                root: null,
                rootMargin: "300px",
                threshold: 0,
            }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [
        loading,
        loadingMore,
        hasMore,
        error,
        sort,
        location,
        loadMoreProducts,
    ]);

    // Search loaded products on the client.
    const filteredProducts = useMemo(
        () => products.filter((item) => matchesSearch(item, search)),
        [products, search]
    );

    function retryFetch() {
        resetFeed();
        setLoading(!(sort === "nearest" && !location));
        setHasMore(!(sort === "nearest" && !location));
        setRefreshKey((previous) => previous + 1);
    }

    function resetFeed() {
        loadMoreControllerRef.current?.abort();
        loadMoreControllerRef.current = null;
        loadingMoreRef.current = false;
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setLoadingMore(false);
        setError("");
    }

    function clearFilters() {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.delete("q");
            return next;
        });
        changeCategory("All");
    }

    function changeSort(nextSort) {
        resetFeed();
        setLoading(!(nextSort === "nearest" && !location));
        setHasMore(!(nextSort === "nearest" && !location));
        setSort(nextSort);
    }

    function changeCategory(nextCategory) {
        if (nextCategory === selectedCategory) return;
        resetFeed();
        setLoading(true);
        setSelectedCategory(nextCategory);
    }

    return (
        <div className="min-h-screen bg-[#f8faff] text-slate-900">
            <AuthNavbar />

            <main>
                {wishlistError && (
                    <div role="alert" className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{wishlistError}</p>
                    </div>
                )}
                {/* Hero */}
                <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-100/60">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
                                <RefreshCw size={14} />
                                A smarter way to reuse
                            </div>

                            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                Good things deserve
                                <span className="block text-blue-700">
                                    another beginning.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                Discover useful items, find great deals nearby, and give
                                the things you no longer need a new purpose.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="#discover"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800"
                                >
                                    Discover items
                                    <ArrowRight size={17} />
                                </a>

                                <Link
                                    to="/create-item"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                >
                                    <Plus size={17} />
                                    List an item
                                </Link>
                            </div>
                        </div>

                        {/* Discovery panel */}
                        <div className="relative hidden lg:block">
                            <div className="rounded-[2rem] border border-white bg-white/70 p-5 shadow-2xl shadow-blue-900/[0.06] backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">
                                            Your next discovery
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            Something useful is out there.
                                        </p>
                                    </div>

                                    <span className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                                        <Compass size={23} />
                                    </span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-blue-50 p-4">
                                        <Package size={23} className="text-blue-700" />
                                        <p className="mt-3 text-sm font-semibold text-slate-800">
                                            Find something useful
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Explore items shared by your community.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-sky-50 p-4">
                                        <MapPin size={23} className="text-sky-700" />
                                        <p className="mt-3 text-sm font-semibold text-slate-800">
                                            Explore nearby
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Discover listings around your location.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                                        <RefreshCw size={19} />
                                    </div>
                                    <p className="text-sm leading-5 text-slate-600">
                                        Use more. Waste less. Make every item count.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product feed */}
                <section
                    id="discover"
                    className="mx-auto max-w-7xl scroll-mt-5 px-4 py-9 sm:px-6 sm:py-12 lg:px-8"
                >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold text-blue-700">
                                Made for your next find
                            </p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                Discover items
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Find something useful, right here.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <label
                                htmlFor="sort-items"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600"
                            >
                                <SlidersHorizontal size={16} />
                                Sort by
                            </label>

                            <div className="relative">
                                <select
                                    id="sort-items"
                                    value={sort}
                                    onChange={(event) =>
                                        changeSort(event.target.value)
                                    }
                                    className="w-full min-w-44 appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-7 flex flex-col gap-4 md:flex-row">
                        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                            <Search size={19} className="shrink-0 text-slate-400" />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearchParams((current) => {
                                    const next = new URLSearchParams(current);
                                    if (event.target.value) next.set("q", event.target.value);
                                    else next.delete("q");
                                    return next;
                                }, { replace: true })}
                                placeholder="Search items, books, electronics..."
                                aria-label="Search items"
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearchParams((current) => {
                                        const next = new URLSearchParams(current);
                                        next.delete("q");
                                        return next;
                                    }, { replace: true })}
                                    aria-label="Clear search"
                                    className="text-slate-400 hover:text-slate-700"
                                >
                                    <X size={17} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                onClick={() =>
                                    changeCategory(category.value)
                                }
                                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                                    selectedCategory === category.value
                                        ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {/* Location status */}
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                                <MapPin size={19} />
                            </span>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {locationLoading
                                        ? "Checking your location..."
                                        : location
                                          ? "Location is ready"
                                          : "Location unavailable"}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {locationLoading
                                        ? "You can browse newest items while we check."
                                        : location
                                          ? "Your distance from each listed item will appear on its card."
                                          : locationError ||
                                            "Allow location access to sort items by distance."}
                                </p>
                            </div>
                        </div>

                        {!location && !locationLoading && (
                            <button
                                type="button"
                                onClick={getLocation}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 sm:self-center"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>
                        )}
                    </div>

                    {/* Feed heading */}
                    <div className="mb-4 mt-7 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {sort === "newest"
                                    ? "Recently added"
                                    : sort === "nearest"
                                      ? "Closest to you"
                                      : "Recommended for you"}
                            </h3>

                            {!loading && !error && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {filteredProducts.length}{" "}
                                    {filteredProducts.length === 1
                                        ? "item"
                                        : "items"}{" "}
                                    loaded
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={retryFetch}
                            disabled={loading}
                            aria-label="Refresh items"
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                        </button>
                    </div>

                    {/* First-page loading skeletons */}
                    {loading && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                                <ProductSkeleton key={number} />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
                            <AlertCircle
                                size={32}
                                className="mx-auto mb-3 text-red-500"
                            />
                            <h3 className="font-semibold text-slate-900">
                                Couldn't load items
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={retryFetch}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                            >
                                <RefreshCw size={15} />
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Location required for nearest sorting */}
                    {!loading &&
                        !error &&
                        sort === "nearest" &&
                        !location && (
                            <div className="rounded-2xl border border-blue-100 bg-white px-5 py-12 text-center">
                                <MapPin
                                    size={32}
                                    className="mx-auto mb-3 text-blue-600"
                                />
                                <h3 className="font-semibold text-slate-900">
                                    Turn on location to find nearby items
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Your location helps SwiVastu calculate
                                    distances and show the closest available
                                    listings first.
                                </p>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                                >
                                    Enable location
                                </button>
                            </div>
                        )}

                    {/* Product grid */}
                    {!loading &&
                        !error &&
                        !(sort === "nearest" && !location) &&
                        (filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {filteredProducts.map((item) => (
                                    <ItemCard
                                        key={item._id}
                                        item={item}
                                        userLocation={location}
                                        liked={likedIds.has(String(item._id))}
                                        onToggleLike={toggleLike}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                                <Search
                                    size={32}
                                    className="mx-auto mb-3 text-slate-400"
                                />
                                <h3 className="text-lg font-semibold text-slate-900">
                                    No matching items found
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try another search or select a different category.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ))}

                    {/* Infinite-scroll trigger */}
                    {!loading &&
                        !error &&
                        !(sort === "nearest" && !location) &&
                        products.length > 0 && (
                            <div
                                ref={observerRef}
                                className="flex min-h-16 items-center justify-center py-4"
                            >
                                {loadingMore && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Loading more items...
                                    </div>
                                )}

                                {!hasMore && (
                                    <p className="text-xs text-slate-400">
                                        You have seen all available items.
                                    </p>
                                )}
                            </div>
                        )}
                </section>

                {/* Call to action */}
                <section className="px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 to-blue-700 px-6 py-9 text-white sm:flex-row sm:items-center sm:px-10">
                        <div>
                            <p className="text-sm font-medium text-blue-200">
                                Make room for something new
                            </p>
                            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                                Give your unused items a new purpose.
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                                List an item and help someone in your community
                                find something useful.
                            </p>
                        </div>

                        <Link
                            to="/create-item"
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                        >
                            <Plus size={17} />
                            List an item
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="text-lg font-extrabold tracking-tight text-blue-800"
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
