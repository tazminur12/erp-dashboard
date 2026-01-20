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
  const useHotelContractsByHotelId = (hotelId) => {
    const hotelIdStr = hotelId ? String(hotelId) : null;
    return useQuery({
      queryKey: ['hotelContracts', 'hotel', hotelIdStr],
      queryFn: async () => {
        const { data } = await axios.get(`/api/hotels/${hotelId}/contracts`);
        return data;
      },
      enabled: Boolean(hotelId),
    });
  };

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
      onSuccess: (responseData, variables) => {
        queryClient.invalidateQueries({ queryKey: ['hotelContracts'] });
        // Invalidate and refetch hotel-specific contracts if hotelId is provided
        if (variables.hotelId) {
          const hotelIdStr = String(variables.hotelId);
          const queryKey = ['hotelContracts', 'hotel', hotelIdStr];
          
          // Invalidate to mark as stale
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel'] });
          
          // Optimistic update: Add the new contract to cache
          // Backend POST returns: { success: true, data: {...contract} }
          // Backend GET returns: { success: true, data: [...] }
          if (responseData?.success && responseData?.data) {
            const newContract = responseData.data;
            queryClient.setQueryData(queryKey, (oldData) => {
              // oldData structure: { success: true, data: [...] }
              if (!oldData || !oldData.data) {
                // If no old data, return structure matching backend response
                return {
                  success: true,
                  data: [newContract]
                };
              }
              
              const existingContracts = Array.isArray(oldData.data) ? oldData.data : [];
              
              // Check if contract already exists (avoid duplicates)
              const contractId = newContract._id || newContract.id;
              const exists = existingContracts.some(c => 
                String(c._id || c.id) === String(contractId)
              );
              
              if (exists) {
                // Contract already exists, just return old data
                return oldData;
              }
              
              // Add new contract to the beginning of the array
              const updatedContracts = [newContract, ...existingContracts];
              
              // Return in the same structure as backend: { success: true, data: [...] }
              return {
                ...oldData,
                success: true,
                data: updatedContracts
              };
            });
          }
          
          // Explicitly refetch to ensure data is updated immediately (this will override optimistic update with fresh data)
          queryClient.refetchQueries({ queryKey, type: 'active' });
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
          const hotelIdStr = String(body.hotelId);
          queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel', hotelIdStr] });
          queryClient.refetchQueries({ queryKey: ['hotelContracts', 'hotel', hotelIdStr], type: 'active' });
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
      onSuccess: (_data, contractId) => {
        queryClient.invalidateQueries({ queryKey: ['hotelContracts'] });
        // Invalidate all hotel-specific contracts queries (since we don't have hotelId here)
        queryClient.invalidateQueries({ queryKey: ['hotelContracts', 'hotel'] });
        // Also invalidate the specific contract query
        queryClient.invalidateQueries({ queryKey: ['hotelContract', contractId] });
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
