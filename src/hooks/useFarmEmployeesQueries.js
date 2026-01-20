import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import useAxios from './Axios';

function getAxios() {
  try {
    return useSecureAxios();
  } catch (e) {
    return useAxios();
  }
}

function extractErrorMessage(error) {
  // Try to extract detailed error message from backend response
  const responseData = error?.response?.data;
  
  if (responseData) {
    // Backend returns: { success: false, error: "...", message: "...", details: "..." }
    return (
      responseData.details ||  // Most detailed error
      responseData.message ||   // User-friendly message
      responseData.error ||     // Error type
      error?.message ||
      'Request failed'
    );
  }
  
  return error?.message || 'Request failed';
}

export default function useFarmEmployeesQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // ==================== FARM EMPLOYEES ====================
  
  const useFarmEmployees = (params = {}) => {
    const { 
      page = 1, 
      limit = 1000, 
      search = '', 
      status = 'all',
      position = ''
    } = params;
    
    return useQuery({
      queryKey: ['farmEmployees', { page, limit, search: search || null, status: status || 'all', position: position || null }],
      queryFn: async () => {
        try {
          const { data } = await axios.get('/api/farmEmployees', { 
            params: { page, limit, search, status, position } 
          });
          
          if (data?.success) {
            // Ensure paidAmount, totalDue, and image are included, and id field is properly set
            return {
              employees: (data.data || []).map(emp => ({
                ...emp,
                id: emp.id || emp._id || String(emp._id), // Ensure id field exists
                _id: emp._id || emp.id, // Keep _id for compatibility
                paidAmount: Number(emp.paidAmount || 0),
                totalDue: Number(emp.totalDue || 0),
                image: emp.image || '' // Ensure image field exists (default empty string)
              })),
              pagination: data.pagination || {
                currentPage: page,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: limit
              }
            };
          }
          return { employees: [], pagination: { currentPage: page, totalPages: 0, totalItems: 0, itemsPerPage: limit } };
        } catch (err) {
          console.error('Error fetching farm employees:', err);
          return { employees: [], pagination: { currentPage: page, totalPages: 0, totalItems: 0, itemsPerPage: limit } };
        }
      },
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    });
  };

  const useGetFarmEmployee = (id) =>
    useQuery({
      queryKey: ['farmEmployees', id],
      queryFn: async () => {
        try {
          const { data } = await axios.get(`/api/farmEmployees/${id}`);
          if (data?.success && data.data) {
            // Ensure paidAmount, totalDue, and image are included, and id field is properly set
            return {
              ...data.data,
              id: data.data.id || data.data._id || String(data.data._id), // Ensure id field exists
              _id: data.data._id || data.data.id, // Keep _id for compatibility
              paidAmount: Number(data.data.paidAmount || 0),
              totalDue: Number(data.data.totalDue || 0),
              image: data.data.image || '' // Ensure image field exists (default empty string)
            };
          }
          return null;
        } catch (err) {
          console.error('Error fetching farm employee:', err);
          throw new Error(extractErrorMessage(err));
        }
      },
      enabled: Boolean(id),
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    });

  const useFarmEmployeeStats = () =>
    useQuery({
      queryKey: ['farmEmployees', 'stats'],
      queryFn: async () => {
        try {
          const { data } = await axios.get('/api/farmEmployees/stats/overview');
          if (data?.success) {
            return data.data || {};
          }
          return {};
        } catch (err) {
          // Handle 404 gracefully - endpoint might not exist
          if (err?.response?.status === 404) {
            console.log('Farm employee stats endpoint not found (404), returning empty stats');
            return {};
          }
          console.error('Error fetching farm employee stats:', err);
          return {};
        }
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: false,
    });

  const useCreateFarmEmployee = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          // Log payload for debugging
          console.log('Creating farm employee with payload:', JSON.stringify(payload, null, 2));
          
          const { data } = await axios.post('/api/farmEmployees', payload);
          
          if (data?.success) {
            console.log('Employee created successfully:', data);
            return data;
          }
          
          // Log error response for debugging
          console.error('Create employee failed - response data:', data);
          const errorMsg = data?.details || data?.message || data?.error || 'Failed to create farm employee';
          throw new Error(errorMsg);
        } catch (err) {
          // Log full error for debugging
          const errorDetails = {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            statusText: err.response?.statusText,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              data: err.config?.data
            }
          };
          console.error('Create employee error details:', errorDetails);
          
          // Extract detailed error message
          const responseData = err.response?.data;
          let errorMessage = 'Failed to create farm employee';
          
          if (responseData) {
            // Backend returns: { success: false, error: "...", message: "...", details: "..." }
            errorMessage = responseData.details || 
                          responseData.message || 
                          responseData.error || 
                          errorMessage;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          throw new Error(errorMessage);
        }
      },
      onSuccess: (response) => {
        // Invalidate farm employee list queries
        queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
        // If response has employee data, update cache with normalized data
        if (response?.data?.id || response?.data?._id) {
          const employeeId = response.data.id || response.data._id;
          const normalizedData = {
            ...response.data,
            id: response.data.id || response.data._id || String(response.data._id),
            _id: response.data._id || response.data.id,
            paidAmount: Number(response.data.paidAmount || 0),
            totalDue: Number(response.data.totalDue || 0),
            image: response.data.image || '' // Ensure image field exists
          };
          queryClient.setQueryData(['farmEmployees', employeeId], normalizedData);
        }
      },
    });

  const useUpdateFarmEmployee = () =>
    useMutation({
      mutationFn: async ({ id, ...payload }) => {
        try {
          const { data } = await axios.put(`/api/farmEmployees/${id}`, payload);
          if (data?.success) {
            return data;
          }
          throw new Error(data?.message || 'Failed to update farm employee');
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (response, variables) => {
        const employeeId = variables.id;
        // Invalidate farm employee list and detail queries
        queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', employeeId] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
        // Update cache if response has updated data with normalized fields
        if (response?.data) {
          const normalizedData = {
            ...response.data,
            id: response.data.id || response.data._id || String(response.data._id),
            _id: response.data._id || response.data.id,
            paidAmount: Number(response.data.paidAmount || 0),
            totalDue: Number(response.data.totalDue || 0),
            image: response.data.image || '' // Ensure image field exists
          };
          queryClient.setQueryData(['farmEmployees', employeeId], normalizedData);
        }
      },
    });

  const useDeleteFarmEmployee = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/farmEmployees/${id}`);
          if (data?.success) {
            return data;
          }
          throw new Error(data?.message || 'Failed to delete farm employee');
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (response, employeeId) => {
        // Remove employee from cache
        queryClient.removeQueries({ queryKey: ['farmEmployees', employeeId] });
        // Invalidate farm employee list and stats
        queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
        // Invalidate attendance records
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      },
    });

  return {
    // Farm Employees
    useFarmEmployees,
    useGetFarmEmployee,
    useFarmEmployeeStats,
    useCreateFarmEmployee,
    useUpdateFarmEmployee,
    useDeleteFarmEmployee,
  };
}
