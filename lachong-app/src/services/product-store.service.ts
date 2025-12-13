import axiosClient from "../api/axiosClient";

export const productStoreService = {
    getStoreProducts: () => {
        return axiosClient.get(`/store/products`);
    },

    addProduct: (payload: FormData) => {
        return axiosClient.post(`/store/product`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    getProductById: (id: string) => {
        return axiosClient.get(`/store/product/${id}`);
    },
    updateProduct: (id: string, payload: FormData) => {
        return axiosClient.put(`/store/product/${id}`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteProduct: (id: string) => {
        return axiosClient.delete(`/store/product/${id}`);
    },

    getCategories: () => {
        return axiosClient.get(`/categories`);
    },

    getMaterials: () => {
        return axiosClient.get(`/materials`);
    }
}