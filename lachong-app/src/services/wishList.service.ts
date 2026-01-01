import axiosClient from "../api/axiosClient";

export const wishListService = {
    getWishList: () => {
        return axiosClient.get(`/wishlist`);
    },

    addToWishList: (productId: string) => {
        return axiosClient.post(`/wishlist`, { productId });
    },

    removeFromWishList: (productId: string) => {
        return axiosClient.delete(`/wishlist/${productId}`);
    },
    clearWishList: () => {
        return axiosClient.delete(`/wishlist`);
    },
};

