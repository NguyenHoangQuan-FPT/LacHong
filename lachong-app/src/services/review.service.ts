import axiosClient from "../api/axiosClient";

export const reviewService = {
    getReviewsByProductId: (productId: string) => {
        return axiosClient.get(`/reviews/${productId}`);
    },
    addReview: (data: { product: string; rating: number; comment: string }) => {
        return axiosClient.post("/review", data);
    },
    updateReview: (reviewId: string, data: { rating?: number; comment?: string }) => {
        return axiosClient.put(`/review/${reviewId}`, data);
    },
    deleteReview: (reviewId: string) => {
        return axiosClient.delete(`/review/${reviewId}`);
    },
}