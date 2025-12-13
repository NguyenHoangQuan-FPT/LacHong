import axiosClient from "../api/axiosClient";

export const addressService = {
    getAddresses: () => {
        return axiosClient.get("/addresses");
    },
    addAddress: (data: any) => {
        return axiosClient.post("/address", data);
    },
    updateAddress: (addressId: string, data: any) => {
        return axiosClient.put(`/address/${addressId}`, data);
    },
    setDefaultAddress: (addressId: string) => {
        return axiosClient.put(`/address/${addressId}/default`);
    },
    deleteAddress: (addressId: string) => {
        return axiosClient.delete(`/address/${addressId}`);
    },
};