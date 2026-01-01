import axiosClient from "../api/axiosClient";

export const storeService = {
    getStoreInfo: () => {
        return axiosClient.get(`/profileStore`);
    },
    getProductsByStore: () => {
        return axiosClient.get(`/store/products`);
    },
    updateProfile: (payload: FormData) => {
        return axiosClient.put(`/profileStore`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    getStoreById: (id: string) => {
        return axiosClient.get(`/store/${id}`);
    },
    getProductsByStoreId: (id: string) => {
        return axiosClient.get(`/store/${id}/products`);
    },
    getAllStores: () => {
        return axiosClient.get(`/stores`);
    },
    updateStatusStore: (id: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE') => {
        return axiosClient.put(`/store/${id}`, { status });
    },
    getAllOrdersByStore: () => {
        return axiosClient.get(`/store/orders`);
    },
    getOrderById: (orderId: string) => {
        return axiosClient.get(`/store/order/${orderId}`);
    },
    updateStatusOrder: (orderId: string, status: String) => {
        return axiosClient.put(`/store/order/${orderId}`, { status });
    },
    getStoreNotifications: () => {
        return axiosClient.get(`/notifications`);
    },

};