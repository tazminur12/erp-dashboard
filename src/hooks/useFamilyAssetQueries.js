import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for family asset (matches backend structure)
export const normalizeFamilyAsset = (doc) => ({
  _id: String(doc._id || doc.id || ''),
  id: String(doc._id || doc.id || ''),
  name: doc.name || '',
  type: doc.type || '',
  providerCompanyId: doc.providerCompanyId || null,
  providerCompanyName: doc.providerCompanyName || '',
  totalPaidAmount: Number(doc.totalPaidAmount || 0),
  paymentType: doc.paymentType || 'one-time',
  paymentDate: doc.paymentDate || null,
  purchaseDate: doc.purchaseDate || null,
  status: doc.status || 'active',
  notes: doc.notes || '',
  numberOfInstallments: doc.numberOfInstallments || null,
  installmentAmount: doc.installmentAmount ? Number(doc.installmentAmount) : null,
  installmentStartDate: doc.installmentStartDate || null,
  installmentEndDate: doc.installmentEndDate || null,
  createdAt: doc.createdAt || null,
  updatedAt: doc.updatedAt || null,
});

export const useFamilyAssetQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Get all family assets with filters and pagination
  const useFamilyAssets = (options = {}) => {
    const { page = 1, limit = 50, q = '', type = '', status = '', paymentType = '' } = options;

    return useQuery({
      queryKey: ['family-assets', { page, limit, q, type, status, paymentType }],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (paymentType) params.append('paymentType', paymentType);

        const queryString = params.toString();
        const url = `/api/personal/family-assets${queryString ? `?${queryString}` : ''}`;
        const { data } = await axiosSecure.get(url);

        if (data.success) {
          const pagination = data.pagination || {};
          return {
            assets: (data.data || []).map(normalizeFamilyAsset),
            pagination: {
              page: pagination.page || page,
              limit: pagination.limit || limit,
              total: pagination.total || 0,
              totalPages: pagination.pages || pagination.totalPages || 0, // Backend returns 'pages', map to 'totalPages'
            },
          };
        } else {
          throw new Error(data.message || 'Failed to fetch family assets');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single family asset by ID
  const useFamilyAsset = (id) => {
    return useQuery({
      queryKey: ['family-asset', id],
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/personal/family-assets/${id}`);

        if (data.success) {
          return normalizeFamilyAsset(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch family asset');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new family asset
  const useCreateFamilyAsset = () => {
    return useMutation({
      mutationFn: async (assetData) => {
        try {
          const { data } = await axiosSecure.post('/api/personal/family-assets', assetData);

          if (data.success) {
            return normalizeFamilyAsset(data.data);
          } else {
            throw new Error(data.message || 'Failed to create family asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create family asset';
          console.error('Create family asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['family-assets'] });
      },
    });
  };

  // Update family asset by ID
  const useUpdateFamilyAsset = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }) => {
        try {
          const { data } = await axiosSecure.put(`/api/personal/family-assets/${id}`, updates);

          if (data.success) {
            return normalizeFamilyAsset(data.data);
          } else {
            throw new Error(data.message || 'Failed to update family asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update family asset';
          console.error('Update family asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['family-assets'] });
        queryClient.invalidateQueries({ queryKey: ['family-asset', variables.id] });
      },
    });
  };

  // Delete family asset by ID (soft delete)
  const useDeleteFamilyAsset = () => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axiosSecure.delete(`/api/personal/family-assets/${id}`);

          if (data.success) {
            return { id, success: true };
          } else {
            throw new Error(data.message || 'Failed to delete family asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete family asset';
          console.error('Delete family asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['family-assets'] });
      },
    });
  };

  return {
    useFamilyAssets,
    useFamilyAsset,
    useCreateFamilyAsset,
    useUpdateFamilyAsset,
    useDeleteFamilyAsset,
  };
};

export default useFamilyAssetQueries;
