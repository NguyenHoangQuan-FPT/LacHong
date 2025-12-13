import axiosClient from "../api/axiosClient";

export const cartService = {
    addToCart: (productId: string, quantity: number) => {
        return axiosClient.post("/cart", { productId, quantity });
    },
    getCart: () => {
        return axiosClient.get("/cart");
    },
    // BE yêu cầu { cartId, quantity } trong body, không dùng :id trên URL
    updateCartItem: (cartId: string, quantity: number) => {
        return axiosClient.put("/cart", { cartId, quantity });
    },
    // BE yêu cầu { cartId } trong body, không dùng :id trên URL
    removeCartItem: (cartId: string) => {
        return axiosClient.delete("/cart", {
            data: { cartId },
        });
    },
    // BE dùng /cart/all để clear
    clearCart: () => {
        return axiosClient.delete("/cart/all");
    }
};