import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for sales invoices
export const invoiceKeys = {
  all: ['invoices'],
  lists: () => [...invoiceKeys.all, 'list'],
  list: (filters) => [...invoiceKeys.lists(), { filters }],
  details: () => [...invoiceKeys.all, 'detail'],
  detail: (id) => [...invoiceKeys.details(), id],
  pending: () => [...invoiceKeys.all, 'pending'],
};

// Normalize invoice data from backend
const normalizeInvoice = (doc) => ({
  id: String(doc?._id || doc?.id || ''),
  invoiceNumber: doc?.invoiceNumber || doc?.invoiceNo || '',
  date: doc?.date || new Date().toISOString().split('T')[0],
  customerId: String(doc?.customerId || doc?.customer?.id || ''),
  customerName: doc?.customerName || doc?.customer?.name || '',
  customerPhone: doc?.customerPhone || doc?.customer?.phone || '',
  serviceId: String(doc?.serviceId || doc?.service?.id || ''),
  serviceName: doc?.serviceName || doc?.service?.name || '',
  bookingId: doc?.bookingId || '',
  vendorId: doc?.vendorId ? String(doc.vendorId) : null,
  vendorName: doc?.vendorName || doc?.vendor?.tradeName || '',
  // Billing fields
  bill: Number(doc?.bill || 0),
  commission: Number(doc?.commission || 0),
  discount: Number(doc?.discount || 0),
  amount: Number(doc?.amount || 0),
  paid: Number(doc?.paid || 0),
  due: Number(doc?.due || 0),
  dueCommitmentDate: doc?.dueCommitmentDate || null,
  status: doc?.status || 'pending', // pending, paid, partial, cancelled
  // Air Ticket fields
  baseFare: Number(doc?.baseFare || 0),
  tax: Number(doc?.tax || 0),
  sellerDetails: doc?.sellerDetails || '',
  gdsPnr: doc?.gdsPnr || '',
  airlinePnr: doc?.airlinePnr || '',
  ticketNo: doc?.ticketNo || '',
  passengerType: doc?.passengerType || 'adult',
  airlineName: doc?.airlineName || '',
  // Flight Details
  flightType: doc?.flightType || 'oneway',
  origin: doc?.origin || '',
  destination: doc?.destination || '',
  flightDate: doc?.flightDate || null,
  originOutbound: doc?.originOutbound || '',
  destinationOutbound: doc?.destinationOutbound || '',
  outboundFlightDate: doc?.outboundFlightDate || null,
  originInbound: doc?.originInbound || '',
  destinationInbound: doc?.destinationInbound || '',
  inboundFlightDate: doc?.inboundFlightDate || null,
  // Multi City segments
  originSegment1: doc?.originSegment1 || '',
  destinationSegment1: doc?.destinationSegment1 || '',
  flightDateSegment1: doc?.flightDateSegment1 || null,
  originSegment2: doc?.originSegment2 || '',
  destinationSegment2: doc?.destinationSegment2 || '',
  flightDateSegment2: doc?.flightDateSegment2 || null,
  // Customer Fare
  customerBaseFare: Number(doc?.customerBaseFare || 0),
  customerTax: Number(doc?.customerTax || 0),
  customerCommission: Number(doc?.customerCommission || 0),
  ait: Number(doc?.ait || 0),
  serviceCharge: Number(doc?.serviceCharge || 0),
  customerTotalFare: Number(doc?.customerTotalFare || 0),
  // Vendor Fare
  vendorBaseFare: Number(doc?.vendorBaseFare || 0),
  vendorTax: Number(doc?.vendorTax || 0),
  vendorCommission: Number(doc?.vendorCommission || 0),
  vendorAit: Number(doc?.vendorAit || 0),
  vendorServiceCharge: Number(doc?.vendorServiceCharge || 0),
  vendorTotalFare: Number(doc?.vendorTotalFare || 0),
  createdAt: doc?.createdAt || null,
  updatedAt: doc?.updatedAt || null,
});

