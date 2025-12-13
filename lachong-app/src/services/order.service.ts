import axiosClient from "../api/axiosClient";

const orderService = {
    createOrder: (data: any) => {
        return axiosClient.post("/orders", data);
    },
    getOrders: () => {
        return axiosClient.get("/orders");
    },
};

export default orderService;