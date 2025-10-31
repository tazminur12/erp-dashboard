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

// Utility: Validate MongoDB ObjectId (24-char hex string)
export const isValidMongoId = (id) => typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id);

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
      if (data?.success) {
        // Ensure numeric fields are numbers (backend already sends numbers, but normalize defensively)
        const payload = data.data || {};
        return {
          ...payload,
          totalAmount: Number(payload.totalAmount || 0),
          paidAmount: Number(payload.paidAmount || 0),
          due: Number(payload.due || 0),
          ...(typeof payload.hajjDue === 'number' ? { hajjDue: Math.max(payload.hajjDue, 0) } : {}),
          ...(typeof payload.umrahDue === 'number' ? { umrahDue: Math.max(payload.umrahDue, 0) } : {}),
        };
      }
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
      // Validate required fields like backend
      if (!payload?.name || !String(payload.name).trim()) {
        throw new Error('Name is required');
      }
      if (!payload?.mobile || !String(payload.mobile).trim()) {
        throw new Error('Mobile is required');
      }

      // Validate email format like backend
      if (payload?.email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(String(payload.email).trim())) {
          throw new Error('Invalid email address');
        }
      }

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
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি তৈরি করতে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
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
      // Validate email format like backend
      if (updates?.email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(String(updates.email).trim())) {
          throw new Error('Invalid email address');
        }
      }
      // Validate ObjectId
      if (!isValidMongoId(id)) {
        throw new Error('Invalid or missing Haji ID (must be valid MongoDB _id)');
      }
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
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি আপডেটে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// ✅ CORRECTED useDeleteHaji hook:
export const useDeleteHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // Validate ObjectId before making DELETE request
      if (!isValidMongoId(id)) {
        throw new Error('Invalid or missing Haji ID (must be valid MongoDB _id)');
      }
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
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি মুছতে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
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


