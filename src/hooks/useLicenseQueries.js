import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
}

export default function useLicenseQueries() {
  const queryClient = useQueryClient();
  const axios = useSecureAxios();

  const useLicenses = () =>
    useQuery({
      queryKey: ['licenses'],
      queryFn: async () => {
        const { data } = await axios.get('/api/licenses');
        return data;
      },
    });

  const useGetLicense = (id) =>
    useQuery({
      queryKey: ['license', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/licenses/${id}`);
        return data;
      },
      enabled: Boolean(id),
    });

  const useCreateLicense = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/licenses', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
      },
    });

  const useUpdateLicense = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/licenses/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
        queryClient.invalidateQueries({ queryKey: ['license', id] });
      },
    });

  const useDeleteLicense = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/licenses/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
      },
    });

  return {
    useLicenses,
    useGetLicense,
    useCreateLicense,
    useUpdateLicense,
    useDeleteLicense,
  };
}
