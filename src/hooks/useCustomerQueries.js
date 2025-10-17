import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (filters) => [...customerKeys.lists(), { filters }],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
  services: () => [...customerKeys.all, 'services'],
  serviceStatuses: (serviceType) => [...customerKeys.all, 'serviceStatuses', serviceType],
};

// Hook to fetch all customers
export const useCustomers = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: async () => {
      const response = await axiosSecure.get('/customers');
      
      if (response.data.success) {
        return response.data.customers || [];
      } else {
        throw new Error(response.data.message || 'Failed to load customers');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single customer
export const useCustomer = (customerId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: async () => {
      const response = await axiosSecure.get(`/customers/${customerId}`);
      
      if (response.data.success) {
        return response.data.customer;
      } else {
        throw new Error(response.data.message || 'Failed to load customer');
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to fetch service types
export const useServiceTypes = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerKeys.services(),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/api/services');
        const serviceTypesData = response?.data?.services || response?.data || [];
        return Array.isArray(serviceTypesData) ? serviceTypesData : [];
      } catch (error) {
        console.error('Error fetching service types:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, only retry on 5xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2; // Reduce retry count for service types
    },
  });
};

// Hook to fetch service statuses for a specific service type
export const useServiceStatuses = (serviceType) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerKeys.serviceStatuses(serviceType),
    queryFn: async () => {
      if (!serviceType) return [];
      
      try {
        const response = await axiosSecure.get(`/api/services/${serviceType}/statuses`);
        const statusesData = response?.data?.statuses || response?.data || [];
        return Array.isArray(statusesData) ? statusesData : [];
      } catch (error) {
        console.error('Error fetching service statuses:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    enabled: !!serviceType,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, only retry on 5xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2; // Reduce retry count for service statuses
    },
  });
};

// Mutation to delete a customer
export const useDeleteCustomer = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId) => {
      const response = await axiosSecure.delete(`/customers/${customerId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete customer');
      }
    },
    onSuccess: (data, customerId) => {
      // Invalidate and refetch customer list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Remove the specific customer from cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update customer status
export const useUpdateCustomerStatus = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, status }) => {
      const response = await axiosSecure.patch(`/customers/${customerId}`, {
        status
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update customer status');
      }
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate and refetch customer list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate specific customer details
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: `কাস্টমার স্ট্যাটাস ${data.customer?.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update customer service type
export const useUpdateCustomerServiceType = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, serviceType }) => {
      const response = await axiosSecure.patch(`/customers/${customerId}`, {
        serviceType,
        serviceStatus: '' // Reset service status when service type changes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update customer service type');
      }
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate and refetch customer list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate specific customer details
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'সার্ভিস টাইপ আপডেট করা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সার্ভিস টাইপ আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update customer service status
export const useUpdateCustomerServiceStatus = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, serviceStatus }) => {
      const response = await axiosSecure.patch(`/customers/${customerId}`, {
        serviceStatus
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update customer service status');
      }
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate and refetch customer list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate specific customer details
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'সার্ভিস স্ট্যাটাস আপডেট করা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সার্ভিস স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to create a new customer
export const useCreateCustomer = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData) => {
      const response = await axiosSecure.post('/customers', customerData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create customer');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch customer list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Add the new customer to the cache if needed
      if (data.customer) {
        queryClient.setQueryData(
          customerKeys.detail(data.customer.id || data.customer.customerId),
          data.customer
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'নতুন কাস্টমার সফলভাবে যোগ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};
