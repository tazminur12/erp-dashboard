import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for lending transaction (matches backend structure)
export const normalizeLendingTransaction = (doc) => ({
  id: String(doc._id || doc.id || ''),
  familyMemberId: String(doc.familyMemberId || ''),
  type: doc.type || 'given', // 'given' or 'taken'
  amount: Number(doc.amount || 0),
  date: doc.date ? new Date(doc.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  description: doc.description || '',
  createdAt: doc.createdAt || null,
  updatedAt: doc.updatedAt || null,
});

export const useLendingTransactionQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  const useLendingTransactions = (memberId, filters = {}) => {
    return useQuery({
      queryKey: ['lending-transactions', memberId, filters],
      enabled: Boolean(memberId),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.type) params.append('type', filters.type);
        
        const queryString = params.toString();
        const url = `/api/personal/family-members/${memberId}/transactions${queryString ? `?${queryString}` : ''}`;
        const { data } = await axiosSecure.get(url);
        return {
          transactions: (data.data || []).map(normalizeLendingTransaction),
          summary: data.summary || { totalGiven: 0, totalTaken: 0, balance: 0 }
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const useCreateLendingTransaction = () => {
    return useMutation({
      mutationFn: async ({ memberId, ...transactionData }) => {
        const { data } = await axiosSecure.post(
          `/api/personal/family-members/${memberId}/transactions`,
          transactionData
        );
        return normalizeLendingTransaction(data.data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['lending-transactions', variables.memberId] });
      },
    });
  };

  const useUpdateLendingTransaction = () => {
    return useMutation({
      mutationFn: async ({ memberId, transactionId, ...updates }) => {
        const { data } = await axiosSecure.put(
          `/api/personal/family-members/${memberId}/transactions/${transactionId}`,
          updates
        );
        return normalizeLendingTransaction(data.data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['lending-transactions', variables.memberId] });
      },
    });
  };

  const useDeleteLendingTransaction = () => {
    return useMutation({
      mutationFn: async ({ memberId, transactionId }) => {
        await axiosSecure.delete(
          `/api/personal/family-members/${memberId}/transactions/${transactionId}`
        );
        return { transactionId, success: true };
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['lending-transactions', variables.memberId] });
      },
    });
  };

  return {
    useLendingTransactions,
    useCreateLendingTransaction,
    useUpdateLendingTransaction,
    useDeleteLendingTransaction,
  };
};

export default useLendingTransactionQueries;
