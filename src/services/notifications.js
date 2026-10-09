import { apiRequest } from "./api.js";

const streams = [
    { type: "purchase", direction: "incoming", path: "/purchase/incoming", pendingOnly: true },
    { type: "exchange", direction: "incoming", path: "/exchange-requests/incoming", pendingOnly: true },
    { type: "rent", direction: "incoming", path: "/rent/incoming", pendingOnly: true },
    { type: "purchase", path: "/purchase/history" },
    { type: "exchange", path: "/exchange-requests/history" },
    { type: "rent", path: "/rent/history" },
];

const typeLabels = { purchase: "Purchase", exchange: "Exchange", rent: "Rental" };
const statusLabels = {
    pending: "is waiting for a response",
    accepted: "was accepted",
    rejected: "was rejected",
    cancelled: "was cancelled",
    completed: "was completed",
    returned: "was marked returned",
};

function notificationItem(request, type) {
    return type === "exchange" ? request.requestedItemId : request.itemId;
}

function requestParticipants(request, type) {
    if (type === "purchase") return [request.buyerId, request.sellerId];
    if (type === "exchange") return [request.requesterId, request.ownerId];
    return [request.borrowerId, request.lenderId];
}

function memberId(member) {
    return String(member?._id || member || "");
}

export async function fetchNotifications(userId) {
    if (!userId) return [];

    const results = await Promise.all(streams.map(async (stream) => ({
        ...stream,
        requests: (await apiRequest(stream.path)).data || [],
    })));

    return results.flatMap(({ type, pendingOnly, requests }) =>
        requests.map((request) => {
            const [firstParticipant, secondParticipant] = requestParticipants(request, type);
            const incoming = pendingOnly
                ? true
                : memberId(firstParticipant) !== String(userId);
            const otherParty = incoming ? firstParticipant : secondParticipant;
            const item = notificationItem(request, type);
            const status = request.status;

            return {
                id: `${type}:${request._id}:${status}`,
                type,
                direction: incoming ? "incoming" : "outgoing",
                request,
                item,
                party: otherParty,
                status,
                createdAt: pendingOnly
                    ? request.createdAt
                    : request.updatedAt || request.createdAt,
                message: pendingOnly
                    ? "sent you a request"
                    : statusLabels[status] || `was updated to ${status}`,
            };
        })
    ).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

function readStateKey(userId) {
    return `swivastu.notifications.read.${userId}`;
}

export function getReadNotificationIds(userId) {
    if (!userId) return new Set();
    try {
        const stored = JSON.parse(localStorage.getItem(readStateKey(userId)) || "[]");
        return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : []);
    } catch (error) {
        console.error("Unable to read notification status:", error);
        return new Set();
    }
}

export function getUnreadNotificationCount(userId, notifications) {
    const readIds = getReadNotificationIds(userId);
    return notifications.reduce((count, notification) => count + Number(!readIds.has(notification.id)), 0);
}

export function markNotificationsRead(userId, notifications) {
    if (!userId) return;
    const readIds = getReadNotificationIds(userId);
    notifications.forEach((notification) => readIds.add(notification.id));
    try {
        localStorage.setItem(readStateKey(userId), JSON.stringify([...readIds]));
        window.dispatchEvent(
            new CustomEvent("swivastu-notifications-read", {
                detail: { userId, notifications },
            })
        );
    } catch (error) {
        console.error("Unable to save notification status:", error);
    }
}

export function markNotificationRead(userId, notificationId) {
    if (!userId || !notificationId) return;
    markNotificationsRead(userId, [{ id: notificationId }]);
}

export function notificationTypeLabel(type) {
    return typeLabels[type] || "Request";
}
