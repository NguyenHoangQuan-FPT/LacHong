import axiosClient from "../api/axiosClient";

const notificationService = {
    sendNotification: (data: any) => {
        return axiosClient.post("/notification/send", data);
    },
    getNotifications: () => {
        return axiosClient.get("/notifications");
    },
    getNotificationIsRead: () => {
        return axiosClient.get("/notifications/isread");
    },
    markAsRead: (id: string) => {
        return axiosClient.patch(`/notification/${id}/`, { isRead: true });
    },
};

export default notificationService;