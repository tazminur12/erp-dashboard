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

// Hook to fetch all dilars with pagination and filters
// Backend: GET /api/dilars
// Supports: page, limit, search
// Backend returns: { success: true, data: dilars[], pagination: { page, limit, total, pages } }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useDilars = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: dilarKeys.list(filters),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        // Add pagination parameters (backend defaults: page=1, limit=10)
        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
        
        // Add search parameter
        if (filters.search && String(filters.search).trim()) {
          params.append('search', String(filters.search).trim());
        }
        
        const response = await axiosSecure.get(`/api/dilars?${params.toString()}`);
        
        // Backend returns: { success: true, data: dilars[], pagination: {...} }
        if (response.data.success) {
          // Ensure data is an array (backend handles this, but be defensive)
          const dilarsList = Array.isArray(response.data.data) ? response.data.data : [];
          
          return {
            dilars: dilarsList,
            pagination: response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0
            }
          };
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details || 
            'Failed to load dilars'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to load dilars';
        throw new Error(errorMessage);
      }
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
// Backend: GET /api/dilars/:id
// Supports: _id or contactNo
// Backend returns: { success: true, data: dilar }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useDilar = (dilarId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: dilarKeys.detail(dilarId),
    queryFn: async () => {
      if (!dilarId) return null;
      
      try {
        const response = await axiosSecure.get(`/api/dilars/${dilarId}`);
        
        // Backend returns: { success: true, data: dilar }
        if (response.data.success) {
          return response.data.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details || 
            'Failed to fetch dilar'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to fetch dilar';
        throw new Error(errorMessage);
      }
    },
    enabled: !!dilarId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors like 404)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Mutation to create a new dilar
// Backend: POST /api/dilars
// Required fields: ownerName, contactNo, tradeLocation
// Optional fields: logo
// Backend returns: { success: true, message: "...", data: { ...dilarData, _id } }
// Backend error: { success: false, error: "...", message: "..." }
export const useCreateDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dilarData) => {
      try {
        const response = await axiosSecure.post('/api/dilars', dilarData);
        
        // Backend returns: { success: true, message: "...", data: {...} }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            'Failed to create dilar'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error ||
                           error?.message || 
                           'Failed to create dilar';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch dilar list
      queryClient.invalidateQueries({ queryKey: dilarKeys.lists() });
      
      // Add the new dilar to cache if needed
      if (data.data && data.data._id) {
        queryClient.setQueryData(
          dilarKeys.detail(data.data._id),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ডিলার সফলভাবে তৈরি হয়েছে',
        text: data.message || 'নতুন ডিলার সফলভাবে যোগ করা হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "..." }
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error ||
                     error?.message ||
                     'ডিলার তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};

// Mutation to update a dilar
// Backend: PUT /api/dilars/:id
// Supports: _id or contactNo
// Optional fields: ownerName, contactNo, tradeLocation, logo
// Backend returns: { success: true, message: "...", data: updatedDilar }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useUpdateDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dilarId, dilarData }) => {
      try {
        const response = await axiosSecure.put(`/api/dilars/${dilarId}`, dilarData);
        
        // Backend returns: { success: true, message: "...", data: updatedDilar }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details ||
            'Failed to update dilar'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to update dilar';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch dilar list
      queryClient.invalidateQueries({ queryKey: dilarKeys.lists() });
      
      // Update the specific dilar in cache
      if (data.data) {
        queryClient.setQueryData(
          dilarKeys.detail(variables.dilarId),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ডিলার আপডেট হয়েছে',
        text: data.message || 'ডিলারের তথ্য সফলভাবে আপডেট করা হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "...", details: "..." }
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error ||
                     error?.response?.data?.details ||
                     error?.message ||
                     'ডিলার আপডেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};

// Mutation to delete a dilar (soft delete)
// Backend: DELETE /api/dilars/:id
// Supports: _id or contactNo
// Sets: isActive = false
// Backend returns: { success: true, message: "..." }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useDeleteDilar = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dilarId) => {
      try {
        const response = await axiosSecure.delete(`/api/dilars/${dilarId}`);
        
        // Backend returns: { success: true, message: "..." }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details ||
            'Failed to delete dilar'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to delete dilar';
        throw new Error(errorMessage);
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
        text: data.message || 'ডিলার সিস্টেম থেকে সরানো হয়েছে।',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "...", details: "..." }
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error ||
                     error?.response?.data?.details ||
                     error?.message ||
                     'ডিলার মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: message
      });
    },
  });
};
