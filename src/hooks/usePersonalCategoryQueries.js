import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for personal expense category (matches backend structure)
export const normalizePersonalCategory = (doc) => ({
  id: String(doc._id || doc.id || ''),
  name: doc.name || '',
  icon: doc.icon || 'DollarSign',
  description: doc.description || '',
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
        // Validate and prepare payload (matching backend validation)
        if (!name || !String(name).trim()) {
          throw new Error('Name is required');
        }

        // Validate type field (matching backend validation)
        const validType = type === 'regular' || type === 'irregular' ? type : 'regular';

        const payload = { 
          name: String(name).trim(), 
          icon: String(icon || 'DollarSign'),
          description: String(description || '').trim(),
          type: validType
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
        // Backend DELETE endpoint: DELETE /api/personal-expenses/categories/:id
        // Backend only supports delete by ID
        if (id) {
          await axiosSecure.delete(`/api/personal-expenses/categories/${id}`);
          return { id, success: true };
        }
        // Fallback: Support delete by name if needed (for backward compatibility)
        // Note: Backend doesn't have by-name endpoint, so this will fail
        // Components should pass id instead of name
        if (name) {
          throw new Error('Delete by name is not supported. Please provide category ID.');
        }
        throw new Error('Category ID is required');
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


