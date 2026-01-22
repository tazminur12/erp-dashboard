import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for personal expense category (matches backend structure)
export const normalizePersonalCategory = (doc) => ({
  id: String(doc._id || doc.id || ''),
  name: doc.name || '',
  icon: doc.icon || 'DollarSign',
  description: doc.description || '',
  type: doc.type || 'regular', // 'regular' or 'irregular'
  familyMemberId: doc.familyMemberId || null,
  familyMember: doc.familyMember || null, // Populated family member data
  totalAmount: Number(doc.totalAmount || 0),
  lastUpdated: doc.lastUpdated || null,
  createdAt: doc.createdAt || null,
});

export const usePersonalCategoryQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Get all personal expense categories with filtering
  const usePersonalCategories = (filters = {}) => {
    const { type, frequency, q } = filters;
    
    return useQuery({
      queryKey: ['personal-expense-categories', { type, frequency, q }],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (type && (type === 'regular' || type === 'irregular')) {
          params.append('type', type);
        }
        if (frequency && (frequency === 'monthly' || frequency === 'annual')) {
          params.append('frequency', frequency);
        }
        if (q && String(q).trim()) {
          params.append('q', String(q).trim());
        }

        const queryString = params.toString();
        const url = `/api/personal-expenses/categories${queryString ? `?${queryString}` : ''}`;
        const { data } = await axiosSecure.get(url);

        // Backend returns array directly or error object
        if (data.error) {
          throw new Error(data.message || 'Failed to load personal expense categories');
        }

        const list = Array.isArray(data) ? data : [];
        return list.map(normalizePersonalCategory);
      },
      staleTime: 1 * 60 * 1000, // 1 minute - reduced for better real-time updates
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Always refetch on mount
    });
  };

  const useCreatePersonalCategory = () => {
    return useMutation({
      mutationFn: async ({ name, icon = 'DollarSign', description = '', type = 'regular', familyMemberId = null }) => {
        try {
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

          // Add familyMemberId if provided
          if (familyMemberId && String(familyMemberId).trim()) {
            payload.familyMemberId = String(familyMemberId).trim();
          }

          const { data } = await axiosSecure.post('/api/personal-expenses/categories', payload);

          // Backend returns category directly or error object
          if (data.error) {
            throw new Error(data.message || 'Failed to create category');
          }

          return normalizePersonalCategory(data);
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create category';
          console.error('Create personal category error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        // Invalidate all personal expense category queries (with any filters)
        queryClient.invalidateQueries({ queryKey: ['personal-expense-categories'] });
        // Also invalidate specific category queries
        queryClient.invalidateQueries({ queryKey: ['personal-expense-category'] });
        // Force refetch to ensure updated data
        queryClient.refetchQueries({ queryKey: ['personal-expense-categories'] });
      },
    });
  };

  const usePersonalCategoryById = (id) => {
    return useQuery({
      queryKey: ['personal-expense-category', id],
      enabled: Boolean(id),
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/personal-expenses/categories/${id}`);
        
        // Backend returns category directly or error object
        if (data.error) {
          throw new Error(data.message || 'Failed to load category');
        }

        return normalizePersonalCategory(data);
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  // Update personal expense category
  const useUpdatePersonalCategory = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }) => {
        try {
          if (!id) {
            throw new Error('Category ID is required');
          }

          // Prepare update payload
          const payload = { ...updates };
          
          // Handle familyMemberId - if it's empty string, set to null
          if ('familyMemberId' in payload) {
            payload.familyMemberId = payload.familyMemberId && String(payload.familyMemberId).trim() 
              ? String(payload.familyMemberId).trim() 
              : null;
          }

          const { data } = await axiosSecure.put(`/api/personal-expenses/categories/${id}`, payload);

          // Backend returns updated category directly or error object
          if (data.error) {
            throw new Error(data.message || 'Failed to update category');
          }

          return normalizePersonalCategory(data);
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update category';
          console.error('Update personal category error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate all personal expense category queries
        queryClient.invalidateQueries({ queryKey: ['personal-expense-categories'] });
        queryClient.invalidateQueries({ queryKey: ['personal-expense-category', variables.id] });
        // Force refetch to ensure updated data
        queryClient.refetchQueries({ queryKey: ['personal-expense-categories'] });
      },
    });
  };

  const useDeletePersonalCategory = () => {
    return useMutation({
      mutationFn: async ({ id, name }) => {
        try {
          // Backend DELETE endpoint: DELETE /api/personal-expenses/categories/:id
          // Backend supports delete by ID or name (via query param)
          let url = '';
          if (id) {
            url = `/api/personal-expenses/categories/${id}`;
          } else if (name) {
            url = `/api/personal-expenses/categories/${encodeURIComponent(name)}?name=${encodeURIComponent(name)}`;
          } else {
            throw new Error('Category ID or name is required');
          }

          const { data } = await axiosSecure.delete(url);

          // Backend returns { success: true, message: "..." } or error object
          if (data.error) {
            throw new Error(data.message || 'Failed to delete category');
          }

          return { id, name, success: true };
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete category';
          console.error('Delete personal category error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        // Invalidate all personal expense category queries
        queryClient.invalidateQueries({ queryKey: ['personal-expense-categories'] });
        queryClient.invalidateQueries({ queryKey: ['personal-expense-category'] });
        // Force refetch to ensure updated data
        queryClient.refetchQueries({ queryKey: ['personal-expense-categories'] });
      },
    });
  };

  return {
    usePersonalCategories,
    useCreatePersonalCategory,
    usePersonalCategoryById,
    useUpdatePersonalCategory,
    useDeletePersonalCategory,
  };
};

export default usePersonalCategoryQueries;


