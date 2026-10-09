import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Package, RefreshCw, Trash2 } from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { apiRequest } from "../../services/api.js";

function itemImage(item) {
    const image = item?.images?.[0];
    return typeof image === "string" ? image : image?.url || "";
}

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await apiRequest("/items/liked-items");
            setItems(Array.isArray(result?.data) ? result.data : []);
        } catch (loadError) {
            setError(loadError.message || "Couldn't load saved items.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(loadItems);
    }, [loadItems]);

    async function removeItem(itemId) {
        setBusyId(itemId);
        setError("");
        try {
            await apiRequest(`/items/${itemId}/like`, {
                method: "PUT",
                body: { liked: false },
            });
            setItems((current) => current.filter((item) => item._id !== itemId));
        } catch (removeError) {
            setError(removeError.message || "Couldn't remove this item.");
        } finally {
            setBusyId("");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600">Your collection</p>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Saved items</h1>
                        <p className="mt-2 text-sm text-slate-600">Items you liked are kept here for later.</p>
                    </div>
                    <Link to="/home" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        Explore items
                    </Link>
                </div>

                {error && (
                    <div role="alert" className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <span className="flex-1">{error}</span>
                        <button type="button" onClick={loadItems} aria-label="Retry loading saved items" className="rounded-lg p-2 hover:bg-red-100">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((key) => <div key={key} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-200" />)}
                    </div>
                ) : items.length ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {items.map((item) => (
                            <article key={item._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <Link to={`/item/${item._id}`} className="block">
                                    {itemImage(item) ? (
                                        <img src={itemImage(item)} alt={item.title || "Saved item"} loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400"><Package size={28} /></div>
                                    )}
                                    <div className="p-3">
                                        <h2 className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</h2>
                                        <p className="mt-1 text-xs capitalize text-slate-500">{item.category} · {item.status}</p>
                                    </div>
                                </Link>
                                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                                    <Link to={`/item/${item._id}`} className="text-xs font-semibold text-blue-700 hover:underline">View item</Link>
                                    <button type="button" disabled={busyId === item._id} onClick={() => removeItem(item._id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                        <Heart size={34} className="mx-auto text-rose-300" />
                        <h2 className="mt-3 font-bold text-slate-900">No saved items yet</h2>
                        <p className="mt-1 text-sm text-slate-500">Tap the heart on an item to save it here.</p>
                        <Link to="/home" className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Explore items</Link>
                    </div>
                )}
            </main>
        </div>
    );
}
