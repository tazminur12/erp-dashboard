import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for money exchange
export const exchangeKeys = {
  all: ['exchanges'],
  lists: () => [...exchangeKeys.all, 'list'],
  list: (filters) => [...exchangeKeys.lists(), { filters }],
  details: () => [...exchangeKeys.all, 'detail'],
  detail: (id) => [...exchangeKeys.details(), id],
  reserves: () => [...exchangeKeys.all, 'reserves'],
  dashboard: (filters) => [...exchangeKeys.all, 'dashboard', { filters }],
  dilarExchanges: (dilarId) => [...exchangeKeys.all, 'dilar', dilarId],
};

// Normalize exchange data from backend
const normalizeExchange = (doc) => ({
  id: String(doc?._id || doc?.id || ''),
  date: doc?.date || new Date().toISOString().split('T')[0],
  fullName: doc?.fullName || '',
  mobileNumber: doc?.mobileNumber || '',
  nid: doc?.nid || '',
  type: doc?.type || 'Buy',
  currencyCode: doc?.currencyCode || '',
  currencyName: doc?.currencyName || '',
  exchangeRate: Number(doc?.exchangeRate || 0),
  quantity: Number(doc?.quantity || 0),
  amount_bdt: Number(doc?.amount_bdt || 0),
  isActive: doc?.isActive !== false,
  createdAt: doc?.createdAt || null,
  updatedAt: doc?.updatedAt || null,
  // Dilar-related fields
  customerType: doc?.customerType || 'normal',
  dilarId: doc?.dilarId || null,
  dilarReference: doc?.dilarReference || null,
});

