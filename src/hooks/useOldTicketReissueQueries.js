import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const oldTicketReissueKeys = {
  all: ['old-ticket-reissues'],
  lists: () => [...oldTicketReissueKeys.all, 'list'],
  list: (filters) => [...oldTicketReissueKeys.lists(), { filters }],
  details: () => [...oldTicketReissueKeys.all, 'detail'],
  detail: (id) => [...oldTicketReissueKeys.details(), id],
};

export default function useOldTicketReissueQueries() {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  // Get all old ticket reissues with pagination, search, and filters
  const useOldTicketReissues = (options = {}) => {
    const {
      page = 1,
      limit = 50,
      q = '',
      customerId,
      reservationOfficerId,
      reissueVendorId,
      airlineName,
      travellingCountry,
      dateFrom,
      dateTo
    } = options;

    return useQuery({
      queryKey: oldTicketReissueKeys.list({
        page,
        limit,
        q,
        customerId,
        reservationOfficerId,
        reissueVendorId,
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
        if (reissueVendorId) params.append('reissueVendorId', reissueVendorId);
        if (airlineName) params.append('airlineName', airlineName);
        if (travellingCountry) params.append('travellingCountry', travellingCountry);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const { data } = await axiosSecure.get(`/api/old-ticket-reissues?${params.toString()}`);

        if (data.success) {
          return {
            reissues: data.data || [],
            pagination: data.pagination || {
              page: 1,
              limit: 50,
              total: 0,
              pages: 0
            }
          };
        } else {
          throw new Error(data.message || 'Failed to fetch old ticket reissues');
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single old ticket reissue by ID
  const useOldTicketReissue = (id) => {
    return useQuery({
      queryKey: oldTicketReissueKeys.detail(id),
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/old-ticket-reissues/${id}`);

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch old ticket reissue');
        }
      },
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new old ticket reissue
  const useCreateOldTicketReissue = () => {
    return useMutation({
      mutationFn: async (payload) => {
        console.log('Creating old ticket reissue with payload:', payload);
        
        const { data } = await axiosSecure.post('/api/old-ticket-reissues', payload);

        if (data.success) {
          console.log('Old ticket reissue created successfully:', data);
          return data;
        } else {
          throw new Error(data.message || 'Failed to create old ticket reissue');
        }
      },
      onSuccess: (data) => {
        // Invalidate all old ticket reissue lists
        queryClient.invalidateQueries({ queryKey: oldTicketReissueKeys.lists() });

        // Add the new reissue to cache if needed
        if (data.data) {
          queryClient.setQueryData(
            oldTicketReissueKeys.detail(data.data._id),
            data.data
          );
        }

        Swal.fire({
          title: 'সফল!',
          text: 'ওল্ড টিকেট রিইস্যু সফলভাবে তৈরি করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Create old ticket reissue error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'ওল্ড টিকেট রিইস্যু তৈরি করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Update old ticket reissue
  const useUpdateOldTicketReissue = () => {
    return useMutation({
      mutationFn: async ({ id, data: updateData }) => {
        console.log('Updating old ticket reissue:', id, updateData);
        
        const { data } = await axiosSecure.put(`/api/old-ticket-reissues/${id}`, updateData);

        if (data.success) {
          console.log('Old ticket reissue updated successfully:', data);
          return data;
        } else {
          throw new Error(data.message || 'Failed to update old ticket reissue');
        }
      },
      onSuccess: (data, { id }) => {
        // Invalidate all old ticket reissue lists
        queryClient.invalidateQueries({ queryKey: oldTicketReissueKeys.lists() });

        // Invalidate specific reissue details
        queryClient.invalidateQueries({ queryKey: oldTicketReissueKeys.detail(id) });

        // Update cache if needed
        if (data.data) {
          queryClient.setQueryData(
            oldTicketReissueKeys.detail(id),
            data.data
          );
        }

        Swal.fire({
          title: 'সফল!',
          text: 'ওল্ড টিকেট রিইস্যু সফলভাবে আপডেট করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Update old ticket reissue error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'ওল্ড টিকেট রিইস্যু আপডেট করতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  // Delete old ticket reissue (soft delete)
  const useDeleteOldTicketReissue = () => {
    return useMutation({
      mutationFn: async (id) => {
        console.log('Deleting old ticket reissue:', id);
        
        const { data } = await axiosSecure.delete(`/api/old-ticket-reissues/${id}`);

        if (data.success) {
          console.log('Old ticket reissue deleted successfully');
          return data;
        } else {
          throw new Error(data.message || 'Failed to delete old ticket reissue');
        }
      },
      onSuccess: () => {
        // Invalidate all old ticket reissue lists
        queryClient.invalidateQueries({ queryKey: oldTicketReissueKeys.lists() });

        Swal.fire({
          title: 'সফল!',
          text: 'ওল্ড টিকেট রিইস্যু সফলভাবে মুছে ফেলা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      },
      onError: (error) => {
        console.error('Delete old ticket reissue error:', error);
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.response?.data?.message || error.message || 'ওল্ড টিকেট রিইস্যু মুছতে সমস্যা হয়েছে।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      },
    });
  };

  return {
    useOldTicketReissues,
    useOldTicketReissue,
    useCreateOldTicketReissue,
    useUpdateOldTicketReissue,
    useDeleteOldTicketReissue,
  };
}
