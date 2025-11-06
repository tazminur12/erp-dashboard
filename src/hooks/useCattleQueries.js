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

export default function useCattleQueries() {
  const queryClient = useQueryClient();
  const axios = getAxios();

  const useCattle = () =>
    useQuery({
      queryKey: ['cattle'],
      queryFn: async () => {
        const { data } = await axios.get('/api/cattle');
        return data;
      },
    });

  const useGetCattle = (id) =>
    useQuery({
      queryKey: ['cattle', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/cattle/${id}`);
        return data;
      },
      enabled: Boolean(id),
    });

  const useCreateCattle = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/cattle', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  const useUpdateCattle = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/cattle/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
        queryClient.invalidateQueries({ queryKey: ['cattle', id] });
      },
    });

  const useDeleteCattle = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/cattle/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      },
    });

  return {
    useCattle,
    useGetCattle,
    useCreateCattle,
    useUpdateCattle,
    useDeleteCattle,
  };
}


