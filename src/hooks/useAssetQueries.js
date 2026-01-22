import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

// Normalizer for asset (matches backend structure)
export const normalizeAsset = (doc) => ({
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

export const useAssetQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Get all assets with filters and pagination
  const useAssets = (options = {}) => {
    const { page = 1, limit = 50, q = '', type = '', status = '', paymentType = '' } = options;

    return useQuery({
      queryKey: ['assets', { page, limit, q, type, status, paymentType }],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (paymentType) params.append('paymentType', paymentType);

        const queryString = params.toString();
        const url = `/api/account/assets${queryString ? `?${queryString}` : ''}`;
        const { data } = await axiosSecure.get(url);

        if (data.success) {
          return {
            assets: (data.data || []).map(normalizeAsset),
            pagination: data.pagination || {
              page: page,
              limit: limit,
              total: 0,
              totalPages: 0,
            },
          };
        } else {
          throw new Error(data.message || 'Failed to fetch assets');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single asset by ID
  const useAsset = (id) => {
    return useQuery({
      queryKey: ['asset', id],
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/account/assets/${id}`);

        if (data.success) {
          return normalizeAsset(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch asset');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new asset
  const useCreateAsset = () => {
    return useMutation({
      mutationFn: async (assetData) => {
        try {
          const { data } = await axiosSecure.post('/api/account/assets', assetData);

          if (data.success) {
            return normalizeAsset(data.data);
          } else {
            throw new Error(data.message || 'Failed to create asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create asset';
          console.error('Create asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      },
    });
  };

  // Update asset by ID
  const useUpdateAsset = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }) => {
        try {
          const { data } = await axiosSecure.put(`/api/account/assets/${id}`, updates);

          if (data.success) {
            return normalizeAsset(data.data);
          } else {
            throw new Error(data.message || 'Failed to update asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update asset';
          console.error('Update asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
      },
    });
  };

  // Delete asset by ID (soft delete)
  const useDeleteAsset = () => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axiosSecure.delete(`/api/account/assets/${id}`);

          if (data.success) {
            return { id, success: true };
          } else {
            throw new Error(data.message || 'Failed to delete asset');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete asset';
          console.error('Delete asset error:', error);
          throw new Error(errorMessage);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      },
    });
  };

  return {
    useAssets,
    useAsset,
    useCreateAsset,
    useUpdateAsset,
    useDeleteAsset,
  };
};

export default useAssetQueries;
