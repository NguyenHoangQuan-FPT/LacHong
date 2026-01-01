import axiosClient from "../api/axiosClient";

type PostUpsert = {
    title: string;
    content: string;
    images?: File[];
};

type PostUpdate = {
    title?: string;
    content?: string;
    images?: File[];
};

export const postService = {
    getAllPosts: () => {
        return axiosClient.get("/posts");
    },
    createPost: (data: PostUpsert) => {
        const payload = new FormData();
        payload.append("title", data.title);
        payload.append("content", data.content);
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach((file, idx) => {
                payload.append("images", file);
            });
        }
        return axiosClient.post("/post", payload);
    },
    updatePost: (postId: string, data: PostUpdate) => {
        const payload = new FormData();
        if (data.title !== undefined) payload.append("title", data.title);
        if (data.content !== undefined) payload.append("content", data.content);
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach((file, idx) => {
                payload.append("images", file);
            });
        }
        return axiosClient.put(`/post/${postId}`, payload);
    },
    deletePost: (postId: string) => {
        return axiosClient.delete(`/post/${postId}`);
    },
}

// Back-compat (old typo export)
export const ppstService = postService;