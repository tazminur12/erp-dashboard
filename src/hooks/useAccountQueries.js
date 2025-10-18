import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

export const useAccountQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Get all bank accounts with optional filters
  const useBankAccounts = (filters = {}) => {
    return useQuery({
      queryKey: ['bankAccounts', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.accountType) params.append('accountType', filters.accountType);
        if (filters.currency) params.append('currency', filters.currency);
        if (filters.search) params.append('search', filters.search);
        
        const queryString = params.toString();
        const url = queryString ? `/bank-accounts?${queryString}` : '/bank-accounts';
        const response = await axiosSecure.get(url);
        return response.data?.data || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get bank account statistics
  const useBankAccountStats = () => {
    return useQuery({
      queryKey: ['bankAccountStats'],
      queryFn: async () => {
        const response = await axiosSecure.get('/bank-accounts/stats/overview');
        return response.data?.data || {};
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single bank account
  const useBankAccount = (id) => {
    return useQuery({
      queryKey: ['bankAccount', id],
      queryFn: async () => {
        const response = await axiosSecure.get(`/bank-accounts/${id}`);
        return response.data?.data;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create bank account mutation
  const useCreateBankAccount = () => {
    return useMutation({
      mutationFn: async (bankData) => {
        const response = await axiosSecure.post('/bank-accounts', bankData);
        return response.data?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
      },
    });
  };

  // Update bank account mutation
  const useUpdateBankAccount = () => {
    return useMutation({
      mutationFn: async ({ id, ...bankData }) => {
        const response = await axiosSecure.patch(`/bank-accounts/${id}`, bankData);
        return response.data?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
      },
    });
  };

  // Delete bank account mutation
  const useDeleteBankAccount = () => {
    return useMutation({
      mutationFn: async (id) => {
        await axiosSecure.delete(`/bank-accounts/${id}`);
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
      },
    });
  };

  // Adjust bank account balance mutation
  const useAdjustBankAccountBalance = () => {
    return useMutation({
      mutationFn: async ({ id, amount, type, note, createdBy, branchId }) => {
        const response = await axiosSecure.post(`/bank-accounts/${id}/adjust-balance`, {
          amount: parseFloat(amount),
          type,
          note,
          createdBy,
          branchId,
        });
        return response.data?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
      },
    });
  };

  // Get bank account transaction history
  const useBankAccountTransactions = (id, options = {}) => {
    return useQuery({
      queryKey: ['bankAccountTransactions', id, options],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);
        if (options.type) params.append('type', options.type);
        if (options.startDate) params.append('startDate', options.startDate);
        if (options.endDate) params.append('endDate', options.endDate);
        
        const queryString = params.toString();
        const url = queryString ? `/bank-accounts/${id}/transactions?${queryString}` : `/bank-accounts/${id}/transactions`;
        const response = await axiosSecure.get(url);
        return response.data?.data || { transactions: [], pagination: {} };
      },
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Create bank account transaction mutation
  const useCreateBankAccountTransaction = () => {
    return useMutation({
      mutationFn: async ({ id, transactionType, amount, description, reference, createdBy, branchId, notes }) => {
        const response = await axiosSecure.post(`/bank-accounts/${id}/transactions`, {
          transactionType,
          amount: parseFloat(amount),
          description,
          reference,
          createdBy,
          branchId,
          notes,
        });
        return response.data?.data;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
        queryClient.invalidateQueries(['bankAccountTransactions', variables.id]);
      },
    });
  };

  return {
    useBankAccounts,
    useBankAccountStats,
    useBankAccount,
    useCreateBankAccount,
    useUpdateBankAccount,
    useDeleteBankAccount,
    useAdjustBankAccountBalance,
    useBankAccountTransactions,
    useCreateBankAccountTransaction,
  };
};

export default useAccountQueries;
