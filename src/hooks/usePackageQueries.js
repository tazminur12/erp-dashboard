import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';
import { umrahKeys, useUmrahList } from './UseUmrahQuries';
import { hajiKeys, useHajiList } from './UseHajiQueries';

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

// Custom hook for assigning package to passenger with type selection
export const useAssignPackageToPassenger = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ packageId, passengerId, passengerType, passengerCategory }) => {
      // Validation
      if (!packageId) {
        throw new Error('Package ID is required');
      }
      if (!passengerId) {
        throw new Error('Passenger ID is required');
      }
      if (!passengerType || !['adult', 'child', 'infant'].includes(passengerType.toLowerCase())) {
        throw new Error('Passenger type must be one of: adult, child, infant');
      }

      const response = await axiosSecure.post(
        `/haj-umrah/packages/${packageId}/assign-passenger`,
        {
          passengerId,
          passengerType: passengerType.toLowerCase(),
          passengerCategory
        }
      );
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to assign package to passenger');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch packages list
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
      
      // Invalidate haji and umrah lists since passenger data was updated
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      
      // Invalidate specific passenger detail to refresh the current page
      queryClient.invalidateQueries({ queryKey: hajiKeys.detail(variables.passengerId) });
      queryClient.invalidateQueries({ queryKey: umrahKeys.detail(variables.passengerId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Package assigned successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to assign package to passenger';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for fetching customers assigned to a package
export const usePackageCustomers = (packageId) => {
  const axiosSecure = useAxiosSecure();

  // Fetch all hajj and umrah customers
  const { data: hajiData, isLoading: hajiLoading } = useHajiList({ limit: 10000 });
  const { data: umrahData, isLoading: umrahLoading } = useUmrahList({ limit: 10000 });

  return useQuery({
    queryKey: [...packageKeys.detail(packageId), 'customers'],
    queryFn: async () => {
      if (!packageId) return { haji: [], umrah: [], all: [] };

      // Try to fetch from API endpoint first
      try {
        const response = await axiosSecure.get(`/haj-umrah/packages/${packageId}/passengers`);
        const data = response?.data;
        if (data?.success && data?.data) {
          return {
            haji: data.data.hajj || [],
            umrah: data.data.umrah || [],
            all: [...(data.data.hajj || []), ...(data.data.umrah || [])]
          };
        }
      } catch (error) {
        // If API endpoint doesn't exist, fall back to filtering local data
        console.log('API endpoint not available, using local data');
      }

      // Fallback: Filter from local hajj and umrah lists
      const hajiList = hajiData?.data || [];
      const umrahList = umrahData?.data || [];

      const assignedHaji = hajiList.filter(customer => {
        return customer.packageId === packageId || 
               customer.packageInfo?.packageId === packageId ||
               customer.packageInfo?._id === packageId;
      });

      const assignedUmrah = umrahList.filter(customer => {
        return customer.packageId === packageId || 
               customer.packageInfo?.packageId === packageId ||
               customer.packageInfo?._id === packageId;
      });

      return {
        haji: assignedHaji,
        umrah: assignedUmrah,
        all: [...assignedHaji, ...assignedUmrah]
      };
    },
    enabled: !!packageId && !hajiLoading && !umrahLoading,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

