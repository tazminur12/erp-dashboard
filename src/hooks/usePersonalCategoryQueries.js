import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for personal expense category (includes live totals)
export const normalizePersonalCategory = (doc) => ({
  id: String(doc._id || doc.id || ''),
  name: doc.name || '',
  icon: doc.icon || 'DollarSign',
  // Backend now sends optional description; color may not exist
  description: doc.description || '',
  color: doc.color,
  type: doc.type || 'regular', // 'regular' or 'irregular'
  totalAmount: Number(doc.totalAmount || 0),
  lastUpdated: doc.lastUpdated || null,
  createdAt: doc.createdAt || null,
});

export const usePersonalCategoryQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  const usePersonalCategories = () => {
    return useQuery({
      queryKey: ['personal-expense-categories'],
      queryFn: async () => {
        const { data } = await axiosSecure.get('/api/personal-expenses/categories');
        const list = Array.isArray(data) ? data : [];
        return list.map(normalizePersonalCategory);
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const useCreatePersonalCategory = () => {
    return useMutation({
      mutationFn: async ({ name, icon = 'DollarSign', description = '', type = 'regular' }) => {
        const payload = { 
          name: String(name).trim(), 
          icon, 
          description: String(description || '').trim(),
          type: type === 'regular' || type === 'irregular' ? type : 'regular' // Validate type
        };
        const { data } = await axiosSecure.post('/api/personal-expenses/categories', payload);
        return normalizePersonalCategory(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['personal-expense-categories']);
      },
    });
  };

  const usePersonalCategoryById = (id) => {
    return useQuery({
      queryKey: ['personal-expense-category', id],
      enabled: Boolean(id),
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/personal-expenses/categories/${id}`);
        return normalizePersonalCategory(data);
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const useDeletePersonalCategory = () => {
    return useMutation({
      mutationFn: async ({ id, name }) => {
        if (id) {
          await axiosSecure.delete(`/api/personal-expenses/categories/${id}`);
          return { id };
        }
        if (name) {
          await axiosSecure.delete(`/api/personal-expenses/categories/by-name/${encodeURIComponent(name)}`);
          return { name };
        }
        throw new Error('id or name required');
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['personal-expense-categories']);
      },
    });
  };

  return {
    usePersonalCategories,
    useCreatePersonalCategory,
    usePersonalCategoryById,
    useDeletePersonalCategory,
  };
};

export default usePersonalCategoryQueries;


