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

// Normalizers to keep UI shape consistent
const normalizeFarmExpense = (doc = {}) => ({
  id: String(doc.id ?? doc._id ?? ''),
  category: String(doc.category ?? ''),
  description: String(doc.description ?? ''),
  vendor: String(doc.vendor ?? ''),
  amount: Number(doc.amount ?? 0),
  notes: String(doc.notes ?? ''),
  createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
});

const normalizeFarmIncome = (doc = {}) => ({
  id: String(doc.id ?? doc._id ?? ''),
  source: String(doc.source ?? ''),
  description: String(doc.description ?? ''),
  amount: Number(doc.amount ?? 0),
  date: String(doc.date ?? ''),
  paymentMethod: String(doc.paymentMethod ?? 'cash'),
  customer: String(doc.customer ?? ''),
  notes: String(doc.notes ?? ''),
  createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
});

export const financeKeys = {
  expenses: {
    all: ['farm-expenses'],
    list: (filters) => ['farm-expenses', 'list', { ...(filters || {}) }],
    detail: (id) => ['farm-expenses', 'detail', id],
  },
  incomes: {
    all: ['farm-incomes'],
    list: (filters) => ['farm-incomes', 'list', { ...(filters || {}) }],
    detail: (id) => ['farm-incomes', 'detail', id],
  },
};

// ==================== EXPENSES ====================

export const useFarmExpenses = (filters = {}) => {
  const axios = getAxios();
  const { search = '' } = filters;
  return useQuery({
    queryKey: financeKeys.expenses.list({ search: search || null }),
    queryFn: async () => {
      const { data } = await axios.get('/api/farm/expenses', { params: { search } });
      const list = data?.data || [];
      return list.map(normalizeFarmExpense);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useFarmExpense = (id) => {
  const axios = getAxios();
  return useQuery({
    queryKey: financeKeys.expenses.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/api/farm/expenses/${id}`);
      return normalizeFarmExpense(data?.data || {});
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFarmExpense = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const cleaned = {
          category: String(payload?.category || ''),
          description: String(payload?.description || ''),
          vendor: String(payload?.vendor || ''),
          amount: Number(payload?.amount || 0),
          notes: String(payload?.notes || ''),
        };
        const { data } = await axios.post('/api/farm/expenses', cleaned);
        return normalizeFarmExpense(data?.data || {});
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses.all });
    },
  });
};

export const useUpdateFarmExpense = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: updates }) => {
      try {
        const allowed = ['category', 'description', 'vendor', 'notes', 'amount'];
        const body = {};
        allowed.forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(updates || {}, k)) {
            body[k] = k === 'amount' ? Number(updates[k]) || 0 : String(updates[k] ?? '');
          }
        });
        const res = await axios.put(`/api/farm/expenses/${id}`, body);
        return normalizeFarmExpense(res?.data?.data || {});
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses.all });
      if (vars?.id) queryClient.invalidateQueries({ queryKey: financeKeys.expenses.detail(vars.id) });
    },
  });
};

export const useDeleteFarmExpense = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      try {
        const res = await axios.delete(`/api/farm/expenses/${id}`);
        return res?.data;
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses.all });
    },
  });
};

// ==================== INCOMES ====================

export const useFarmIncomes = (filters = {}) => {
  const axios = getAxios();
  const { search = '', date = '' } = filters;
  return useQuery({
    queryKey: financeKeys.incomes.list({ search: search || null, date: date || null }),
    queryFn: async () => {
      const { data } = await axios.get('/api/farm/incomes', { params: { search, date } });
      const list = data?.data || [];
      return list.map(normalizeFarmIncome);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useFarmIncome = (id) => {
  const axios = getAxios();
  return useQuery({
    queryKey: financeKeys.incomes.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/api/farm/incomes/${id}`);
      return normalizeFarmIncome(data?.data || {});
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFarmIncome = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const cleaned = {
          source: String(payload?.source || ''),
          description: String(payload?.description || ''),
          amount: Number(payload?.amount || 0),
          date: String((payload?.date || new Date().toISOString().slice(0, 10))).slice(0, 10),
          paymentMethod: String(payload?.paymentMethod || 'cash'),
          customer: String(payload?.customer || ''),
          notes: String(payload?.notes || ''),
        };
        const { data } = await axios.post('/api/farm/incomes', cleaned);
        return normalizeFarmIncome(data?.data || {});
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.incomes.all });
    },
  });
};

export const useUpdateFarmIncome = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: updates }) => {
      try {
        const allowed = ['source', 'description', 'amount', 'date', 'paymentMethod', 'customer', 'notes'];
        const body = {};
        allowed.forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(updates || {}, k)) {
            body[k] = k === 'amount' ? Number(updates[k]) || 0 : String(updates[k] ?? '');
          }
        });
        const res = await axios.put(`/api/farm/incomes/${id}`, body);
        return normalizeFarmIncome(res?.data?.data || {});
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.incomes.all });
      if (vars?.id) queryClient.invalidateQueries({ queryKey: financeKeys.incomes.detail(vars.id) });
    },
  });
};

export const useDeleteFarmIncome = () => {
  const axios = getAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      try {
        const res = await axios.delete(`/api/farm/incomes/${id}`);
        return res?.data;
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.incomes.all });
    },
  });
};


