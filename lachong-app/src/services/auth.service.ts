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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('store');
        }
    }
};