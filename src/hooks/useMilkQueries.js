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

export default function useMilkQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  const useMilkRecords = (params = {}) => {
    const { cattleId, from, to } = params;
    return useQuery({
      queryKey: ['milk', { cattleId: cattleId || null, from: from || null, to: to || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/milk', { params: { cattleId, from, to } });
        return data;
      },
    });
  };

  const useGetMilkRecord = (id) =>
    useQuery({
      queryKey: ['milk', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/milk/${id}`);
        return data;
      },
      enabled: Boolean(id),
    });

  const useCreateMilkRecord = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/milk', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['milk'] });
      },
    });

  const useUpdateMilkRecord = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/milk/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['milk'] });
        queryClient.invalidateQueries({ queryKey: ['milk', id] });
      },
    });

  const useDeleteMilkRecord = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/milk/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['milk'] });
      },
    });

  return {
    useMilkRecords,
    useGetMilkRecord,
    useCreateMilkRecord,
    useUpdateMilkRecord,
    useDeleteMilkRecord,
  };
}


