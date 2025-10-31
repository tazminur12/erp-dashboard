import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';
import { vendorKeys } from './useVendorQueries';

// Query keys
export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (filters) => [...transactionKeys.lists(), { filters }],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (id) => [...transactionKeys.details(), id],
  accounts: () => [...transactionKeys.all, 'accounts'],
  customers: () => [...transactionKeys.all, 'customers'],
  invoices: () => [...transactionKeys.all, 'invoices'],
  categories: () => [...transactionKeys.all, 'categories'],
  agents: () => [...transactionKeys.all, 'agents'],
  vendors: () => [...transactionKeys.all, 'vendors'],
};

// Hook to fetch transactions with filters and pagination
export const useTransactions = (filters = {}, page = 1, limit = 10) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: transactionKeys.list({ ...filters, page, limit }),
    queryFn: async () => {
      // Build query parameters to match backend API
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters.partyType) params.append('partyType', String(filters.partyType));
      if (filters.partyId) params.append('partyId', String(filters.partyId));
      if (filters.transactionType) params.append('transactionType', String(filters.transactionType));
      if (filters.serviceCategory || filters.category) params.append('serviceCategory', String(filters.serviceCategory || filters.category));
      if (filters.branchId) params.append('branchId', String(filters.branchId));
      if (filters.accountId) params.append('accountId', String(filters.accountId));
      if (filters.status) params.append('status', String(filters.status));

      // Date filters (map to fromDate/toDate expected by backend)
      const appendDate = (from, to) => {
        if (from) params.append('fromDate', from);
        if (to) params.append('toDate', to);
      };

      if (filters.dateRange) {
        const today = new Date();
        const iso = (d) => d.toISOString().split('T')[0];
        if (filters.dateRange === 'today') appendDate(iso(today), iso(today));
        else if (filters.dateRange === 'yesterday') {
          const y = new Date(today); y.setDate(y.getDate() - 1);
          appendDate(iso(y), iso(y));
        } else if (filters.dateRange === 'last-week') {
          const lw = new Date(today); lw.setDate(lw.getDate() - 7);
          appendDate(iso(lw), iso(today));
        } else if (filters.dateRange === 'last-month') {
          const lm = new Date(today); lm.setMonth(lm.getMonth() - 1);
          appendDate(iso(lm), iso(today));
        }
      }
      // Direct date values
      if (filters.dateFrom) params.append('fromDate', filters.dateFrom);
      if (filters.dateTo) params.append('toDate', filters.dateTo);

      // Text search
      if (filters.search) params.append('q', String(filters.search));

      const response = await axiosSecure.get(`/api/transactions?${params.toString()}`);

      if (response.data?.success) {
        const items = response.data.data || [];
        const pagination = response.data.pagination || {};
        return {
          transactions: items,
          totalCount: pagination.total || 0,
          totalPages: pagination.totalPages || 0,
          currentPage: pagination.page || page
        };
      }
      throw new Error(response.data?.message || 'Failed to load transactions');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch a single transaction
