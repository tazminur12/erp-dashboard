import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
}

// Query keys for Other Services
export const otherServiceKeys = {
  all: ['otherServices'],
  lists: () => [...otherServiceKeys.all, 'list'],
  list: (filters) => [...otherServiceKeys.lists(), { filters }],
  details: () => [...otherServiceKeys.all, 'detail'],
  detail: (id) => [...otherServiceKeys.details(), id],
};

// Get all other services with pagination and filters
export const useOtherServices = (options = {}) => {
  const axios = useAxiosSecure();
  const {
    page = 1,
    limit = 50,
    q = '',
    status = '',
    serviceType = ''
  } = options;

  return useQuery({
    queryKey: otherServiceKeys.list({ page, limit, q, status, serviceType }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (q) params.append('q', q);
      if (status) params.append('status', status);
      if (serviceType) params.append('serviceType', serviceType);

      const { data } = await axios.get(`/api/other-services?${params.toString()}`);

      return {
        services: data?.services || data?.data || [],
        pagination: data?.pagination || {
          page: page,
          pages: 1,
          total: 0,
          limit: limit
        }
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Get single other service by ID
export const useOtherService = (id) => {
  const axios = useAxiosSecure();

  return useQuery({
    queryKey: otherServiceKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/api/other-services/${id}`);
      return data?.data || data?.service || data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Create new other service
export const useCreateOtherService = () => {
  const axios = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      const { data } = await axios.post('/api/other-services', serviceData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: otherServiceKeys.all });
      Swal.fire({
        title: 'সফল!',
        text: 'অন্যান্য সার্ভিস সফলভাবে তৈরি হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Update other service
export const useUpdateOtherService = () => {
  const axios = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...serviceData }) => {
      const { data } = await axios.put(`/api/other-services/${id}`, serviceData);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: otherServiceKeys.all });
      queryClient.invalidateQueries({ queryKey: otherServiceKeys.detail(variables.id) });
      Swal.fire({
        title: 'সফল!',
        text: 'অন্যান্য সার্ভিস সফলভাবে আপডেট হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Delete other service
export const useDeleteOtherService = () => {
  const axios = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`/api/other-services/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otherServiceKeys.all });
      Swal.fire({
        title: 'সফল!',
        text: 'অন্যান্য সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};
