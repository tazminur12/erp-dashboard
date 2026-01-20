import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';

// Cache keys for IATA & Airlines Capping investments
export const iataAirlinesCappingKeys = {
  all: ['iataAirlinesCapping'],
  lists: () => [...iataAirlinesCappingKeys.all, 'list'],
  list: (filters) => [...iataAirlinesCappingKeys.lists(), { filters }],
  details: () => [...iataAirlinesCappingKeys.all, 'detail'],
  detail: (id) => [...iataAirlinesCappingKeys.details(), id],
};

// Cache keys for Others Invest
export const othersInvestKeys = {
  all: ['othersInvest'],
  lists: () => [...othersInvestKeys.all, 'list'],
  list: (filters) => [...othersInvestKeys.lists(), { filters }],
  details: () => [...othersInvestKeys.all, 'detail'],
  detail: (id) => [...othersInvestKeys.details(), id],
};

// ==================== IATA & AIRLINES CAPPING INVESTMENTS ====================

// Get all IATA & Airlines Capping investments with filters and pagination
export const useIATAAirlinesCappingInvestments = (filters = {}) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: iataAirlinesCappingKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.q) params.append('q', String(filters.q));
      if (filters.search) params.append('q', String(filters.search));
      if (filters.investmentType) params.append('investmentType', String(filters.investmentType));
      if (filters.status) params.append('status', String(filters.status));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));
      if (filters.maturityDateFrom) params.append('maturityDateFrom', String(filters.maturityDateFrom));
      if (filters.maturityDateTo) params.append('maturityDateTo', String(filters.maturityDateTo));

      const queryString = params.toString();
      const url = queryString 
        ? `/api/investments/iata-airlines-capping?${queryString}` 
        : '/api/investments/iata-airlines-capping';
      
      const response = await axiosSecure.get(url);
      
      if (response.data?.success) {
        return {
          data: response.data.data || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          }
        };
      }
      
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single IATA & Airlines Capping investment by ID
export const useIATAAirlinesCappingInvestment = (id) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: iataAirlinesCappingKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      
      const response = await axiosSecure.get(`/api/investments/iata-airlines-capping/${id}`);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to fetch investment');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Create IATA & Airlines Capping investment mutation
export const useCreateIATAAirlinesCappingInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investmentData) => {
      const response = await axiosSecure.post('/api/investments/iata-airlines-capping', investmentData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to create investment');
    },
    onSuccess: () => {
      // Invalidate and refetch investments list
      queryClient.invalidateQueries({ queryKey: iataAirlinesCappingKeys.lists() });
    },
  });
};

// Update IATA & Airlines Capping investment mutation
export const useUpdateIATAAirlinesCappingInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await axiosSecure.put(`/api/investments/iata-airlines-capping/${id}`, updateData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to update investment');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch investments list and detail
      queryClient.invalidateQueries({ queryKey: iataAirlinesCappingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: iataAirlinesCappingKeys.detail(variables.id) });
    },
  });
};

// Delete IATA & Airlines Capping investment mutation
export const useDeleteIATAAirlinesCappingInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/api/investments/iata-airlines-capping/${id}`);
      
      if (response.data?.success) {
        return response.data;
      }
      
      throw new Error(response.data?.message || 'Failed to delete investment');
    },
    onSuccess: () => {
      // Invalidate and refetch investments list
      queryClient.invalidateQueries({ queryKey: iataAirlinesCappingKeys.lists() });
    },
  });
};

// ==================== OTHERS INVEST ====================

// Get all Others Invest investments with filters and pagination
export const useOthersInvestInvestments = (filters = {}) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: othersInvestKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.q) params.append('q', String(filters.q));
      if (filters.search) params.append('q', String(filters.search));
      if (filters.investmentType) params.append('investmentType', String(filters.investmentType));
      if (filters.status) params.append('status', String(filters.status));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));
      if (filters.maturityDateFrom) params.append('maturityDateFrom', String(filters.maturityDateFrom));
      if (filters.maturityDateTo) params.append('maturityDateTo', String(filters.maturityDateTo));

      const queryString = params.toString();
      const url = queryString 
        ? `/api/investments/others-invest?${queryString}` 
        : '/api/investments/others-invest';
      
      const response = await axiosSecure.get(url);
      
      if (response.data?.success) {
        return {
          data: response.data.data || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          }
        };
      }
      
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single Others Invest investment by ID
export const useOthersInvestInvestment = (id) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: othersInvestKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      
      const response = await axiosSecure.get(`/api/investments/others-invest/${id}`);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to fetch investment');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Create Others Invest investment mutation
export const useCreateOthersInvestInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investmentData) => {
      const response = await axiosSecure.post('/api/investments/others-invest', investmentData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to create investment');
    },
    onSuccess: () => {
      // Invalidate and refetch investments list
      queryClient.invalidateQueries({ queryKey: othersInvestKeys.lists() });
    },
  });
};

// Update Others Invest investment mutation
export const useUpdateOthersInvestInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await axiosSecure.put(`/api/investments/others-invest/${id}`, updateData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to update investment');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch investments list and detail
      queryClient.invalidateQueries({ queryKey: othersInvestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: othersInvestKeys.detail(variables.id) });
    },
  });
};

// Delete Others Invest investment mutation
export const useDeleteOthersInvestInvestment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/api/investments/others-invest/${id}`);
      
      if (response.data?.success) {
        return response.data;
      }
      
      throw new Error(response.data?.message || 'Failed to delete investment');
    },
    onSuccess: () => {
      // Invalidate and refetch investments list
      queryClient.invalidateQueries({ queryKey: othersInvestKeys.lists() });
    },
  });
};

// Export all hooks as a single object for convenience
export const useInvestmentQueries = () => {
  return {
    // IATA & Airlines Capping
    useIATAAirlinesCappingInvestments,
    useIATAAirlinesCappingInvestment,
    useCreateIATAAirlinesCappingInvestment,
    useUpdateIATAAirlinesCappingInvestment,
    useDeleteIATAAirlinesCappingInvestment,
    // Others Invest
    useOthersInvestInvestments,
    useOthersInvestInvestment,
    useCreateOthersInvestInvestment,
    useUpdateOthersInvestInvestment,
    useDeleteOthersInvestInvestment,
  };
};
