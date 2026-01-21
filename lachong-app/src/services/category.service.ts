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
    updateCategory: (id: string, name: string, description: string, status: boolean) => {
        return axiosClient.put(`/categories/admin/${id}`, { name, description, status });
    }
};

export default categoryService;