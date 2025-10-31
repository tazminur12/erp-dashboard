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
      const response = await axiosSecure.get('/api/haj-umrah/agents', {
        params: { page, limit, search: searchTerm }
      });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load agents');
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
      const response = await axiosSecure.get(`/api/haj-umrah/agents/${id}`);
      const data = response?.data;
      if (data?.success) {
        const agent = data?.data || {};
        // Normalize/ensure fields exist with safe defaults
        return {
          _id: agent._id || agent.id,
          agentId: agent.agentId || agent._id || agent.id,
          tradeName: agent.tradeName || '',
          tradeLocation: agent.tradeLocation || '',
          ownerName: agent.ownerName || '',
          contactNo: agent.contactNo || '',
          email: agent.email || '',
          dob: agent.dob || agent.dateOfBirth || '',
          nid: agent.nid || '',
          passport: agent.passport || '',
          licenseNumber: agent.licenseNumber || '',
          bankAccount: agent.bankAccount || '',
          paymentMethod: agent.paymentMethod || '',
          isActive: agent.isActive !== undefined ? agent.isActive : true,
          totalDue: agent.totalDue ?? 0,
          hajDue: agent.hajDue ?? 0,
          umrahDue: agent.umrahDue ?? 0,
          totalDeposit: agent.totalDeposit ?? 0,
          totalRevenue: agent.totalRevenue ?? 0,
          commissionRate: agent.commissionRate ?? 0,
          pendingPayments: agent.pendingPayments ?? 0,
          lastActivity: agent.lastActivity || null,
          createdAt: agent.createdAt || null,
          updatedAt: agent.updatedAt || null,
          // Preserve any other fields
          ...agent,
        };
      }
      throw new Error(data?.message || 'Failed to load agent');
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
      const response = await axiosSecure.post('/api/haj-umrah/agents', agentData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create agent');
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
      const response = await axiosSecure.put(`/api/haj-umrah/agents/${id}`, agentData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update agent');
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
      const response = await axiosSecure.delete(`/api/haj-umrah/agents/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete agent');
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
      const response = await axiosSecure.post('/api/haj-umrah/agents/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to upload agents');
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
      const response = await axiosSecure.get('/api/haj-umrah/agents/stats');
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load agent statistics');
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
