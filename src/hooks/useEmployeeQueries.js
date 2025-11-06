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
    error?.message ||
    'Request failed'
  );
}

export default function useEmployeeQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // ==================== EMPLOYEES ====================
  
  const useEmployees = (params = {}) => {
    const { search = '', status = 'all' } = params;
    return useQuery({
      queryKey: ['employees', { search: search || null, status: status || 'all' }],
      queryFn: async () => {
        const { data } = await axios.get('/api/employees', { params: { search, status } });
        return data?.data || [];
      },
    });
  };

  const useGetEmployee = (id) =>
    useQuery({
      queryKey: ['employees', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/employees/${id}`);
        return data?.data;
      },
      enabled: Boolean(id),
    });

  const useEmployeeStats = () =>
    useQuery({
      queryKey: ['employees', 'stats'],
      queryFn: async () => {
        const { data } = await axios.get('/api/employees/stats');
        return data?.data || {};
      },
    });

  const useCreateEmployee = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/employees', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['employees', 'stats'] });
      },
    });

  const useDeleteEmployee = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/employees/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['employees', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      },
    });

  // ==================== ATTENDANCE ====================

  const useAttendance = (params = {}) => {
    const { limit = 20, employeeId, date } = params;
    return useQuery({
      queryKey: ['attendance', { limit, employeeId: employeeId || null, date: date || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/attendance', { params: { limit, employeeId, date } });
        return data?.data || [];
      },
    });
  };

  const useCreateAttendance = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/attendance', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        queryClient.invalidateQueries({ queryKey: ['employees', 'stats'] });
      },
    });

  return {
    // Employees
    useEmployees,
    useGetEmployee,
    useEmployeeStats,
    useCreateEmployee,
    useDeleteEmployee,
    // Attendance
    useAttendance,
    useCreateAttendance,
  };
}

