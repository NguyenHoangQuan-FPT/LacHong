import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_APP_URL_LOCAL || import.meta.env.VITE_APP_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

