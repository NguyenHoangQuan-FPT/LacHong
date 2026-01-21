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
    updateMaterial: (id: string, name: string, description: string, status: boolean) => {
        return axiosClient.put(`/materials/admin/${id}`, { name, description, status });
    }
};

export default materialService;