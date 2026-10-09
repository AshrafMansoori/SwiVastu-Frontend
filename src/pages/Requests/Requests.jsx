import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    AlertCircle,
    ArrowRightLeft,
    CalendarDays,
    Check,
    Clock3,
    MessageCircle,
    Package,
    RefreshCw,
    ShoppingBag,
    X,
} from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { apiRequest } from "../../services/api.js";

const requestTypes = [
    { value: "purchase", label: "Buy & giveaway", icon: ShoppingBag },
    { value: "exchange", label: "Exchange", icon: ArrowRightLeft },
    { value: "rent", label: "Rent", icon: CalendarDays },
];

const directions = [
    { value: "incoming", label: "Received" },
    { value: "outgoing", label: "Sent" },
    { value: "history", label: "History" },
];

const requestPaths = {
    purchase: {
        incoming: "/purchase/incoming",
        outgoing: "/purchase/outgoing",
        history: "/purchase/history",
        action: (id, action) => `/purchase/${id}/${action}`,
        chat: (id) => `/purchase/${id}/chat`,
    },
    exchange: {
        incoming: "/exchange-requests/incoming",
        outgoing: "/exchange-requests/outgoing",
        history: "/exchange-requests/history",
        action: (id, action) => `/exchange-requests/${id}/${action}`,
        chat: (id) => `/exchange-requests/${id}/chat`,
    },
    rent: {
        incoming: "/rent/incoming",
        outgoing: "/rent/outgoing",
        history: "/rent/history",
        action: (id, action) => `/rent/request/${id}/${action}`,
        chat: (id) => `/rent/request/${id}/chat`,
    },
};

function RequestIcon({ type, size = 16, className }) {
    const Icon = requestTypes.find((entry) => entry.value === type)?.icon || Package;
    return <Icon size={size} className={className} />;
}

function getRequestItem(request, type) {
    return type === "exchange" ? request.requestedItemId : request.itemId;
}

function getOtherParty(request, type, direction, userId) {
    if (type === "purchase") {
        if (direction === "incoming") return request.buyerId;
        if (direction === "outgoing") return request.sellerId;
        return String(request.buyerId?._id) === String(userId)
            ? request.sellerId
            : request.buyerId;
    }
    if (type === "exchange") {
        if (direction === "incoming") return request.requesterId;
        if (direction === "outgoing") return request.ownerId;
        return String(request.requesterId?._id) === String(userId)
            ? request.ownerId
            : request.requesterId;
    }
    if (direction === "incoming") return request.borrowerId;
    if (direction === "outgoing") return request.lenderId;
    return String(request.borrowerId?._id) === String(userId)
        ? request.lenderId
        : request.borrowerId;
}

function hasConfirmedCompletion(request, type, userId) {
    const completion = request.completion || {};
    if (type === "purchase") {
        return String(request.buyerId?._id) === String(userId)
            ? completion.buyerConfirmed
            : completion.sellerConfirmed;
    }
    if (type === "exchange") {
        return String(request.requesterId?._id) === String(userId)
            ? completion.requesterConfirmed
            : completion.ownerConfirmed;
    }
    return String(request.borrowerId?._id) === String(userId)
        ? completion.borrowerConfirmed
        : completion.lenderConfirmed;
}

function getImage(item) {
    const image = item?.images?.[0];
    return typeof image === "string" ? image : image?.url || "";
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
          });
}

