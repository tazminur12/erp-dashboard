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

export default function useBreedingQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // ==================== BREEDINGS ====================
  
  const useBreedings = (params = {}) => {
    const { cowId, from, to, method, success, q } = params;
    return useQuery({
      queryKey: ['breedings', { cowId: cowId || null, from: from || null, to: to || null, method: method || null, success: success || null, q: q || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/breedings', { params: { cowId, from, to, method, success, q } });
        return data || [];
      },
    });
  };

  const useCreateBreeding = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/breedings', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['breedings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  const useUpdateBreeding = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/breedings/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['breedings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  const useDeleteBreeding = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/breedings/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['breedings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  // ==================== CALVINGS ====================

  const useCalvings = (params = {}) => {
    const { cowId, from, to, calfHealth, calvingType, q } = params;
    return useQuery({
      queryKey: ['calvings', { cowId: cowId || null, from: from || null, to: to || null, calfHealth: calfHealth || null, calvingType: calvingType || null, q: q || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/calvings', { params: { cowId, from, to, calfHealth, calvingType, q } });
        return data || [];
      },
    });
  };

  const useCreateCalving = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/calvings', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['calvings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  const useUpdateCalving = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/calvings/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['calvings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  const useDeleteCalving = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/calvings/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['calvings'] });
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  return {
    // Breedings
    useBreedings,
    useCreateBreeding,
    useUpdateBreeding,
    useDeleteBreeding,
    // Calvings
    useCalvings,
    useCreateCalving,
    useUpdateCalving,
    useDeleteCalving,
  };
}

