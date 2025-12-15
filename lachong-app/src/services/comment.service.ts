import axiosClient from "../api/axiosClient";

export const commentService = {
    getCommentsByPostId: (postId: string) => {
        return axiosClient.get(`/comments/${postId}`);
    },
    addComment: (data: { postId?: string; post?: string; content: string; parentCommentId?: string | null }) => {
        const postId = data.postId || data.post;
        return axiosClient.post("/comment", { postId, content: data.content, parentCommentId: data.parentCommentId ?? null });
    },
    updateComment: (commentId: string, data: { content?: string }) => {
        return axiosClient.put(`/comment/${commentId}`, data);
    },
    deleteComment: (commentId: string) => {
        return axiosClient.delete(`/comment/${commentId}`);
    },
}