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
    logout: async () => {
        try {
            await axiosClient.post('/logout');
        } catch (e) {
            console.error('Logout api error', e);
        } finally {
            // axiosClient reads token from `access_token`
            localStorage.removeItem('access_token');
            // backward-compat / older key
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