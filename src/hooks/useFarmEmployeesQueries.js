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
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details ||
    error?.message ||
    'Request failed'
  );
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
            // Ensure paidAmount and totalDue are included, and id field is properly set
            return {
              employees: (data.data || []).map(emp => ({
                ...emp,
                id: emp.id || emp._id || String(emp._id), // Ensure id field exists
                _id: emp._id || emp.id, // Keep _id for compatibility
                paidAmount: Number(emp.paidAmount || 0),
                totalDue: Number(emp.totalDue || 0)
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
            // Ensure paidAmount and totalDue are included, and id field is properly set
            return {
              ...data.data,
              id: data.data.id || data.data._id || String(data.data._id), // Ensure id field exists
              _id: data.data._id || data.data.id, // Keep _id for compatibility
              paidAmount: Number(data.data.paidAmount || 0),
              totalDue: Number(data.data.totalDue || 0)
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
          const { data } = await axios.post('/api/farmEmployees', payload);
          if (data?.success) {
            return data;
          }
          throw new Error(data?.message || 'Failed to create farm employee');
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (response) => {
        // Invalidate farm employee list queries
        queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
        // If response has employee data, update cache
        if (response?.data?.id || response?.data?._id) {
          const employeeId = response.data.id || response.data._id;
          queryClient.setQueryData(['farmEmployees', employeeId], response.data);
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
        // Update cache if response has updated data
        if (response?.data) {
          queryClient.setQueryData(['farmEmployees', employeeId], response.data);
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
