import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

export const useAccountQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Utility functions - defined early for use in mutations
  const getAccountCategories = () => {
    return ['cash', 'bank', 'mobile_banking', 'check', 'others'];
  };

  const validateAccountCategory = (category) => {
    const validCategories = getAccountCategories();
    return validCategories.includes(category);
  };

  const validateContactNumber = (contactNumber) => {
    if (!contactNumber) return true; // Optional field
    return /^[\+]?[0-9\s\-\(\)]+$/.test(contactNumber);
  };

  // Get all bank accounts with optional filters
  const useBankAccounts = (filters = {}) => {
    return useQuery({
      queryKey: ['bankAccounts', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.accountType) params.append('accountType', filters.accountType);
        if (filters.accountCategory) params.append('accountCategory', filters.accountCategory);
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
        try {
          const response = await axiosSecure.get(`/bank-accounts/${id}`);
          return response.data?.data;
        } catch (error) {
          console.error('Error fetching bank account:', error);
          // If specific account fails, try to get from the list
          if (error.response?.status === 404) {
            try {
              const listResponse = await axiosSecure.get('/bank-accounts');
              const accounts = listResponse.data?.data || [];
              const account = accounts.find(acc => acc._id === id);
              if (account) {
                console.log('Found account in list:', account);
                return account;
              }
            } catch (listError) {
              console.error('Error fetching bank accounts list:', listError);
            }
          }
          throw error;
        }
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on 404 errors
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    });
  };

  // Create bank account mutation
  const useCreateBankAccount = () => {
    return useMutation({
      mutationFn: async (bankData) => {
        // Ensure required fields are included with defaults
        const dataToSend = {
          accountCategory: 'bank', // Default value
          currency: 'BDT', // Default value
          ...bankData
        };
        
        const response = await axiosSecure.post('/bank-accounts', dataToSend);
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
        // Validate and prepare data before sending
        const dataToSend = { ...bankData };
        
        // Validate initial balance if provided
        if (dataToSend.initialBalance !== undefined) {
          const numeric = Number(dataToSend.initialBalance);
          if (!Number.isFinite(numeric) || numeric < 0) {
            throw new Error("Invalid initialBalance");
          }
          dataToSend.initialBalance = numeric;
        }

        // Validate account category if provided
        if (dataToSend.accountCategory && !validateAccountCategory(dataToSend.accountCategory)) {
          throw new Error("Invalid account category");
        }

        // Validate contact number format if provided
        if (dataToSend.contactNumber && !validateContactNumber(dataToSend.contactNumber)) {
          throw new Error("Invalid contact number format");
        }

        const response = await axiosSecure.put(`/bank-accounts/${id}`, dataToSend);
        
        // Handle the case where backend returns error but still updates data
        if (response.data?.success === false) {
          console.log('Backend returned error:', response.data?.error);
          
          // If we get "Bank account not found" error, try to fetch from list
          if (response.data?.error === "Bank account not found") {
            try {
              const listResponse = await axiosSecure.get('/bank-accounts');
              const accounts = listResponse.data?.data || [];
              const account = accounts.find(acc => acc._id === id);
              if (account) {
                console.log('Found updated account in list:', account);
                return account;
              }
            } catch (listError) {
              console.error('Error fetching bank accounts list:', listError);
            }
          }
          
          // If still no data, throw the original error
          throw new Error(response.data?.error || 'Update failed');
        }
        
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

  // Transfer between two bank accounts
  const useTransferBetweenAccounts = () => {
    return useMutation({
      mutationFn: async ({ fromAccountId, toAccountId, amount, reference, notes, createdBy, branchId, accountManager }) => {
        const response = await axiosSecure.post('/bank-accounts/transfers', {
          fromAccountId,
          toAccountId,
          amount: parseFloat(amount),
          reference,
          notes,
          createdBy,
          branchId,
          accountManager,
          transactionType: 'transfer', // Explicitly set transaction type as transfer
        });
        return response.data?.data;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['bankAccounts']);
        queryClient.invalidateQueries(['bankAccountStats']);
        if (variables?.fromAccountId) {
          queryClient.invalidateQueries(['bankAccountTransactions', variables.fromAccountId]);
        }
        if (variables?.toAccountId) {
          queryClient.invalidateQueries(['bankAccountTransactions', variables.toAccountId]);
        }
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
    useTransferBetweenAccounts,
    getAccountCategories,
    validateAccountCategory,
    validateContactNumber,
  };
};

export default useAccountQueries;
