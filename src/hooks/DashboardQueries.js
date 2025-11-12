import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';

// Query keys for dashboard queries
export const dashboardKeys = {
  all: ['dashboard'],
  summary: (filters) => [...dashboardKeys.all, 'summary', { filters }],
  categoriesSummary: (filters) => [...dashboardKeys.all, 'categoriesSummary', { filters }],
  transactionsStats: (filters) => [...dashboardKeys.all, 'transactionsStats', { filters }],
};

// Extract error message helper
const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
};

/**
 * Hook to fetch comprehensive dashboard summary
 * @param {Object} filters - Optional filters: { fromDate, toDate }
 * @returns {Object} - Dashboard summary data with overview, users, customers, agents, vendors, financial, services, farm, recentActivity, grandTotals
 */
export const useDashboardSummary = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { fromDate, toDate } = filters;

  return useQuery({
    queryKey: dashboardKeys.summary({ fromDate, toDate }),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);

        const queryString = params.toString();
        const url = queryString 
          ? `/api/dashboard/summary?${queryString}` 
          : '/api/dashboard/summary';

        const response = await axiosSecure.get(url);

        if (response.data.success) {
          return {
            data: response.data.data,
            grandTotals: response.data.grandTotals,
            period: response.data.period,
            generatedAt: response.data.generatedAt,
          };
        } else {
          throw new Error(response.data.message || 'Failed to load dashboard summary');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch categories summary (credit and debit by category)
 * @param {Object} filters - Optional filters: { fromDate, toDate }
 * @returns {Object} - Categories summary with categories array and grandTotal
 */
export const useCategoriesSummary = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { fromDate, toDate } = filters;

  return useQuery({
    queryKey: dashboardKeys.categoriesSummary({ fromDate, toDate }),
    queryFn: async () => {
      try {
        // This endpoint might need to be created or use transactions endpoint
        // For now, using a transactions-based approach
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        params.append('groupBy', 'category');

        const queryString = params.toString();
        const url = `/api/transactions/stats?${queryString}`;

        const response = await axiosSecure.get(url);

        if (response.data.success) {
          // Transform the data to match the expected structure
          const stats = response.data.data || [];
          const categories = stats.map(item => ({
            categoryName: item.category || item._id || 'Unknown',
            totalCredit: item.totalCredit || 0,
            totalDebit: item.totalDebit || 0,
            netAmount: (item.totalCredit || 0) - (item.totalDebit || 0),
          }));

          // Calculate grand total
          const grandTotal = categories.reduce(
            (acc, cat) => ({
              totalCredit: acc.totalCredit + (cat.totalCredit || 0),
              totalDebit: acc.totalDebit + (cat.totalDebit || 0),
              netAmount: acc.netAmount + (cat.netAmount || 0),
            }),
            { totalCredit: 0, totalDebit: 0, netAmount: 0 }
          );

          return {
            categories,
            grandTotal,
            period: {
              fromDate: fromDate || null,
              toDate: toDate || null,
            },
          };
        } else {
          throw new Error(response.data.message || 'Failed to load categories summary');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch transactions statistics grouped by category and subcategory
 * @param {Object} filters - Optional filters: { groupBy, fromDate, toDate }
 * @returns {Object} - Transactions stats with data array, totals, and period
 */
export const useTransactionsStats = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { groupBy, fromDate, toDate } = filters;

  return useQuery({
    queryKey: dashboardKeys.transactionsStats({ groupBy, fromDate, toDate }),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (groupBy) params.append('groupBy', groupBy);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);

        const queryString = params.toString();
        const url = `/api/transactions/stats?${queryString}`;

        const response = await axiosSecure.get(url);

        if (response.data.success) {
          const stats = response.data.data || [];
          
          // Calculate totals
          const totals = stats.reduce(
            (acc, item) => ({
              totalCredit: acc.totalCredit + (item.totalCredit || 0),
              totalDebit: acc.totalDebit + (item.totalDebit || 0),
              netAmount: acc.netAmount + ((item.totalCredit || 0) - (item.totalDebit || 0)),
            }),
            { totalCredit: 0, totalDebit: 0, netAmount: 0 }
          );

          // Transform data to include category and subcategory
          const data = stats.map(item => ({
            category: item.category || item._id?.category || 'Unknown',
            subcategory: item.subcategory || item._id?.subcategory || null,
            totalCredit: item.totalCredit || 0,
            totalDebit: item.totalDebit || 0,
            netAmount: (item.totalCredit || 0) - (item.totalDebit || 0),
          }));

          return {
            data,
            totals,
            period: {
              fromDate: fromDate || null,
              toDate: toDate || null,
            },
          };
        } else {
          throw new Error(response.data.message || 'Failed to load transactions statistics');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

