import { io } from "socket.io-client";

const resolveSocketUrl = () => {
    const raw =
        (import.meta.env.VITE_APP_SOCKET as string | undefined) ||
        (import.meta.env.VITE_APP_URL_LOCAL as string | undefined);

    if (!raw) return "http://localhost:3000";
    try {
        // If VITE_API_BASE_URL is like https://xxx.onrender.com/api/v1 -> use origin only.
        return new URL(raw).origin;
    } catch {
        return raw;
    }
};

export const socket = io(resolveSocketUrl(), {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    withCredentials: true,
});

