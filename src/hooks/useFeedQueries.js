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

export default function useFeedQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  // FEED TYPES
  const useFeedTypes = () =>
    useQuery({
      queryKey: ['feeds', 'types'],
      queryFn: async () => {
        const { data } = await axios.get('/api/feeds/types');
        return data || [];
      },
    });

  const useCreateFeedType = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/feeds/types', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['feeds', 'types'] });
      },
    });

  // FEED STOCKS
  const useFeedStocks = () =>
    useQuery({
      queryKey: ['feeds', 'stocks'],
      queryFn: async () => {
        const { data } = await axios.get('/api/feeds/stocks');
        return data || [];
      },
    });

  const useCreateFeedStock = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/feeds/stocks', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['feeds', 'stocks'] });
      },
    });

  // FEED USAGES
  const useFeedUsages = (params = {}) => {
    const { feedTypeId, date, from, to, q } = params;
    return useQuery({
      queryKey: ['feeds', 'usages', { feedTypeId: feedTypeId || null, date: date || null, from: from || null, to: to || null, q: q || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/feeds/usages', {
          params: { feedTypeId, date, from, to, q },
        });
        return data || [];
      },
    });
  };

  const useCreateFeedUsage = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/feeds/usages', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['feeds', 'usages'] });
        queryClient.invalidateQueries({ queryKey: ['feeds', 'stocks'] });
      },
    });

  const useDeleteFeedUsage = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/feeds/usages/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['feeds', 'usages'] });
        queryClient.invalidateQueries({ queryKey: ['feeds', 'stocks'] });
      },
    });

  return {
    useFeedTypes,
    useCreateFeedType,
    useFeedStocks,
    useCreateFeedStock,
    useFeedUsages,
    useCreateFeedUsage,
    useDeleteFeedUsage,
  };
}


