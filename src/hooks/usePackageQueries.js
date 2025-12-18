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
  const profitLossFromApi = pkg.profitLoss || {};
  const assignedCounts = pkg.assignedPassengerCounts || { adult: 0, child: 0, infant: 0 };
  const totals = pkg.totals || {};
  
  // Use backend calculated values if available
  const totalOriginalPrice = toNumeric(profitLossFromApi.totalOriginalPrice) ?? 0;
  const totalCostingPrice = toNumeric(profitLossFromApi.totalCostingPrice) ?? 0;
  const profitOrLoss = toNumeric(profitLossFromApi.profitOrLoss) ?? (totalOriginalPrice - totalCostingPrice);
  
  // Get per-passenger-type data from backend
  const originalPrices = profitLossFromApi.originalPrices || totals.passengerTotals || { adult: 0, child: 0, infant: 0 };
  const costingPrices = profitLossFromApi.costingPrices || totals.costingPassengerTotals || { adult: 0, child: 0, infant: 0 };
  const passengerOriginalTotals = profitLossFromApi.passengerOriginalTotals || {
    adult: (assignedCounts.adult || 0) * (toNumeric(originalPrices.adult) || 0),
    child: (assignedCounts.child || 0) * (toNumeric(originalPrices.child) || 0),
    infant: (assignedCounts.infant || 0) * (toNumeric(originalPrices.infant) || 0)
  };
  const passengerCostingTotals = profitLossFromApi.passengerCostingTotals || {
    adult: (assignedCounts.adult || 0) * (toNumeric(costingPrices.adult) || 0),
    child: (assignedCounts.child || 0) * (toNumeric(costingPrices.child) || 0),
    infant: (assignedCounts.infant || 0) * (toNumeric(costingPrices.infant) || 0)
  };
  const passengerProfit = profitLossFromApi.passengerProfit || {
    adult: (toNumeric(passengerOriginalTotals.adult) || 0) - (toNumeric(passengerCostingTotals.adult) || 0),
    child: (toNumeric(passengerOriginalTotals.child) || 0) - (toNumeric(passengerCostingTotals.child) || 0),
    infant: (toNumeric(passengerOriginalTotals.infant) || 0) - (toNumeric(passengerCostingTotals.infant) || 0)
  };

  const percentage = totalOriginalPrice ? (profitOrLoss / totalOriginalPrice) * 100 : 0;

  return {
    totalCostingPrice,
    totalOriginalPrice,
    profitOrLoss,
    profitLossPercentage: percentage,
    isProfit: profitOrLoss > 0,
    isLoss: profitOrLoss < 0,
    assignedPassengerCounts: assignedCounts,
    originalPrices: {
      adult: toNumeric(originalPrices.adult) || 0,
      child: toNumeric(originalPrices.child) || 0,
      infant: toNumeric(originalPrices.infant) || 0
    },
    costingPrices: {
      adult: toNumeric(costingPrices.adult) || 0,
      child: toNumeric(costingPrices.child) || 0,
      infant: toNumeric(costingPrices.infant) || 0
    },
    passengerOriginalTotals: {
      adult: toNumeric(passengerOriginalTotals.adult) || 0,
      child: toNumeric(passengerOriginalTotals.child) || 0,
      infant: toNumeric(passengerOriginalTotals.infant) || 0
    },
    passengerCostingTotals: {
      adult: toNumeric(passengerCostingTotals.adult) || 0,
      child: toNumeric(passengerCostingTotals.child) || 0,
      infant: toNumeric(passengerCostingTotals.infant) || 0
    },
    passengerProfit: {
      adult: toNumeric(passengerProfit.adult) || 0,
      child: toNumeric(passengerProfit.child) || 0,
      infant: toNumeric(passengerProfit.infant) || 0
    }
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
  const { year, month, type, customPackageType, status, limit = 50, page = 1 } = filters;

  return useQuery({
    queryKey: packageKeys.list({ year, month, type, customPackageType, status, limit, page }),
    queryFn: async () => {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (type) params.type = type;
      if (customPackageType) params.customPackageType = customPackageType;
      if (status) params.status = status;
      params.limit = limit;
      params.page = page;

      const response = await axiosSecure.get('/haj-umrah/packages', { params });
      const data = response?.data;
      if (data?.success) {
        // Normalize packages to ensure passengerTotals structure exists
        const normalizedPackages = (data.data || []).map(pkg => ({
          ...pkg,
          totals: normalizePassengerTotals(pkg.totals),
          assignedPassengerCounts: pkg.assignedPassengerCounts || {
            adult: 0,
            child: 0,
            infant: 0
          }
        }));
        return {
          ...data,
          data: normalizedPackages
        };
      }
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
        
        // Backend returns profitLoss object with all calculated values
        // Use it directly if available, otherwise normalize it
        const profitLossData = pkg.profitLoss ? {
          totalCostingPrice: toNumeric(pkg.profitLoss.totalCostingPrice) || 0,
          totalOriginalPrice: toNumeric(pkg.profitLoss.totalOriginalPrice) || 0,
          profitOrLoss: toNumeric(pkg.profitLoss.profitOrLoss) || 0,
          profitLossPercentage: pkg.profitLoss.totalOriginalPrice 
            ? ((toNumeric(pkg.profitLoss.profitOrLoss) || 0) / (toNumeric(pkg.profitLoss.totalOriginalPrice) || 1)) * 100 
            : 0,
          isProfit: (toNumeric(pkg.profitLoss.profitOrLoss) || 0) > 0,
          isLoss: (toNumeric(pkg.profitLoss.profitOrLoss) || 0) < 0,
          assignedPassengerCounts: pkg.profitLoss.assignedPassengerCounts || {
            adult: 0,
            child: 0,
            infant: 0
          },
          originalPrices: {
            adult: toNumeric(pkg.profitLoss.originalPrices?.adult) || 0,
            child: toNumeric(pkg.profitLoss.originalPrices?.child) || 0,
            infant: toNumeric(pkg.profitLoss.originalPrices?.infant) || 0
          },
          costingPrices: {
            adult: toNumeric(pkg.profitLoss.costingPrices?.adult) || 0,
            child: toNumeric(pkg.profitLoss.costingPrices?.child) || 0,
            infant: toNumeric(pkg.profitLoss.costingPrices?.infant) || 0
          },
          passengerOriginalTotals: {
            adult: toNumeric(pkg.profitLoss.passengerOriginalTotals?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerOriginalTotals?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerOriginalTotals?.infant) || 0
          },
          passengerCostingTotals: {
            adult: toNumeric(pkg.profitLoss.passengerCostingTotals?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerCostingTotals?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerCostingTotals?.infant) || 0
          },
          passengerProfit: {
            adult: toNumeric(pkg.profitLoss.passengerProfit?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerProfit?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerProfit?.infant) || 0
          }
        } : normalizeProfitLoss(pkg);
        
        return {
          ...pkg,
          totals: normalizePassengerTotals(pkg.totals),
          assignedPassengerCounts: pkg.assignedPassengerCounts || {
            adult: 0,
            child: 0,
            infant: 0
          },
          profitLoss: profitLossData,
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
      // Normalize package data to match backend expectations
      const normalizedData = {
        packageName: String(packageData.packageName || ''),
        packageYear: String(packageData.packageYear || ''),
        packageMonth: packageData.packageMonth || '',
        packageType: packageData.packageType || 'Regular',
        customPackageType: packageData.customPackageType || '',
        sarToBdtRate: parseFloat(packageData.sarToBdtRate) || 0,
        notes: packageData.notes || '',
        status: packageData.status || 'Active',
        costs: packageData.costs || {},
        totals: packageData.totals || {},
      };

      // Handle totalPrice - optional field, only set if provided
      if (packageData.totalPrice !== undefined && packageData.totalPrice !== null && packageData.totalPrice !== '') {
        normalizedData.totalPrice = Number((parseFloat(packageData.totalPrice) || 0).toFixed(2));
      }

      // Ensure totals.passengerTotals structure exists and is properly formatted
      // Passenger totals are stored separately: adult, child, infant
      if (!normalizedData.totals.passengerTotals) {
        normalizedData.totals.passengerTotals = {
          adult: 0,
          child: 0,
          infant: 0
        };
      } else {
        // Ensure all three passenger types are present and properly formatted
        normalizedData.totals.passengerTotals = {
          adult: Number((parseFloat(normalizedData.totals.passengerTotals.adult) || 0).toFixed(2)),
          child: Number((parseFloat(normalizedData.totals.passengerTotals.child) || 0).toFixed(2)),
          infant: Number((parseFloat(normalizedData.totals.passengerTotals.infant) || 0).toFixed(2))
        };
      }

      const response = await axiosSecure.post('/haj-umrah/packages', normalizedData);
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
      // Ensure totalPrice is not sent in costing update (backend explicitly ignores it)
      const { totalPrice, ...dataWithoutTotalPrice } = costingData;
      
      const response = await axiosSecure.post(`/haj-umrah/packages/${id}/costing`, dataWithoutTotalPrice);
      const data = response?.data;
      if (data?.success) {
        const pkg = data?.data || {};
        
        // Backend returns profitLoss object with all calculated values
        // Normalize it similar to usePackage hook
        const profitLossData = pkg.profitLoss ? {
          totalCostingPrice: toNumeric(pkg.profitLoss.totalCostingPrice) || 0,
          totalOriginalPrice: toNumeric(pkg.profitLoss.totalOriginalPrice) || 0,
          profitOrLoss: toNumeric(pkg.profitLoss.profitOrLoss) || 0,
          profitLossPercentage: pkg.profitLoss.totalOriginalPrice 
            ? ((toNumeric(pkg.profitLoss.profitOrLoss) || 0) / (toNumeric(pkg.profitLoss.totalOriginalPrice) || 1)) * 100 
            : 0,
          isProfit: (toNumeric(pkg.profitLoss.profitOrLoss) || 0) > 0,
          isLoss: (toNumeric(pkg.profitLoss.profitOrLoss) || 0) < 0,
          assignedPassengerCounts: pkg.profitLoss.assignedPassengerCounts || {
            adult: 0,
            child: 0,
            infant: 0
          },
          originalPrices: {
            adult: toNumeric(pkg.profitLoss.originalPrices?.adult) || 0,
            child: toNumeric(pkg.profitLoss.originalPrices?.child) || 0,
            infant: toNumeric(pkg.profitLoss.originalPrices?.infant) || 0
          },
          costingPrices: {
            adult: toNumeric(pkg.profitLoss.costingPrices?.adult) || 0,
            child: toNumeric(pkg.profitLoss.costingPrices?.child) || 0,
            infant: toNumeric(pkg.profitLoss.costingPrices?.infant) || 0
          },
          passengerOriginalTotals: {
            adult: toNumeric(pkg.profitLoss.passengerOriginalTotals?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerOriginalTotals?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerOriginalTotals?.infant) || 0
          },
          passengerCostingTotals: {
            adult: toNumeric(pkg.profitLoss.passengerCostingTotals?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerCostingTotals?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerCostingTotals?.infant) || 0
          },
          passengerProfit: {
            adult: toNumeric(pkg.profitLoss.passengerProfit?.adult) || 0,
            child: toNumeric(pkg.profitLoss.passengerProfit?.child) || 0,
            infant: toNumeric(pkg.profitLoss.passengerProfit?.infant) || 0
          }
        } : normalizeProfitLoss(pkg);
        
        // Return normalized package data
        return {
          ...data,
          data: {
            ...pkg,
            totals: normalizePassengerTotals(pkg.totals),
            assignedPassengerCounts: pkg.assignedPassengerCounts || {
              adult: 0,
              child: 0,
              infant: 0
            },
            profitLoss: profitLossData
          }
        };
      }
      throw new Error(data?.message || 'Failed to add/update package costing');
    },
    onSuccess: (data, { id }) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      
      // Update the cache with the normalized response data
      if (data?.data) {
        queryClient.setQueryData(packageKeys.detail(id), (oldData) => {
          // Merge with existing data if available, otherwise use new data
          return data.data;
        });
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

