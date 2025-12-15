import axiosClient from "../api/axiosClient";

export const likeService = {
    getLikesByPostId: (postId: string) => {
        return axiosClient.get(`/likes/${postId}`);
    },
    likePost: (postId: string) => {
        return axiosClient.post(`/like/${postId}`);
    },
    unLike: (postId: string) => {
        return axiosClient.delete(`/like/${postId}`);
    },
}