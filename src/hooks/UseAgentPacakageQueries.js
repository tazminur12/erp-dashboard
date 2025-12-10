import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Local validation helpers
const validatePackageData = (data) => {
  const errors = [];
  
  if (!data.packageName || !String(data.packageName).trim()) {
    errors.push('প্যাকেজের নাম প্রয়োজন');
  }
  
  if (!data.packageYear) {
    errors.push('প্যাকেজের বছর প্রয়োজন');
  }
  
  if (!data.agentId) {
    errors.push('এজেন্ট নির্বাচন করুন');
  }
  
  if (data.sarToBdtRate && (isNaN(data.sarToBdtRate) || data.sarToBdtRate < 0)) {
    errors.push('সঠিক SAR to BDT রেট দিন');
  }
  
  if (data.discount && (isNaN(data.discount) || data.discount < 0)) {
    errors.push('সঠিক ডিসকাউন্ট পরিমাণ দিন');
  }
  
  return errors;
};

// Query keys for Agent Package domain
export const agentPackageKeys = {
  all: ['agent-packages'],
  lists: () => ['agent-packages', 'list'],
  list: (filters) => ['agent-packages', 'list', { filters }],
  details: () => ['agent-packages', 'detail'],
  detail: (id) => ['agent-packages', 'detail', id],
};

// List Agent Packages with pagination and filters
export const useAgentPackageList = (params = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: agentPackageKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/api/haj-umrah/agent-packages', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load agent packages');
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Get single Agent Package by id
// Returns package data with profitLoss calculation from backend
// profitLoss includes: packagePrice, costingPrice, profitLoss, isProfit, isLoss, profitLossPercentage
export const useAgentPackage = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: agentPackageKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/api/haj-umrah/agent-packages/${id}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load agent package');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Create Agent Package
export const useCreateAgentPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageData) => {
      // Validate package data
      const validationErrors = validatePackageData(packageData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      const response = await axiosSecure.post('/api/haj-umrah/agent-packages', packageData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create agent package');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      // Also invalidate agent queries to refresh agent profile
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      if (data?.data?._id) {
        queryClient.setQueryData(agentPackageKeys.detail(data.data._id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'এজেন্ট প্যাকেজ সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'এজেন্ট প্যাকেজ তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Update Agent Package by id
export const useUpdateAgentPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      // Validate package data if required fields are being updated
      if (updates.packageName || updates.packageYear || updates.sarToBdtRate || updates.discount) {
        const validationErrors = validatePackageData(updates);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '));
        }
      }
      
      const response = await axiosSecure.put(`/api/haj-umrah/agent-packages/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update agent package');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(id) });
      // Also invalidate agent queries to refresh agent profile
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      if (data?.data) {
        queryClient.setQueryData(agentPackageKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'এজেন্ট প্যাকেজ সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'এজেন্ট প্যাকেজ আপডেটে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Delete Agent Package (soft delete)
export const useDeleteAgentPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/api/haj-umrah/agent-packages/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete agent package');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      queryClient.removeQueries({ queryKey: agentPackageKeys.detail(id) });
      // Also invalidate agent queries to refresh agent profile
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'এজেন্ট প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'এজেন্ট প্যাকেজ মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Helper hook for getting package statistics
export const useAgentPackageStats = () => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: [...agentPackageKeys.all, 'stats'],
    queryFn: async () => {
      // This would need a separate endpoint for stats
      // For now, we'll get basic stats from the list endpoint
      const response = await axiosSecure.get('/api/haj-umrah/agent-packages', { 
        params: { limit: 1000, isActive: 'true' } 
      });
      const data = response?.data;
      if (data?.success) {
        const packages = data.data || [];
        return {
          totalPackages: packages.length,
          activePackages: packages.filter(p => p.isActive).length,
          draftPackages: packages.filter(p => p.status === 'Draft').length,
          publishedPackages: packages.filter(p => p.status === 'Published').length,
          yearlyStats: packages.reduce((acc, pkg) => {
            const year = pkg.packageYear;
            acc[year] = (acc[year] || 0) + 1;
            return acc;
          }, {})
        };
      }
      throw new Error(data?.message || 'Failed to load package statistics');
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  });
};

// Helper hook for getting packages by year
export const useAgentPackagesByYear = (year) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: [...agentPackageKeys.all, 'by-year', year],
    queryFn: async () => {
      const response = await axiosSecure.get('/api/haj-umrah/agent-packages', { 
        params: { year, limit: 1000 } 
      });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load packages for year');
    },
    enabled: !!year,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Helper hook for getting packages by type
export const useAgentPackagesByType = (type, customType = null) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: [...agentPackageKeys.all, 'by-type', type, customType],
    queryFn: async () => {
      const params = { type, limit: 1000 };
      if (customType) params.customType = customType;
      
      const response = await axiosSecure.get('/api/haj-umrah/agent-packages', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load packages by type');
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Assign customers to package
export const useAssignCustomersToPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, customerIds }) => {
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        throw new Error('Customer IDs array is required');
      }
      
      const response = await axiosSecure.post(
        `/api/haj-umrah/agent-packages/${packageId}/assign-customers`,
        { customerIds }
      );
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to assign customers to package');
    },
    onSuccess: (data, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(packageId) });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      Swal.fire({
        title: 'সফল!',
        text: `${data.assignedCount || 'যাত্রীরা'} সফলভাবে প্যাকেজে যোগ করা হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'যাত্রীদের যোগ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Remove customer from package
export const useRemoveCustomerFromPackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, customerId }) => {
      const response = await axiosSecure.delete(
        `/api/haj-umrah/agent-packages/${packageId}/remove-customer/${customerId}`
      );
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to remove customer from package');
    },
    onSuccess: (data, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(packageId) });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      Swal.fire({
        title: 'সফল!',
        text: 'যাত্রী প্যাকেজ থেকে সরানো হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'যাত্রী সরাতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Get package customers
export const usePackageCustomers = (packageId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...agentPackageKeys.detail(packageId), 'customers'],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get(`/api/haj-umrah/agent-packages/${packageId}/customers`);
        const data = response?.data;
        if (data?.success) return data;
        throw new Error(data?.message || 'Failed to load package customers');
      } catch (error) {
        // If the endpoint doesn't exist or fails, return null instead of throwing
        return null;
      }
    },
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: false, // Don't retry if endpoint doesn't exist
  });
};

