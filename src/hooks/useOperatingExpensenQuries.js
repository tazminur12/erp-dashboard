import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Valid icon keys matching frontend component
const VALID_ICON_KEYS = ["FileText", "Scale", "Megaphone", "Laptop", "CreditCard", "Package", "Receipt", "RotateCcw"];

// Query keys for operating expenses
export const opExKeys = {
  all: ['operating-expenses'],
  categories: () => [...opExKeys.all, 'categories'],
  category: (id) => [...opExKeys.categories(), id],
};

// Normalizer for operating expense category (matching backend)
export const normalizeOpExCategory = (doc) => ({
  id: String(doc?._id || doc?.id || ''),
  name: doc?.name || '',
  banglaName: doc?.banglaName || '',
  description: doc?.description || '',
  iconKey: VALID_ICON_KEYS.includes(doc?.iconKey) ? doc.iconKey : 'FileText',
  color: doc?.color || '',
  bgColor: doc?.bgColor || '',
  iconColor: doc?.iconColor || '',
  totalAmount: Number(doc?.totalAmount || 0),
  lastUpdated: doc?.lastUpdated || null,
  itemCount: Number(doc?.itemCount || 0),
});

// List categories
export const useOpExCategories = () => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: opExKeys.categories(),
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/operating-expenses/categories');
      // Backend returns array directly
      const list = Array.isArray(data) ? data : [];
      return list.map(normalizeOpExCategory);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Single category
export const useOpExCategory = (id) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: opExKeys.category(id),
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/api/operating-expenses/categories/${id}`);
      // Backend returns normalized category directly
      return normalizeOpExCategory(data);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create category
export const useCreateOpExCategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Validate iconKey
      const validIconKey = VALID_ICON_KEYS.includes(String(payload?.iconKey || '')) ? String(payload.iconKey) : 'FileText';
      
      const body = {
        name: String(payload?.name || '').trim(),
        banglaName: String(payload?.banglaName || '').trim(),
        description: String(payload?.description || '').trim(),
        iconKey: validIconKey,
        color: String(payload?.color || ''),
        bgColor: String(payload?.bgColor || ''),
        iconColor: String(payload?.iconColor || ''),
        totalAmount: Number(payload?.totalAmount || 0),
        lastUpdated: payload?.lastUpdated,
        itemCount: Number(payload?.itemCount || 0),
      };
      
      const { data } = await axiosSecure.post('/api/operating-expenses/categories', body);
      // Backend returns normalized category directly (status 201)
      return normalizeOpExCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
    },
  });
};

// Update category
export const useUpdateOpExCategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      // Prepare updates object (backend validates and normalizes)
      const body = { ...updates };
      
      // Validate iconKey if provided
      if (typeof body.iconKey !== 'undefined') {
        body.iconKey = VALID_ICON_KEYS.includes(String(body.iconKey || '')) ? String(body.iconKey) : 'FileText';
      }
      
      // Trim string fields if provided
      if (typeof body.name !== 'undefined') {
        body.name = String(body.name || '').trim();
      }
      if (typeof body.banglaName !== 'undefined') {
        body.banglaName = String(body.banglaName || '').trim();
      }
      if (typeof body.description !== 'undefined') {
        body.description = String(body.description || '').trim();
      }
      if (typeof body.color !== 'undefined') {
        body.color = String(body.color || '');
      }
      if (typeof body.bgColor !== 'undefined') {
        body.bgColor = String(body.bgColor || '');
      }
      if (typeof body.iconColor !== 'undefined') {
        body.iconColor = String(body.iconColor || '');
      }
      if (typeof body.totalAmount !== 'undefined') {
        body.totalAmount = Number(body.totalAmount || 0);
      }
      if (typeof body.itemCount !== 'undefined') {
        body.itemCount = Number(body.itemCount || 0);
      }
      
      const { data } = await axiosSecure.put(`/api/operating-expenses/categories/${id}`, body);
      // Backend returns normalized category directly
      return normalizeOpExCategory(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: opExKeys.category(data.id) });
      }
    },
  });
};

// Delete category
export const useDeleteOpExCategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/api/operating-expenses/categories/${id}`);
      // Backend returns { success: true }
      return { id, success: data?.success || true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
      if (result?.id) {
        queryClient.removeQueries({ queryKey: opExKeys.category(result.id) });
      }
    },
  });
};

// Aggregate export for convenience (similar to other hooks)
const useOperatingExpensenQuries = () => ({
  opExKeys,
  normalizeOpExCategory,
  useOpExCategories,
  useOpExCategory,
  useCreateOpExCategory,
  useUpdateOpExCategory,
  useDeleteOpExCategory,
});

export default useOperatingExpensenQuries;