export const useTransaction = (transactionId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: async () => {
      const response = await axiosSecure.get(`/transactions/${transactionId}`);
      
      if (response.data.success) {
        return response.data.transaction;
      } else {
        throw new Error(response.data.message || 'Failed to load transaction');
      }
    },
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to fetch accounts for transactions
export const useTransactionAccounts = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: transactionKeys.accounts(),
    queryFn: async () => {
      try {
        // Try the bank-accounts endpoint first (as used in original code)
        const response = await axiosSecure.get('/bank-accounts');
        const bankAccounts = response?.data?.data || response?.data?.accounts || [];
        
        // Transform the data to match the expected format
        const transformedAccounts = bankAccounts.map(account => ({
          id: account._id || account.id,
          name: account.accountName || account.name || account.bankName,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          balance: account.balance || account.currentBalance || account.initialBalance || 0,
          accountType: account.accountCategory || account.accountType || 'bank', // Map accountCategory to accountType
          accountCategory: account.accountCategory || 'bank', // Keep original accountCategory
          // Backward-compat: some UI expects `type` for badges/filters
          type: account.type || account.accountCategory || account.accountType || 'bank',
          branch: account.branch || '',
          routingNumber: account.routingNumber || '',
          swiftCode: account.swiftCode || '',
          currency: account.currency || 'BDT',
          isActive: account.isActive !== false,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        }));
        
        return transformedAccounts;
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        // Return empty array if API fails
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch customers for transactions
export const useTransactionCustomers = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: transactionKeys.customers(),
    queryFn: async () => {
      try {
        // Try multiple endpoints for customers
        const endpoints = ['/customers', '/api/customers', '/api/haj-umrah/customers'];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying customers endpoint: ${endpoint}`);
            const response = await axiosSecure.get(endpoint);
            console.log(`Customers API response from ${endpoint}:`, response.data);
            
            if (response.data.success) {
              return response.data.customers || response.data.data || [];
            } else if (response.data.data) {
              return response.data.data;
            }
          } catch (endpointError) {
            console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
            continue;
          }
        }
        
        // If all endpoints fail, return empty array
        console.warn('All customer endpoints failed, returning empty array');
        return [];
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook to fetch invoices for transactions
export const useTransactionInvoices = (customerId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.invoices(), customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const response = await axiosSecure.get(`/invoices?customerId=${customerId}`);
      
      if (response.data.success) {
        return response.data.invoices || [];
      } else {
        throw new Error(response.data.message || 'Failed to load invoices');
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to fetch transaction categories
export const useTransactionCategories = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: transactionKeys.categories(),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/api/categories');
        const categoriesData = response?.data?.categories || response?.data || [];
        return Array.isArray(categoriesData) ? categoriesData : [];
      } catch (error) {
        console.error('Error fetching transaction categories:', error);
        // Return default categories if API fails
        return [
          'হাজ্জ প্যাকেজ',
          'ওমরাহ প্যাকেজ',
          'এয়ার টিকেট',
          'ভিসা সার্ভিস',
          'হোটেল বুকিং',
          'ইনসুরেন্স',
          'অন্যান্য সেবা'
        ];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Mutation to create a new transaction
export const useCreateTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData) => {
      // Extract values from nested objects if provided (matching backend logic)
      const finalAmount = transactionData.amount || transactionData.paymentDetails?.amount;
      const finalPartyId = transactionData.partyId || transactionData.customerId;
      const finalTargetAccountId = transactionData.targetAccountId || transactionData.creditAccount?.id || transactionData.debitAccount?.id;
      const finalFromAccountId = transactionData.fromAccountId || transactionData.debitAccount?.id;
      const finalToAccountId = transactionData.toAccountId || transactionData.creditAccount?.id;
      const finalServiceCategory = transactionData.serviceCategory || transactionData.category;

      // Validate required fields based on backend API
      if (!transactionData.transactionType || !finalAmount || !finalPartyId) {
        throw new Error('Transaction type, amount, and party ID are required');
      }

      // Validate transaction type
      if (!['credit', 'debit', 'transfer'].includes(transactionData.transactionType)) {
        throw new Error("Transaction type must be 'credit', 'debit', or 'transfer'");
      }

      // Validate amount
      const amount = parseFloat(finalAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid positive number');
      }

      // Validate amount precision (max 2 decimal places)
      const amountStr = amount.toString();
      const decimalParts = amountStr.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        throw new Error('Amount can have maximum 2 decimal places');
      }

      // Validate account fields based on transaction type
      if (transactionData.transactionType === 'credit' || transactionData.transactionType === 'debit') {
        const isAgent = transactionData.partyType === 'agent' || transactionData.customerType === 'agent';
        // For agent credit/debit, allow missing targetAccountId (input-based flow)
        if (!finalTargetAccountId && !isAgent) {
          throw new Error('Target account ID is required for credit/debit transactions');
        }
      }

      if (transactionData.transactionType === 'transfer') {
        if (!finalFromAccountId || !finalToAccountId) {
          throw new Error('From and to account IDs are required for transfer transactions');
        }
        if (finalFromAccountId === finalToAccountId) {
          throw new Error('Cannot transfer to the same account');
        }
      }

      // Build the payload for backend API (matching backend structure)
      const payload = {
        transactionType: transactionData.transactionType,
        amount: amount,
        partyId: finalPartyId,
        partyType: transactionData.partyType || 'customer', // customer, agent, vendor
        serviceCategory: finalServiceCategory || '',
        paymentMethod: transactionData.paymentMethod || 'cash',
        // For credit/debit, always pass the selected target account if provided,
        // regardless of party type. Only transfers use toAccountId.
        targetAccountId: transactionData.transactionType === 'transfer' ? finalToAccountId : finalTargetAccountId,
        fromAccountId: transactionData.transactionType === 'transfer' ? finalFromAccountId : null,
        toAccountId: transactionData.transactionType === 'transfer' ? finalToAccountId : null,
        invoiceId: transactionData.invoiceId || null,
        accountManagerId: transactionData.accountManagerId || null,
        branchId: transactionData.branchId || 'main_branch',
        createdBy: transactionData.createdBy || 'SYSTEM',
        notes: transactionData.notes || '',
        reference: transactionData.reference || transactionData.paymentDetails?.reference || '',
        employeeReference: transactionData.employeeReference || null,
        // Forward meta if provided (e.g., { selectedOption: 'umrah' })
        meta: transactionData.meta || null,
        // Include nested objects for backend compatibility
        debitAccount: transactionData.debitAccount || (transactionData.transactionType === 'debit' ? { id: finalTargetAccountId } : null),
        creditAccount: transactionData.creditAccount || (transactionData.transactionType === 'credit' ? { id: finalTargetAccountId } : null),
        paymentDetails: transactionData.paymentDetails || { amount: amount },
        customerBankAccount: transactionData.customerBankAccount || null,
        customerId: finalPartyId
      };

      // Remove null or undefined fields to keep payload clean
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      const response = await axiosSecure.post('/api/transactions', payload);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create transaction');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate bank accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // If this transaction is linked to a vendor, refresh vendor caches as well
      const partyType = variables?.partyType || data?.transaction?.partyType;
      const partyId = variables?.partyId || variables?.customerId || data?.transaction?.partyId || data?.transaction?.customerId;
      if (partyType === 'vendor' && partyId) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(partyId) });
        queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(partyId), 'financials'] });
      }
      
      // Add the new transaction to the cache if needed
      if (data.transaction) {
        queryClient.setQueryData(
          transactionKeys.detail(data.transaction.transactionId || data.transaction._id),
          data.transaction
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'নতুন লেনদেন সফলভাবে যোগ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'লেনদেন যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error for validation failures
      if (error.response?.data?.details) {
        errorMessage += `\n\nবিস্তারিত: ${error.response.data.details.join(', ')}`;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update a transaction with enhanced validation
export const useUpdateTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ transactionId, data: transactionData }) => {
      // Validate transaction ID
      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Transaction ID is required');
      }

      // Fields that cannot be updated (as per backend restrictions)
      const restrictedFields = [
        'transactionId', 'createdAt', '_id', 'accountingEntries',
        'debitAccount', 'creditAccount', 'balanceUpdates'
      ];
      
      // Remove restricted fields
      const cleanedData = { ...transactionData };
      restrictedFields.forEach(field => delete cleanedData[field]);

      // Validate transaction type if being updated
      if (cleanedData.transactionType) {
        if (!['income', 'expense', 'transfer'].includes(cleanedData.transactionType)) {
          throw new Error("Transaction type must be 'income', 'expense', or 'transfer'");
        }
      }

      // Validate payment method if being updated
      if (cleanedData.paymentMethod) {
        const validPaymentMethods = ['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others', 'bank'];
        if (!validPaymentMethods.includes(cleanedData.paymentMethod)) {
          throw new Error('Invalid payment method');
        }
        // Normalize legacy 'bank' to 'bank-transfer'
        if (cleanedData.paymentMethod === 'bank') {
          cleanedData.paymentMethod = 'bank-transfer';
        }
      }

      // Validate amount if being updated
      if (cleanedData.paymentDetails?.amount) {
        const parsedAmount = parseFloat(cleanedData.paymentDetails.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Amount must be a valid positive number');
        }
        
        // Check if amount changed (not allowed as per backend)
        throw new Error('Amount changes are not allowed. Please create a new transaction or reverse this one.');
      }

      const response = await axiosSecure.patch(`/transactions/${transactionId}`, cleanedData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update transaction');
      }
    },
    onSuccess: (data, { transactionId }) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate specific transaction details
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      // Update the transaction in cache if needed
      if (data.transaction) {
        queryClient.setQueryData(
          transactionKeys.detail(transactionId),
          data.transaction
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'লেনদেন সফলভাবে আপডেট করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'লেনদেন আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error for validation failures
      if (error.response?.data?.details) {
        errorMessage += `\n\nবিস্তারিত: ${error.response.data.details.join(', ')}`;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to delete a transaction with balance reversal
export const useDeleteTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ transactionId, reason, deletedBy }) => {
      // Validate transaction ID
      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Transaction ID is required');
      }

      // Validate deletion reason
      if (!reason || reason.trim() === '') {
        throw new Error('Deletion reason is required');
      }

      const response = await axiosSecure.delete(`/transactions/${transactionId}`, {
        data: {
          reason: reason.trim(),
          deletedBy: deletedBy || null
        }
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete transaction');
      }
    },
    onSuccess: (data, { transactionId }) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate bank accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // Remove the specific transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      // Show success message with balance reversal info
      const balanceReversed = data.data?.balanceReversed;
      const message = balanceReversed 
        ? 'লেনদেন সফলভাবে মুছে ফেলা হয়েছে এবং অ্যাকাউন্ট ব্যালেন্স পুনরুদ্ধার করা হয়েছে।'
        : 'লেনদেন সফলভাবে মুছে ফেলা হয়েছে।';
      
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: message,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'লেনদেন মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error for validation failures
      if (error.response?.data?.details) {
        errorMessage += `\n\nবিস্তারিত: ${error.response.data.details.join(', ')}`;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to bulk delete transactions with balance reversal
export const useBulkDeleteTransactions = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ transactionIds, reason, deletedBy }) => {
      // Validate transaction IDs
      if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
        throw new Error('Transaction IDs are required');
      }

      // Validate deletion reason
      if (!reason || reason.trim() === '') {
        throw new Error('Deletion reason is required');
      }

      const response = await axiosSecure.post('/transactions/bulk-delete', {
        transactionIds,
        reason: reason.trim(),
        deletedBy: deletedBy || null
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete transactions');
      }
    },
    onSuccess: (data, { transactionIds }) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate bank accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // Remove the specific transactions from cache
      transactionIds.forEach(id => {
        queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });
      });
      
      // Show success message with balance reversal info
      const balanceReversed = data.data?.balanceReversed;
      const message = balanceReversed 
        ? `${transactionIds.length}টি লেনদেন সফলভাবে মুছে ফেলা হয়েছে এবং অ্যাকাউন্ট ব্যালেন্স পুনরুদ্ধার করা হয়েছে।`
        : `${transactionIds.length}টি লেনদেন সফলভাবে মুছে ফেলা হয়েছে।`;
      
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: message,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'লেনদেন মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error for validation failures
      if (error.response?.data?.details) {
        errorMessage += `\n\nবিস্তারিত: ${error.response.data.details.join(', ')}`;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to search agents
export const useSearchAgents = (searchTerm, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.agents(), 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm?.trim()) return [];
      
      const response = await axiosSecure.get('/api/haj-umrah/agents', { 
        params: { search: searchTerm, limit: 20, page: 1 } 
      });
      
      if (response.data?.success) {
        // Add type identifier to agent data
        return (response.data.data || []).map(agent => ({
          ...agent,
          _type: 'agent'
        }));
      }
      return [];
    },
    enabled: enabled && !!searchTerm?.trim(),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook to search vendors
export const useSearchVendors = (searchTerm, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.vendors(), 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm?.trim()) return [];
      
      try {
        const response = await axiosSecure.get('/vendors', { 
          params: { q: searchTerm, limit: 20, page: 1 } 
        });
        
        // Extract vendors array from response (same pattern as other vendor queries)
        const vendorsData = response.data?.vendors || response.data || [];
        
        // Filter vendors based on search term if backend doesn't filter
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const filteredVendors = vendorsData.filter(vendor => {
          const tradeName = (vendor.tradeName || '').toLowerCase();
          const ownerName = (vendor.ownerName || '').toLowerCase();
          const contactNo = (vendor.contactNo || '').toLowerCase();
          const tradeLocation = (vendor.tradeLocation || '').toLowerCase();
          
          return (
            tradeName.includes(normalizedSearchTerm) ||
            ownerName.includes(normalizedSearchTerm) ||
            contactNo.includes(searchTerm) || // Don't lowercase phone numbers
            tradeLocation.includes(normalizedSearchTerm)
          );
        });
        
        // Add type identifier to vendor data
        return filteredVendors.slice(0, 20).map(vendor => ({
          ...vendor,
          _type: 'vendor'
        }));
      } catch (error) {
        console.error('Error searching vendors:', error);
        return [];
      }
    },
    enabled: enabled && !!searchTerm?.trim(),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook to get transaction statistics
export const useTransactionStats = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.all, 'stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.transactionType) params.append('transactionType', filters.transactionType);
      
      const queryString = params.toString();
      const url = queryString ? `/transactions/stats?${queryString}` : '/transactions/stats';
      
      const response = await axiosSecure.get(url);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to load transaction statistics');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to reverse a transaction
export const useReverseTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ transactionId, reason, reversedBy }) => {
      // Validate transaction ID
      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Transaction ID is required');
      }

      // Validate reversal reason
      if (!reason || reason.trim() === '') {
        throw new Error('Reversal reason is required');
      }

      const response = await axiosSecure.post(`/transactions/${transactionId}/reverse`, {
        reason: reason.trim(),
        reversedBy: reversedBy || null
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to reverse transaction');
      }
    },
    onSuccess: (data, { transactionId }) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate bank accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // Invalidate specific transaction details
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      // Show success message
      Swal.fire({
        title: 'রিভার্স করা হয়েছে!',
        text: 'লেনদেন সফলভাবে রিভার্স করা হয়েছে এবং অ্যাকাউন্ট ব্যালেন্স পুনরুদ্ধার করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'লেনদেন রিভার্স করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to get transaction audit trail
export const useTransactionAuditTrail = (transactionId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.detail(transactionId), 'audit'],
    queryFn: async () => {
      if (!transactionId) return null;
      
      const response = await axiosSecure.get(`/transactions/${transactionId}/audit`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to load transaction audit trail');
      }
    },
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation to complete a transaction (atomic updates to accounts, parties, invoices)
export const useCompleteTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionId) => {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const response = await axiosSecure.post(`/api/transactions/${transactionId}/complete`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to complete transaction');
      }
    },
    onSuccess: (data, transactionId) => {
      // Invalidate all relevant caches to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });

      // Update specific party caches if returned
      if (data.agent) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.agents() });
      }
      if (data.customer) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.customers() });
      }
      if (data.vendor) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        if (data.vendor._id || data.vendor.vendorId) {
          const vendorId = data.vendor._id || data.vendor.vendorId;
          queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
        }
      }
      if (data.invoice) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.invoices() });
      }
    },
    onError: (error) => {
      console.error('Complete transaction error:', error);
      // Error handling is done at the calling component level
    },
  });
};

// Mutation to create bank account to bank account transfer
export const useBankAccountTransfer = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transferData) => {
      // Validate required fields
      if (!transferData.fromAccountId || !transferData.toAccountId || !transferData.amount) {
        throw new Error('From account, to account, and amount are required');
      }

      // Validate amount
      const amount = parseFloat(transferData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid positive number');
      }

      // Validate amount precision (max 2 decimal places)
      const amountStr = amount.toString();
      const decimalParts = amountStr.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        throw new Error('Amount can have maximum 2 decimal places');
      }

      // Check if same account
      if (transferData.fromAccountId === transferData.toAccountId) {
        throw new Error('Cannot transfer to the same account');
      }

      // Prepare transfer payload
      const transferPayload = {
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: amount,
        reference: transferData.reference || '',
        notes: transferData.notes || '',
        createdBy: transferData.createdBy || 'SYSTEM',
        branchId: transferData.branchId || 'main_branch',
        accountManager: transferData.accountManager || null
      };

      const response = await axiosSecure.post('/bank-accounts/transfers', transferPayload);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to process transfer');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch transaction list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Invalidate bank accounts to refresh balances
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // Add the new transfer transaction to the cache if needed
      if (data.data?.transaction) {
        queryClient.setQueryData(
          transactionKeys.detail(data.data.transaction.transactionId),
          data.data.transaction
        );
      }
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: `Account to Account Transfer সফলভাবে সম্পন্ন হয়েছে। Transfer ID: ${data.data?.transactionId}`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Enhanced error handling
      let errorMessage = 'Account transfer করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error for validation failures
      if (error.response?.data?.details) {
        errorMessage += `\n\nবিস্তারিত: ${error.response.data.details.join(', ')}`;
      }

      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};