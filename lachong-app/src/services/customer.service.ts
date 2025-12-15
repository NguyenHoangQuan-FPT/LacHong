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
};

export default customerService;