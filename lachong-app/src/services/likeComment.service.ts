import axiosClient from "../api/axiosClient";

const likeCommentService = {
    likeComment: (commentId: string) => {
        return axiosClient.post(`/likeComment/${commentId}`);
    },
    unlikeComment: (commentId: string) => {
        return axiosClient.delete(`/likeComment/${commentId}`);
    },
    getLikeCommentsByCommentId: (commentId: string) => {
        return axiosClient.get(`/likeComments/${commentId}`);
    },
    // Back-compat alias
    getLikedComments: (commentId: string) => {
        return axiosClient.get(`/likeComments/${commentId}`);
    },
};

export default likeCommentService;