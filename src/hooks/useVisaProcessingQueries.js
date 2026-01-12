import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for Visa Processing Services
export const visaProcessingKeys = {
  all: ['visaProcessingServices'],
  lists: () => [...visaProcessingKeys.all, 'list'],
  list: (filters) => [...visaProcessingKeys.lists(), { filters }],
  details: () => [...visaProcessingKeys.all, 'detail'],
  detail: (id) => [...visaProcessingKeys.details(), id],
};

// Hook to fetch all visa processing services
export const useVisaProcessingServices = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: visaProcessingKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.q) params.append('q', filters.q);
      if (filters.status) params.append('status', filters.status);
      if (filters.visaType) params.append('visaType', filters.visaType);
      if (filters.country) params.append('country', filters.country);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await axiosSecure.get(`/api/visa-processing-services?${params.toString()}`);
      
      if (response.data.success) {
        return {
          services: response.data.data || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch visa processing services');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Hook to fetch a single visa processing service by ID
export const useVisaProcessingService = (serviceId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: visaProcessingKeys.detail(serviceId),
    queryFn: async () => {
      if (!serviceId) return null;
      
      const response = await axiosSecure.get(`/api/visa-processing-services/${serviceId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch visa processing service');
      }
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation to create a new visa processing service
export const useCreateVisaProcessingService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceData) => {
      console.log('Creating visa processing service:', serviceData);
      
      const response = await axiosSecure.post('/api/visa-processing-services', serviceData);
      
      console.log('Create response:', response.data);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create visa processing service');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: visaProcessingKeys.lists() });
      
      // Add the new service to cache if needed
      if (data.data) {
        queryClient.setQueryData(
          visaProcessingKeys.detail(data.data._id),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'ভিসা প্রসেসিং সার্ভিস সফলভাবে যোগ হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 2000
      });
    },
    onError: (error) => {
      console.error('Create visa processing service error:', error);
      
      const message = error?.response?.data?.message || error?.message || 'ভিসা প্রসেসিং সার্ভিস যোগ করতে সমস্যা হয়েছে।';
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update a visa processing service
export const useUpdateVisaProcessingService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceId, updateData }) => {
      console.log('Updating visa processing service:', { serviceId, updateData });
      
      const response = await axiosSecure.put(`/api/visa-processing-services/${serviceId}`, updateData);
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update visa processing service');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: visaProcessingKeys.lists() });
      
      // Update the specific service in cache
      if (data.data) {
        queryClient.setQueryData(
          visaProcessingKeys.detail(variables.serviceId),
          data.data
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'ভিসা প্রসেসিং সার্ভিস সফলভাবে আপডেট হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 2000
      });
    },
    onError: (error) => {
      console.error('Update visa processing service error:', error);
      
      const message = error?.response?.data?.message || error?.message || 'ভিসা প্রসেসিং সার্ভিস আপডেট করতে সমস্যা হয়েছে।';
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to delete a visa processing service
export const useDeleteVisaProcessingService = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceId) => {
      console.log('Deleting visa processing service:', serviceId);
      
      const response = await axiosSecure.delete(`/api/visa-processing-services/${serviceId}`);
      
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete visa processing service');
      }
    },
    onSuccess: (data, serviceId) => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: visaProcessingKeys.lists() });
      
      // Remove the service from cache
      queryClient.removeQueries({ queryKey: visaProcessingKeys.detail(serviceId) });
      
      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'ভিসা প্রসেসিং সার্ভিস মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 2000
      });
    },
    onError: (error) => {
      console.error('Delete visa processing service error:', error);
      
      const message = error?.response?.data?.message || error?.message || 'ভিসা প্রসেসিং সার্ভিস মুছতে সমস্যা হয়েছে।';
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Export all hooks
export default {
  visaProcessingKeys,
  useVisaProcessingServices,
  useVisaProcessingService,
  useCreateVisaProcessingService,
  useUpdateVisaProcessingService,
  useDeleteVisaProcessingService,
};
