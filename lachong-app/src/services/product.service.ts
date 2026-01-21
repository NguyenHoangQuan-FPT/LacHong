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
    getRelatedProducts: (categoryId: string, productId: string) => {
        return axiosClient.get(`/products/related/${categoryId}/${productId}`);
    },
    getDiscountedProducts: () => {
        return axiosClient.get("/products/discounted");
    },
    getBestSellingProducts: () => {
        return axiosClient.get("/products/best-selling");
    },
    getNewProducts: () => {
        return axiosClient.get("/products/new");
    },
};