import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Package, Plus, RefreshCw, Trash2 } from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { apiRequest } from "../../services/api.js";

function getImage(item) {
    const image = item?.images?.[0];
    return typeof image === "string" ? image : image?.url || "";
}

export default function MyItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        apiRequest("/items/my-items")
            .then((result) => {
                if (active) setItems(Array.isArray(result?.data) ? result.data : []);
            })
            .catch((loadError) => {
                if (active) setError(loadError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [loadAttempt]);

    async function deleteItem(item) {
        if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

        setBusyId(item._id);
        setError("");
        try {
            await apiRequest(`/items/${item._id}`, { method: "DELETE" });
            setItems((current) => current.filter((entry) => entry._id !== item._id));
        } catch (deleteError) {
            setError(deleteError.message);
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
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Your marketplace</p>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">My items</h1>
                        <p className="mt-2 text-sm text-slate-600">Manage the things you have shared with the community.</p>
                    </div>
                    <Link to="/create-item" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                        <Plus size={17} /> List an item
                    </Link>
                </div>

                {error && (
                    <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setLoading(true);
                                setLoadAttempt((attempt) => attempt + 1);
                            }}
                            className="ml-auto shrink-0 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                        <Package size={36} className="mx-auto text-slate-400" />
                        <h2 className="mt-4 text-lg font-bold text-slate-900">Nothing listed yet</h2>
                        <p className="mt-2 text-sm text-slate-500">Add your first item and give it a new beginning.</p>
                        <Link to="/create-item" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                            <Plus size={17} /> Create a listing
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <article key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <Link to={`/item/${item._id}`} className="block">
                                    {getImage(item) ? (
                                        <img src={getImage(item)} alt={item.title} className="aspect-[16/10] w-full bg-slate-100 object-cover" />
                                    ) : (
                                        <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-slate-400"><Package size={32} /></div>
                                    )}
                                </Link>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <Link to={`/item/${item._id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-blue-700">{item.title}</Link>
                                            <p className="mt-1 text-xs capitalize text-slate-500">
                                                {Array.isArray(item.listingType)
                                                    ? item.listingType.join(" · ")
                                                    : item.listingType || "Listing"}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status || "Available"}</span>
                                    </div>
                                    <button type="button" onClick={() => deleteItem(item)} disabled={busyId === item._id} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                                        {busyId === item._id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {busyId === item._id ? "Deleting…" : "Delete listing"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
