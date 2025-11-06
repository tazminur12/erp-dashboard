import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

// Alias commonly used in codebases
export const api = axiosInstance;

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;