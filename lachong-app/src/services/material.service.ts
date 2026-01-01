import axiosClient from "../api/axiosClient";

const materialService = {
    getAllMaterials: () => {
        return axiosClient.get('/materials');
    },
    getMaterials: () => {
        return axiosClient.get('/materials/admin');
    },
    createMaterial: (name: string, description: string) => {
        return axiosClient.post('/materials', { name, description });
    },
    updateStatusMaterial: (id: string, status: boolean) => {
        return axiosClient.put(`/materials/${id}`, { status });
    },
};

export default materialService;