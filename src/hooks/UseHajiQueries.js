import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Local helpers (kept minimal and aligned with backend contract in prompt)
const isValidYmdDate = (value) => {
  if (!value) return true;
  const ymdPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof value !== 'string' || !ymdPattern.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Query keys for Haji domain
export const hajiKeys = {
  all: ['haji'],
  lists: () => ['haji', 'list'],
  list: (filters) => ['haji', 'list', { filters }],
  details: () => ['haji', 'detail'],
  detail: (id) => ['haji', 'detail', id],
};

// List Haji with pagination and filters
export const useHajiList = (params) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: hajiKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/haji', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load haji list');
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Get single Haji by id or customerId
export const useHaji = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: hajiKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/haji/${id}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load haji');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Create Haji
export const useCreateHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Validate dates per backend expectation
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (payload?.[field] && !isValidYmdDate(payload[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.post('/haj-umrah/haji', payload || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create haji');
    },
    onSuccess: (data) => {
      const created = data?.data;
      const createdId = created?._id || created?.id || created?.customerId;
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      if (createdId && created) {
        queryClient.setQueryData(hajiKeys.detail(createdId), created);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'হাজি সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'হাজি তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Update Haji by id or customerId
export const useUpdateHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      // Validate dates per backend expectation
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (updates?.[field] && !isValidYmdDate(updates[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.put(`/haj-umrah/haji/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update haji');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hajiKeys.detail(id) });
      if (data?.data) {
        queryClient.setQueryData(hajiKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'হাজি তথ্য সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'হাজি আপডেটে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Soft delete Haji
export const useDeleteHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/haj-umrah/haji/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete haji');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      queryClient.removeQueries({ queryKey: hajiKeys.detail(id) });
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'হাজি সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'হাজি মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export default {
  hajiKeys,
  useHajiList,
  useHaji,
  useCreateHaji,
  useUpdateHaji,
  useDeleteHaji,
};


