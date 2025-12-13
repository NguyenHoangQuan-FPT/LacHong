import axiosClient from "../api/axiosClient";

const paymentService = {
    getPaymentMethods: () => {
        return axiosClient.get("/payment-methods");
    }
};

export default paymentService;