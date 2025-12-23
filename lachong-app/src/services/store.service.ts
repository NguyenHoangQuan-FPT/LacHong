import axiosClient from "../api/axiosClient";

export const storeService = {
    getStoreInfo: () => {
        return axiosClient.get(`/profileStore`);
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
    updateStatusStore: (id: string, status: boolean) => {
        return axiosClient.put(`/store/${id}`, { status });
    }
}