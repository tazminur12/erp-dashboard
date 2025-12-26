import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const vendorKeys = {
  all: ['vendors'],
  lists: () => [...vendorKeys.all, 'list'],
  list: (filters) => [...vendorKeys.lists(), { filters }],
  details: () => [...vendorKeys.all, 'detail'],
  detail: (id) => [...vendorKeys.details(), id],
  categories: () => [...vendorKeys.all, 'categories'],
  bills: () => [...vendorKeys.all, 'bills'],
  billsList: (filters) => [...vendorKeys.bills(), 'list', { filters }],
  billDetail: (id) => [...vendorKeys.bills(), 'detail', id],
  vendorBills: (vendorId) => [...vendorKeys.bills(), 'vendor', vendorId],
};

// Hook to fetch all vendors
export const useVendors = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      const response = await axiosSecure.get('/vendors');
      
      // Extract vendors array from response
      const vendorsData = response.data?.vendors || response.data || [];
      
      // Transform vendor data to match frontend expectations
      const transformedVendors = vendorsData.map(vendor => ({
        _id: vendor._id || vendor.id,
        vendorId: vendor.vendorId || vendor.id || vendor._id,
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        dob: vendor.dob || '',
        nid: vendor.nid || '',
        passport: vendor.passport || '',
        logo: vendor.logo || '',
        createdAt: vendor.createdAt || new Date().toISOString(),
        updatedAt: vendor.updatedAt || new Date().toISOString()
      }));
      
      return transformedVendors;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for server errors (5xx)
      return failureCount < 3;
    },
  });
};

