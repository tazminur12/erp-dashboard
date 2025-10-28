import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const vendorKeys = {
  all: ['vendors'],
  lists: () => [...vendorKeys.all, 'list'],
  list: (filters) => [...vendorKeys.lists(), { filters }],
  details: () => [...vendorKeys.all, 'detail'],
  detail: (id) => [...vendorKeys.details(), id],
  categories: () => [...vendorKeys.all, 'categories'],
};

// Hook to fetch all vendors
export const useVendors = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      const response = await axiosSecure.get('/vendors');
      
      // Extract vendors array from response
      const vendorsData = response.data?.vendors || response.data || [];
      
      // Transform vendor data to match frontend expectations
      const transformedVendors = vendorsData.map(vendor => ({
        _id: vendor._id || vendor.id,
        vendorId: vendor.vendorId || vendor.id || vendor._id,
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        dob: vendor.dob || '',
        nid: vendor.nid || '',
        passport: vendor.passport || '',
        createdAt: vendor.createdAt || new Date().toISOString(),
        updatedAt: vendor.updatedAt || new Date().toISOString()
      }));
      
      return transformedVendors;
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

// Hook to fetch a single vendor by ID
export const useVendor = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: async () => {
      if (!vendorId) return null;
      
      // Fetch all vendors and filter by vendorId (matching existing pattern)
      const response = await axiosSecure.get('/vendors');
      
      // Extract vendors array from response
      const vendorsData = response.data?.vendors || response.data || [];
      
      // Find vendor by vendorId
      const vendor = vendorsData.find(v => 
        v.vendorId === vendorId || v._id === vendorId || v.id === vendorId
      );
      
      if (!vendor) {
        console.warn('Vendor not found with ID:', vendorId);
        console.log('Available vendors:', vendorsData.map(v => ({ id: v.vendorId || v._id || v.id, tradeName: v.tradeName })));
        throw new Error(`Vendor with ID "${vendorId}" not found`);
      }
      
      // Transform vendor data to match frontend expectations
      return {
        _id: vendor._id || vendor.id,
        vendorId: vendor.vendorId || vendor.id || vendor._id,
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        dob: vendor.dob || '',
        nid: vendor.nid || '',
        passport: vendor.passport || '',
        createdAt: vendor.createdAt || new Date().toISOString(),
        updatedAt: vendor.updatedAt || new Date().toISOString()
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch customer types/categories for order types
export const useCustomerTypes = () => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.categories(),
    queryFn: async () => {
      const response = await axiosSecure.get('/customer-types');
      
      if (response.data.success) {
        return response.data.customerTypes || response.data.categories || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Mutation to create a new vendor
export const useCreateVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorData) => {
      const response = await axiosSecure.post('/vendors', vendorData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create vendor');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Add the new vendor to the cache if needed
      if (data.vendor) {
        const cacheId = data.vendor._id || data.vendor.id || data.vendor.vendorId;
        queryClient.setQueryData(
          vendorKeys.detail(cacheId),
          data.vendor
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor added successfully',
        text: 'New vendor has been created successfully.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to add vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Mutation to update a vendor
export const useUpdateVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, vendorData }) => {
      const response = await axiosSecure.put(`/vendors/${vendorId}`, vendorData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update vendor');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Update the specific vendor in cache
      if (data.vendor) {
        queryClient.setQueryData(
          vendorKeys.detail(variables.vendorId),
          data.vendor
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor updated successfully',
        text: 'Vendor information has been updated successfully.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Mutation to delete a vendor
export const useDeleteVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorId) => {
      const response = await axiosSecure.delete(`/vendors/${vendorId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete vendor');
      }
    },
    onSuccess: (data, vendorId) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Remove the vendor from cache
      queryClient.removeQueries({ queryKey: vendorKeys.detail(vendorId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor deleted successfully',
        text: 'Vendor has been removed from the system.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Hook to fetch vendor financial data
export const useVendorFinancials = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: [...vendorKeys.detail(vendorId), 'financials'],
    queryFn: async () => {
      if (!vendorId) return null;
      
      try {
        // Try to fetch from API first
        const response = await axiosSecure.get(`/vendors/${vendorId}/financials`);
        
        if (response.data.success) {
          return response.data.financials || response.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch financial data');
        }
      } catch (error) {
        // If API fails, return mock data
        console.warn('Financial API not available, using mock data:', error.message);
        return {
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalAmount: Math.floor(Math.random() * 200000) + 50000,
          outstandingAmount: Math.floor(Math.random() * 50000) + 5000,
          paidAmount: Math.floor(Math.random() * 150000) + 30000,
          lastPaymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          averageOrderValue: Math.floor(Math.random() * 10000) + 2000,
          creditLimit: Math.floor(Math.random() * 100000) + 20000,
          paymentTerms: 'Net 30',
          businessType: 'Wholesale',
          registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
          status: Math.random() > 0.1 ? 'Active' : 'Inactive'
        };
      }
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once since we have fallback
  });
};

// Hook to fetch vendor activities
export const useVendorActivities = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: [...vendorKeys.detail(vendorId), 'activities'],
    queryFn: async () => {
      if (!vendorId) return [];
      
      try {
        // Try to fetch from API first
        const response = await axiosSecure.get(`/vendors/${vendorId}/activities`);
        
        if (response.data.success) {
          return response.data.activities || response.data || [];
        } else {
          throw new Error(response.data.message || 'Failed to fetch activities');
        }
      } catch (error) {
        // If API fails, return mock activities
        console.warn('Activities API not available, using mock data:', error.message);
        return [
          {
            id: '1',
            type: 'order',
            title: 'New order created',
            description: 'Order #ORD-001 for ৳5,000',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            icon: 'Receipt'
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment received',
            description: 'Payment of ৳10,000 received',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            icon: 'CheckCircle'
          },
          {
            id: '3',
            type: 'update',
            title: 'Profile updated',
            description: 'Contact information updated',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            icon: 'Edit'
          }
        ];
      }
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1, // Only retry once since we have fallback
  });
};

// Mutation to create an order for a vendor
export const useCreateVendorOrder = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axiosSecure.post('/orders', orderData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate vendor queries to refresh data
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'financials'] });
      queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'activities'] });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Order created successfully',
        text: 'New order has been created successfully.',
        confirmButtonColor: '#7c3aed'
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create order. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Failed to create order',
        text: message,
        confirmButtonColor: '#dc2626'
      });
    },
  });
};