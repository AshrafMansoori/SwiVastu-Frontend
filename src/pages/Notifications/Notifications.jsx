import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Bell, CalendarDays, RefreshCw, ShoppingBag } from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { useSelector } from "react-redux";
import {
    fetchNotifications,
    markNotificationsRead,
    notificationTypeLabel,
} from "../../services/notifications.js";

const typeIcons = { purchase: ShoppingBag, exchange: ArrowRightLeft, rent: CalendarDays };

function getImage(item) {
    const image = item?.images?.[0];
    return typeof image === "string" ? image : image?.url || "";
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function Notifications() {
    const userId = useSelector((state) => state.auth.user?._id);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const entries = await fetchNotifications(userId);
            setNotifications(entries);
            markNotificationsRead(userId, entries);
        } catch (loadError) {
            setError(loadError.message || "Couldn't load notifications.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        Promise.resolve().then(loadNotifications);
    }, [loadNotifications]);

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Activity</p>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Notifications</h1>
                        <p className="mt-2 text-sm text-slate-600">Request updates and new requests from your marketplace activity.</p>
                    </div>
                    <button type="button" onClick={loadNotifications} aria-label="Refresh notifications" className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-100">
                        <RefreshCw size={17} />
                    </button>
                </div>

                {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                <section aria-label="Recent activity" className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {loading ? (
                        <div className="space-y-3 p-5">{[1, 2, 3].map((key) => <div key={key} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
                    ) : notifications.length ? notifications.map((entry) => {
                        const Icon = typeIcons[entry.type];
                        const action = entry.message;
                        return (
                            <article key={entry.id} className="flex items-start gap-3 border-b border-slate-100 p-4 last:border-0 sm:gap-4 sm:p-5">
                                {getImage(entry.item) ? (
                                    <img src={getImage(entry.item)} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 object-cover" />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={20} /></div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-6 text-slate-700">
                                        <strong className="font-semibold text-slate-900">{entry.party?.fullname || "A member"}</strong>{" "}
                                        {action} for <strong className="font-semibold text-slate-900">{entry.item?.title || "an item"}</strong>.
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">{notificationTypeLabel(entry.type)} · {formatDate(entry.createdAt)}</p>
                                </div>
                                <Link to="/requests" className="shrink-0 self-center text-xs font-semibold text-blue-700 hover:underline">View</Link>
                            </article>
                        );
                    }) : (
                        <div className="px-5 py-16 text-center">
                            <Bell size={32} className="mx-auto text-slate-300" />
                            <h2 className="mt-3 font-bold text-slate-900">You're all caught up</h2>
                            <p className="mt-1 text-sm text-slate-500">Request activity will show here.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
