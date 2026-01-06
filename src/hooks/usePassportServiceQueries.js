import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const passportServiceKeys = {
  all: ['passportServices'],
  lists: () => [...passportServiceKeys.all, 'list'],
  list: (filters) => [...passportServiceKeys.lists(), { filters }],
  details: () => [...passportServiceKeys.all, 'detail'],
  detail: (id) => [...passportServiceKeys.details(), id],
};

// Hook to fetch all passport services with pagination and filters
export const usePassportServices = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: passportServiceKeys.list(filters),
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
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await axiosSecure.get(`/api/passport-services?${params.toString()}`);
      
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
        throw new Error(response.data.message || 'Failed to fetch passport services');
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

// Hook to fetch a single passport service by ID
export const usePassportService = (serviceId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: passportServiceKeys.detail(serviceId),
    queryFn: async () => {
      if (!serviceId) return null;
      
      const response = await axiosSecure.get(`/api/passport-services/${serviceId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch passport service');
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

// Mutation to create a new passport service
export const useCreatePassportService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceData) => {
      const response = await axiosSecure.post('/api/passport-services', serviceData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create passport service');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch passport services list
      queryClient.invalidateQueries({ queryKey: passportServiceKeys.lists() });
      
      // Add the new service to the cache if needed
      if (data.data && data.data._id) {
        queryClient.setQueryData(
          passportServiceKeys.detail(data.data._id),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'পাসপোর্ট সার্ভিস সফলভাবে যোগ করা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'পাসপোর্ট সার্ভিস যোগ করতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

// Mutation to update a passport service
export const useUpdatePassportService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceId, updateData }) => {
      const response = await axiosSecure.put(`/api/passport-services/${serviceId}`, updateData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update passport service');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch passport services list
      queryClient.invalidateQueries({ queryKey: passportServiceKeys.lists() });
      
      // Update the specific service in cache
      if (data.data) {
        queryClient.setQueryData(
          passportServiceKeys.detail(variables.serviceId),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'পাসপোর্ট সার্ভিস সফলভাবে আপডেট করা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'পাসপোর্ট সার্ভিস আপডেট করতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

// Mutation to delete a passport service (soft delete)
export const useDeletePassportService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceId) => {
      const response = await axiosSecure.delete(`/api/passport-services/${serviceId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete passport service');
      }
    },
    onSuccess: (data, serviceId) => {
      // Invalidate and refetch passport services list
      queryClient.invalidateQueries({ queryKey: passportServiceKeys.lists() });
      
      // Remove the service from cache
      queryClient.removeQueries({ queryKey: passportServiceKeys.detail(serviceId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'পাসপোর্ট সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'পাসপোর্ট সার্ভিস মুছতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে'
      });
    },
  });
};

