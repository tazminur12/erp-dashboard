import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import useAxios from './Axios';

function getAxios() {
  try {
    return useSecureAxios();
  } catch (e) {
    return useAxios();
  }
}

function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
}

export default function useFinanceQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // ==================== EXPENSES ====================
  
  const useExpenses = (params = {}) => {
    const { search = '', date } = params;
    return useQuery({
      queryKey: ['expenses', { search: search || null, date: date || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/expenses', { params: { search, date } });
        return data?.data || [];
      },
    });
  };

  const useCreateExpense = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/expenses', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      },
    });

  // ==================== INCOMES ====================

  const useIncomes = (params = {}) => {
    const { search = '', date } = params;
    return useQuery({
      queryKey: ['incomes', { search: search || null, date: date || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/incomes', { params: { search, date } });
        return data?.data || [];
      },
    });
  };

  const useCreateIncome = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/incomes', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['incomes'] });
        queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      },
    });

  // ==================== FINANCE STATS ====================

  const useFinanceStats = () =>
    useQuery({
      queryKey: ['finance', 'stats'],
      queryFn: async () => {
        const { data } = await axios.get('/api/finance/stats');
        return data?.data || {};
      },
    });

  return {
    // Expenses
    useExpenses,
    useCreateExpense,
    // Incomes
    useIncomes,
    useCreateIncome,
    // Stats
    useFinanceStats,
  };
}

