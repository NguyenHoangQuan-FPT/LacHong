import axiosClient from "../api/axiosClient";

const paymentService = {
    getPaymentMethods: () => {
        return axiosClient.get("/payment-methods");
    },
    createVNPayPayment: (data: { amount: number; orderInfo?: string; orderType?: string; bankCode?: string }) => {
        return axiosClient.post("/vnpay/create-payment", data);
    }
};

export default paymentService;