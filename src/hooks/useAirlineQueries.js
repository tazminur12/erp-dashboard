import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import useAxios from './Axios';
import Swal from 'sweetalert2';

function getAxios() {
  try {
    return useSecureAxios();
  } catch (e) {
    return useAxios();
  }
}

function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
}

// Query keys
export const airlineKeys = {
  all: ['airlines'],
  lists: () => [...airlineKeys.all, 'list'],
  list: (filters) => [...airlineKeys.lists(), { filters }],
  details: () => [...airlineKeys.all, 'detail'],
  detail: (id) => [...airlineKeys.details(), id],
};

export default function useAirlineQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // Get all airlines with pagination, search, and filters
  const useAirlines = (options = {}) => {
    const { page = 1, limit = 20, q = '', status = 'All' } = options;
    
    return useQuery({
      queryKey: airlineKeys.list({ page, limit, q, status }),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (status && status !== 'All') params.append('status', status);
        
        const { data } = await axios.get(`/api/air-ticketing/airlines?${params.toString()}`);
        
        if (data.success) {
          return {
            airlines: data.data || [],
            pagination: data.pagination || {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0
            }
          };
        } else {
          throw new Error(data.message || 'Failed to fetch airlines');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single airline by ID
  const useGetAirline = (id) => {
    return useQuery({
      queryKey: airlineKeys.detail(id),
      queryFn: async () => {
        const { data } = await axios.get(`/api/air-ticketing/airlines/${id}`);
        
        if (data.success) {
          return data.airline;
        } else {
          throw new Error(data.message || 'Failed to fetch airline');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new airline
  const useCreateAirline = () => {
    return useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/air-ticketing/airlines', payload);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to create airline');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data) => {
        // Invalidate all airline lists
        queryClient.invalidateQueries({ queryKey: airlineKeys.lists() });
        
        // Add the new airline to cache if needed
        if (data.airline) {
          queryClient.setQueryData(
            airlineKeys.detail(data.airline._id || data.airline.airlineId),
            data.airline
          );
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'এয়ারলাইন সফলভাবে যোগ করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'এয়ারলাইন যোগ করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Update airline
  const useUpdateAirline = () => {
    return useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/air-ticketing/airlines/${id}`, body);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to update airline');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data, { id }) => {
        // Invalidate all airline lists
        queryClient.invalidateQueries({ queryKey: airlineKeys.lists() });
        
        // Invalidate specific airline details
        queryClient.invalidateQueries({ queryKey: airlineKeys.detail(id) });
        
        // Update cache if needed
        if (data.airline) {
          queryClient.setQueryData(
            airlineKeys.detail(id),
            data.airline
          );
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'এয়ারলাইন সফলভাবে আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'এয়ারলাইন আপডেট করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Delete airline (soft delete)
  const useDeleteAirline = () => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/air-ticketing/airlines/${id}`);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to delete airline');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: () => {
        // Invalidate all airline lists
        queryClient.invalidateQueries({ queryKey: airlineKeys.lists() });
        
        Swal.fire({
          title: 'সফল!',
          text: 'এয়ারলাইন সফলভাবে মুছে ফেলা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'এয়ারলাইন মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  return {
    useAirlines,
    useGetAirline,
    useCreateAirline,
    useUpdateAirline,
    useDeleteAirline,
  };
}

