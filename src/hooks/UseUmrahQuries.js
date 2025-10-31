import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

const isValidYmdDate = (value) => {
  if (!value) return true;
  const ymdPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof value !== 'string' || !ymdPattern.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const umrahKeys = {
  all: ['umrah'],
  lists: () => ['umrah', 'list'],
  list: (filters) => ['umrah', 'list', { filters }],
  details: () => ['umrah', 'detail'],
  detail: (id) => ['umrah', 'detail', id],
};

export const useUmrahList = (params) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/umrah', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load umrah list');
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useUmrah = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/umrah/${id}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load umrah');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Fetch Umrah by either Mongo _id or customerId using the same endpoint
export const useUmrahByIdOrCustomerId = (identifier) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.detail(identifier),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/umrah/${identifier}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load umrah');
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCreateUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Minimal client-side validation to mirror backend
      if (!payload?.name) throw new Error('Name is required');
      if (!payload?.mobile) throw new Error('Mobile is required');
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (payload?.[field] && !isValidYmdDate(payload[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.post('/haj-umrah/umrah', payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create umrah');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      if (data?.data?._id) {
        const id = data.data._id;
        queryClient.setQueryData(umrahKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'উমরাহ সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export const useUpdateUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (updates?.[field] && !isValidYmdDate(updates[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.put(`/haj-umrah/umrah/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update umrah');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      queryClient.invalidateQueries({ queryKey: umrahKeys.detail(id) });
      if (data?.data) {
        queryClient.setQueryData(umrahKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'উমরাহ তথ্য সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ আপডেটে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export const useDeleteUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/haj-umrah/umrah/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete umrah');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      queryClient.removeQueries({ queryKey: umrahKeys.detail(id) });
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'উমরাহ সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export default {
  umrahKeys,
  useUmrahList,
  useUmrah,
  useCreateUmrah,
  useUpdateUmrah,
  useDeleteUmrah,
};


