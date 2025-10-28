import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for consistent caching
export const packageKeys = {
  all: ['packages'],
  lists: () => [...packageKeys.all, 'list'],
  list: (filters) => [...packageKeys.lists(), { filters }],
  details: () => [...packageKeys.all, 'detail'],
  detail: (id) => [...packageKeys.details(), id],
};

// Custom hook for fetching packages list with pagination and filters
export const usePackages = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { year, type, customPackageType, status, limit = 50, page = 1 } = filters;

  return useQuery({
    queryKey: packageKeys.list({ year, type, customPackageType, status, limit, page }),
    queryFn: async () => {
      const params = {};
      if (year) params.year = year;
      if (type) params.type = type;
      if (customPackageType) params.customPackageType = customPackageType;
      if (status) params.status = status;
      params.limit = limit;
      params.page = page;

      const response = await axiosSecure.get('/haj-umrah/packages', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load packages');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for fetching single package details
export const usePackage = (id) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: packageKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosSecure.get(`/haj-umrah/packages/${id}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load package');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for creating a new package
export const useCreatePackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageData) => {
      const response = await axiosSecure.post('/haj-umrah/packages', packageData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create package');
    },
    onSuccess: (data) => {
      // Invalidate and refetch packages list
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Package created successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create package';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for updating a package
export const useUpdatePackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...packageData }) => {
      const response = await axiosSecure.put(`/haj-umrah/packages/${id}`, packageData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update package');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch packages list and specific package detail
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Package updated successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update package';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for deleting a package
export const useDeletePackage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/haj-umrah/packages/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete package');
    },
    onSuccess: (data) => {
      // Invalidate and refetch packages list
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Package deleted successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete package';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

