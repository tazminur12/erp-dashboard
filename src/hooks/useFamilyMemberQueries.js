import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for family member (matches backend structure)
export const normalizeFamilyMember = (doc) => ({
  _id: String(doc._id || doc.id || ''),
  id: String(doc._id || doc.id || ''),
  picture: doc.picture || '',
  name: doc.name || '',
  fatherName: doc.fatherName || '',
  motherName: doc.motherName || '',
  relationship: doc.relationship || '',
  mobileNumber: doc.mobileNumber || '',
  createdAt: doc.createdAt || null,
  updatedAt: doc.updatedAt || null,
});

export const useFamilyMemberQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Get all family members with filters and pagination
  const useFamilyMembers = (options = {}) => {
    const { page = 1, limit = 50, q = '', relationship = '' } = options;

    return useQuery({
      queryKey: ['family-members', { page, limit, q, relationship }],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (relationship) params.append('relationship', relationship);

        const queryString = params.toString();
        const url = `/api/personal/family-members${queryString ? `?${queryString}` : ''}`;
        const { data } = await axiosSecure.get(url);

        if (data.success) {
          return {
            members: (data.data || []).map(normalizeFamilyMember),
            pagination: data.pagination || {
              page: page,
              limit: limit,
              total: 0,
              totalPages: 0,
            },
          };
        } else {
          throw new Error(data.message || 'Failed to fetch family members');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single family member by ID
  const useFamilyMember = (id) => {
    return useQuery({
      queryKey: ['family-member', id],
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/personal/family-members/${id}`);

        if (data.success) {
          return normalizeFamilyMember(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch family member');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new family member
  const useCreateFamilyMember = () => {
    return useMutation({
      mutationFn: async (memberData) => {
        try {
          const { data } = await axiosSecure.post('/api/personal/family-members', memberData);

          if (data.success) {
            return normalizeFamilyMember(data.data);
          } else {
            throw new Error(data.message || 'Failed to create family member');
          }
        } catch (error) {
          // Better error handling
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create family member';
          console.error('Create family member error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['family-members'] });
      },
    });
  };

  // Update family member by ID
  const useUpdateFamilyMember = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }) => {
        try {
          const { data } = await axiosSecure.put(`/api/personal/family-members/${id}`, updates);

          if (data.success) {
            return normalizeFamilyMember(data.data);
          } else {
            throw new Error(data.message || 'Failed to update family member');
          }
        } catch (error) {
          // Better error handling
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update family member';
          console.error('Update family member error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['family-members'] });
        queryClient.invalidateQueries({ queryKey: ['family-member', variables.id] });
      },
    });
  };

  // Delete family member by ID (soft delete)
  const useDeleteFamilyMember = () => {
    return useMutation({
      mutationFn: async (id) => {
        const { data } = await axiosSecure.delete(`/api/personal/family-members/${id}`);

        if (data.success) {
          return { id, success: true };
        } else {
          throw new Error(data.message || 'Failed to delete family member');
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['family-members'] });
      },
    });
  };

  return {
    useFamilyMembers,
    useFamilyMember,
    useCreateFamilyMember,
    useUpdateFamilyMember,
    useDeleteFamilyMember,
  };
};

export default useFamilyMemberQueries;
