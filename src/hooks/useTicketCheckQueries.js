import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const ticketCheckKeys = {
  all: ['ticket-checks'],
  lists: () => [...ticketCheckKeys.all, 'list'],
  list: (filters) => [...ticketCheckKeys.lists(), { filters }],
  details: () => [...ticketCheckKeys.all, 'detail'],
  detail: (id) => [...ticketCheckKeys.details(), id],
};

export default function useTicketCheckQueries() {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  // Get all ticket checks with pagination, search, and filters
  const useTicketChecks = (options = {}) => {
    const {
      page = 1,
      limit = 50,
      q = '',
      customerId,
      reservationOfficerId,
      airlineName,
      travellingCountry,
      dateFrom,
      dateTo
    } = options;

    return useQuery({
      queryKey: ticketCheckKeys.list({
        page,
        limit,
        q,
        customerId,
        reservationOfficerId,
        airlineName,
        travellingCountry,
        dateFrom,
        dateTo
      }),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (q) params.append('q', q);
        if (customerId) params.append('customerId', customerId);
        if (reservationOfficerId) params.append('reservationOfficerId', reservationOfficerId);
        if (airlineName) params.append('airlineName', airlineName);
        if (travellingCountry) params.append('travellingCountry', travellingCountry);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const { data } = await axiosSecure.get(`/api/ticket-checks?${params.toString()}`);

        if (data.success) {
          return {
            ticketChecks: data.data || [],
            pagination: data.pagination || {
              page: 1,
              limit: 50,
              total: 0,
              pages: 0
            }
          };
        } else {
          throw new Error(data.message || 'Failed to fetch ticket checks');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single ticket check by ID
  const useTicketCheck = (id) => {
    return useQuery({
      queryKey: ticketCheckKeys.detail(id),
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/ticket-checks/${id}`);

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch ticket check');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new ticket check
  const useCreateTicketCheck = () => {
    return useMutation({
      mutationFn: async (payload) => {
        console.log('Creating ticket check with payload:', payload);
        
        const { data } = await axiosSecure.post('/api/ticket-checks', payload);

        if (data.success) {
          console.log('Ticket check created successfully:', data);
          return data;
        } else {
          throw new Error(data.message || 'Failed to create ticket check');
        }
      },
      onSuccess: (data) => {
        // Invalidate all ticket check lists
        queryClient.invalidateQueries({ queryKey: ticketCheckKeys.lists() });

        // Add the new ticket check to cache if needed
        if (data.data) {
          queryClient.setQueryData(
            ticketCheckKeys.detail(data.data._id),
            data.data
          );
        }

        Swal.fire({
          title: 'সফল!',
          text: 'টিকেট চেক সফলভাবে তৈরি করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Create ticket check error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'টিকেট চেক তৈরি করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Update ticket check
  const useUpdateTicketCheck = () => {
    return useMutation({
      mutationFn: async ({ id, data: updateData }) => {
        console.log('Updating ticket check:', id, updateData);
        
        const { data } = await axiosSecure.put(`/api/ticket-checks/${id}`, updateData);

        if (data.success) {
          console.log('Ticket check updated successfully:', data);
          return data;
        } else {
          throw new Error(data.message || 'Failed to update ticket check');
        }
      },
      onSuccess: (data, { id }) => {
        // Invalidate all ticket check lists
        queryClient.invalidateQueries({ queryKey: ticketCheckKeys.lists() });

        // Invalidate specific ticket check details
        queryClient.invalidateQueries({ queryKey: ticketCheckKeys.detail(id) });

        // Update cache if needed
        if (data.data) {
          queryClient.setQueryData(
            ticketCheckKeys.detail(id),
            data.data
          );
        }

        Swal.fire({
          title: 'সফল!',
          text: 'টিকেট চেক সফলভাবে আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Update ticket check error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'টিকেট চেক আপডেট করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Delete ticket check (soft delete)
  const useDeleteTicketCheck = () => {
    return useMutation({
      mutationFn: async (id) => {
        console.log('Deleting ticket check:', id);
        
        const { data } = await axiosSecure.delete(`/api/ticket-checks/${id}`);

        if (data.success) {
          console.log('Ticket check deleted successfully');
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete ticket check');
        }
      },
      onSuccess: () => {
        // Invalidate all ticket check lists
        queryClient.invalidateQueries({ queryKey: ticketCheckKeys.lists() });

        Swal.fire({
          title: 'সফল!',
          text: 'টিকেট চেক সফলভাবে মুছে ফেলা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Delete ticket check error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'টিকেট চেক মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  return {
    useTicketChecks,
    useTicketCheck,
    useCreateTicketCheck,
    useUpdateTicketCheck,
    useDeleteTicketCheck,
  };
}
