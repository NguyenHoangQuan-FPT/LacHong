import axiosClient from "../api/axiosClient";

type PostUpsert = {
    title: string;
    content: string;
    image?: File | null;
};

type PostUpdate = {
    title?: string;
    content?: string;
    image?: File | null;
};

export const postService = {
    getAllPosts: () => {
        return axiosClient.get("/posts");
    },
    createPost: (data: PostUpsert) => {
        const payload = new FormData();
        payload.append("title", data.title);
        payload.append("content", data.content);
        if (data.image) payload.append("image", data.image);
        return axiosClient.post("/post", payload);
    },
    updatePost: (postId: string, data: PostUpdate) => {
        const payload = new FormData();
        if (data.title !== undefined) payload.append("title", data.title);
        if (data.content !== undefined) payload.append("content", data.content);
        if (data.image) payload.append("image", data.image);
        return axiosClient.put(`/post/${postId}`, payload);
    },
    deletePost: (postId: string) => {
        return axiosClient.delete(`/post/${postId}`);
    },
}

// Back-compat (old typo export)
export const ppstService = postService;