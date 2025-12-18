import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const airTicketKeys = {
  all: ['air-tickets'],
  lists: () => [...airTicketKeys.all, 'list'],
  list: (filters) => [...airTicketKeys.lists(), { filters }],
  details: () => [...airTicketKeys.all, 'detail'],
  detail: (id) => [...airTicketKeys.details(), id],
  dashboard: (filters) => [...airTicketKeys.all, 'dashboard-summary', { filters }],
};

// Helper function to extract error message
const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  );
};

// Hook to fetch all Air Tickets with filters and pagination
// API: GET /api/air-ticketing/tickets
// Returns: { success: true, data: [...], pagination: {...} }
export const useAirTickets = (params = {}) => {
  const axiosSecure = useAxiosSecure();
  const {
    page = 1,
    limit = 20,
    q,
    customerId,
    agentId,
    status,
    flightType,
    tripType,
    airline,
    dateFrom,
    dateTo,
    bookingId,
  } = params;

  return useQuery({
    queryKey: airTicketKeys.list({
      page,
      limit,
      q,
      customerId,
      agentId,
      status,
      flightType,
      tripType,
      airline,
      dateFrom,
      dateTo,
      bookingId,
    }),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/api/air-ticketing/tickets', {
          params: {
            page,
            limit,
            q,
            customerId,
            agentId,
            status,
            flightType,
            tripType,
            airline,
            dateFrom,
            dateTo,
            bookingId,
          },
        });

        if (response.data.success) {
          return {
            data: response.data.data || [],
            pagination: response.data.pagination || {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0,
            },
          };
        } else {
          throw new Error(response.data.message || 'Failed to load air tickets');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch Air Ticketing dashboard summary (profit/loss, trends)
// API: GET /api/air-ticketing/dashboard/summary
// Returns: summary object with totals, breakdowns, top lists, recent tickets
export const useAirTicketDashboardSummary = (filters = {}) => {
  const axiosSecure = useAxiosSecure();

  // Clean filters to avoid sending empty strings/undefined
  const params = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

  return useQuery({
    queryKey: airTicketKeys.dashboard(params),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/api/air-ticketing/dashboard/summary', {
          params,
        });

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to load air ticketing dashboard summary');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch a single Air Ticket by ID or bookingId
// API: GET /api/air-ticketing/tickets/:id
// Returns: { success: true, ticket: {...} }
export const useAirTicket = (ticketId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: airTicketKeys.detail(ticketId),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get(`/api/air-ticketing/tickets/${ticketId}`);

        if (response.data.success) {
          return response.data.ticket;
        } else {
          throw new Error(response.data.message || 'Failed to load air ticket');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to create a new Air Ticket
// API: POST /api/air-ticketing/tickets
// Required fields: customerId, bookingId, airline, date
// For multicity: segments (at least 2)
// For oneway/roundtrip: origin, destination, flightDate
// For roundtrip: returnDate
// Returns: { success: true, message: '...', ticket: {...} }
export const useCreateAirTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData) => {
      try {
        const response = await axiosSecure.post('/api/air-ticketing/tickets', ticketData);

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to create air ticket');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch ticket list
      queryClient.invalidateQueries({ queryKey: airTicketKeys.lists() });

      // Invalidate customer queries if customerId exists (for financial updates)
      if (data.ticket?.customerId) {
        queryClient.invalidateQueries({ queryKey: ['air-customers'] });
      }

      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'এয়ার টিকিট সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to update an Air Ticket by ID or bookingId
// API: PUT /api/air-ticketing/tickets/:id
// Note: If financial fields (customerDeal, customerPaid, customerDue) are updated,
//       the API will also update the customer's financial totals in airCustomers collection
// Returns: { success: true, message: '...', ticket: {...} }
export const useUpdateAirTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, ticketData }) => {
      try {
        const response = await axiosSecure.put(
          `/api/air-ticketing/tickets/${ticketId}`,
          ticketData
        );

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to update air ticket');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch ticket list
      queryClient.invalidateQueries({ queryKey: airTicketKeys.lists() });

      // Invalidate specific ticket details
      queryClient.invalidateQueries({ queryKey: airTicketKeys.detail(variables.ticketId) });

      // If financial fields were updated, invalidate customer queries
      if (variables.ticketData?.customerDeal !== undefined || 
          variables.ticketData?.customerPaid !== undefined || 
          variables.ticketData?.customerDue !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['air-customers'] });
      }

      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'এয়ার টিকিট সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to delete an Air Ticket (soft delete) by ID or bookingId
// API: DELETE /api/air-ticketing/tickets/:id
// Note: This performs a soft delete (sets isActive: false)
// Returns: { success: true, message: '...' }
export const useDeleteAirTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId) => {
      try {
        const response = await axiosSecure.delete(`/api/air-ticketing/tickets/${ticketId}`);

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to delete air ticket');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, ticketId) => {
      // Invalidate and refetch ticket list
      queryClient.invalidateQueries({ queryKey: airTicketKeys.lists() });

      // Remove the specific ticket from cache
      queryClient.removeQueries({ queryKey: airTicketKeys.detail(ticketId) });

      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: data.message || 'এয়ার টিকিট সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'এয়ার টিকিট মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

