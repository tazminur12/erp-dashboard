import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';

// Cache keys for loans
export const loanKeys = {
  all: ['loans'],
  lists: () => [...loanKeys.all, 'list'],
  list: (filters) => [...loanKeys.lists(), { filters }],
  details: () => [...loanKeys.all, 'detail'],
  detail: (loanId) => [...loanKeys.details(), loanId],
};

// List loans with optional filters: loanDirection, status
export const useLoans = (filters = {}, page = 1, limit = 20) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: loanKeys.list({ ...filters, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.loanDirection) params.append('loanDirection', String(filters.loanDirection));
      if (filters.status) params.append('status', String(filters.status));
      // Allow filtering by customerId if backend supports it
      if (filters.customerId) params.append('customerId', String(filters.customerId));
      if (filters.search) params.append('search', String(filters.search));
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));

      const qs = params.toString();
      const url = qs ? `/loans?${qs}` : '/loans';
      const response = await axiosSecure.get(url);
      const data = response?.data;
      // Normalize common response shapes
      if (data?.success) return data;
      if (Array.isArray(data)) return { loans: data };
      if (Array.isArray(data?.loans)) return data;
      return { loans: [] };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch a single loan by loanId
export const useLoan = (loanId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: loanKeys.detail(loanId),
    queryFn: async () => {
      if (!loanId) return null;
      const response = await axiosSecure.get(`/loans/${encodeURIComponent(loanId)}`);
      const data = response?.data;
      // Normalize and ensure new computed totals are always present
      const loan = data?.loan ?? data ?? null;
      if (!loan) return null;
      const totalAmount = Number(loan.totalAmount ?? loan.amount ?? 0) || 0;
      const paidAmount = Number(loan.paidAmount ?? 0) || 0;
      const totalDue = Number(loan.totalDue ?? Math.max(0, totalAmount - paidAmount)) || 0;
      return {
        loan: {
          ...loan,
          totalAmount,
          paidAmount,
          totalDue,
        },
        success: true,
      };
    },
    enabled: !!loanId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
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
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.id) });
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
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(data.id) });
      }
    },
  });
};

// Update loan by loanId or _id
export const useUpdateLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, payload }) => {
      if (!loanId) throw new Error('loanId is required');
      const response = await axiosSecure.put(`/loans/${encodeURIComponent(loanId)}`, payload);
      const data = response?.data;
      if (data?.success) return data;
      return data;
    },
    onSuccess: (data, variables) => {
      // Refresh lists and detail
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      if (variables?.loanId) {
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      }
    }
  });
};

export default {
  loanKeys,
  useLoans,
  useLoan,
  useCreateGivingLoan,
  useCreateReceivingLoan,
  useUpdateLoan,
};