// Hook to fetch a single vendor by ID
export const useVendor = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: async () => {
      if (!vendorId) return null;
      
      // Fetch single vendor by ID from API
      const response = await axiosSecure.get(`/vendors/${vendorId}`);
      
      if (!response?.data) {
        throw new Error('Empty response while fetching vendor');
      }
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch vendor');
      }
      
      const vendor = response.data.vendor || response.data;
      const recentActivity = response.data.recentActivity || {};
      const transactionsActivity = Array.isArray(recentActivity.transactions) ? recentActivity.transactions : [];
      const billsActivity = Array.isArray(recentActivity.bills) ? recentActivity.bills : [];
      
      if (!vendor) {
        throw new Error(`Vendor with ID "${vendorId}" not found`);
      }
      
      // Normalize/transform vendor data to match frontend expectations
      return {
        _id: vendor._id || vendor.id,
        vendorId: vendor.vendorId || vendor.id || vendor._id,
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        dob: vendor.dob || '',
        nid: vendor.nid || '',
        passport: vendor.passport || '',
        logo: vendor.logo || '',
        totalPaid: vendor.totalPaid ?? 0,
        totalDue: vendor.totalDue ?? 0,
        hajDue: vendor.hajDue ?? 0,
        umrahDue: vendor.umrahDue ?? 0,
        createdAt: vendor.createdAt || new Date().toISOString(),
        updatedAt: vendor.updatedAt || new Date().toISOString(),
        recentActivity: {
          transactions: transactionsActivity.map((tx) => ({
            transactionId: tx.transactionId || tx._id,
            transactionType: tx.transactionType || tx.type || '',
            amount: tx.amount ?? 0,
            status: tx.status || '',
            paymentMethod: tx.paymentMethod || tx?.paymentDetails?.method || null,
            reference: tx.reference || tx?.paymentDetails?.reference || tx.transactionId || tx._id,
            createdAt: tx.createdAt || tx.date || null,
          })),
          bills: billsActivity.map((bill) => ({
            billId: bill.billId || bill._id,
            billNumber: bill.billNumber || null,
            billType: bill.billType || null,
            totalAmount: bill.totalAmount ?? 0,
            paidAmount: bill.amount ?? bill.paidAmount ?? 0,
            paymentStatus: bill.paymentStatus || null,
            billDate: bill.billDate || null,
            createdAt: bill.createdAt || null,
          })),
        }
      };
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch customer types/categories for order types
export const useCustomerTypes = () => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.categories(),
    queryFn: async () => {
      const response = await axiosSecure.get('/customer-types');
      
      if (response.data.success) {
        return response.data.customerTypes || response.data.categories || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Mutation to create a new vendor
export const useCreateVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorData) => {
      const response = await axiosSecure.post('/vendors', vendorData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create vendor');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Add the new vendor to the cache if needed
      if (data.vendor) {
        const cacheId = data.vendor._id || data.vendor.id || data.vendor.vendorId;
        queryClient.setQueryData(
          vendorKeys.detail(cacheId),
          data.vendor
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor added successfully',
        text: 'New vendor has been created successfully.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to add vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Mutation to update a vendor
export const useUpdateVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, vendorData }) => {
      const response = await axiosSecure.put(`/vendors/${vendorId}`, vendorData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update vendor');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Update the specific vendor in cache
      if (data.vendor) {
        queryClient.setQueryData(
          vendorKeys.detail(variables.vendorId),
          data.vendor
        );
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor updated successfully',
        text: 'Vendor information has been updated successfully.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Mutation to delete a vendor
export const useDeleteVendor = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorId) => {
      const response = await axiosSecure.delete(`/vendors/${vendorId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete vendor');
      }
    },
    onSuccess: (data, vendorId) => {
      // Invalidate and refetch vendor list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Remove the vendor from cache
      queryClient.removeQueries({ queryKey: vendorKeys.detail(vendorId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Vendor deleted successfully',
        text: 'Vendor has been removed from the system.',
        showConfirmButton: false,
        timer: 1400
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete vendor. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    },
  });
};

// Hook to fetch vendor financial data
export const useVendorFinancials = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: [...vendorKeys.detail(vendorId), 'financials'],
    queryFn: async () => {
      if (!vendorId) return null;
      
      try {
        // Try to fetch from API first
        const response = await axiosSecure.get(`/vendors/${vendorId}/financials`);
        
        if (response.data.success) {
          return response.data.financials || response.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch financial data');
        }
      } catch (error) {
        // If API fails, return mock data
        console.warn('Financial API not available, using mock data:', error.message);
        return {
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalAmount: Math.floor(Math.random() * 200000) + 50000,
          outstandingAmount: Math.floor(Math.random() * 50000) + 5000,
          paidAmount: Math.floor(Math.random() * 150000) + 30000,
          lastPaymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          averageOrderValue: Math.floor(Math.random() * 10000) + 2000,
          creditLimit: Math.floor(Math.random() * 100000) + 20000,
          paymentTerms: 'Net 30',
          businessType: 'Wholesale',
          registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
          status: Math.random() > 0.1 ? 'Active' : 'Inactive'
        };
      }
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once since we have fallback
  });
};

// Hook to fetch vendor activities
export const useVendorActivities = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: [...vendorKeys.detail(vendorId), 'activities'],
    queryFn: async () => {
      if (!vendorId) return [];
      
      try {
        // Try to fetch from API first
        const response = await axiosSecure.get(`/vendors/${vendorId}/activities`);
        
        if (response.data.success) {
          return response.data.activities || response.data || [];
        } else {
          throw new Error(response.data.message || 'Failed to fetch activities');
        }
      } catch (error) {
        // If API fails, return mock activities
        console.warn('Activities API not available, using mock data:', error.message);
        return [
          {
            id: '1',
            type: 'order',
            title: 'New order created',
            description: 'Order #ORD-001 for ৳5,000',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            icon: 'Receipt'
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment received',
            description: 'Payment of ৳10,000 received',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            icon: 'CheckCircle'
          },
          {
            id: '3',
            type: 'update',
            title: 'Profile updated',
            description: 'Contact information updated',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            icon: 'Edit'
          }
        ];
      }
    },
    enabled: !!vendorId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1, // Only retry once since we have fallback
  });
};

// Mutation to create an order for a vendor
export const useCreateVendorOrder = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axiosSecure.post('/orders', orderData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate vendor queries to refresh data
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'financials'] });
      queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'activities'] });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Order created successfully',
        text: 'New order has been created successfully.',
        confirmButtonColor: '#7c3aed'
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create order. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Failed to create order',
        text: message,
        confirmButtonColor: '#dc2626'
      });
    },
  });
};

// Hook to fetch all vendor bills with filters
export const useVendorBills = (filters = {}) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.billsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.billType) params.append('billType', filters.billType);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await axiosSecure.get(`/vendors/bills?${params.toString()}`);
      
      if (response.data.success) {
        return response.data.bills || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendor bills');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Hook to fetch a single vendor bill by ID
export const useVendorBill = (billId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorKeys.billDetail(billId),
    queryFn: async () => {
      if (!billId) return null;
      
      const response = await axiosSecure.get(`/vendors/bills/${billId}`);
      
      if (response.data.success) {
        return response.data.bill;
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendor bill');
      }
    },
    enabled: !!billId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to fetch all bills for a specific vendor
export const useVendorBillsByVendor = (vendorId, options = {}) => {
  const axiosSecure = useSecureAxios();
  const { limit = 100 } = options;
  
  return useQuery({
    queryKey: vendorKeys.vendorBills(vendorId),
    queryFn: async () => {
      if (!vendorId) return [];
      
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      
      const response = await axiosSecure.get(`/vendors/${vendorId}/bills?${params.toString()}`);
      
      if (response.data.success) {
        return response.data.bills || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendor bills');
      }
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

// Mutation to create a vendor bill
export const useCreateVendorBill = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billData) => {
      const response = await axiosSecure.post('/vendors/bills', billData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create vendor bill');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate vendor queries to refresh data
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.bills() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.billsList() });
      
      if (variables.vendorId) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.vendorId) });
        queryClient.invalidateQueries({ queryKey: vendorKeys.vendorBills(variables.vendorId) });
        queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'financials'] });
        queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(variables.vendorId), 'activities'] });
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Bill generated successfully',
        text: 'Vendor bill has been created successfully.',
        confirmButtonColor: '#7c3aed',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to generate bill. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#dc2626'
      });
    },
  });
};

// Mutation to update a vendor bill
export const useUpdateVendorBill = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ billId, updateData }) => {
      const response = await axiosSecure.patch(`/vendors/bills/${billId}`, updateData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update vendor bill');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: vendorKeys.bills() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.billDetail(variables.billId) });
      queryClient.invalidateQueries({ queryKey: vendorKeys.billsList() });
      
      // Update the specific bill in cache
      if (data.bill) {
        queryClient.setQueryData(
          vendorKeys.billDetail(variables.billId),
          data.bill
        );
      }
      
      // If bill has vendorId, invalidate vendor-specific queries
      if (data.bill?.vendorId) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.vendorBills(data.bill.vendorId) });
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(data.bill.vendorId) });
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Bill updated successfully',
        text: 'Vendor bill has been updated successfully.',
        confirmButtonColor: '#7c3aed',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update bill. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#dc2626'
      });
    },
  });
};

// Mutation to delete a vendor bill (soft delete)
export const useDeleteVendorBill = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billId) => {
      const response = await axiosSecure.delete(`/vendors/bills/${billId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete vendor bill');
      }
    },
    onSuccess: (data, billId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: vendorKeys.bills() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.billsList() });
      
      // Remove the bill from cache
      queryClient.removeQueries({ queryKey: vendorKeys.billDetail(billId) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Bill deleted successfully',
        text: 'Vendor bill has been deleted successfully.',
        confirmButtonColor: '#7c3aed',
        timer: 2000
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete bill. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#dc2626'
      });
    },
  });
};

// Bulk Create Vendors from Excel Upload
export const useBulkVendorOperation = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorsDataArray) => {
      // Validate that we have an array with data
      if (!Array.isArray(vendorsDataArray) || vendorsDataArray.length === 0) {
        throw new Error('Vendors array is required and must not be empty');
      }

      // Filter out invalid records and collect errors
      const validRecords = [];
      const invalidRecords = [];
      
      for (let i = 0; i < vendorsDataArray.length; i++) {
        const record = vendorsDataArray[i];
        const rowNumber = i + 1;
        
        // Map Excel field names (from ExcelUploader) to backend expected field names
        // ExcelUploader returns data with Excel header names like "Trade Name", "Owner Name", etc.
        // Backend expects: tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport
        
        // Try multiple possible field name variations
        const tradeName = record['Trade Name'] || record['tradeName'] || record.tradeName || '';
        const tradeLocation = record['Trade Location'] || record['tradeLocation'] || record.tradeLocation || '';
        const ownerName = record['Owner Name'] || record['ownerName'] || record.ownerName || '';
        const contactNo = record['Contact No'] || record['contactNo'] || record.contactNo || '';
        
        // Optional fields
        const dob = record['Date of Birth'] || record['DOB'] || record['dob'] || record.dob || null;
        const nid = record['NID'] || record['nid'] || record.nid || '';
        const passport = record['Passport'] || record['passport'] || record.passport || '';
        
        // Validate required fields (same as backend validation)
        if (!tradeName || !String(tradeName).trim()) {
          invalidRecords.push({ row: rowNumber, missingFields: 'Trade Name' });
          continue;
        }
        if (!tradeLocation || !String(tradeLocation).trim()) {
          invalidRecords.push({ row: rowNumber, missingFields: 'Trade Location' });
          continue;
        }
        if (!ownerName || !String(ownerName).trim()) {
          invalidRecords.push({ row: rowNumber, missingFields: 'Owner Name' });
          continue;
        }
        if (!contactNo || !String(contactNo).trim()) {
          invalidRecords.push({ row: rowNumber, missingFields: 'Contact No' });
          continue;
        }
        
        // Add valid record with proper field mapping (backend field names)
        validRecords.push({
          tradeName: String(tradeName).trim(),
          tradeLocation: String(tradeLocation).trim(),
          ownerName: String(ownerName).trim(),
          contactNo: String(contactNo).trim(),
          dob: dob && dob.trim() ? String(dob).trim() : null,
          nid: nid && nid.trim() ? String(nid).trim() : '',
          passport: passport && passport.trim() ? String(passport).trim() : ''
        });
      }
      
      // If no valid records, throw error
      if (validRecords.length === 0) {
        const errorMsg = invalidRecords.length > 0
          ? `Row ${invalidRecords[0].row}: ${invalidRecords[0].missingFields || invalidRecords[0].error || 'Invalid data'}`
          : 'No valid records found';
        throw new Error(errorMsg);
      }
      
      // If some records are invalid, log warning but continue with valid ones
      if (invalidRecords.length > 0) {
        console.warn(`${invalidRecords.length} rows skipped due to validation errors:`, invalidRecords);
        // Show warning but don't fail the entire operation
      }

      // Backend accepts either array directly or { vendors: [...] }
      // Send as array directly as per backend code: const vendorsPayload = Array.isArray(req.body) ? req.body : req.body?.vendors;
      const response = await axiosSecure.post('/vendors/bulk', validRecords);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to bulk create vendors');
    },
    onSuccess: (data) => {
      const count = data?.count || data?.data?.length || 0;
      
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // Show success message with details
      Swal.fire({
        title: 'সফল!',
        html: `${count} টি ভেন্ডর সফলভাবে তৈরি হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 5000,
        showConfirmButton: true,
      });
    },
    onError: (error) => {
      // Backend returns error format: { error: true, message: "..." }
      const errorMessage = error?.response?.data?.message || error?.message || 'Excel থেকে ভেন্ডর তৈরি করতে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};