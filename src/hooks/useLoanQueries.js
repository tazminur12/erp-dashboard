import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const loanKeys = {
  all: ['loans'],
  lists: () => [...loanKeys.all, 'list'],
  list: (filters) => [...loanKeys.lists(), { filters }],
  details: () => [...loanKeys.all, 'detail'],
  detail: (id) => [...loanKeys.details(), id],
  dashboard: () => [...loanKeys.all, 'dashboard'],
};

// Hook to fetch all loans with filters
export const useLoans = (filters = {}, page = 1, limit = 20, includeTransactionCount = false) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: loanKeys.list({ ...filters, page, limit, includeTransactionCount }),
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters.loanDirection) params.append('loanDirection', filters.loanDirection);
      if (filters.status) params.append('status', filters.status);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      if (includeTransactionCount) params.append('includeTransactionCount', 'true');

      const response = await axiosSecure.get(`/loans?${params.toString()}`);

      if (response.data?.success) {
        return {
          loans: response.data.loans || [],
          count: response.data.count || 0,
          totalCount: response.data.totalCount || 0,
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages || 0
        };
      }
      throw new Error(response.data?.message || 'Failed to load loans');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch a single loan by ID with transaction summary
export const useLoan = (loanId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: loanKeys.detail(loanId),
    queryFn: async () => {
      if (!loanId) return null;
      
      const response = await axiosSecure.get(`/loans/${loanId}`);
      
      if (response.data?.success) {
        return {
          loan: response.data.loan,
          transactionSummary: response.data.transactionSummary || {
            count: 0,
            totalPaid: 0,
            totalReceived: 0,
            transactions: []
          }
        };
      }
      throw new Error(response.data?.message || 'Failed to load loan');
    },
    enabled: !!loanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation to create a new loan giving
export const useCreateLoanGiving = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanData) => {
      const response = await axiosSecure.post('/loans/giving', loanData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create loan');
      }
    },
    onSuccess: () => {
      // Invalidate loan lists and transactions
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
    },
    onError: (error) => {
      console.error('Loan creation error:', error);
    },
  });
};

// Mutation to create a new loan receiving (application)
export const useCreateLoanReceiving = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanData) => {
      const response = await axiosSecure.post('/loans/receiving', loanData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create loan application');
      }
    },
    onSuccess: () => {
      // Invalidate loan lists and transactions
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
    },
    onError: (error) => {
      console.error('Loan application error:', error);
    },
  });
};

// Hook to fetch loan dashboard stats
export const useLoanDashboard = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: loanKeys.dashboard(),
    queryFn: async () => {
      // For now, calculate stats from loans list
      const { data } = await axiosSecure.get('/loans?limit=1000');
      
      if (data?.success) {
        const allLoans = data.loans || [];
        
        const stats = {
          totalGiving: allLoans
            .filter(l => l.loanDirection === 'giving')
            .reduce((sum, l) => sum + (l.amount || 0), 0),
          totalReceiving: allLoans
            .filter(l => l.loanDirection === 'receiving')
            .reduce((sum, l) => sum + (l.amount || 0), 0),
          activeLoans: allLoans.filter(l => l.status === 'Active').length,
          overdueLoans: allLoans.filter(l => l.status === 'Overdue').length,
          completedLoans: allLoans.filter(l => l.status === 'Completed').length,
          totalInterest: 0, // Calculate from interest rate and duration
          monthlyGiving: 0, // Calculate for current month
          monthlyReceiving: 0 // Calculate for current month
        };
        
        return stats;
      }
      throw new Error('Failed to fetch loan dashboard data');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation to update loan status
export const useUpdateLoanStatus = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, status }) => {
      const response = await axiosSecure.patch(`/loans/${loanId}/status`, { status });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update loan status');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      
      // If approved, invalidate bank accounts (transaction will be created)
      if (variables.status === 'Active') {
        queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
        queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
      }
    },
  });
};

// Mutation to approve loan receiving
export const useApproveLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, targetAccountId, approvedBy, notes }) => {
      const response = await axiosSecure.patch(`/loans/${loanId}/approve`, {
        targetAccountId,
        approvedBy,
        notes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to approve loan');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Mutation to reject loan application
export const useRejectLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, rejectionReason, rejectedBy, notes }) => {
      const response = await axiosSecure.patch(`/loans/${loanId}/reject`, {
        rejectionReason,
        rejectedBy,
        notes
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to reject loan');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
    },
  });
};

// Mutation to record loan payment (for Loan Giving)
export const useRecordLoanPayment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, paymentData }) => {
      const response = await axiosSecure.post(`/loans/${loanId}/payment`, paymentData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to record payment');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Mutation to record loan repayment (for Loan Receiving)
export const useRecordLoanRepayment = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, repaymentData }) => {
      const response = await axiosSecure.post(`/loans/${loanId}/repayment`, repaymentData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to record repayment');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccountStats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Mutation to update loan details
export const useUpdateLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, data }) => {
      const response = await axiosSecure.patch(`/loans/${loanId}`, data);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update loan');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
    },
  });
};

// Mutation to delete a loan
export const useDeleteLoan = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanId) => {
      const response = await axiosSecure.delete(`/loans/${loanId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete loan');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.dashboard() });
    },
  });
};

export default {
  useLoans,
  useLoan,
  useCreateLoanGiving,
  useCreateLoanReceiving,
  useLoanDashboard,
  useUpdateLoanStatus,
  useApproveLoan,
  useRejectLoan,
  useRecordLoanPayment,
  useRecordLoanRepayment,
  useUpdateLoan,
  useDeleteLoan,
};

