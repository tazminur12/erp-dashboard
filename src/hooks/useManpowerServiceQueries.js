import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const manpowerServiceKeys = {
  all: ['manpowerServices'],
  lists: () => [...manpowerServiceKeys.all, 'list'],
  list: (filters) => [...manpowerServiceKeys.lists(), { filters }],
  details: () => [...manpowerServiceKeys.all, 'detail'],
  detail: (id) => [...manpowerServiceKeys.details(), id],
};

// Hook to fetch all manpower services with pagination and filters
export const useManpowerServices = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: manpowerServiceKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Pagination
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      // Search
      if (filters.q) params.append('q', filters.q);
      
      // Filters
      if (filters.status) params.append('status', filters.status);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.appliedDateFrom) params.append('appliedDateFrom', filters.appliedDateFrom);
      if (filters.appliedDateTo) params.append('appliedDateTo', filters.appliedDateTo);
      
      const response = await axiosSecure.get(`/api/manpower-services?${params.toString()}`);
      
      if (response.data.success) {
        return {
          services: response.data.data || [],
          pagination: response.data.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 50,
            total: 0,
            pages: 1
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch manpower services');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for server errors (5xx)
      return failureCount < 3;
    },
  });
};

// Hook to fetch a single manpower service by ID
export const useManpowerService = (serviceId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: manpowerServiceKeys.detail(serviceId),
    queryFn: async () => {
      if (!serviceId) return null;
      
      const response = await axiosSecure.get(`/api/manpower-services/${serviceId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch manpower service');
      }
    },
    enabled: !!serviceId,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Mutation to create a new manpower service
export const useCreateManpowerService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceData) => {
      const response = await axiosSecure.post('/api/manpower-services', serviceData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create manpower service');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch manpower services list
      queryClient.invalidateQueries({ queryKey: manpowerServiceKeys.lists() });
      
      // Add the new service to the cache if needed
      if (data.data && data.data._id) {
        queryClient.setQueryData(
          manpowerServiceKeys.detail(data.data._id),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ম্যানপাওয়ার সার্ভিস সফলভাবে যোগ করা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ম্যানপাওয়ার সার্ভিস যোগ করতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

// Mutation to update a manpower service
export const useUpdateManpowerService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceId, updateData }) => {
      const response = await axiosSecure.put(`/api/manpower-services/${serviceId}`, updateData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update manpower service');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch manpower services list
      queryClient.invalidateQueries({ queryKey: manpowerServiceKeys.lists() });
      
      // Update the specific service in cache
      if (data.data) {
        queryClient.setQueryData(
          manpowerServiceKeys.detail(variables.serviceId),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ম্যানপাওয়ার সার্ভিস সফলভাবে আপডেট করা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ম্যানপাওয়ার সার্ভিস আপডেট করতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

// Mutation to delete a manpower service (soft delete)
export const useDeleteManpowerService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceId) => {
      const response = await axiosSecure.delete(`/api/manpower-services/${serviceId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete manpower service');
      }
    },
    onSuccess: (data, serviceId) => {
      // Invalidate and refetch manpower services list
      queryClient.invalidateQueries({ queryKey: manpowerServiceKeys.lists() });
      
      // Remove the service from cache
      queryClient.removeQueries({ queryKey: manpowerServiceKeys.detail(serviceId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ম্যানপাওয়ার সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ম্যানপাওয়ার সার্ভিস মুছতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

