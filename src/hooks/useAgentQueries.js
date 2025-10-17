import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for consistent caching
export const agentKeys = {
  all: ['agents'],
  lists: () => [...agentKeys.all, 'list'],
  list: (filters) => [...agentKeys.lists(), { filters }],
  details: () => [...agentKeys.all, 'detail'],
  detail: (id) => [...agentKeys.details(), id],
};

// Custom hook for fetching agents list with pagination and search
export const useAgents = (page = 1, limit = 10, searchTerm = '') => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: agentKeys.list({ page, limit, searchTerm }),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/agents', {
        params: { page, limit, search: searchTerm }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for fetching single agent details
export const useAgent = (id) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosSecure.get(`/haj-umrah/agents/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for creating a new agent
export const useCreateAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData) => {
      const response = await axiosSecure.post('/haj-umrah/agents', agentData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent created successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for updating an agent
export const useUpdateAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...agentData }) => {
      const response = await axiosSecure.put(`/haj-umrah/agents/${id}`, agentData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch agents list and specific agent detail
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.id) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent updated successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for deleting an agent
export const useDeleteAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/haj-umrah/agents/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent deleted successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for bulk operations (like Excel upload)
export const useBulkAgentOperation = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await axiosSecure.post('/haj-umrah/agents/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message with details
      Swal.fire({
        icon: 'success',
        title: 'Bulk Upload Successful!',
        text: data?.message || 'Agents uploaded successfully',
        timer: 5000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to upload agents';
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: message,
      });
    },
  });
};

// Custom hook for agent statistics
export const useAgentStats = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [...agentKeys.all, 'stats'],
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/agents/stats');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
