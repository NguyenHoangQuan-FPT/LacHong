import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

axiosClient.interceptors.request.use((config => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    const headers: any = config.headers;
    if (isFormData) {
        if (headers && typeof headers.delete === "function") {
            headers.delete("Content-Type");
            headers.delete("content-type");
        } else if (headers) {
            delete headers["Content-Type"];
            delete headers["content-type"];
        }
    } else {
        if (headers && typeof headers.set === "function") {
            if (!headers.get("Content-Type")) headers.set("Content-Type", "application/json");
        } else {
            config.headers = { ...(headers || {}), "Content-Type": (headers || {})["Content-Type"] || "application/json" };
        }
    }
    return config;
}));

export default axiosClient;