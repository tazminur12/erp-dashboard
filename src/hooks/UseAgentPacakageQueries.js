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
export const useAgentPackageList = (params) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: agentPackageKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/agent-packages', { params });
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
export const useAgentPackage = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: agentPackageKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/agent-packages/${id}`);
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
      
      const response = await axiosSecure.post('/haj-umrah/agent-packages', packageData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create agent package');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
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
      
      const response = await axiosSecure.put(`/haj-umrah/agent-packages/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update agent package');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.detail(id) });
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
      const response = await axiosSecure.delete(`/haj-umrah/agent-packages/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete agent package');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: agentPackageKeys.lists() });
      queryClient.removeQueries({ queryKey: agentPackageKeys.detail(id) });
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
      const response = await axiosSecure.get('/haj-umrah/agent-packages', { 
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
      const response = await axiosSecure.get('/haj-umrah/agent-packages', { 
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
      
      const response = await axiosSecure.get('/haj-umrah/agent-packages', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load packages by type');
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
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
};
