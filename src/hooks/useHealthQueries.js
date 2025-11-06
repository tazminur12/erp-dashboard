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

export default function useHealthQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  const useHealthRecords = (params = {}) => {
    const { cattleId, from, to, status, q } = params;
    return useQuery({
      queryKey: ['health', { cattleId: cattleId || null, from: from || null, to: to || null, status: status || null, q: q || null }],
      queryFn: async () => {
        const { data } = await axios.get('/api/health', { params: { cattleId, from, to, status, q } });
        return data || [];
      },
    });
  };

  const useCreateHealthRecord = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/health', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['health'] });
      },
    });

  const useUpdateHealthRecord = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/health/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['health'] });
        queryClient.invalidateQueries({ queryKey: ['health', id] });
      },
    });

  const useDeleteHealthRecord = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/health/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['health'] });
      },
    });

  return {
    useHealthRecords,
    useCreateHealthRecord,
    useUpdateHealthRecord,
    useDeleteHealthRecord,
  };
}