// Get all invoices with pagination and filters
export const useInvoices = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.status) params.append('status', String(filters.status));
      if (filters.customerId) params.append('customerId', String(filters.customerId));
      if (filters.serviceId) params.append('serviceId', String(filters.serviceId));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));
      if (filters.search) params.append('search', String(filters.search));

      const qs = params.toString();
      const url = qs ? `/api/invoices?${qs}` : '/api/invoices';
      const { data } = await axiosSecure.get(url);

      return {
        data: Array.isArray(data?.data) ? data.data.map(normalizeInvoice) : [],
        pagination: data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get pending invoices
export const usePendingInvoices = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: [...invoiceKeys.pending(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.customerId) params.append('customerId', String(filters.customerId));
      if (filters.dateFrom) params.append('dateFrom', String(filters.dateFrom));
      if (filters.dateTo) params.append('dateTo', String(filters.dateTo));
      if (filters.search) params.append('search', String(filters.search));

      const qs = params.toString();
      const url = qs ? `/api/invoices/pending?${qs}` : '/api/invoices/pending';
      const { data } = await axiosSecure.get(url);

      return {
        data: Array.isArray(data?.data) ? data.data.map(normalizeInvoice) : [],
        pagination: data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Get single invoice by ID
export const useInvoice = (id) => {
  const axiosSecure = useSecureAxios();
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/api/invoices/${id}`);
      return normalizeInvoice(data?.invoice || data);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Create invoice
export const useCreateInvoice = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const body = {
        date: String(payload?.date || new Date().toISOString().split('T')[0]).slice(0, 10),
        customerId: String(payload?.customerId || '').trim(),
        serviceId: String(payload?.serviceId || '').trim(),
        bookingId: payload?.bookingId ? String(payload.bookingId).trim() : '',
        vendorId: payload?.vendorId ? String(payload.vendorId).trim() : null,
        // Billing fields
        bill: payload?.bill !== undefined ? Number(payload.bill) : undefined,
        commission: payload?.commission !== undefined ? Number(payload.commission) : undefined,
        discount: payload?.discount !== undefined ? Number(payload.discount) : undefined,
        paid: payload?.paid !== undefined ? Number(payload.paid) : undefined,
        dueCommitmentDate: payload?.dueCommitmentDate ? String(payload.dueCommitmentDate).slice(0, 10) : null,
        // Air Ticket fields
        baseFare: payload?.baseFare !== undefined ? Number(payload.baseFare) : undefined,
        tax: payload?.tax !== undefined ? Number(payload.tax) : undefined,
        sellerDetails: payload?.sellerDetails ? String(payload.sellerDetails).trim() : '',
        gdsPnr: payload?.gdsPnr ? String(payload.gdsPnr).trim() : '',
        airlinePnr: payload?.airlinePnr ? String(payload.airlinePnr).trim() : '',
        ticketNo: payload?.ticketNo ? String(payload.ticketNo).trim() : '',
        passengerType: payload?.passengerType || 'adult',
        airlineName: payload?.airlineName ? String(payload.airlineName).trim() : '',
        // Flight Details
        flightType: payload?.flightType || 'oneway',
        origin: payload?.origin ? String(payload.origin).trim() : '',
        destination: payload?.destination ? String(payload.destination).trim() : '',
        flightDate: payload?.flightDate ? String(payload.flightDate).slice(0, 10) : null,
        originOutbound: payload?.originOutbound ? String(payload.originOutbound).trim() : '',
        destinationOutbound: payload?.destinationOutbound ? String(payload.destinationOutbound).trim() : '',
        outboundFlightDate: payload?.outboundFlightDate ? String(payload.outboundFlightDate).slice(0, 10) : null,
        originInbound: payload?.originInbound ? String(payload.originInbound).trim() : '',
        destinationInbound: payload?.destinationInbound ? String(payload.destinationInbound).trim() : '',
        inboundFlightDate: payload?.inboundFlightDate ? String(payload.inboundFlightDate).slice(0, 10) : null,
        // Multi City segments
        originSegment1: payload?.originSegment1 ? String(payload.originSegment1).trim() : '',
        destinationSegment1: payload?.destinationSegment1 ? String(payload.destinationSegment1).trim() : '',
        flightDateSegment1: payload?.flightDateSegment1 ? String(payload.flightDateSegment1).slice(0, 10) : null,
        originSegment2: payload?.originSegment2 ? String(payload.originSegment2).trim() : '',
        destinationSegment2: payload?.destinationSegment2 ? String(payload.destinationSegment2).trim() : '',
        flightDateSegment2: payload?.flightDateSegment2 ? String(payload.flightDateSegment2).slice(0, 10) : null,
        // Customer Fare
        customerBaseFare: payload?.customerBaseFare !== undefined ? Number(payload.customerBaseFare) : undefined,
        customerTax: payload?.customerTax !== undefined ? Number(payload.customerTax) : undefined,
        customerCommission: payload?.customerCommission !== undefined ? Number(payload.customerCommission) : undefined,
        ait: payload?.ait !== undefined ? Number(payload.ait) : undefined,
        serviceCharge: payload?.serviceCharge !== undefined ? Number(payload.serviceCharge) : undefined,
        // Vendor Fare
        vendorBaseFare: payload?.vendorBaseFare !== undefined ? Number(payload.vendorBaseFare) : undefined,
        vendorTax: payload?.vendorTax !== undefined ? Number(payload.vendorTax) : undefined,
        vendorCommission: payload?.vendorCommission !== undefined ? Number(payload.vendorCommission) : undefined,
        vendorAit: payload?.vendorAit !== undefined ? Number(payload.vendorAit) : undefined,
        vendorServiceCharge: payload?.vendorServiceCharge !== undefined ? Number(payload.vendorServiceCharge) : undefined,
      };

      // Remove undefined/null/empty string fields
      Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === null || body[key] === '') {
          delete body[key];
        }
      });

      const { data } = await axiosSecure.post('/api/invoices', body);
      return normalizeInvoice(data?.invoice || data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.pending() });
      // Success message will be shown by the calling component
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'ইনভয়েস তৈরি করতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Update invoice
export const useUpdateInvoice = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const body = {};
      
      if (updates.date !== undefined) {
        body.date = String(updates.date).slice(0, 10);
      }
      if (updates.customerId !== undefined) {
        body.customerId = String(updates.customerId).trim();
      }
      if (updates.serviceId !== undefined) {
        body.serviceId = String(updates.serviceId).trim();
      }
      if (updates.bookingId !== undefined) {
        body.bookingId = updates.bookingId ? String(updates.bookingId).trim() : '';
      }
      if (updates.vendorId !== undefined) {
        body.vendorId = updates.vendorId ? String(updates.vendorId).trim() : null;
      }
      if (updates.bill !== undefined) {
        body.bill = Number(updates.bill);
      }
      if (updates.commission !== undefined) {
        body.commission = Number(updates.commission);
      }
      if (updates.discount !== undefined) {
        body.discount = Number(updates.discount);
      }
      if (updates.paid !== undefined) {
        body.paid = Number(updates.paid);
      }
      if (updates.dueCommitmentDate !== undefined) {
        body.dueCommitmentDate = updates.dueCommitmentDate ? String(updates.dueCommitmentDate).slice(0, 10) : null;
      }
      if (updates.status !== undefined) {
        body.status = String(updates.status);
      }
      // Air Ticket fields
      if (updates.baseFare !== undefined) {
        body.baseFare = Number(updates.baseFare);
      }
      if (updates.tax !== undefined) {
        body.tax = Number(updates.tax);
      }
      if (updates.sellerDetails !== undefined) {
        body.sellerDetails = String(updates.sellerDetails).trim();
      }
      if (updates.gdsPnr !== undefined) {
        body.gdsPnr = String(updates.gdsPnr).trim();
      }
      if (updates.airlinePnr !== undefined) {
        body.airlinePnr = String(updates.airlinePnr).trim();
      }
      if (updates.ticketNo !== undefined) {
        body.ticketNo = String(updates.ticketNo).trim();
      }
      if (updates.passengerType !== undefined) {
        body.passengerType = String(updates.passengerType);
      }
      if (updates.airlineName !== undefined) {
        body.airlineName = String(updates.airlineName).trim();
      }
      // Flight Details
      if (updates.flightType !== undefined) {
        body.flightType = String(updates.flightType);
      }
      if (updates.origin !== undefined) {
        body.origin = String(updates.origin).trim();
      }
      if (updates.destination !== undefined) {
        body.destination = String(updates.destination).trim();
      }
      if (updates.flightDate !== undefined) {
        body.flightDate = updates.flightDate ? String(updates.flightDate).slice(0, 10) : null;
      }
      // Customer Fare
      if (updates.customerBaseFare !== undefined) {
        body.customerBaseFare = Number(updates.customerBaseFare);
      }
      if (updates.customerTax !== undefined) {
        body.customerTax = Number(updates.customerTax);
      }
      if (updates.customerCommission !== undefined) {
        body.customerCommission = Number(updates.customerCommission);
      }
      if (updates.ait !== undefined) {
        body.ait = Number(updates.ait);
      }
      if (updates.serviceCharge !== undefined) {
        body.serviceCharge = Number(updates.serviceCharge);
      }
      // Vendor Fare
      if (updates.vendorBaseFare !== undefined) {
        body.vendorBaseFare = Number(updates.vendorBaseFare);
      }
      if (updates.vendorTax !== undefined) {
        body.vendorTax = Number(updates.vendorTax);
      }
      if (updates.vendorCommission !== undefined) {
        body.vendorCommission = Number(updates.vendorCommission);
      }
      if (updates.vendorAit !== undefined) {
        body.vendorAit = Number(updates.vendorAit);
      }
      if (updates.vendorServiceCharge !== undefined) {
        body.vendorServiceCharge = Number(updates.vendorServiceCharge);
      }

      // Remove undefined/null/empty string fields
      Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === null || body[key] === '') {
          delete body[key];
        }
      });

      const { data } = await axiosSecure.put(`/api/invoices/${id}`, body);
      return normalizeInvoice(data?.invoice || data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.pending() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      }
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ইনভয়েস সফলভাবে আপডেট হয়েছে',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'ইনভয়েস আপডেট করতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Delete invoice (soft delete)
export const useDeleteInvoice = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/api/invoices/${id}`);
      return { id, success: data?.success || true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.pending() });
      if (result?.id) {
        queryClient.removeQueries({ queryKey: invoiceKeys.detail(result.id) });
      }
      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে!',
        text: 'ইনভয়েস সফলভাবে মুছে ফেলা হয়েছে',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'ইনভয়েস মুছতে ব্যর্থ হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: message,
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });
};

// Aggregate export for convenience
const useSalesInvoiceQueries = () => ({
  invoiceKeys,
  normalizeInvoice,
  useInvoices,
  usePendingInvoices,
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
});

export default useSalesInvoiceQueries;

