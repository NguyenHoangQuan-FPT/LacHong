import axiosClient from "../api/axiosClient";

export const followService = {
    followStore: (storeId: string) => {
        return axiosClient.post("/follow/store", { storeId });
    },
    unfollowStore: (storeId: string) => {
        return axiosClient.post("/unfollow/store", { storeId });
    },
    getFollowingByStore: (storeId: string) => {
        return axiosClient.get(`/follows/${storeId}`);
    },
    getFollowingStores: () => {
        return axiosClient.get(`/follows`);
    }
};