import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Query keys for operating expenses
export const opExKeys = {
  all: ['operating-expenses'],
  categories: () => [...opExKeys.all, 'categories'],
  category: (id) => [...opExKeys.categories(), id],
  subcategories: (categoryId) => [...opExKeys.category(categoryId), 'subcategories'],
};

// Normalizer matching backend contract provided in spec
export const normalizeOpExCategory = (doc) => ({
  id: String(doc?._id || doc?.id || ''),
  name: doc?.name || '',
  banglaName: doc?.banglaName || '',
  description: doc?.description || '',
  iconKey: doc?.iconKey || 'FileText',
  color: doc?.color || '',
  bgColor: doc?.bgColor || '',
  iconColor: doc?.iconColor || '',
  totalAmount: Number(doc?.totalAmount || 0),
  lastUpdated: doc?.lastUpdated || null,
  itemCount: Number(doc?.itemCount || 0),
  subcategories: Array.isArray(doc?.subcategories) ? doc.subcategories : [],
});

const normalizeOpExCategoryList = (raw) => {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list.map(normalizeOpExCategory);
};

// List categories
export const useOpExCategories = () => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: opExKeys.categories(),
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/operating-expenses/categories');
      return normalizeOpExCategoryList(data);
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
      const body = {
        name: String(payload?.name || '').trim(),
        banglaName: payload?.banglaName || '',
        description: payload?.description || '',
        iconKey: payload?.iconKey || 'FileText',
        color: payload?.color || '',
        bgColor: payload?.bgColor || '',
        iconColor: payload?.iconColor || '',
        totalAmount: Number(payload?.totalAmount || 0),
        lastUpdated: payload?.lastUpdated,
        itemCount: Number(payload?.itemCount || 0),
        subcategories: Array.isArray(payload?.subcategories) ? payload.subcategories : [],
      };
      const { data } = await axiosSecure.post('/api/operating-expenses/categories', body);
      return data;
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
      const { data } = await axiosSecure.put(`/api/operating-expenses/categories/${id}`, updates || {});
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
      if (data?.id || data?._id) {
        const cid = String(data?._id || data?.id);
        queryClient.invalidateQueries({ queryKey: opExKeys.category(cid) });
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
      await axiosSecure.delete(`/api/operating-expenses/categories/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
      queryClient.removeQueries({ queryKey: opExKeys.category(id) });
    },
  });
};

// List subcategories for a category
export const useOpExSubcategories = (categoryId) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: opExKeys.subcategories(categoryId),
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/api/operating-expenses/categories/${categoryId}/subcategories`);
      return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create subcategory
export const useCreateOpExSubcategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, subcategory }) => {
      const body = {
        name: String(subcategory?.name || '').trim(),
        banglaName: subcategory?.banglaName || '',
        description: subcategory?.description || '',
        iconKey: subcategory?.iconKey || 'FileText',
      };
      const { data } = await axiosSecure.post(`/api/operating-expenses/categories/${categoryId}/subcategories`, body);
      return data;
    },
    onSuccess: (data, vars) => {
      const id = vars?.categoryId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
        queryClient.invalidateQueries({ queryKey: opExKeys.category(id) });
        queryClient.invalidateQueries({ queryKey: opExKeys.subcategories(id) });
      }
    },
  });
};

// Update subcategory (partial fields)
export const useUpdateOpExSubcategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, subcategoryId, updates }) => {
      const { data } = await axiosSecure.patch(
        `/api/operating-expenses/categories/${categoryId}/subcategories/${subcategoryId}`,
        updates || {}
      );
      return data;
    },
    onSuccess: (data, vars) => {
      const id = vars?.categoryId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
        queryClient.invalidateQueries({ queryKey: opExKeys.category(id) });
        queryClient.invalidateQueries({ queryKey: opExKeys.subcategories(id) });
      }
    },
  });
};

// Delete subcategory
export const useDeleteOpExSubcategory = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, subcategoryId }) => {
      await axiosSecure.delete(`/api/operating-expenses/categories/${categoryId}/subcategories/${subcategoryId}`);
      return { categoryId, subcategoryId };
    },
    onSuccess: (_data, vars) => {
      const id = vars?.categoryId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: opExKeys.categories() });
        queryClient.invalidateQueries({ queryKey: opExKeys.category(id) });
        queryClient.invalidateQueries({ queryKey: opExKeys.subcategories(id) });
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
  useOpExSubcategories,
  useCreateOpExSubcategory,
  useUpdateOpExSubcategory,
  useDeleteOpExSubcategory,
});

export default useOperatingExpensenQuries;


