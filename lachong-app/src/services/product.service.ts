import axiosClient from "../api/axiosClient";

export const productService = {
    getAllProducts: () => {
        return axiosClient.get("/products");
    },
    getAllCategory: () => {
        return axiosClient.get("/categories");
    },
    getAllMaterial: () => {
        return axiosClient.get("/materials");
    },
    getProductById: (id: string) => {
        return axiosClient.get(`/products/${id}`);
    },
};