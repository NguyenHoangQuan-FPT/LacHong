import axiosClient from "../api/axiosClient";

export const messageService = {
    getMessages: (roomId: string) => {
        return axiosClient.get(`/chatrooms/${roomId}/messages`);
    },
    sendMessage: (payload: FormData) => {
        return axiosClient.post(`/messages`, payload);
    },
    getRoomByStore: () => {
        return axiosClient.get(`/chatrooms/store`);
    },
    getRoomByCustomer: () => {
        return axiosClient.get(`/chatrooms/customer`);
    },
};

