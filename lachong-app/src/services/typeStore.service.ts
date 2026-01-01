import axiosClient from "../api/axiosClient";

export const typeStoreService = {
    getAllTypeStores: () => {
        return axiosClient.get(`/typeStores`);
    },
    getTypeStoreTrue: () => {
        return axiosClient.get(`/typeStoreTrue`);
    },
    createTypeStore: (typeName: string, description: string) => {
        return axiosClient.post(`/typeStore`, { typeName, description });
    },
    updateTypeStore: (id: string, typeName: string, description: string, status: boolean) => {
        return axiosClient.put(`/typeStore/${id}`, { typeName, description, status });
    }
};