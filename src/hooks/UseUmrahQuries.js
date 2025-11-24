import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

const isValidYmdDate = (value) => {
  if (!value) return true;
  const ymdPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof value !== 'string' || !ymdPattern.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const umrahKeys = {
  all: ['umrah'],
  lists: () => ['umrah', 'list'],
  list: (filters) => ['umrah', 'list', { filters }],
  details: () => ['umrah', 'detail'],
  detail: (id) => ['umrah', 'detail', id],
};

export const useUmrahList = (params) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/umrah', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load umrah list');
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useUmrah = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/umrah/${id}`);
      const data = response?.data;
      if (data?.success) {
        // Ensure numeric fields are numbers (backend already sends numbers, but normalize defensively)
        const payload = data.data || {};
        return {
          ...payload,
          totalAmount: Number(payload.totalAmount || 0),
          paidAmount: Number(payload.paidAmount || 0),
          due: Number(payload.due || 0),
        };
      }
      throw new Error(data?.message || 'Failed to load umrah');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Fetch Umrah by either Mongo _id or customerId using the same endpoint
export const useUmrahByIdOrCustomerId = (identifier) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: umrahKeys.detail(identifier),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/umrah/${identifier}`);
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load umrah');
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCreateUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Minimal client-side validation to mirror backend
      if (!payload?.name) throw new Error('Name is required');
      if (!payload?.mobile) throw new Error('Mobile is required');
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (payload?.[field] && !isValidYmdDate(payload[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.post('/haj-umrah/umrah', payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create umrah');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      if (data?.data?._id) {
        const id = data.data._id;
        queryClient.setQueryData(umrahKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'উমরাহ সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ তৈরি করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export const useUpdateUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (updates?.[field] && !isValidYmdDate(updates[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.put(`/haj-umrah/umrah/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update umrah');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      queryClient.invalidateQueries({ queryKey: umrahKeys.detail(id) });
      if (data?.data) {
        queryClient.setQueryData(umrahKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'উমরাহ তথ্য সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ আপডেটে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

export const useDeleteUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/haj-umrah/umrah/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete umrah');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });
      queryClient.removeQueries({ queryKey: umrahKeys.detail(id) });
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'উমরাহ সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || error?.message || 'উমরাহ মুছতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Bulk Create Umrah from Excel Upload
export const useBulkCreateUmrah = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (umrahDataArray) => {
      // Validate that we have an array with data
      if (!Array.isArray(umrahDataArray) || umrahDataArray.length === 0) {
        throw new Error('Data array is required and must not be empty');
      }

      // Filter out invalid records and collect errors
      const validRecords = [];
      const invalidRecords = [];
      
      for (let i = 0; i < umrahDataArray.length; i++) {
        const record = umrahDataArray[i];
        const rowNumber = i + 1;
        
        // Check required fields - try multiple variations
        const name = record['Name'] || 
                     record['name'] || 
                     record.name || 
                     record['নাম'] || // Bengali
                     '';
        
        const mobile = record['Mobile no'] || 
                       record['Mobile No'] || 
                       record['mobile no'] || 
                       record['Mobile'] || 
                       record.mobile ||
                       record['মোবাইল নং'] || // Bengali
                       record['মোবাইল'] || // Bengali
                       '';
        
        // Validate required fields
        const nameValid = name && String(name).trim();
        const mobileValid = mobile && String(mobile).trim();
        
        if (!nameValid || !mobileValid) {
          const missingFields = [];
          if (!nameValid) missingFields.push('Name');
          if (!mobileValid) missingFields.push('Mobile');
          invalidRecords.push({
            row: rowNumber,
            missingFields: missingFields.join(', ')
          });
          console.warn(`Row ${rowNumber} skipped - missing: ${missingFields.join(', ')}`);
          continue; // Skip this record
        }
        
        // Add valid record
        validRecords.push(record);
      }
      
      // If no valid records, throw error
      if (validRecords.length === 0) {
        const errorMsg = invalidRecords.length > 0
          ? `All ${umrahDataArray.length} rows are invalid. Missing fields: ${invalidRecords.map(r => `Row ${r.row} (${r.missingFields})`).join('; ')}`
          : 'No valid records found';
        throw new Error(errorMsg);
      }
      
      // If some records are invalid, log warning but continue with valid ones
      if (invalidRecords.length > 0) {
        console.warn(`${invalidRecords.length} rows skipped due to missing required fields:`, invalidRecords);
      }
      
      // Use only valid records
      const recordsToProcess = validRecords;

      const response = await axiosSecure.post('/haj-umrah/umrah/bulk', { data: recordsToProcess });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to bulk create umrah');
    },
    onSuccess: (data) => {
      const results = data?.data || {};
      const successCount = results.successCount || 0;
      const failedCount = results.failedCount || 0;
      const total = results.total || 0;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: umrahKeys.lists() });

      // Show success message with details
      if (failedCount === 0) {
        Swal.fire({
          title: 'সফল!',
          html: `সব ${total} টি উমরাহ হাজি সফলভাবে তৈরি হয়েছে।`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      } else {
        Swal.fire({
          title: 'আংশিক সফল!',
          html: `
            <div class="text-left">
              <p>মোট: ${total} টি রেকর্ড</p>
              <p class="text-green-600">সফল: ${successCount} টি</p>
              <p class="text-red-600">ব্যর্থ: ${failedCount} টি</p>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Excel থেকে উমরাহ হাজি তৈরি করতে সমস্যা হয়েছে।';
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

export default {
  umrahKeys,
  useUmrahList,
  useUmrah,
  useCreateUmrah,
  useUpdateUmrah,
  useDeleteUmrah,
  useBulkCreateUmrah,
};


