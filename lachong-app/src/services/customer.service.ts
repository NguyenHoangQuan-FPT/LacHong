import axiosClient from "../api/axiosClient";

const customerService = {
    getProfileCustomer: () => {
        return axiosClient.get("/customer");
    },
    updateProfileCustomer: (data: any) => {
        return axiosClient.put("/customer", data);
    },
};

export default customerService;