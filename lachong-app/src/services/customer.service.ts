import axiosClient from "../api/axiosClient";

const customerService = {
    getProfileCustomer: () => {
        return axiosClient.get("/customer");
    },
    updateProfileCustomer: (payload: FormData) => {
        return axiosClient.put("/customer", payload, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    getAllCustomers: () => {
        return axiosClient.get("/customers");
    },
    getCustomerById: (id: string) => {
        return axiosClient.get(`/customer/${id}`);
    },
    updateStatusCustomer: (id: string, status: boolean) => {
        return axiosClient.put(`/customer/${id}`, { status });
    },
};

export default customerService;