import axiosClient from "../api/axiosClient";

const categoryService = {
    getAllCategories: () => {
        return axiosClient.get('/categories');
    },
    getCategories: () => {
        return axiosClient.get('/categories/admin');
    },
    createCategory: (name: string, description: string) => {
        return axiosClient.post('/categories', { name, description });
    },
    updateStatusCategory: (id: string, status: boolean) => {
        return axiosClient.put(`/categories/${id}`, { status });
    },
};

export default categoryService;