import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';

// Cache keys for loans
export const loanKeys = {
  all: ['loans'],
  lists: () => [...loanKeys.all, 'list'],
  list: (filters) => [...loanKeys.lists(), { filters }],
  giving: () => [...loanKeys.all, 'giving'],
  givingList: (filters) => [...loanKeys.giving(), 'list', { filters }],
  receiving: () => [...loanKeys.all, 'receiving'],
  receivingList: (filters) => [...loanKeys.receiving(), 'list', { filters }],
  details: () => [...loanKeys.all, 'detail'],
  detail: (loanId) => [...loanKeys.details(), loanId],
  dashboard: (filters) => [...loanKeys.all, 'dashboard-summary', { filters }],
};

// List all loans with optional filters: loanDirection, status
// Since backend doesn't have /loans endpoint, we fetch from both /loans/giving and /loans/receiving
export const useLoans = (filters = {}, page = 1, limit = 20, options = {}) => {
  const axiosSecure = useAxiosSecure();

  // Normalize filters - ensure it's always an object, not null
  const normalizedFilters = filters && typeof filters === 'object' ? filters : {};

  return useQuery({
    queryKey: loanKeys.list({ ...normalizedFilters, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (normalizedFilters.status) params.append('status', String(normalizedFilters.status));
      if (normalizedFilters.branchId) params.append('branchId', String(normalizedFilters.branchId));
      if (normalizedFilters.search) params.append('search', String(normalizedFilters.search));
      if (normalizedFilters.customerId) params.append('customerId', String(normalizedFilters.customerId));
      params.append('page', String(page));
      params.append('limit', String(Math.ceil(limit / 2))); // Split limit between giving and receiving
      
      const qs = params.toString();
      
      // Fetch both giving and receiving loans in parallel
      const [givingResponse, receivingResponse] = await Promise.all([
        axiosSecure.get(`/loans/giving?${qs}`).catch(() => ({ data: { success: true, loans: [], pagination: { page, limit: 0, total: 0, totalPages: 0 } } })),
        axiosSecure.get(`/loans/receiving?${qs}`).catch(() => ({ data: { success: true, loans: [], pagination: { page, limit: 0, total: 0, totalPages: 0 } } }))
      ]);
      
      const givingData = givingResponse?.data;
      const receivingData = receivingResponse?.data;
      
      const givingLoans = (givingData?.success && givingData?.loans) ? givingData.loans.map(loan => ({
        ...loan,
        loanDirection: 'giving',
        direction: 'giving'
      })) : [];
      
      const receivingLoans = (receivingData?.success && receivingData?.loans) ? receivingData.loans.map(loan => ({
        ...loan,
        loanDirection: 'receiving',
        direction: 'receiving'
      })) : [];
      
      // Combine loans and apply loanDirection filter if specified
      let allLoans = [...givingLoans, ...receivingLoans];
      if (normalizedFilters.loanDirection) {
        allLoans = allLoans.filter(loan => 
          (loan.loanDirection || loan.direction) === normalizedFilters.loanDirection
        );
      }
      
      // Apply search filter client-side if backend doesn't support it
      if (normalizedFilters.search && normalizedFilters.search.trim()) {
        const searchTerm = normalizedFilters.search.toLowerCase().trim();
        allLoans = allLoans.filter(loan => {
          const name = (loan.customerName || loan.borrowerName || loan.fullName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || '').toLowerCase();
          const id = (loan.loanId || loan.id || loan._id || '').toString().toLowerCase();
          return name.includes(searchTerm) || id.includes(searchTerm);
        });
      }
      
      // Combine pagination info
      const givingPagination = givingData?.pagination || { total: 0 };
      const receivingPagination = receivingData?.pagination || { total: 0 };
      const totalCount = givingPagination.total + receivingPagination.total;
      
      return {
        loans: allLoans,
        data: allLoans, // Also return as 'data' for compatibility
        pagination: {
          page,
          limit,
          total: allLoans.length,
          totalPages: Math.ceil(allLoans.length / limit)
        }
      };
    },
    enabled: options.enabled !== false && normalizedFilters !== null,
    staleTime: 5 * 60 * 1000,
  });
};

// List giving loans with pagination and search
export const useGivingLoans = (filters = {}, page = 1, limit = 20) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: loanKeys.givingList({ ...filters, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', String(filters.status));
      if (filters.branchId) params.append('branchId', String(filters.branchId));
      if (filters.search) params.append('search', String(filters.search));
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await axiosSecure.get(`/loans/giving?${params.toString()}`);
      const data = response?.data;
      if (data?.success) {
        return {
          loans: data.loans || [],
          pagination: data.pagination || { page, limit, total: 0, totalPages: 0 }
        };
      }
      throw new Error(data?.message || 'Failed to fetch giving loans');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// List receiving loans with pagination and search
export const useReceivingLoans = (filters = {}, page = 1, limit = 20) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: loanKeys.receivingList({ ...filters, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', String(filters.status));
      if (filters.branchId) params.append('branchId', String(filters.branchId));
      if (filters.search) params.append('search', String(filters.search));
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await axiosSecure.get(`/loans/receiving?${params.toString()}`);
      const data = response?.data;
      if (data?.success) {
        return {
          loans: data.loans || [],
          pagination: data.pagination || { page, limit, total: 0, totalPages: 0 }
        };
      }
      throw new Error(data?.message || 'Failed to fetch receiving loans');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch a single loan by loanId (works for both giving and receiving)
export const useLoan = (loanId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: loanKeys.detail(loanId),
    queryFn: async () => {
      if (!loanId) return null;
      const response = await axiosSecure.get(`/loans/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success && data?.loan) {
        return {
          loan: data.loan,
          success: true,
        };
      }
      return null;
    },
    enabled: !!loanId,
    staleTime: 0, // Always consider data stale to refetch on mount
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Fetch a single giving loan by loanId
export const useGivingLoan = (loanId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [...loanKeys.giving(), 'detail', loanId],
    queryFn: async () => {
      if (!loanId) return null;
      const response = await axiosSecure.get(`/loans/giving/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success && data?.loan) {
        return {
          loan: data.loan,
          success: true,
        };
      }
      return null;
    },
    enabled: !!loanId,
    staleTime: 0, // Always consider data stale to refetch on mount
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Fetch a single receiving loan by loanId
export const useReceivingLoan = (loanId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [...loanKeys.receiving(), 'detail', loanId],
    queryFn: async () => {
      if (!loanId) return null;
      const response = await axiosSecure.get(`/loans/receiving/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success && data?.loan) {
        return {
          loan: data.loan,
          success: true,
        };
      }
      return null;
    },
    enabled: !!loanId,
    staleTime: 0, // Always consider data stale to refetch on mount
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Loan dashboard summary (volume + profit/loss)
// API: GET /loans/dashboard/summary
export const useLoanDashboardSummary = (filters = {}) => {
  const axiosSecure = useAxiosSecure();

  // Remove empty filters so backend receives only meaningful params
  const cleaned = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

  return useQuery({
    queryKey: loanKeys.dashboard(cleaned),
    queryFn: async () => {
      const response = await axiosSecure.get('/loans/dashboard/summary', { params: cleaned });
      if (response?.data?.success) {
        return response.data.data;
      }
      throw new Error(response?.data?.message || 'Failed to load loan dashboard summary');
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Create loan (giving)
export const useCreateGivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.post('/loans/giving', payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create giving loan');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.giving() });
      if (data?.id || data?.loan?.loanId) {
        const loanId = data?.id || data?.loan?.loanId;
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) });
      }
    },
  });
};

// Create loan (receiving)
export const useCreateReceivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.post('/loans/receiving', payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create receiving loan');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.receiving() });
      if (data?.id || data?.loan?.loanId) {
        const loanId = data?.id || data?.loan?.loanId;
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) });
      }
    },
  });
};

// Update loan by loanId (generic - works for both giving and receiving)
export const useUpdateLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, payload }) => {
      if (!loanId) throw new Error('loanId is required');
      const response = await axiosSecure.put(`/loans/${encodeURIComponent(loanId)}`, payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update loan');
    },
    onSuccess: (data, variables) => {
      // Refresh lists and detail
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.giving() });
      queryClient.invalidateQueries({ queryKey: loanKeys.receiving() });
      if (variables?.loanId) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      }
    }
  });
};

// Update giving loan by loanId
export const useUpdateGivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, payload }) => {
      if (!loanId) throw new Error('loanId is required');
      const response = await axiosSecure.put(`/loans/giving/${encodeURIComponent(loanId)}`, payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update giving loan');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.giving() });
      if (variables?.loanId) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
        queryClient.invalidateQueries({ queryKey: [...loanKeys.giving(), 'detail', variables.loanId] });
      }
    }
  });
};

// Update receiving loan by loanId
export const useUpdateReceivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, payload }) => {
      if (!loanId) throw new Error('loanId is required');
      const response = await axiosSecure.put(`/loans/receiving/${encodeURIComponent(loanId)}`, payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update receiving loan');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.receiving() });
      if (variables?.loanId) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
        queryClient.invalidateQueries({ queryKey: [...loanKeys.receiving(), 'detail', variables.loanId] });
      }
    }
  });
};

// Delete loan by loanId (soft delete - generic)
export const useDeleteLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId) => {
      const response = await axiosSecure.delete(`/loans/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete loan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.giving() });
      queryClient.invalidateQueries({ queryKey: loanKeys.receiving() });
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
};

// Delete giving loan by loanId (soft delete)
export const useDeleteGivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId) => {
      const response = await axiosSecure.delete(`/loans/giving/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete giving loan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.giving() });
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
};

// Delete receiving loan by loanId (soft delete)
export const useDeleteReceivingLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId) => {
      const response = await axiosSecure.delete(`/loans/receiving/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete receiving loan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.receiving() });
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
};

export default {
  loanKeys,
  useLoans,
  useGivingLoans,
  useReceivingLoans,
  useLoan,
  useGivingLoan,
  useReceivingLoan,
  useCreateGivingLoan,
  useCreateReceivingLoan,
  useUpdateLoan,
  useUpdateGivingLoan,
  useUpdateReceivingLoan,
  useDeleteLoan,
  useDeleteGivingLoan,
  useDeleteReceivingLoan,
  useLoanDashboardSummary,
};
