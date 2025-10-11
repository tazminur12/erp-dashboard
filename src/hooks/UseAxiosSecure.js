import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
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
        return Promise.reject(error);
      }
    );

    interceptorsAdded = true; 
  }

  return instance;
};

export default useSecureAxios;