import axiosClient from "../api/axiosClient";

export const reviewService = {
    getReviewsByProductId: (productId: string) => {
        return axiosClient.get(`/reviews/${productId}`);
    },
    addReview: (payload: FormData) => {
        return axiosClient.post("/review", payload);
    },
    updateReview: (reviewId: string, payload: FormData) => {
        return axiosClient.put(`/review/${reviewId}`, payload);
    },
    deleteReview: (reviewId: string) => {
        return axiosClient.delete(`/review/${reviewId}`);
    },
}