// Get available customers for assignment
export const useAvailableCustomers = (packageId, searchTerm = '') => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...agentPackageKeys.detail(packageId), 'available-customers', searchTerm],
    queryFn: async () => {
      const params = { search: searchTerm, limit: 100 };
      const response = await axiosSecure.get(`/api/haj-umrah/agent-packages/${packageId}/available-customers`, { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load available customers');
    },
    enabled: !!packageId,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Bulk assign customers to package
export const useBulkAssignCustomers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, customerIds, replaceExisting = false }) => {
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        throw new Error('Customer IDs array is required');
      }
      
      const response = await axiosSecure.post(
        `/api/haj-umrah/agent-packages/${packageId}/bulk-assign-customers`,
        { customerIds, replaceExisting }
      );
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to bulk assign customers');
    },
    onSuccess: (data, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(packageId) });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      Swal.fire({
        title: 'সফল!',
        text: `${data.assignedCount || 'যাত্রীরা'} সফলভাবে প্যাকেজে যোগ করা হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'যাত্রীদের যোগ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Get package statistics
export const usePackageStatistics = (packageId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...agentPackageKeys.detail(packageId), 'statistics'],
    queryFn: async () => {
      const response = await axiosSecure.get(`/api/haj-umrah/agent-packages/${packageId}/statistics`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load package statistics');
    },
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Add/Update agent package costing
export const useUpdateAgentPackageCosting = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, costingData }) => {
      const response = await axiosSecure.post(
        `/api/haj-umrah/agent-packages/${id}/costing`,
        costingData
      );
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to add/update package costing');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      // Also invalidate agent queries to refresh agent profile (due amounts)
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      if (data?.data) {
        queryClient.setQueryData(agentPackageKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'প্যাকেজ খরচ সফলভাবে সংরক্ষণ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'প্যাকেজ খরচ সংরক্ষণে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Get package transactions (agent-specific)
export const useAgentPackageTransactions = ({ packageId, page = 1, limit = 10, fromDate = '', toDate = '' }) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [...agentPackageKeys.detail(packageId), 'transactions', { page, limit, fromDate, toDate }],
    queryFn: async () => {
      const params = { page, limit };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await axiosSecure.get(`/api/haj-umrah/agent-packages/${packageId}/transactions`, { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load agent package transactions');
    },
    enabled: !!packageId,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
};

export default {
  agentPackageKeys,
  useAgentPackageList,
  useAgentPackage,
  useCreateAgentPackage,
  useUpdateAgentPackage,
  useDeleteAgentPackage,
  useAgentPackageStats,
  useAgentPackagesByYear,
  useAgentPackagesByType,
  useAssignCustomersToPackage,
  useRemoveCustomerFromPackage,
  usePackageCustomers,
  useAvailableCustomers,
  useBulkAssignCustomers,
  usePackageStatistics,
  useUpdateAgentPackageCosting,
  useAgentPackageTransactions,
};
