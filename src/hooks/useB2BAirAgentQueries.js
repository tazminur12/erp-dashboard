import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const airAgentKeys = {
  all: ['air-agents'],
  lists: () => [...airAgentKeys.all, 'list'],
  list: (filters) => [...airAgentKeys.lists(), { filters }],
  details: () => [...airAgentKeys.all, 'detail'],
  detail: (id) => [...airAgentKeys.details(), id],
};

// Helper function to extract error message
const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
};

// Hook to fetch all Air Ticketing Agents with filters and pagination
export const useAirAgents = (params = {}) => {
  const axiosSecure = useAxiosSecure();
  const { page = 1, limit = 20, q, country } = params;

  return useQuery({
    queryKey: airAgentKeys.list({ page, limit, q, country }),
    queryFn: async () => {
      const response = await axiosSecure.get('/api/air-ticketing/agents', {
        params: {
          page,
          limit,
          q,
          country,
        },
      });

      if (response.data.success) {
        return {
          data: response.data.data || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        };
      } else {
        throw new Error(response.data.message || 'Failed to load air ticketing agents');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single Air Ticketing Agent by ID
export const useAirAgent = (agentId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: airAgentKeys.detail(agentId),
    queryFn: async () => {
      const response = await axiosSecure.get(`/api/air-ticketing/agents/${agentId}`);

      if (response.data.success) {
        return response.data.agent;
      } else {
        throw new Error(response.data.message || 'Failed to load air ticketing agent');
      }
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to create a new Air Ticketing Agent
export const useCreateAirAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData) => {
      try {
        const response = await axiosSecure.post('/api/air-ticketing/agents', agentData);

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to create air ticketing agent');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch agent list
      queryClient.invalidateQueries({ queryKey: airAgentKeys.lists() });

      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'এয়ার টিকিট এজেন্ট সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট এজেন্ট তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to update an Air Ticketing Agent
export const useUpdateAirAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, agentData }) => {
      try {
        const response = await axiosSecure.put(
          `/api/air-ticketing/agents/${agentId}`,
          agentData
        );

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to update air ticketing agent');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch agent list
      queryClient.invalidateQueries({ queryKey: airAgentKeys.lists() });

      // Invalidate specific agent details
      queryClient.invalidateQueries({ queryKey: airAgentKeys.detail(variables.agentId) });

      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'এয়ার টিকিট এজেন্ট সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট এজেন্ট আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to delete an Air Ticketing Agent (soft delete)
export const useDeleteAirAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId) => {
      try {
        const response = await axiosSecure.delete(`/api/air-ticketing/agents/${agentId}`);

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to delete air ticketing agent');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, agentId) => {
      // Invalidate and refetch agent list
      queryClient.invalidateQueries({ queryKey: airAgentKeys.lists() });

      // Remove the specific agent from cache
      queryClient.removeQueries({ queryKey: airAgentKeys.detail(agentId) });

      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: data.message || 'এয়ার টিকিট এজেন্ট সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট এজেন্ট মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

