import axiosClient from "../api/axiosClient";

const paymentService = {
    getPaymentMethods: () => {
        return axiosClient.get("/payment-methods");
    },
    createVNPayPayment: (data: { amount: number; orderInfo?: string; orderType?: string; bankCode?: string }) => {
        return axiosClient.post("/vnpay/create-payment", data);
    },
    createStripeCheckoutSession: (data: { cartIds: string[]; addressId: string; paymentMethod: string }) => {
        return axiosClient.post('/stripe/create-checkout-session', data);
    }
};

export default paymentService;