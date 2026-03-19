import axiosClient from "../api/axiosClient";

type PostUpsert = {
    title: string;
    content: string;
    images?: Array<File | string>;
};

type PostUpdate = {
    title?: string;
    content?: string;
    images?: Array<File | string>;
};

function splitImages(images?: Array<File | string>) {
    const keepImages: string[] = [];
    const files: File[] = [];

    for (const item of images || []) {
        if (item instanceof File) {
            files.push(item);
        } else if (typeof item === 'string' && item.trim()) {
            keepImages.push(item);
        }
    }

    return { keepImages, files };
}

export const postService = {
    getAllPosts: () => {
        return axiosClient.get("/posts");
    },
    createPost: (data: PostUpsert) => {
        const payload = new FormData();
        payload.append("title", data.title);
        payload.append("content", data.content);
        const { keepImages, files } = splitImages(data.images);
        // For create, keepImages is typically empty, but we support it for back-compat clients.
        if (keepImages.length) payload.append('keepImages', JSON.stringify(keepImages));
        files.forEach((file) => payload.append("images", file));
        return axiosClient.post("/post", payload);
    },
    updatePost: (postId: string, data: PostUpdate) => {
        const payload = new FormData();
        if (data.title !== undefined) payload.append("title", data.title);
        if (data.content !== undefined) payload.append("content", data.content);
        const { keepImages, files } = splitImages(data.images);
        if (keepImages.length) payload.append('keepImages', JSON.stringify(keepImages));
        files.forEach((file) => payload.append("images", file));
        return axiosClient.put(`/post/${postId}`, payload);
    },
    deletePost: (postId: string) => {
        return axiosClient.delete(`/post/${postId}`);
    },
}

// Back-compat (old typo export)
export const ppstService = postService;