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

// Query keys for Other Service Customers domain
export const otherCustomerKeys = {
  all: ['otherCustomers'],
  lists: () => [...otherCustomerKeys.all, 'list'],
  list: (filters) => [...otherCustomerKeys.lists(), { filters }],
  details: () => [...otherCustomerKeys.all, 'detail'],
  detail: (id) => [...otherCustomerKeys.details(), id],
};

export default function useOtherCustomerQueries() {
  const queryClient = useQueryClient();
  const axios = useAxiosSecure();

  // Get all other service customers with pagination, search, and filters
  // API: GET /api/other/customers?page=1&limit=50&q=search&status=active
  // Returns: { success: true, data: [...], pagination: {...} }
  const useOtherCustomers = (options = {}) => {
    const { 
      page = 1, 
      limit = 50, 
      q = '', 
      status = '' 
    } = options;
    
    return useQuery({
      queryKey: otherCustomerKeys.list({ page, limit, q, status }),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (status) params.append('status', status);
        
        const { data } = await axios.get(`/api/other/customers?${params.toString()}`);
        
        if (data.success) {
          return {
            customers: data.data || [],
            pagination: data.pagination || {
              page: page,
              limit: limit,
              total: 0,
              pages: 0
            }
          };
        } else {
          throw new Error(data.message || 'Failed to fetch other service customers');
        }
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single other service customer by ID
  // API: GET /api/other/customers/:id
  // Returns: { success: true, data: {...} }
  const useOtherCustomer = (id) => {
    return useQuery({
      queryKey: otherCustomerKeys.detail(id),
      queryFn: async () => {
        try {
          const { data } = await axios.get(`/api/other/customers/${id}`);
          
          if (data.success) {
            return data.data;
          } else {
            throw new Error(data.message || 'Failed to fetch other service customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Create new other service customer
  // API: POST /api/other/customers
  // Payload: { firstName, lastName, name?, phone, email?, address?, city?, country?, status?, notes? }
  // Returns: { success: true, message: "...", data: {...} }
  const useCreateOtherCustomer = () => {
    return useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/other/customers', payload);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to create other service customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data) => {
        // Invalidate all other customer lists
        queryClient.invalidateQueries({ queryKey: otherCustomerKeys.lists() });
        
        // Add the new customer to cache if needed
        if (data.data) {
          const customerId = data.data._id || data.data.id;
          if (customerId) {
            queryClient.setQueryData(
              otherCustomerKeys.detail(customerId),
              data.data
            );
          }
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে যোগ করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার যোগ করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Update other service customer (PUT - full update)
  // API: PUT /api/other/customers/:id
  // Payload: { firstName?, lastName?, name?, phone?, email?, address?, city?, country?, status?, notes? }
  // Returns: { success: true, message: "...", data: {...} }
  const useUpdateOtherCustomer = () => {
    return useMutation({
      mutationFn: async ({ id, ...payload }) => {
        try {
          const { data } = await axios.put(`/api/other/customers/${id}`, payload);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to update other service customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data, variables) => {
        const customerId = variables.id;
        
        // Invalidate all other customer lists
        queryClient.invalidateQueries({ queryKey: otherCustomerKeys.lists() });
        
        // Update the specific customer in cache
        if (data.data) {
          queryClient.setQueryData(
            otherCustomerKeys.detail(customerId),
            data.data
          );
        } else {
          // If data not returned, invalidate the detail query
          queryClient.invalidateQueries({ queryKey: otherCustomerKeys.detail(customerId) });
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার আপডেট করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Delete other service customer (soft delete)
  // API: DELETE /api/other/customers/:id
  // Returns: { success: true, message: "Customer deleted successfully" }
  const useDeleteOtherCustomer = () => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/other/customers/${id}`);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to delete other service customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: () => {
        // Invalidate all other customer lists and details
        queryClient.invalidateQueries({ queryKey: otherCustomerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: otherCustomerKeys.details() });
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার মুছতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  return {
    useOtherCustomers,
    useOtherCustomer,
    useCreateOtherCustomer,
    useUpdateOtherCustomer,
    useDeleteOtherCustomer,
  };
}

