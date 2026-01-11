import { act } from "react";
import axiosClient from "../api/axiosClient";

export const authService = {
    login: (email: string, password: string) => {
        return axiosClient.post("login", { email, password });
    },
    register: (email: string, password: string) => {
        return axiosClient.post("register", { email, password });
    },
    registerStore: (email: string, password: string, storeName: string, emailStore: string) => {
        return axiosClient.post("/register-store", { email, password, storeName, emailStore });
    },
    activateAccount: (token: string) => {
        return axiosClient.post("/activate-account", { token });
    },
    logout: async () => {
        try {
            await axiosClient.post('/logout');
        } catch (e) {
            console.error('Logout api error', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('store');

            try {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('app:logout'));
                }
            } catch {
                // ignore
            }
        }
    }
};