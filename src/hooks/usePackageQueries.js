import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';
import { umrahKeys, useUmrahList } from './UseUmrahQuries';
import { hajiKeys, useHajiList } from './UseHajiQueries';

// Normalize mixed string/number values (e.g. "৳12,000")
const toNumeric = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const numericValue = Number(cleaned);
    return Number.isNaN(numericValue) ? null : numericValue;
  }
  return null;
};

const normalizePassengerTotals = (totals = {}) => {
  const passengers = totals.passengerTotals || {};
  return {
    ...totals,
    passengerTotals: {
      adult: toNumeric(passengers.adult) ?? 0,
      child: toNumeric(passengers.child) ?? 0,
      infant: toNumeric(passengers.infant) ?? 0,
    },
  };
};

const normalizeProfitLoss = (pkg = {}) => {
  const totals = pkg.totals || {};
  const profitLossFromApi = pkg.profitLoss || {};

  const costingPrice =
    toNumeric(profitLossFromApi.costingPrice) ??
    toNumeric(totals.costingPrice) ??
    toNumeric(totals.grandTotal) ??
    0;

  const packagePrice =
    toNumeric(profitLossFromApi.packagePrice) ??
    toNumeric(pkg.totalPrice) ??
    toNumeric(totals.packagePrice) ??
    toNumeric(totals.subtotal) ??
    toNumeric(totals.grandTotal) ??
    0;

  const profitValue =
    toNumeric(profitLossFromApi.profitOrLoss) ??
    toNumeric(profitLossFromApi.profitLoss) ??
    (packagePrice - costingPrice);

  const percentage = packagePrice ? (profitValue / packagePrice) * 100 : 0;

  return {
    costingPrice,
    packagePrice,
    profitLoss: profitValue,
    profitLossPercentage: percentage,
    isProfit: profitValue > 0,
    isLoss: profitValue < 0,
  };
};

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
      if (data?.success) {
        const pkg = data?.data || {};
        return {
          ...pkg,
          totals: normalizePassengerTotals(pkg.totals),
          profitLoss: normalizeProfitLoss(pkg),
        };
      }
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

// Add/Update package costing
export const useUpdatePackageCosting = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, costingData }) => {
      const response = await axiosSecure.post(`/haj-umrah/packages/${id}/costing`, costingData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to add/update package costing');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      if (data?.data) {
        queryClient.setQueryData(packageKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: data?.message || 'প্যাকেজ খরচ সফলভাবে সংরক্ষণ করা হয়েছে।',
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

