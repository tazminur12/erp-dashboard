import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const dilarKeys = {
  all: ['dilars'],
  lists: () => [...dilarKeys.all, 'list'],
  list: (filters) => [...dilarKeys.lists(), { filters }],
  details: () => [...dilarKeys.all, 'detail'],
  detail: (id) => [...dilarKeys.details(), id],
};

// Hook to fetch all dilars
export const useDilars = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: dilarKeys.list(filters),
    queryFn: async () => {
      const response = await axiosSecure.get('/dilars');
      
      // Extract dilars array from response
      const dilarsData = response.data?.dilars || response.data || [];
      
      // Transform dilar data to match frontend expectations
      const transformedDilars = dilarsData.map(dilar => ({
        _id: dilar._id || dilar.id,
        dilarId: dilar.dilarId || dilar.id || dilar._id,
        tradeName: dilar.tradeName || '',
        tradeLocation: dilar.tradeLocation || '',
        ownerName: dilar.ownerName || '',
        contactNo: dilar.contactNo || '',
        dob: dilar.dob || '',
        nid: dilar.nid || '',
        passport: dilar.passport || '',
        logo: dilar.logo || '',
        createdAt: dilar.createdAt || new Date().toISOString(),
        updatedAt: dilar.updatedAt || new Date().toISOString()
      }));
      
      return transformedDilars;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Hook to fetch a single dilar by ID
export const useDilar = (dilarId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: dilarKeys.detail(dilarId),
    queryFn: async () => {
      if (!dilarId) return null;
      
      // Fetch single dilar by ID from API
      const response = await axiosSecure.get(`/dilars/${dilarId}`);
      
      if (!response?.data) {
        throw new Error('Empty response while fetching dilar');
      }
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch dilar');
      }
      
      const dilar = response.data.dilar || response.data;
      
      if (!dilar) {
        throw new Error(`Dilar with ID "${dilarId}" not found`);
      }
      
      // Normalize/transform dilar data to match frontend expectations
      return {
        _id: dilar._id || dilar.id,
        dilarId: dilar.dilarId || dilar.id || dilar._id,
        tradeName: dilar.tradeName || '',
        tradeLocation: dilar.tradeLocation || '',
        ownerName: dilar.ownerName || '',
        contactNo: dilar.contactNo || '',
        dob: dilar.dob || '',
        nid: dilar.nid || '',
        passport: dilar.passport || '',
        logo: dilar.logo || '',
        createdAt: dilar.createdAt || new Date().toISOString(),
        updatedAt: dilar.updatedAt || new Date().toISOString(),
      };
    },
    enabled: !!dilarId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation to create a new dilar
export const useCreateDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dilarData) => {
      const response = await axiosSecure.post('/dilars', dilarData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create dilar');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch dilar list
      queryClient.invalidateQueries({ queryKey: dilarKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ডিলার সফলভাবে তৈরি হয়েছে',
        text: 'নতুন ডিলার সফলভাবে যোগ করা হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ডিলার তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};

// Mutation to update a dilar
export const useUpdateDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dilarId, dilarData }) => {
      const response = await axiosSecure.put(`/dilars/${dilarId}`, dilarData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update dilar');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch dilar list
      queryClient.invalidateQueries({ queryKey: dilarKeys.lists() });
      
      // Update the specific dilar in cache
      if (data.dilar) {
        queryClient.setQueryData(
          dilarKeys.detail(variables.dilarId),
          data.dilar
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ডিলার আপডেট হয়েছে',
        text: 'ডিলারের তথ্য সফলভাবে আপডেট করা হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ডিলার আপডেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};

// Mutation to delete a dilar
export const useDeleteDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dilarId) => {
      const response = await axiosSecure.delete(`/dilars/${dilarId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete dilar');
      }
    },
    onSuccess: (data, dilarId) => {
      // Invalidate and refetch dilar list
      queryClient.invalidateQueries({ queryKey: dilarKeys.lists() });
      
      // Remove the dilar from cache
      queryClient.removeQueries({ queryKey: dilarKeys.detail(dilarId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ডিলার মুছে ফেলা হয়েছে',
        text: 'ডিলার সিস্টেম থেকে সরানো হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'ডিলার মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};
