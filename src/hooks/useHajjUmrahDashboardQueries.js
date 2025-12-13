import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';

// Query keys for Hajj-Umrah Dashboard
export const hajjUmrahDashboardKeys = {
  all: ['hajjUmrahDashboard'],
  summary: () => [...hajjUmrahDashboardKeys.all, 'summary'],
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
 * Hook to fetch comprehensive Hajj-Umrah dashboard summary
 * Returns overview, profit/loss, agent statistics, district statistics, and financial summary
 * @returns {Object} - Dashboard summary data with:
 *   - overview: { totalHaji, totalUmrah, totalAgents, totalPilgrims }
 *   - profitLoss: { hajj, umrah, combined }
 *   - agentProfitLoss: Array of agent profit/loss data
 *   - topAgentsByHaji: Array of top agents by haji count
 *   - topDistricts: Array of districts with haji/umrah counts
 *   - financialSummary: { haji, umrah, agents }
 */
export const useHajjUmrahDashboardSummary = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: hajjUmrahDashboardKeys.summary(),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/haj-umrah/dashboard-summary');
        const data = response?.data;

        if (data?.success) {
          return data.data;
        }

        throw new Error(data?.message || 'Failed to load Hajj-Umrah dashboard summary');
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

export default {
  hajjUmrahDashboardKeys,
  useHajjUmrahDashboardSummary,
};