// Get all exchanges with pagination and filters
export const useExchanges = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: exchangeKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.type) params.append('type', String(filters.type));
      if (filters.currencyCode) params.append('currencyCode', String(filters.currencyCode));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));
      if (filters.search) params.append('search', String(filters.search));
      if (filters.dilarId) params.append('dilarId', String(filters.dilarId));
      if (filters.customerType) params.append('customerType', String(filters.customerType));

      const qs = params.toString();
      const url = qs ? `/api/exchanges?${qs}` : '/api/exchanges';
      const { data } = await axiosSecure.get(url);

      return {
        data: Array.isArray(data?.data) ? data.data.map(normalizeExchange) : [],
        pagination: data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single exchange by ID
export const useExchange = (id) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: exchangeKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/api/exchanges/${id}`);
      return normalizeExchange(data?.exchange || data);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Get exchanges for a specific dealer
// Backend: GET /api/dilars/:dilarId/exchanges
export const useDilarExchanges = (dilarId, filters = {}) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: [...exchangeKeys.dilarExchanges(dilarId), filters],
    queryFn: async () => {
      if (!dilarId) return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.type) params.append('type', String(filters.type));
      if (filters.currencyCode) params.append('currencyCode', String(filters.currencyCode));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));

      const qs = params.toString();
      const url = qs 
        ? `/api/dilars/${dilarId}/exchanges?${qs}` 
        : `/api/dilars/${dilarId}/exchanges`;
      
      const { data } = await axiosSecure.get(url);
      
      return {
        data: Array.isArray(data?.data) ? data.data.map(normalizeExchange) : [],
        pagination: data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    },
    enabled: !!dilarId,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Create exchange
export const useCreateExchange = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const body = {
        date: String(payload?.date || new Date().toISOString().split('T')[0]).slice(0, 10),
        fullName: String(payload?.fullName || '').trim(),
        mobileNumber: String(payload?.mobileNumber || '').trim(),
        nid: payload?.nid ? String(payload.nid).trim() : '',
        type: String(payload?.type || 'Buy'),
        currencyCode: String(payload?.currencyCode || ''),
        currencyName: String(payload?.currencyName || ''),
        exchangeRate: Number(payload?.exchangeRate || 0),
        quantity: Number(payload?.quantity || 0),
        amount_bdt: payload?.amount_bdt ? Number(payload.amount_bdt) : undefined,
        // Dilar-related fields
        customerType: payload?.customerType || 'normal', // 'normal' or 'dilar'
        selectedDilarId: payload?.selectedDilarId || '', // Frontend selection
        dilarId: payload?.dilarId || payload?.selectedDilarId || '', // Backend will use this
      };

      const { data } = await axiosSecure.post('/api/exchanges', body);
      return normalizeExchange(data?.exchange || data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.lists() });
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'মুদ্রা লেনদেন সফলভাবে তৈরি হয়েছে',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'মুদ্রা লেনদেন তৈরি করতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Update exchange
export const useUpdateExchange = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const body = {};
      
      if (updates.date !== undefined) {
        body.date = String(updates.date).slice(0, 10);
      }
      if (updates.fullName !== undefined) {
        body.fullName = String(updates.fullName).trim();
      }
      if (updates.mobileNumber !== undefined) {
        body.mobileNumber = String(updates.mobileNumber).trim();
      }
      if (updates.nid !== undefined) {
        body.nid = updates.nid ? String(updates.nid).trim() : '';
      }
      if (updates.type !== undefined) {
        body.type = String(updates.type);
      }
      if (updates.currencyCode !== undefined) {
        body.currencyCode = String(updates.currencyCode);
      }
      if (updates.currencyName !== undefined) {
        body.currencyName = String(updates.currencyName);
      }
      if (updates.exchangeRate !== undefined) {
        body.exchangeRate = Number(updates.exchangeRate);
      }
      if (updates.quantity !== undefined) {
        body.quantity = Number(updates.quantity);
      }
      if (updates.amount_bdt !== undefined) {
        body.amount_bdt = Number(updates.amount_bdt);
      }

      const { data } = await axiosSecure.put(`/api/exchanges/${id}`, body);
      return normalizeExchange(data?.exchange || data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.lists() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: exchangeKeys.detail(data.id) });
      }
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'মুদ্রা লেনদেন সফলভাবে আপডেট হয়েছে',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'মুদ্রা লেনদেন আপডেট করতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Delete exchange (soft delete)
export const useDeleteExchange = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/api/exchanges/${id}`);
      return { id, success: data?.success || true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.lists() });
      if (result?.id) {
        queryClient.removeQueries({ queryKey: exchangeKeys.detail(result.id) });
      }
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: 'মুদ্রা লেনদেন সফলভাবে মুছে ফেলা হয়েছে',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'মুদ্রা লেনদেন মুছতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Get currency reserves
export const useReserves = () => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: exchangeKeys.reserves(),
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/exchanges/reserves');
      return {
        data: Array.isArray(data?.data) ? data.data : [],
        summary: data?.summary || {
          totalCurrencies: 0,
          totalReserveValue: 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get exchange dashboard (profit/loss)
export const useExchangeDashboard = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: exchangeKeys.dashboard(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.currencyCode) params.append('currencyCode', String(filters.currencyCode));
      if (filters.fromDate) params.append('fromDate', String(filters.fromDate));
      if (filters.toDate) params.append('toDate', String(filters.toDate));

      const qs = params.toString();
      const url = qs ? `/api/exchanges/dashboard?${qs}` : '/api/exchanges/dashboard';
      const { data } = await axiosSecure.get(url);

      return {
        data: Array.isArray(data?.data) ? data.data : [],
        summary: data?.summary || {
          totalRealizedProfitLoss: 0,
          totalUnrealizedProfitLoss: 0,
          totalPurchaseCost: 0,
          totalSaleRevenue: 0,
          totalCurrentReserveValue: 0,
          totalCurrencies: 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Aggregate export for convenience
const useMoneyExchangeQueries = () => ({
  exchangeKeys,
  normalizeExchange,
  useExchanges,
  useExchange,
  useCreateExchange,
  useUpdateExchange,
  useDeleteExchange,
  useReserves,
  useExchangeDashboard,
  useDilarExchanges,
});

export default useMoneyExchangeQueries;

