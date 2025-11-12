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

// Query keys for Air Customers domain
export const airCustomerKeys = {
  all: ['airCustomers'],
  lists: () => [...airCustomerKeys.all, 'list'],
  list: (filters) => [...airCustomerKeys.lists(), { filters }],
  details: () => [...airCustomerKeys.all, 'detail'],
  detail: (id) => [...airCustomerKeys.details(), id],
};

export default function useAirCustomersQueries() {
  const queryClient = useQueryClient();
  const axios = useAxiosSecure();

  // Get all air customers with pagination, search, and filters
  const useAirCustomers = (options = {}) => {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      customerType = '',
      isActive = 'true' 
    } = options;
    
    return useQuery({
      queryKey: airCustomerKeys.list({ page, limit, search, customerType, isActive }),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);
        if (customerType) params.append('customerType', customerType);
        if (isActive) params.append('isActive', isActive);
        
        const { data } = await axios.get(`/api/airCustomers?${params.toString()}`);
        
        if (data.success) {
          return {
            customers: data.customers || [],
            pagination: data.pagination || {
              page: 1,
              limit: 50,
              total: 0,
              pages: 0
            }
          };
        } else {
          throw new Error(data.message || 'Failed to fetch air customers');
        }
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single air customer by ID (customerId or _id)
  // API: GET /api/airCustomers/:id
  // Returns: { success: true, customer: {...} }
  // Note: The API calculates financial totals from all active tickets for this customer
  //       and includes calculatedTotalAmount, calculatedPaidAmount, calculatedTotalDue
  const useAirCustomer = (id) => {
    return useQuery({
      queryKey: airCustomerKeys.detail(id),
      queryFn: async () => {
        try {
          const { data } = await axios.get(`/api/airCustomers/${id}`);
          
          if (data.success) {
            return data.customer;
          } else {
            throw new Error(data.message || 'Failed to fetch air customer');
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

  // Create new air customer
  const useCreateAirCustomer = () => {
    return useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/airCustomers', payload);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to create air customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data) => {
        // Invalidate all air customer lists
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        
        // Add the new customer to cache if needed
        if (data.customer) {
          const customerId = data.customer.customerId || data.customer._id;
          if (customerId) {
            queryClient.setQueryData(
              airCustomerKeys.detail(customerId),
              data.customer
            );
          }
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে যোগ হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার যোগ করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Update air customer (PUT - full update)
  const useUpdateAirCustomer = () => {
    return useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/airCustomers/${id}`, body);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to update air customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data, { id }) => {
        // Invalidate all air customer lists
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        
        // Invalidate specific customer details
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.detail(id) });
        
        // Update cache if needed
        if (data.customer) {
          queryClient.setQueryData(
            airCustomerKeys.detail(id),
            data.customer
          );
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার আপডেট করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Partially update air customer (PATCH - partial update)
  const usePatchAirCustomer = () => {
    return useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.patch(`/api/airCustomers/${id}`, body);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to update air customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data, { id }) => {
        // Invalidate all air customer lists
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        
        // Invalidate specific customer details
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.detail(id) });
        
        // Update cache if needed
        if (data.customer) {
          queryClient.setQueryData(
            airCustomerKeys.detail(id),
            data.customer
          );
        }
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার আপডেট করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Delete air customer (soft delete)
  const useDeleteAirCustomer = () => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/airCustomers/${id}`);
          
          if (data.success) {
            return data;
          } else {
            throw new Error(data.message || 'Failed to delete air customer');
          }
        } catch (err) {
          const errorMsg = extractErrorMessage(err);
          throw new Error(errorMsg);
        }
      },
      onSuccess: (data, id) => {
        // Invalidate all air customer lists
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        
        // Remove specific customer from cache
        queryClient.removeQueries({ queryKey: airCustomerKeys.detail(id) });
        
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'কাস্টমার মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Search air customers (for reference customer search)
  const useSearchAirCustomers = (searchTerm, options = {}) => {
    const { enabled = true, limit = 20 } = options;
    
    return useQuery({
      queryKey: ['airCustomers', 'search', searchTerm, { limit }],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        params.append('limit', limit);
        params.append('page', 1);
        params.append('isActive', 'true');
        
        const { data } = await axios.get(`/api/airCustomers?${params.toString()}`);
        
        if (data.success) {
          return data.customers || [];
        } else {
          throw new Error(data.message || 'Failed to search air customers');
        }
      },
      enabled: enabled && Boolean(searchTerm && searchTerm.trim()),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  return {
    useAirCustomers,
    useAirCustomer,
    useCreateAirCustomer,
    useUpdateAirCustomer,
    usePatchAirCustomer,
    useDeleteAirCustomer,
    useSearchAirCustomers,
  };
}

