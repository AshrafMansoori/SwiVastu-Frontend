export const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
        ? "/api/v1"
        : "https://swi-back.onrender.com/api/v1");

export async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers);
    let body = options.body;

    if (
        body &&
        typeof body === "object" &&
        !(typeof FormData !== "undefined" && body instanceof FormData)
    ) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        body,
        headers,
        credentials: "include",
    });

    let result = {};

    try {
        result = await response.json();
    } catch {
        if (response.ok) {
            throw new Error("The server returned an invalid response.");
        }
    }

    if (!response.ok) {
        throw new Error(result?.message || "Request failed. Please try again.");
    }

    return result;
}
