import axios from "axios";

const instance = axios.create({
  // Prefer VITE_API_BASE_URL for consistency, fall back to VITE_API_URL, then default
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "https://erp-auth-backend.vercel.app",
});


let interceptorsAdded = false;

const useSecureAxios = () => {
  if (!interceptorsAdded) {
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("erp_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`; 
        }
        

        
        return config;
      },
      (error) => Promise.reject(error)
    );


    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle network errors
        if (!error.response) {
          console.error('Network Error:', error.message);
          // You can show a toast notification here
        }
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          localStorage.removeItem('erp_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );

    interceptorsAdded = true; 
  }

  return instance;
};

export default useSecureAxios;