export default function Requests() {
    const userId = useSelector((state) => state.auth.user?._id);
    const [type, setType] = useState("purchase");
    const [direction, setDirection] = useState("incoming");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyRequestId, setBusyRequestId] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        apiRequest(requestPaths[type][direction], {
            signal: controller.signal,
        })
            .then((result) => {
                if (active) {
                    setRequests(Array.isArray(result?.data) ? result.data : []);
                }
            })
            .catch((loadError) => {
                if (active && loadError.name !== "AbortError") {
                    setError(loadError.message);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [type, direction, reloadKey]);

    async function updateRequest(request, action) {
        setBusyRequestId(request._id);
        setError("");
        setNotice("");

        try {
            const result = await apiRequest(
                action === "chat"
                    ? requestPaths[type].chat(request._id)
                    : requestPaths[type].action(request._id, action),
                { method: "PATCH" }
            );
            setNotice(
                result?.message ||
                    (action === "chat"
                        ? "Chat is now available."
                        : `Request ${
                            {
                            accept: "accepted",
                            reject: "declined",
                            cancel: "cancelled",
                            complete: "completion confirmed",
                            return: "return confirmed",
                        }[action]
                        }.`)
            );
            setLoading(true);
            setReloadKey((current) => current + 1);
        } catch (actionError) {
            setError(actionError.message);
        } finally {
            setBusyRequestId("");
        }
    }

    function switchDirection(nextDirection) {
        if (nextDirection === direction) return;
        setError("");
        setNotice("");
        setLoading(true);
        setDirection(nextDirection);
    }

    function switchType(nextType) {
        if (nextType === type) return;
        setError("");
        setNotice("");
        setLoading(true);
        setType(nextType);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                            Keep things moving
                        </p>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                            Requests
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Review incoming requests and keep track of the ones you sent.
                        </p>
                    </div>
                    <Link to="/home" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
                        Explore items <ArrowRightLeft size={16} />
                    </Link>
                </div>

                <div className="mt-7 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Request type">
                    {requestTypes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={type === value}
                            onClick={() => switchType(value)}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                type === value
                                    ? "bg-blue-700 text-white shadow-sm"
                                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                            }`}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex border-b border-slate-200" role="tablist" aria-label="Request direction">
                    {directions.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={direction === value}
                            onClick={() => switchDirection(value)}
                            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                direction === value
                                    ? "border-blue-700 text-blue-700"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {notice && (
                    <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {notice}
                    </p>
                )}
                {error && (
                    <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setLoading(true);
                                setReloadKey((current) => current + 1);
                            }}
                            className="ml-auto shrink-0 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="mt-5 space-y-3">
                        {[1, 2, 3].map((key) => (
                            <div key={key} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                        <RequestIcon type={type} size={34} className="mx-auto text-slate-400" />
                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                            {direction === "history" ? "No request history yet" : "No requests here yet"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            {direction === "incoming"
                                ? "When someone requests one of your items, it will appear here."
                                : direction === "outgoing"
                                  ? "Requests you send to other members will show up here."
                                  : "Accepted, declined, and cancelled requests will appear here."}
                        </p>
                        {direction !== "incoming" && (
                            <Link to="/home" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                                Find something nearby
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="mt-5 space-y-3">
                        {requests.map((request) => {
                            const item = getRequestItem(request, type);
                            const otherParty = getOtherParty(request, type, direction, userId);
                            const isPending = request.status === "pending";
                            const isAccepted = request.status === "accepted";
                            const completionConfirmed = hasConfirmedCompletion(request, type, userId);

                            return (
                                <article key={request._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                                    <Link to={item?._id ? `/item/${item._id}` : "/home"} className="flex min-w-0 flex-1 items-center gap-4">
                                        {getImage(item) ? (
                                            <img src={getImage(item)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-cover" />
                                        ) : (
                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <Package size={25} />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h2 className="truncate font-bold text-slate-900">{item?.title || "Item no longer available"}</h2>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {direction === "incoming" ? "From" : "With"}{" "}
                                                <span className="font-semibold text-slate-800">{otherParty?.fullname || "SwiVastu member"}</span>
                                            </p>
                                            {type === "exchange" && request.offeredItemId?.title && (
                                                <p className="mt-1 text-xs text-slate-500">Offered: {request.offeredItemId.title}</p>
                                            )}
                                            {type === "rent" && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDate(request.startDate)} – {formatDate(request.endDate)}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatDate(request.createdAt)}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                                            request.status === "accepted"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : request.status === "pending"
                                                  ? "bg-amber-50 text-amber-700"
                                                  : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {request.status === "pending" ? <Clock3 size={13} /> : <Check size={13} />}
                                            {request.status}
                                        </span>
                                        {direction === "incoming" && isPending && (
                                            <>
                                                {request.chatStarted ? (
                                                    <Link
                                                        to={`/chat/${type}/${request._id}`}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <MessageCircle size={14} /> Open chat
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={busyRequestId === request._id}
                                                        onClick={() => updateRequest(request, "chat")}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                                    >
                                                        <MessageCircle size={14} /> Start chat
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={busyRequestId === request._id}
                                                    onClick={() => updateRequest(request, "accept")}
                                                    className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={busyRequestId === request._id}
                                                    onClick={() => updateRequest(request, "reject")}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    <X size={13} /> Decline
                                                </button>
                                            </>
                                        )}
                                        {direction === "outgoing" && isPending && (
                                            <>
                                                {request.chatStarted ? (
                                                    <Link to={`/chat/${type}/${request._id}`} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                                                        <MessageCircle size={14} /> Open chat
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-500">Waiting for owner to start chat</span>
                                                )}
                                            <button
                                                type="button"
                                                disabled={busyRequestId === request._id}
                                                onClick={() => updateRequest(request, "cancel")}
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                Cancel request
                                            </button>
                                            </>
                                        )}
                                        {direction === "history" && isAccepted && !completionConfirmed && (
                                            <button
                                                type="button"
                                                disabled={busyRequestId === request._id}
                                                onClick={() =>
                                                    updateRequest(
                                                        request,
                                                        type === "rent"
                                                            ? "return"
                                                            : "complete"
                                                    )
                                                }
                                                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                                            >
                                                {type === "rent" ? "Confirm return" : "Confirm completion"}
                                            </button>
                                        )}
                                        {direction === "history" && isAccepted && completionConfirmed && (
                                            <span className="text-xs text-slate-500">
                                                Waiting for the other member&apos;s confirmation
                                            </span>
                                        )}
                                        {busyRequestId === request._id && (
                                            <RefreshCw size={15} className="animate-spin text-blue-700" aria-label="Updating request" />
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
