import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

/**
 * Air Ticket Structure:
 * 
 * 1. Unique ID field (ticketId) - Auto-generated
 *    - Format: TKT1301250001 (TKT + Date + Serial)
 *    - Automatically generated when creating a ticket
 *    - Unique index in database
 *    - Cannot be updated (only set during creation)
 * 
 * 2. Booking ID (bookingId) - Manual
 *    - Must be provided manually by frontend
 *    - Required field (validation added)
 *    - Can be updated
 *    - Not unique (can have duplicates if needed)
 *    - Searchable field
 * 
 * 3. Database Indexes:
 *    - ticketId: Unique index (for unique identification)
 *    - bookingId: Regular index (for searching, not unique)
 * 
 * 4. Routes Updated:
 *    - POST: Generates ticketId automatically, requires bookingId manually
 *    - GET /:id: Can find by ticketId, bookingId, or _id
 *    - PUT /:id: Can find by ticketId, bookingId, or _id
 *    - DELETE /:id: Can find by ticketId, bookingId, or _id
 */

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
  console.log('Extracting error message from:', error);
  
  // Check for axios error response
  if (error?.response?.data) {
    const errorData = error.response.data;
    console.log('Error response data:', errorData);
    
    // Check for MongoDB duplicate key error
    if (errorData.error && errorData.error.includes('E11000 duplicate key error')) {
      if (errorData.error.includes('bookingId')) {
        return 'এই Booking ID ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে একটি নতুন Booking ID ব্যবহার করুন।';
      }
      if (errorData.error.includes('ticketId')) {
        return 'এই Ticket ID ইতিমধ্যে ব্যবহৃত হয়েছে।';
      }
      return 'এই তথ্য ইতিমধ্যে ডাটাবেসে রয়েছে। অনুগ্রহ করে একটি নতুন মান ব্যবহার করুন।';
    }
    
    // Return backend error message
    return (
      errorData.message ||
      errorData.error ||
      error.response.statusText ||
      `Server error (${error.response.status})`
    );
  }
  
  // Check for network error
  if (error?.request) {
    console.log('Network error - no response received');
    return 'Network error: Could not connect to server';
  }
  
  // Check for error message
  if (error?.message) {
    return error.message;
  }
  
  return 'Request failed';
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

// Hook to fetch a single Air Ticket by ID
// API: GET /api/air-ticketing/tickets/:id
// The API accepts:
//   - ticketId (auto-generated unique ID, format: TKT1301250001 - TKT + Date + Serial)
//   - bookingId (manual booking ID, can have duplicates)
//   - MongoDB _id (ObjectId)
// @param {string} ticketId - Can be ticketId, bookingId, or MongoDB _id
// Returns: { success: true, ticket: {...} }
export const useAirTicket = (ticketId) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: airTicketKeys.detail(ticketId),
    queryFn: async () => {
      try {
        if (!ticketId) {
          throw new Error('Ticket ID is required');
        }

        // API can find by ticketId, bookingId, or _id
        const response = await axiosSecure.get(`/api/air-ticketing/tickets/${encodeURIComponent(ticketId)}`);

        if (response.data.success && response.data.ticket) {
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
// Required fields: customerId, bookingId (manual, required), airline, date
// Note: ticketId is auto-generated by backend (format: TKT1301250001 - TKT + Date + Serial)
//       ticketId has unique index and cannot be updated (only set during creation)
//       bookingId is required and can be updated, but is not unique (can have duplicates)
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
        console.log('Sending ticket data to backend:', ticketData);
        const response = await axiosSecure.post('/api/air-ticketing/tickets', ticketData);

        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to create air ticket');
        }
      } catch (error) {
        console.error('Mutation error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          fullError: error
        });
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch ticket list
      queryClient.invalidateQueries({ queryKey: airTicketKeys.lists() });

      // Invalidate dashboard summary
      queryClient.invalidateQueries({ queryKey: airTicketKeys.all });

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
      // Check if it's a duplicate bookingId error
      const errorMessage = error.message || '';
      const isDuplicateError = errorMessage.includes('Booking ID ইতিমধ্যে ব্যবহৃত হয়েছে') || 
                               errorMessage.includes('duplicate key') ||
                               errorMessage.includes('E11000');
      
      Swal.fire({
        title: isDuplicateError ? 'Booking ID ডুপ্লিকেট!' : 'ত্রুটি!',
        text: errorMessage || 'এয়ার টিকিট তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        ...(isDuplicateError && {
          footer: 'অনুগ্রহ করে একটি নতুন Booking ID ব্যবহার করুন।'
        })
      });
    },
  });
};

// Hook to update an Air Ticket by ID
// API: PUT /api/air-ticketing/tickets/:id
// The API accepts:
//   - ticketId (auto-generated unique ID, format: TKT1301250001)
//   - bookingId (manual booking ID, can have duplicates)
//   - MongoDB _id (ObjectId)
// Note: ticketId cannot be updated (only set during creation), but bookingId can be updated
//       If financial fields (customerDeal, customerPaid, customerDue) are updated,
//       the API will also update the customer's financial totals in airCustomers collection
// @param {object} params - { ticketId: string (can be ticketId, bookingId, or _id), ticketData: object }
// Returns: { success: true, message: '...', ticket: {...} }
export const useUpdateAirTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, ticketData }) => {
      try {
        if (!ticketId) {
          throw new Error('Ticket ID is required');
        }

        // API can find by ticketId, bookingId, or _id
        const response = await axiosSecure.put(
          `/api/air-ticketing/tickets/${encodeURIComponent(ticketId)}`,
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

      // Invalidate dashboard summary
      queryClient.invalidateQueries({ queryKey: airTicketKeys.all });

      // Invalidate specific ticket details (using ticketId, bookingId, or _id)
      queryClient.invalidateQueries({ queryKey: airTicketKeys.detail(variables.ticketId) });
      if (data.ticket?._id) {
        queryClient.invalidateQueries({ queryKey: airTicketKeys.detail(data.ticket._id) });
      }
      if (data.ticket?.ticketId) {
        queryClient.invalidateQueries({ queryKey: airTicketKeys.detail(data.ticket.ticketId) });
      }
      if (data.ticket?.bookingId) {
        queryClient.invalidateQueries({ queryKey: airTicketKeys.detail(data.ticket.bookingId) });
      }

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

// Hook to delete an Air Ticket (soft delete) by ID
// API: DELETE /api/air-ticketing/tickets/:id
// The API accepts:
//   - ticketId (auto-generated unique ID, format: TKT1301250001)
//   - bookingId (manual booking ID, can have duplicates)
//   - MongoDB _id (ObjectId)
// Note: This performs a soft delete (sets isActive: false)
// @param {string} ticketId - Can be ticketId, bookingId, or MongoDB _id
// Returns: { success: true, message: '...' }
export const useDeleteAirTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId) => {
      try {
        if (!ticketId) {
          throw new Error('Ticket ID is required');
        }

        // API can find by ticketId, bookingId, or _id
        const response = await axiosSecure.delete(`/api/air-ticketing/tickets/${encodeURIComponent(ticketId)}`);

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

      // Invalidate dashboard summary
      queryClient.invalidateQueries({ queryKey: airTicketKeys.all });

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

