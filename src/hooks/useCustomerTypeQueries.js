import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for customer types
export const customerTypeKeys = {
  all: ['customerTypes'],
  lists: () => [...customerTypeKeys.all, 'list'],
  list: (filters) => [...customerTypeKeys.lists(), { filters }],
  details: () => [...customerTypeKeys.all, 'detail'],
  detail: (id) => [...customerTypeKeys.details(), id],
  byValue: (value) => [...customerTypeKeys.all, 'value', value],
};

// Hook to fetch all customer types
export const useCustomerTypes = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerTypeKeys.lists(),
    queryFn: async () => {
      const response = await axiosSecure.get('/customer-types');
      
      if (response.data.success) {
        return response.data.customerTypes || [];
      } else {
        throw new Error(response.data.message || 'Failed to load customer types');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single customer type by ID
export const useCustomerType = (customerTypeId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerTypeKeys.detail(customerTypeId),
    queryFn: async () => {
      const response = await axiosSecure.get(`/customer-types/${customerTypeId}`);
      
      if (response.data.success) {
        return response.data.customerType;
      } else {
        throw new Error(response.data.message || 'Failed to load customer type');
      }
    },
    enabled: !!customerTypeId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to fetch customers by customer type
export const useCustomersByType = (customerTypeValue, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: customerTypeKeys.byValue(customerTypeValue),
    queryFn: async () => {
      const response = await axiosSecure.get(`/customers?type=${customerTypeValue}`);
      
      if (response.data.success) {
        return response.data.customers || [];
      } else {
        throw new Error(response.data.message || 'Failed to load customers');
      }
    },
    enabled: !!customerTypeValue && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation to create a new customer type
export const useCreateCustomerType = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerTypeData) => {
      // Validate required fields
      if (!customerTypeData.value || !customerTypeData.label || !customerTypeData.prefix) {
        throw new Error('Value, Label, and Prefix are required');
      }

      const response = await axiosSecure.post('/customer-types', {
        value: customerTypeData.value,
        label: customerTypeData.label,
        prefix: customerTypeData.prefix,
        icon: customerTypeData.icon || 'home',
        type: customerTypeData.type || 'general'
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create customer type');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch customer types list
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.lists() });
      
      // Show success message (component will handle theme-specific styling)
      Swal.fire({
        title: 'সফল!',
        text: 'নতুন কাস্টমার টাইপ যোগ হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      let errorMessage = 'কাস্টমার টাইপ সংরক্ষণ করতে সমস্যা হয়েছে।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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

// Mutation to update a customer type
export const useUpdateCustomerType = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerTypeId, updates }) => {
      // Validate required fields if provided
      if (updates.value !== undefined && !updates.value) {
        throw new Error('Value cannot be empty');
      }
      if (updates.label !== undefined && !updates.label) {
        throw new Error('Label cannot be empty');
      }
      if (updates.prefix !== undefined && !updates.prefix) {
        throw new Error('Prefix cannot be empty');
      }

      const response = await axiosSecure.patch(`/customer-types/${customerTypeId}`, {
        value: updates.value,
        label: updates.label,
        prefix: updates.prefix,
        icon: updates.icon,
        type: updates.type
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update customer type');
      }
    },
    onSuccess: (data, { customerTypeId }) => {
      // Invalidate and refetch customer types list
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.lists() });
      
      // Invalidate specific customer type details
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.detail(customerTypeId) });
      
      // Update the customer type in cache if needed
      if (data.customerType) {
        queryClient.setQueryData(
          customerTypeKeys.detail(customerTypeId),
          data.customerType
        );
      }
      
      // Show success message (component will handle theme-specific styling)
      Swal.fire({
        title: 'সফল!',
        text: 'কাস্টমার টাইপ সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      let errorMessage = 'কাস্টমার টাইপ আপডেট করতে সমস্যা হয়েছে।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add more specific error handling for ID format issues
      if (errorMessage.includes('Invalid') && errorMessage.includes('ID')) {
        errorMessage = 'কাস্টমার টাইপ ID ফরম্যাট সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।';
      }
      
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

// Mutation to delete a customer type
export const useDeleteCustomerType = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerTypeId, value }) => {
      const response = await axiosSecure.delete(`/customer-types/${customerTypeId}`, {
        data: { value }
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete customer type');
      }
    },
    onSuccess: (data, { customerTypeId }) => {
      // Invalidate and refetch customer types list
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.lists() });
      
      // Remove the specific customer type from cache
      queryClient.removeQueries({ queryKey: customerTypeKeys.detail(customerTypeId) });
      
      // Show success message (component will handle theme-specific styling)
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'কাস্টমার টাইপ মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      let errorMessage = 'কাস্টমার টাইপ মুছতে সমস্যা হয়েছে।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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

// Aggregate export for convenience
const useCustomerTypeQueries = () => ({
  customerTypeKeys,
  useCustomerTypes,
  useCustomerType,
  useCustomersByType,
  useCreateCustomerType,
  useUpdateCustomerType,
  useDeleteCustomerType,
});

export default useCustomerTypeQueries;

