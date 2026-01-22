import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';
import { vendorKeys } from './useVendorQueries';
import { opExKeys } from './useOperatingExpensenQuries';
import { exchangeKeys } from './useMoneyExchangeQueries';
import { loanKeys } from './useLoanQueries';
import { airCustomerKeys } from './useAirCustomersQueries';
import { agentKeys } from './useAgentQueries';

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

// ==================== PERSONAL EXPENSE via /api/transactions/personal-expense ====================
const normalizePersonalExpenseTxV2 = (doc) => ({
  id: String(doc._id || doc.id || ''),
  date: doc.date || new Date().toISOString().slice(0, 10),
  amount: Number(doc.amount || 0),
  categoryId: String(doc.categoryId || ''),
  categoryName: String(doc.categoryName || ''),
  description: String(doc.description || ''),
  tags: Array.isArray(doc.tags) ? doc.tags : [],
  createdAt: doc.createdAt || null,
});

const personalExpenseV2Keys = {
  all: ['personal-expense-transactions-v2'],
  list: (filters) => [...personalExpenseV2Keys.all, { filters }],
};

export const usePersonalExpenseTransactionsV2 = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: personalExpenseV2Keys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', String(filters.from));
      if (filters.to) params.append('to', String(filters.to));
      if (filters.categoryId) params.append('categoryId', String(filters.categoryId));
      const qs = params.toString();
      const url = qs ? `/api/transactions/personal-expense?${qs}` : '/api/transactions/personal-expense';
      const { data } = await axiosSecure.get(url);
      const list = Array.isArray(data) ? data : [];
      return list.map(normalizePersonalExpenseTxV2);
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

export const useCreatePersonalExpenseTransactionV2 = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, amount, categoryId, description = '', tags = [] }) => {
      const payload = {
        // Ensure yyyy-mm-dd format to match backend (which slices internally as well)
        date: (date ? String(date) : new Date().toISOString().slice(0, 10)).slice(0, 10),
        amount: Number(amount || 0),
        categoryId: String(categoryId || ''),
        description: String(description || ''),
        tags: Array.isArray(tags) ? tags.map((t) => String(t)).filter(Boolean) : [],
      };
      const { data } = await axiosSecure.post('/api/transactions/personal-expense', payload);
      // Use categoryId from response if available, otherwise use from payload
      const responseCategoryId = data?.categoryId || categoryId;
      return { ...normalizePersonalExpenseTxV2(data), categoryId: String(responseCategoryId || '') };
    },
    onSuccess: (data) => {
      const categoryId = data?.categoryId;
      
      queryClient.invalidateQueries({ queryKey: personalExpenseV2Keys.all });
      
      // Invalidate all personal expense category queries (with any filters)
      queryClient.invalidateQueries({ queryKey: ['personal-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['personal-expense-category'] });
      
      // If we have a categoryId, invalidate and refetch that specific category
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['personal-expense-category', categoryId] });
        queryClient.refetchQueries({ queryKey: ['personal-expense-category', categoryId] });
      }
      
      // Force refetch all categories to ensure updated totals
      queryClient.refetchQueries({ queryKey: ['personal-expense-categories'] });
    },
  });
};

export const useDeletePersonalExpenseTransactionV2 = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      if (!id) throw new Error('Transaction id is required');
      
      // First, try to get the transaction to extract categoryId
      let categoryId = null;
      try {
        const { data: txData } = await axiosSecure.get(`/api/transactions/personal-expense/${id}`);
        if (txData && !txData.error && Array.isArray(txData)) {
          const tx = txData.find(t => String(t._id || t.id) === String(id));
          categoryId = tx?.categoryId || tx?.category?.id || null;
        } else if (txData && !txData.error) {
          categoryId = txData.categoryId || txData.category?.id || null;
        }
      } catch (err) {
        console.warn('Could not fetch transaction before delete:', err);
      }
      
      // Delete the transaction and get categoryId from response if available
      const { data: deleteResponse } = await axiosSecure.delete(`/api/transactions/personal-expense/${id}`);
      const responseCategoryId = deleteResponse?.categoryId || categoryId;
      
      return { id, categoryId: responseCategoryId };
    },
    onSuccess: (data) => {
      const categoryId = data?.categoryId;
      
      queryClient.invalidateQueries({ queryKey: personalExpenseV2Keys.all });
      
      // Invalidate all personal expense category queries (with any filters)
      queryClient.invalidateQueries({ queryKey: ['personal-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['personal-expense-category'] });
      
      // If we have a categoryId, invalidate and refetch that specific category
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['personal-expense-category', categoryId] });
        queryClient.refetchQueries({ queryKey: ['personal-expense-category', categoryId] });
      }
      
      // Force refetch all categories to ensure updated totals
      queryClient.refetchQueries({ queryKey: ['personal-expense-categories'] });
    },
  });
};

