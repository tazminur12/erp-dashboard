import { useQuery } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Query keys for dashboard
export const dashboardKeys = {
  all: ['dashboard'],
  categoriesSummary: (params) => ['dashboard', 'categories-summary', params],
  transactionsStats: (params) => ['dashboard', 'transactions-stats', params],
};

/**
 * Hook to fetch categories-wise credit and debit summary
 * @param {Object} filters - Filters for date range
 * @param {string} filters.fromDate - Start date (ISO format: YYYY-MM-DD)
 * @param {string} filters.toDate - End date (ISO format: YYYY-MM-DD)
 * @returns {Object} Query result with data, isLoading, error
 */
export const useCategoriesSummary = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  const { fromDate, toDate } = filters;

  return useQuery({
    queryKey: dashboardKeys.categoriesSummary({ fromDate, toDate }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const queryString = params.toString();
      const url = queryString 
        ? `/api/categories-summary?${queryString}` 
        : '/api/categories-summary';

      const response = await axiosSecure.get(url);
      
      if (response.data?.success) {
        return {
          categories: response.data.data || [],
          grandTotal: response.data.grandTotal || {
            totalCredit: 0,
            totalDebit: 0,
            netAmount: 0
          },
          period: response.data.period || {
            fromDate: null,
            toDate: null
          }
        };
      }
      
      throw new Error(response.data?.message || 'Failed to load categories summary');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to fetch transactions stats grouped by category and subcategory
 * @param {Object} filters - Filters for the query
 * @param {string} filters.groupBy - Comma-separated list: "category", "subcategory", or both "category,subcategory"
 * @param {string} filters.fromDate - Start date (ISO format: YYYY-MM-DD)
 * @param {string} filters.toDate - End date (ISO format: YYYY-MM-DD)
 * @param {string} filters.partyType - Filter by party type
 * @param {string} filters.partyId - Filter by party ID
 * @returns {Object} Query result with data, isLoading, error
 */
export const useTransactionsStats = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  const { groupBy, fromDate, toDate, partyType, partyId } = filters;

  return useQuery({
    queryKey: dashboardKeys.transactionsStats({ groupBy, fromDate, toDate, partyType, partyId }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (groupBy) params.append('groupBy', groupBy);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (partyType) params.append('partyType', partyType);
      if (partyId) params.append('partyId', partyId);

      const queryString = params.toString();
      const url = queryString 
        ? `/api/transactions/stats?${queryString}` 
        : '/api/transactions/stats';

      const response = await axiosSecure.get(url);
      
      if (response.data?.success) {
        return {
          data: response.data.data || [],
          totals: response.data.totals || {
            totalCredit: 0,
            totalDebit: 0,
            netAmount: 0
          },
          groupBy: response.data.groupBy || ['category'],
          period: response.data.period || {
            fromDate: null,
            toDate: null
          }
        };
      }
      
      throw new Error(response.data?.message || 'Failed to load transactions stats');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

