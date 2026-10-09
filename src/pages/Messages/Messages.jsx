import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Send, Wifi, WifiOff } from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { apiRequest, API_URL } from "../../services/api.js";

const TYPES = ["purchase", "exchange", "rent"];

const backendUrl = new URL(API_URL, window.location.origin);
const SOCKET_URL = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${backendUrl.host}/socket`;

const REQUEST_ENDPOINTS = {
    purchase: ["/purchase/incoming", "/purchase/outgoing"],
    exchange: ["/exchange-requests/incoming", "/exchange-requests/outgoing"],
    rent: ["/rent/incoming", "/rent/outgoing"],
};

function participantIds(request, type) {
    if (type === "purchase") return [request.buyerId, request.sellerId];
    if (type === "exchange") return [request.requesterId, request.ownerId];
    return [request.borrowerId, request.lenderId];
}

function otherMember(request, type, userId) {
    const [first, second] = participantIds(request, type);
    return String(first?._id || first) === String(userId) ? second : first;
}

function getItem(request, type) {
    return type === "exchange" ? request.requestedItemId : request.itemId;
}

function getTitle(conversation) {
    if (conversation.type === "exchange") {
        return `Exchange · ${conversation.item?.title || "Item"}`;
    }
    if (conversation.type === "rent") {
        return `Rental · ${conversation.item?.title || "Item"}`;
    }
    return `Purchase · ${conversation.item?.title || "Item"}`;
}

function normalizeMessage(message, currentUserId) {
    return {
        id: String(message._id || message.messageId || `${message.createdAt}-${message.message}`),
        senderId: String(message.senderId?._id || message.senderId),
        text: message.message || "",
        createdAt: message.createdAt || new Date().toISOString(),
        status: message.status || "sent",
        mine: String(message.senderId?._id || message.senderId) === String(currentUserId),
    };
}

function formatTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
          });
}

export default function Messages() {
    const { transactionType, transactionId } = useParams();
    const userId = useSelector((state) => state.auth.user?._id);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [conversationError, setConversationError] = useState("");
    const [messageError, setMessageError] = useState("");
    const [draft, setDraft] = useState("");
    const [socketState, setSocketState] = useState("connecting");
    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const invalidConversationType = Boolean(
        transactionType && transactionId && !TYPES.includes(transactionType)
    );

    const activeConversation = useMemo(
        () =>
            conversations.find(
                (conversation) =>
                    conversation.type === transactionType &&
                    conversation.id === transactionId
            ) || null,
        [conversations, transactionId, transactionType]
    );
    const loadConversations = useCallback(async () => {
        try {
            const results = await Promise.all(
                TYPES.flatMap((type) =>
                    REQUEST_ENDPOINTS[type].map((path) =>
                        apiRequest(path).then((response) => ({ type, response }))
                    )
                )
            );
            const entries = results.flatMap(({ type, response }) =>
                (Array.isArray(response?.data) ? response.data : [])
                    .filter((request) => request.chatStarted)
                    .map((request) => {
                        const member = otherMember(request, type, userId);
                        const item = getItem(request, type);
                        return {
                            id: String(request._id),
                            type,
                            request,
                            member,
                            item,
                            title: member?.fullname || "SwiVastu member",
                            image: member?.profileImage || "",
                            updatedAt: request.updatedAt || request.createdAt,
                        };
                    })
            );
            const unique = [...new Map(entries.map((entry) => [`${entry.type}:${entry.id}`, entry])).values()];
            unique.sort(
                (first, second) =>
                    new Date(second.updatedAt).getTime() -
                    new Date(first.updatedAt).getTime()
            );
            setConversationError("");
            setConversations(unique);
        } catch (error) {
            setConversationError(error.message || "Couldn't load conversations.");
        } finally {
            setLoadingConversations(false);
        }
    }, [userId]);

    useEffect(() => {
        Promise.resolve().then(loadConversations);
    }, [loadConversations]);

    useEffect(() => {
        if (!transactionType || !transactionId) return undefined;
        if (!TYPES.includes(transactionType)) return undefined;

        let active = true;
        Promise.resolve()
            .then(() => {
                if (!active) return null;
                setLoadingMessages(true);
                setMessageError("");
                return apiRequest(`/messages/${transactionType}/${transactionId}`);
            })
            .then((result) => {
                if (!active || !result) return;
                const data = Array.isArray(result?.data) ? result.data : [];
                setMessages(data.map((message) => normalizeMessage(message, userId)));
            })
            .catch((error) => {
                if (active) setMessageError(error.message || "Couldn't load messages.");
            })
            .finally(() => {
                if (active) setLoadingMessages(false);
            });

        return () => {
            active = false;
        };
    }, [transactionType, transactionId, userId]);

    useEffect(() => {
        if (!transactionType || !transactionId || !TYPES.includes(transactionType)) {
            socketRef.current?.close();
            socketRef.current = null;
            return undefined;
        }

        let reconnectTimer;
        let disposed = false;
        let retryDelay = 1000;

        function connect() {
            if (disposed) return;
            setSocketState("connecting");
            const socket = new WebSocket(SOCKET_URL);
            socketRef.current = socket;

            socket.addEventListener("open", () => {
                retryDelay = 1000;
                setSocketState("connected");
                socket.send(JSON.stringify({ type: "ping" }));
            });

            socket.addEventListener("message", (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    setMessageError("The messaging server returned an invalid message.");
                    return;
                }

                if (
                    data.type === "private_message" &&
                    String(data.transactionId) === String(transactionId) &&
                    data.transactionType === transactionType
                ) {
                    setMessages((current) => {
                        const incoming = normalizeMessage(data, userId);
                        if (current.some((message) => message.id === incoming.id)) {
                            return current;
                        }
                        return [...current, incoming];
                    });
                    return;
                }

                if (data.type === "message_status") {
                    setMessages((current) =>
                        current.map((message, index) =>
                            index === current.length - 1 && message.status === "sending"
                                ? {
                                      ...message,
                                      id: String(data.messageId || message.id),
                                      status: data.status || "sent",
                                  }
                                : message
                        )
                    );
                    return;
                }

                if (data.type === "error") {
                    setMessageError(data.message || "Unable to send message.");
                    setMessages((current) =>
                        current.map((message, index) =>
                            index === current.length - 1 && message.status === "sending"
                                ? { ...message, status: "failed" }
                                : message
                        )
                    );
                }
            });

            socket.addEventListener("close", () => {
                if (socketRef.current === socket) socketRef.current = null;
                if (disposed) return;
                setSocketState("disconnected");
                reconnectTimer = window.setTimeout(connect, retryDelay);
                retryDelay = Math.min(retryDelay * 2, 15000);
            });

            socket.addEventListener("error", () => {
                setSocketState("disconnected");
            });
        }

        connect();
        return () => {
            disposed = true;
            window.clearTimeout(reconnectTimer);
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [transactionType, transactionId, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    function sendMessage(event) {
        event.preventDefault();
        const text = draft.trim();
        const socket = socketRef.current;
        if (!text || text.length > 5000 || !activeConversation || socket?.readyState !== WebSocket.OPEN) {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                setMessageError("Chat is reconnecting. Please try sending again in a moment.");
            }
            return;
        }

        setMessageError("");
        setMessages((current) => [
            ...current,
            {
                id: `pending-${Date.now()}`,
                senderId: String(userId),
                text,
                createdAt: new Date().toISOString(),
                status: "sending",
                mine: true,
            },
        ]);
        setDraft("");
        socket.send(
            JSON.stringify({
                type: "private_message",
                receiverId: String(activeConversation.member?._id || activeConversation.member),
                transactionId: activeConversation.id,
                transactionType: activeConversation.type,
                message: text,
            })
        );
    }

    const visibleSocketState = activeConversation ? socketState : "closed";
    const title = activeConversation ? getTitle(activeConversation) : "Messages";

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Marketplace conversations</p>
                    <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Messages</h1>
                </div>

                <div className="grid min-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[18rem_minmax(0,1fr)]">
                    <aside className={`${activeConversation ? "hidden md:flex" : "flex"} min-w-0 flex-col border-r border-slate-200`}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                            <h2 className="font-bold text-slate-900">Your chats</h2>
                            <button type="button" onClick={() => {
                                setLoadingConversations(true);
                                setConversationError("");
                                loadConversations();
                            }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Refresh chats">
                                <MessageCircle size={17} />
                            </button>
                        </div>
                        {conversationError && (
                            <div role="alert" className="m-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                {conversationError}
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto">
                            {loadingConversations ? (
                                <div className="space-y-3 p-4">
                                    {[1, 2, 3].map((key) => <div key={key} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <MessageCircle size={28} className="mx-auto text-slate-300" />
                                    <p className="mt-3 text-sm font-semibold text-slate-700">No chats started</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">When an item owner starts a chat from a request, it will appear here.</p>
                                    <Link to="/requests" className="mt-4 inline-block text-xs font-semibold text-blue-700 hover:underline">View requests</Link>
                                </div>
                            ) : (
                                conversations.map((conversation) => {
                                    const selected = conversation.id === transactionId && conversation.type === transactionType;
                                    return (
                                        <Link
                                            key={`${conversation.type}:${conversation.id}`}
                                            to={`/chat/${conversation.type}/${conversation.id}`}
                                            className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-blue-50/60 ${selected ? "bg-blue-50" : ""}`}
                                        >
                                            {conversation.image ? (
                                                <img src={conversation.image} alt="" className="h-11 w-11 shrink-0 rounded-full bg-slate-100 object-cover" />
                                            ) : (
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{conversation.title.charAt(0).toUpperCase()}</div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">{conversation.title}</p>
                                                <p className="truncate text-xs text-slate-500">{getTitle(conversation)}</p>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {activeConversation ? (
                        <section className="flex min-h-[70vh] min-w-0 flex-col">
                            <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                                <Link to="/chat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Back to chats">
                                    <ArrowLeft size={19} />
                                </Link>
                                {activeConversation.image ? (
                                    <img src={activeConversation.image} alt="" className="h-10 w-10 rounded-full bg-slate-100 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{activeConversation.title.charAt(0).toUpperCase()}</div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-sm font-bold text-slate-900">{activeConversation.title}</h2>
                                    <p className="truncate text-xs text-slate-500">{title}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${visibleSocketState === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {visibleSocketState === "connected" ? <Wifi size={13} /> : <WifiOff size={13} />}
                                    <span className="hidden sm:inline">{visibleSocketState === "connected" ? "Connected" : visibleSocketState === "connecting" ? "Connecting" : "Offline"}</span>
                                </span>
                            </header>

                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6">
                                {loadingMessages && (
                                    <p className="text-center text-xs text-slate-400">Loading conversation…</p>
                                )}
                                {(invalidConversationType || messageError) && (
                                    <p role="alert" className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs text-red-700">
                                        {invalidConversationType ? "Invalid conversation type." : messageError}
                                    </p>
                                )}
                                {!loadingMessages && !messageError && messages.length === 0 && (
                                    <div className="py-16 text-center">
                                        <MessageCircle size={30} className="mx-auto text-slate-300" />
                                        <p className="mt-3 text-sm font-semibold text-slate-700">Start the conversation</p>
                                        <p className="mt-1 text-xs text-slate-500">Keep communication respectful and arrange details here.</p>
                                    </div>
                                )}
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[72%] ${message.mine ? "rounded-br-md bg-blue-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
                                            <p className={`mt-1 text-right text-[10px] ${message.mine ? "text-blue-100" : "text-slate-400"}`}>
                                                {formatTime(message.createdAt)}{message.mine && message.status !== "sending" ? ` · ${message.status}` : message.mine ? " · Sending" : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3 sm:p-4">
                                <label className="sr-only" htmlFor="chat-message">Message</label>
                                <div className="flex items-end gap-2">
                                    <textarea
                                        id="chat-message"
                                        rows={1}
                                        maxLength={5000}
                                        value={draft}
                                        onChange={(event) => setDraft(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey) {
                                                event.preventDefault();
                                                event.currentTarget.form?.requestSubmit();
                                            }
                                        }}
                                        placeholder="Write a message…"
                                        className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                    <button type="submit" disabled={!draft.trim() || draft.length > 5000 || visibleSocketState !== "connected"} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                                        <Send size={17} />
                                    </button>
                                </div>
                                <p className="mt-1.5 text-right text-[10px] text-slate-400">Enter to send · Shift+Enter for a new line</p>
                            </form>
                        </section>
                    ) : (
                        <section className="hidden items-center justify-center bg-slate-50/60 p-8 text-center md:flex">
                            <div>
                                <MessageCircle size={40} className="mx-auto text-slate-300" />
                                <h2 className="mt-4 text-lg font-bold text-slate-800">Choose a conversation</h2>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Your item-request chats will show up in the list.</p>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