// (removed personal expense transaction client APIs as requested)

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

      // New: special branch support (personal-expense) and general filters
      if (filters.scope) params.append('scope', String(filters.scope));
      if (filters.categoryId) params.append('categoryId', String(filters.categoryId));

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
      if (filters.dateFrom) params.append('fromDate', String(filters.dateFrom).slice(0, 10));
      if (filters.dateTo) params.append('toDate', String(filters.dateTo).slice(0, 10));

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
          logo: account.logo || null, // Bank logo URL
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

// Hook to fetch invoices for transactions
export const useTransactionInvoices = (customerId, options = {}) => {
  const axiosSecure = useAxiosSecure();
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: [...transactionKeys.invoices(), customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      try {
        const response = await axiosSecure.get(`/invoices?customerId=${customerId}`);
        
        if (response.data.success) {
          return response.data.invoices || [];
        } else {
          // If response is not successful, return empty array instead of throwing
          if (process.env.NODE_ENV === 'development') {
            console.log('Invoice query returned unsuccessful:', response.data.message);
          }
          return [];
        }
      } catch (error) {
        // Handle 404 errors gracefully - invoice endpoint might not exist
        if (error?.response?.status === 404) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Invoice endpoint not found (404), returning empty array');
          }
          return [];
        }
        // For other errors, log in development and return empty array
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching invoices:', error);
        }
        return [];
      }
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: false, // Don't retry if endpoint doesn't exist
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
// Backend handles airCustomer auto-detection:
// 1. For partyType='customer': First searches regular customers collection, then airCustomers collection
// 2. If found in airCustomers: Sets party._isAirCustomer = true and updates airCustomers collection
// 3. For airCustomers: Debit transactions also update totalAmount field (in addition to totalDue)
// 4. Haji/Umrah transactions sync to linked customer profiles (both regular and airCustomers)
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
      
      // Extract subCategory (optional)
      const finalSubCategory = typeof transactionData.subCategory !== 'undefined' 
        ? String(transactionData.subCategory || '').trim() || undefined 
        : undefined;
      
      // Extract charge (can be at top level or in paymentDetails)
      const finalCharge = transactionData.charge !== undefined 
        ? transactionData.charge 
        : (transactionData.paymentDetails?.charge !== undefined ? transactionData.paymentDetails.charge : undefined);
      
      // Extract operatingExpenseCategoryId from object or direct value
      const finalOperatingExpenseCategoryId = transactionData.operatingExpenseCategoryId 
        || transactionData.operatingExpenseCategory?.id 
        || null;
      
      // Determine final party type - handle customerType mapping to partyType
      // Backend handles: customerType (e.g., 'money-exchange') maps to partyType
      let finalPartyType = transactionData.partyType || transactionData.customerType || 'customer';
      // Normalize money-exchange variants
      if (finalPartyType === 'money-exchange' || finalPartyType === 'money_exchange') {
        finalPartyType = 'money-exchange'; // Backend accepts both but normalize to hyphenated
      }

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
      // Backend requires targetAccountId for all credit/debit transactions
      // (Backend handles missing party gracefully for money-exchange, but still requires account)
      if (transactionData.transactionType === 'credit' || transactionData.transactionType === 'debit') {
        if (!finalTargetAccountId) {
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

      // Prepare moneyExchangeInfo if provided (for money exchange transactions)
      let moneyExchangeInfo = null;
      const isMoneyExchange = finalPartyType === 'money-exchange' || finalPartyType === 'money_exchange';
      if (isMoneyExchange && transactionData.moneyExchangeInfo) {
        moneyExchangeInfo = {
          id: transactionData.moneyExchangeInfo.id || null,
          fullName: transactionData.moneyExchangeInfo.fullName || transactionData.moneyExchangeInfo.currencyName || null,
          mobileNumber: transactionData.moneyExchangeInfo.mobileNumber || null,
          type: transactionData.moneyExchangeInfo.type || null,
          currencyCode: transactionData.moneyExchangeInfo.currencyCode || null,
          currencyName: transactionData.moneyExchangeInfo.currencyName || null,
          exchangeRate: transactionData.moneyExchangeInfo.exchangeRate || null,
          quantity: transactionData.moneyExchangeInfo.quantity || null,
          amount_bdt: transactionData.moneyExchangeInfo.amount_bdt || transactionData.moneyExchangeInfo.amount || null
        };
      }

      // Build the payload for backend API (matching backend structure)
      const payload = {
        transactionType: transactionData.transactionType,
        amount: amount,
        charge: finalCharge !== undefined ? (finalCharge !== null && finalCharge !== '' ? parseFloat(finalCharge) || 0 : 0) : undefined,
        partyId: finalPartyId,
        partyType: finalPartyType,
        customerType: transactionData.customerType || null, // Backend uses this to auto-detect party type
        serviceCategory: finalServiceCategory || '',
        subCategory: finalSubCategory || null,
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
        // Operating expense category ID (for updating category totals on backend)
        // Support both direct ID and object with id property
        operatingExpenseCategoryId: finalOperatingExpenseCategoryId,
        operatingExpenseCategory: transactionData.operatingExpenseCategory || null,
        // Forward meta if provided (e.g., { selectedOption: 'umrah' })
        meta: transactionData.meta || null,
        // Include nested objects for backend compatibility
        debitAccount: transactionData.debitAccount || (transactionData.transactionType === 'debit' ? { id: finalTargetAccountId } : null),
        creditAccount: transactionData.creditAccount || (transactionData.transactionType === 'credit' ? { id: finalTargetAccountId } : null),
        paymentDetails: {
          ...(transactionData.paymentDetails || {}),
          amount: amount,
          ...(finalCharge !== undefined ? { charge: finalCharge !== null && finalCharge !== '' ? parseFloat(finalCharge) || 0 : 0 } : {})
        },
        customerBankAccount: transactionData.customerBankAccount || null,
        customerId: finalPartyId,
        // For haji/umrah: linked customerId to sync with customer profile
        linkedCustomerId: transactionData.linkedCustomerId || null,
        // Money exchange information (for money-exchange party type)
        moneyExchangeInfo: moneyExchangeInfo
      };

      // Remove null or undefined fields to keep payload clean
      // But preserve empty strings for certain fields that backend expects
      Object.keys(payload).forEach(key => {
        // Keep empty strings for notes, reference, serviceCategory
        if (key === 'notes' || key === 'reference' || key === 'serviceCategory') {
          if (payload[key] === null || payload[key] === undefined) {
            payload[key] = '';
          }
        } 
        // Keep moneyExchangeInfo if it exists (even with null values) as backend uses it for virtual parties
        else if (key === 'moneyExchangeInfo') {
          // Only remove if it's completely null or undefined
          if (payload[key] === null || payload[key] === undefined) {
            delete payload[key];
          }
          // Keep it even if some properties are null - backend can use partial data
        }
        // Remove null/undefined/empty string for other fields
        else if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
        // Remove completely empty objects (but not moneyExchangeInfo which we handle above)
        else if (key !== 'moneyExchangeInfo' && typeof payload[key] === 'object' && payload[key] !== null) {
          // Check if object has any non-null, non-undefined values
          const hasValues = Object.values(payload[key]).some(val => val !== null && val !== undefined && val !== '');
          if (!hasValues && Object.keys(payload[key]).length > 0) {
            delete payload[key];
          }
        }
      });

      // Debug log for haji/umrah transactions
      if (finalPartyType === 'haji' || finalPartyType === 'umrah') {
        console.log('Haji/Umrah Transaction Payload:', {
          partyType: finalPartyType,
          partyId: finalPartyId,
          linkedCustomerId: payload.linkedCustomerId,
          customerId: payload.customerId,
          fullPayload: payload
        });
      }

      const response = await axiosSecure.post('/api/transactions', payload);
      
      if (response.data.success) {
        // Debug log for response
        if (finalPartyType === 'haji' || finalPartyType === 'umrah') {
          console.log('Haji/Umrah Transaction Response:', response.data);
        }
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
      
      // Get party type and ID from variables or response
      const partyType = variables?.partyType || variables?.customerType || data?.transaction?.partyType;
      const partyId = variables?.partyId || variables?.customerId || data?.transaction?.partyId || data?.transaction?.customerId;
      
      // Handle different party types for cache invalidation
      if (partyType === 'vendor' && partyId) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(partyId) });
        queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(partyId), 'financials'] });
      }
      
      // Handle money-exchange party type
      if ((partyType === 'money-exchange' || partyType === 'money_exchange') && partyId) {
        queryClient.invalidateQueries({ queryKey: exchangeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: exchangeKeys.detail(partyId) });
      }
      
      // Handle loan party type
      if (partyType === 'loan' && partyId) {
        queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
        queryClient.invalidateQueries({ queryKey: loanKeys.detail(partyId) });
      }
      
      // Handle customer party type
      // Backend logic: First searches regular customers collection, then airCustomers collection
      // If airCustomer found, sets party._isAirCustomer = true and updates airCustomers collection
      // For airCustomers: debit transactions also update totalAmount field
      if (partyType === 'customer' && partyId) {
        // Invalidate both regular customers and airCustomers queries
        // Backend auto-detects which collection to use based on where party is found
        queryClient.invalidateQueries({ queryKey: transactionKeys.customers() });
        // Invalidate all airCustomer queries comprehensively
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.all });
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.details() });
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.detail(partyId) });
        // Also invalidate any queries that might be using customerId or _id
        // This ensures all customer-related queries are refreshed
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey;
            if (!Array.isArray(key)) return false;
            // Check if query key includes airCustomers and the partyId
            const hasAirCustomer = key.some(k => 
              typeof k === 'string' && (k === 'airCustomers' || k.includes('airCustomer'))
            );
            const hasPartyId = key.includes(partyId);
            return hasAirCustomer && hasPartyId;
          }
        });
      }
      
      // Handle employee transactions (Miraj Industries employees - farmEmployees)
      // Check for employeeReference or customerType indicating employee transaction
      const employeeReference = variables?.employeeReference || data?.transaction?.employeeReference;
      const customerType = variables?.customerType || data?.transaction?.customerType;
      const employeeId = employeeReference?.id || employeeReference?.employeeId || 
                        (customerType === 'miraj-employee' ? partyId : null);
      
      if ((customerType === 'miraj-employee' || customerType === 'mirajIndustries') && employeeId) {
        const employeeIdStr = String(employeeId);
        // Invalidate farmEmployees queries only (employees collection removed from backend)
        queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', employeeIdStr] });
        queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
        // Also invalidate any queries with employeeId in different formats
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey;
            if (!Array.isArray(key)) return false;
            const hasFarmEmployee = key.some(k => 
              typeof k === 'string' && (k === 'farmEmployees' || k.includes('farmEmployee'))
            );
            const hasEmployeeId = key.includes(employeeIdStr) || 
                                 key.includes(employeeId) ||
                                 (employeeReference?.employeeId && key.includes(String(employeeReference.employeeId)));
            return hasFarmEmployee && hasEmployeeId;
          }
        });
        // Force refetch farmEmployee detail query to ensure updated balance is shown immediately
        queryClient.refetchQueries({ queryKey: ['farmEmployees', employeeIdStr] });
      }
      
      // Handle agent party type - invalidate agent queries to refresh agent profile (including hajDue/umrahDue)
      // Backend updates agent.hajDue and agent.umrahDue based on serviceCategory ('hajj' or 'umrah')
      if (partyType === 'agent' && partyId) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.agents() });
        // Invalidate and force refetch agent detail query to refresh hajDue/umrahDue balances
        queryClient.invalidateQueries({ queryKey: agentKeys.detail(partyId) });
        queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        // Force refetch to ensure updated balance is shown immediately
        queryClient.refetchQueries({ queryKey: agentKeys.detail(partyId) });
      }
      
      // Handle haji and umrah party types (these may also sync to customer profiles)
      // Backend logic: Haji/Umrah transactions sync to linked customer profiles (via customerId or linkedCustomerId)
      // Updates both regular customers and airCustomers if linked customer exists
      if ((partyType === 'haji' || partyType === 'umrah') && partyId) {
        // Invalidate customer queries as backend syncs to linked customer profiles
        queryClient.invalidateQueries({ queryKey: transactionKeys.customers() });
        // Invalidate all airCustomer queries comprehensively
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.all });
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: airCustomerKeys.details() });
        // Get linked customerId from transaction data if available (for linked customer profile)
        // Backend may use linkedCustomerId or customerId field to sync with customer profile
        const linkedCustomerId = data?.transaction?.linkedCustomerId 
          || data?.transaction?.customerId 
          || variables?.linkedCustomerId 
          || variables?.customerId;
        if (linkedCustomerId) {
          queryClient.invalidateQueries({ queryKey: airCustomerKeys.detail(linkedCustomerId) });
          // Also invalidate any queries that might include this customerId
          queryClient.invalidateQueries({ 
            predicate: (query) => {
              const key = query.queryKey;
              if (!Array.isArray(key)) return false;
              const hasAirCustomer = key.some(k => 
                typeof k === 'string' && (k === 'airCustomers' || k.includes('airCustomer'))
              );
              const hasLinkedCustomerId = key.includes(linkedCustomerId);
              return hasAirCustomer && hasLinkedCustomerId;
            }
          });
        }
        // Invalidate haji/umrah queries
        queryClient.invalidateQueries({ queryKey: ['haji'] });
        queryClient.invalidateQueries({ queryKey: ['umrah'] });
      }
      
      // If this transaction is linked to an operating expense category, refresh category cache
      // Backend updates category totals for debit transactions with operatingExpenseCategoryId
      const operatingExpenseCategoryId = variables?.operatingExpenseCategoryId 
        || variables?.operatingExpenseCategory?.id 
        || data?.transaction?.operatingExpenseCategoryId;
      const transactionType = variables?.transactionType || data?.transaction?.transactionType;
      if (operatingExpenseCategoryId && transactionType === 'debit') {
        queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
        queryClient.invalidateQueries({ queryKey: opExKeys.category(operatingExpenseCategoryId) });
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

// ✅ DELETE: Delete transaction and reverse all related operations
// This mutation deletes a transaction and automatically reverses:
// - Bank account balance changes (credit/debit/transfer)
// - Party due/paid amounts (agents, vendors, customers, haji, umrah, loans)
// - Operating expense category totals
// - Money exchange record links
// - Farm income/expense records
export const useDeleteTransaction = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ transactionId, reason, deletedBy }) => {
      // Validate transaction ID
      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Transaction ID is required');
      }

      // Note: Backend performs comprehensive reversals automatically:
      // - Reverses bank account balances (credit/debit/transfer)
      // - Reverses party due/paid amounts for all party types
      // - Reverses operating expense category updates
      // - Unlinks money exchange records
      // - Reverses farm income/expense updates
      // - Deletes transaction in atomic MongoDB transaction

      const response = await axiosSecure.delete(`/api/transactions/${transactionId}`, {
        data: {
          reason: reason?.trim() || null,
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
      
      // Invalidate bank accounts to refresh balances (reversed by backend)
      queryClient.invalidateQueries({ queryKey: transactionKeys.accounts() });
      
      // Remove the specific transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      // Invalidate party-related queries (all party types get reversed by backend)
      // Agents
      queryClient.invalidateQueries({ queryKey: transactionKeys.agents() });
      
      // Vendors
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.details() });
      
      // Customers (airCustomers and regular customers)
      // Backend logic: First searches regular customers, then airCustomers collection
      // If airCustomer found, updates airCustomers collection with _isAirCustomer flag
      queryClient.invalidateQueries({ queryKey: transactionKeys.customers() });
      queryClient.invalidateQueries({ queryKey: airCustomerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: airCustomerKeys.details() });
      
      // Haji and Umrah
      queryClient.invalidateQueries({ queryKey: ['haji'] });
      queryClient.invalidateQueries({ queryKey: ['umrah'] });
      
      // Loans
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.details() });
      
      // Money Exchange
      queryClient.invalidateQueries({ queryKey: exchangeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exchangeKeys.details() });
      
      // Operating Expense Categories (reversed by backend for debit transactions)
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
      
      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'লেনদেন সফলভাবে মুছে ফেলা হয়েছে এবং সব সম্পর্কিত অপারেশন (ব্যালেন্স, দেয়া-নেয়া, ক্যাটাগরি) পুনরুদ্ধার করা হয়েছে।',
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
    queryKey: [...transactionKeys.agents(), 'search', searchTerm || 'all'],
    queryFn: async () => {
      const response = await axiosSecure.get('/api/haj-umrah/agents', { 
        params: { 
          ...(searchTerm?.trim() ? { search: searchTerm } : {}),
          limit: 1000, 
          page: 1 
        } 
      });
      
      if (response.data?.success) {
        let agents = response.data.data || [];
        
        // If searchTerm is provided, filter on client side for better UX
        if (searchTerm?.trim()) {
          const normalizedSearchTerm = searchTerm.toLowerCase();
          agents = agents.filter(agent => {
            const tradeName = (agent.tradeName || '').toLowerCase();
            const ownerName = (agent.ownerName || '').toLowerCase();
            const contactNo = (agent.contactNo || '').toLowerCase();
            const tradeLocation = (agent.tradeLocation || '').toLowerCase();
            
            return (
              tradeName.includes(normalizedSearchTerm) ||
              ownerName.includes(normalizedSearchTerm) ||
              contactNo.includes(searchTerm) ||
              tradeLocation.includes(normalizedSearchTerm)
            );
          });
        }
        
        // Add type identifier to agent data
        return agents.map(agent => ({
          ...agent,
          _type: 'agent'
        }));
      }
      return [];
    },
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook to search vendors
export const useSearchVendors = (searchTerm, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...transactionKeys.vendors(), 'search', searchTerm || 'all'],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/vendors', { 
          params: { 
            ...(searchTerm?.trim() ? { q: searchTerm } : {}),
            limit: 1000, 
            page: 1 
          } 
        });
        
        // Extract vendors array from response (same pattern as other vendor queries)
        let vendorsData = response.data?.vendors || response.data || [];
        
        // If searchTerm is provided, filter on client side for better UX
        if (searchTerm?.trim()) {
          const normalizedSearchTerm = searchTerm.toLowerCase();
          vendorsData = vendorsData.filter(vendor => {
            const tradeName = (vendor.tradeName || vendor.vendorName || vendor.name || '').toLowerCase();
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
        }
        
        // Add type identifier to vendor data
        return vendorsData.map(vendor => ({
          ...vendor,
          _type: 'vendor'
        }));
      } catch (error) {
        console.error('Error searching vendors:', error);
        return [];
      }
    },
    enabled: enabled,
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
      if (data.employee) {
        // Invalidate farmEmployees queries when employee is updated
        const employeeId = data.employee.id || data.employee._id;
        if (employeeId) {
          const employeeIdStr = String(employeeId);
          queryClient.invalidateQueries({ queryKey: ['farmEmployees'] });
          queryClient.invalidateQueries({ queryKey: ['farmEmployees', employeeIdStr] });
          queryClient.invalidateQueries({ queryKey: ['farmEmployees', 'stats'] });
          queryClient.refetchQueries({ queryKey: ['farmEmployees', employeeIdStr] });
        }
      }
      if (data.invoice) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.invoices() });
      }
    },
    onError: (error) => {
      console.error('Complete transaction error:', error);
      // Extract error details for better debugging
      const errorDetails = {
        message: error?.response?.data?.message || error?.message || 'Unknown error',
        error: error?.response?.data?.error || error?.error,
        details: error?.response?.data?.details,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      };
      console.error('Complete transaction error details:', errorDetails);
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