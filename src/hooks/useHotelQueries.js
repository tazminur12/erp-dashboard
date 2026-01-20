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

export default function useHotelQueries() {
  const queryClient = useQueryClient();
  const axios = useSecureAxios();

  // ==================== HOTELS CRUD ====================

  // GET: Get all hotels with filters
  const useHotels = (params = {}) => {
    const { page = 1, limit = 1000, search, area } = params;
    return useQuery({
      queryKey: ['hotels', { page, limit, search, area }],
      queryFn: async () => {
        const { data } = await axios.get('/api/hotels', {
          params: { page, limit, search, area }
        });
        return data;
      },
    });
  };

  // GET: Get single hotel by ID
  const useGetHotel = (id) =>
    useQuery({
      queryKey: ['hotel', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/hotels/${id}`);
        return data;
      },
      enabled: Boolean(id),
    });

  // POST: Create new hotel
  const useCreateHotel = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/hotels', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['hotels'] });
      },
    });

  // PUT: Update hotel
  const useUpdateHotel = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/hotels/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['hotels'] });
        queryClient.invalidateQueries({ queryKey: ['hotel', id] });
      },
    });

  // DELETE: Delete hotel (soft delete)
  const useDeleteHotel = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/hotels/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['hotels'] });
      },
    });

  // ==================== HOTEL CONTRACTS CRUD ====================

  // GET: Get all hotel contracts with filters
  const useHotelContracts = (params = {}) => {
    const { page = 1, limit = 1000, hotelId, contractType, nusukAgencyId } = params;
    return useQuery({
      queryKey: ['hotelContracts', { page, limit, hotelId, contractType, nusukAgencyId }],
      queryFn: async () => {
        const { data } = await axios.get('/api/hotels/contracts', {
          params: { page, limit, hotelId, contractType, nusukAgencyId }
        });
        return data;
      },
    });
  };

  // GET: Get single hotel contract by ID
  const useGetHotelContract = (id) =>
    useQuery({
      queryKey: ['hotelContract', id],
      queryFn: async () => {
        const { data } = await axios.get(`/api/hotels/contracts/${id}`);
        return data;
      },
      enabled: Boolean(id),
    });

  // GET: Get contracts by hotel ID
  const useHotelContractsByHotelId = (hotelId) =>
    useQuery({
      queryKey: ['hotelContracts', 'hotel', hotelId],
      queryFn: async () => {
        const { data } = await axios.get(`/api/hotels/${hotelId}/contracts`);
        return data;
      },
      enabled: Boolean(hotelId),
    });

  // POST: Create hotel contract
  const useCreateHotelContract = () =>
    useMutation({
      mutationFn: async (payload) => {
        try {
          const { data } = await axios.post('/api/hotels/contracts', payload);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['hotelContracts'] });
        // Invalidate hotel-specific contracts if hotelId is provided
        if (variables.hotelId) {
          const hotelIdStr = String(variables.hotelId);
          queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel', hotelIdStr] });
          queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel'] });
          // Invalidate hotel data to refresh contract count if needed
          queryClient.invalidateQueries({ queryKey: ['hotel', hotelIdStr] });
        }
      },
    });

  // PUT: Update hotel contract
  const useUpdateHotelContract = () =>
    useMutation({
      mutationFn: async ({ id, data: body }) => {
        try {
          const { data } = await axios.put(`/api/hotels/contracts/${id}`, body);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: (_data, { id, data: body }) => {
        queryClient.invalidateQueries({ queryKey: ['hotelContracts'] });
        queryClient.invalidateQueries({ queryKey: ['hotelContract', id] });
        // Invalidate hotel-specific contracts if hotelId is provided
        if (body?.hotelId) {
          queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel', body.hotelId] });
        }
      },
    });

  // DELETE: Delete hotel contract (soft delete)
  const useDeleteHotelContract = () =>
    useMutation({
      mutationFn: async (id) => {
        try {
          const { data } = await axios.delete(`/api/hotels/contracts/${id}`);
          return data;
        } catch (err) {
          throw new Error(extractErrorMessage(err));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['hotelContracts'] });
      },
    });

  return {
    // Hotels
    useHotels,
    useGetHotel,
    useCreateHotel,
    useUpdateHotel,
    useDeleteHotel,
    // Hotel Contracts
    useHotelContracts,
    useGetHotelContract,
    useHotelContractsByHotelId,
    useCreateHotelContract,
    useUpdateHotelContract,
    useDeleteHotelContract,
  };
}
