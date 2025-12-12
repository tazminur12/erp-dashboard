import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Local helpers (kept minimal and aligned with backend contract in prompt)
const isValidYmdDate = (value) => {
  if (!value) return true;
  const ymdPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof value !== 'string' || !ymdPattern.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Utility: Validate MongoDB ObjectId (24-char hex string)
export const isValidMongoId = (id) => typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id);

// Query keys for Haji domain
export const hajiKeys = {
  all: ['haji'],
  lists: () => ['haji', 'list'],
  list: (filters) => ['haji', 'list', { filters }],
  details: () => ['haji', 'detail'],
  detail: (id) => ['haji', 'detail', id],
  familySummary: (id) => ['haji', 'family-summary', id],
};

// List Haji with pagination and filters
export const useHajiList = (params) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: hajiKeys.list(params),
    queryFn: async () => {
      const response = await axiosSecure.get('/haj-umrah/haji', { params });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load haji list');
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Get single Haji by id or customerId
export const useHaji = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: hajiKeys.detail(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/haji/${id}`);
      const data = response?.data;
      if (data?.success) {
        // Ensure numeric fields are numbers (backend already sends numbers, but normalize defensively)
        const payload = data.data || {};
        return {
          ...payload,
          totalAmount: Number(payload.totalAmount || 0),
          paidAmount: Number(payload.paidAmount || 0),
          due: Number(payload.due || 0),
          ...(typeof payload.hajjDue === 'number' ? { hajjDue: Math.max(payload.hajjDue, 0) } : {}),
          ...(typeof payload.umrahDue === 'number' ? { umrahDue: Math.max(payload.umrahDue, 0) } : {}),
        };
      }
      throw new Error(data?.message || 'Failed to load haji');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Get family summary for a primary Haji
export const useHajiFamilySummary = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: hajiKeys.familySummary(id),
    queryFn: async () => {
      const response = await axiosSecure.get(`/haj-umrah/haji/${id}/family-summary`);
      const data = response?.data;
      if (data?.success) {
        const payload = data.data || {};
        return {
          ...payload,
          familyTotal: Number(payload.familyTotal || 0),
          familyPaid: Number(payload.familyPaid || 0),
          familyDue: Number(payload.familyDue || 0),
          members: Array.isArray(payload.members)
            ? payload.members.map((m) => ({
                ...m,
                totalAmount: Number(m?.totalAmount || 0),
                paidAmount: Number(m?.paidAmount || 0),
                due: Number(m?.due || 0),
                displayPaidAmount: Number(m?.displayPaidAmount || 0),
                displayDue: Number(m?.displayDue || 0),
              }))
            : [],
        };
      }
      throw new Error(data?.message || 'Failed to load family summary');
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Create Haji
export const useCreateHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Validate required fields like backend
      if (!payload?.name || !String(payload.name).trim()) {
        throw new Error('Name is required');
      }
      if (!payload?.mobile || !String(payload.mobile).trim()) {
        throw new Error('Mobile is required');
      }

      // Validate email format like backend
      if (payload?.email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(String(payload.email).trim())) {
          throw new Error('Invalid email address');
        }
      }

      // Validate dates per backend expectation
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (payload?.[field] && !isValidYmdDate(payload[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }

      const response = await axiosSecure.post('/haj-umrah/haji', payload || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create haji');
    },
    onSuccess: (data) => {
      const created = data?.data;
      const createdId = created?._id || created?.id || created?.customerId;
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      if (createdId && created) {
        queryClient.setQueryData(hajiKeys.detail(createdId), created);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'হাজি সফলভাবে তৈরি হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি তৈরি করতে সমস্যা হয়েছে।';
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

// Update Haji by id or customerId
export const useUpdateHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      // Validate email format like backend
      if (updates?.email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(String(updates.email).trim())) {
          throw new Error('Invalid email address');
        }
      }
      // Validate ObjectId
      if (!isValidMongoId(id)) {
        throw new Error('Invalid or missing Haji ID (must be valid MongoDB _id)');
      }
      // Validate dates per backend expectation
      const dateFields = ['issueDate', 'expiryDate', 'dateOfBirth', 'departureDate', 'returnDate'];
      for (const field of dateFields) {
        if (updates?.[field] && !isValidYmdDate(updates[field])) {
          throw new Error(`Invalid date format for ${field} (YYYY-MM-DD)`);
        }
      }
      const response = await axiosSecure.put(`/haj-umrah/haji/${id}`, updates || {});
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update haji');
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hajiKeys.detail(id) });
      if (data?.data) {
        queryClient.setQueryData(hajiKeys.detail(id), data.data);
      }
      Swal.fire({
        title: 'সফল!',
        text: 'হাজি তথ্য সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি আপডেটে সমস্যা হয়েছে।';
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

// Add or update a relation for a primary Haji
export const useAddHajiRelation = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ primaryId, relatedHajiId, relationType }) => {
      if (!isValidMongoId(primaryId)) {
        throw new Error('Invalid primary Haji ID');
      }
      if (!isValidMongoId(relatedHajiId)) {
        throw new Error('Invalid related Haji ID');
      }
      const payload = {
        relatedHajiId,
        relationType: relationType || 'relative',
      };
      const response = await axiosSecure.post(`/haj-umrah/haji/${primaryId}/relations`, payload);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to add relation');
    },
    onSuccess: (_data, { primaryId, relatedHajiId }) => {
      // Refresh primary details, family summary, list, and related haji detail
      queryClient.invalidateQueries({ queryKey: hajiKeys.detail(primaryId) });
      queryClient.invalidateQueries({ queryKey: hajiKeys.familySummary(primaryId) });
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      if (relatedHajiId) {
        queryClient.invalidateQueries({ queryKey: hajiKeys.detail(relatedHajiId) });
      }
      Swal.fire({
        title: 'সফল!',
        text: 'রিলেশন যুক্ত করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'রিলেশন যুক্ত করতে সমস্যা হয়েছে।';
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

// ✅ CORRECTED useDeleteHaji hook:
export const useDeleteHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // Validate ObjectId before making DELETE request
      if (!isValidMongoId(id)) {
        throw new Error('Invalid or missing Haji ID (must be valid MongoDB _id)');
      }
      const response = await axiosSecure.delete(`/haj-umrah/haji/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete haji');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });
      queryClient.removeQueries({ queryKey: hajiKeys.detail(id) });
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: 'হাজি সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'হাজি মুছতে সমস্যা হয়েছে।';
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

// Bulk Create Haji from Excel Upload
export const useBulkCreateHaji = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hajiDataArray) => {
      // Validate that we have an array with data
      if (!Array.isArray(hajiDataArray) || hajiDataArray.length === 0) {
        throw new Error('Data array is required and must not be empty');
      }

      // Filter out invalid records and collect errors
      const validRecords = [];
      const invalidRecords = [];
      
      for (let i = 0; i < hajiDataArray.length; i++) {
        const record = hajiDataArray[i];
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
          ? `All ${hajiDataArray.length} rows are invalid. Missing fields: ${invalidRecords.map(r => `Row ${r.row} (${r.missingFields})`).join('; ')}`
          : 'No valid records found';
        throw new Error(errorMsg);
      }
      
      // If some records are invalid, log warning but continue with valid ones
      if (invalidRecords.length > 0) {
        console.warn(`${invalidRecords.length} rows skipped due to missing required fields:`, invalidRecords);
      }
      
      // Use only valid records
      const recordsToProcess = validRecords;

      const response = await axiosSecure.post('/haj-umrah/haji/bulk', { data: recordsToProcess });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to bulk create haji');
    },
    onSuccess: (data) => {
      const results = data?.data || {};
      const successCount = results.successCount || 0;
      const failedCount = results.failedCount || 0;
      const total = results.total || 0;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: hajiKeys.lists() });

      // Show success message with details
      if (failedCount === 0) {
        Swal.fire({
          title: 'সফল!',
          html: `সব ${total} টি হাজি সফলভাবে তৈরি হয়েছে।`,
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Excel থেকে হাজি তৈরি করতে সমস্যা হয়েছে।';
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
  hajiKeys,
  useHajiList,
  useHaji,
  useHajiFamilySummary,
  useCreateHaji,
  useUpdateHaji,
  useDeleteHaji,
  useBulkCreateHaji,
  useAddHajiRelation,
};


