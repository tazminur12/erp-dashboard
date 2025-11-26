import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys for consistent caching
export const agentKeys = {
  all: ['agents'],
  lists: () => [...agentKeys.all, 'list'],
  list: (filters) => [...agentKeys.lists(), { filters }],
  details: () => [...agentKeys.all, 'detail'],
  detail: (id) => [...agentKeys.details(), id],
};

// Custom hook for fetching agents list with pagination and search
export const useAgents = (page = 1, limit = 10, searchTerm = '') => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: agentKeys.list({ page, limit, searchTerm }),
    queryFn: async () => {
      const response = await axiosSecure.get('/api/haj-umrah/agents', {
        params: { page, limit, search: searchTerm }
      });
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to load agents');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for fetching single agent details
export const useAgent = (id) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosSecure.get(`/api/haj-umrah/agents/${id}`);
      const data = response?.data;
      if (data?.success) {
        const agent = data?.data || {};
        // Normalize/ensure fields exist with safe defaults
        return {
          _id: agent._id || agent.id,
          agentId: agent.agentId || agent._id || agent.id,
          tradeName: agent.tradeName || '',
          tradeLocation: agent.tradeLocation || '',
          ownerName: agent.ownerName || '',
          contactNo: agent.contactNo || '',
          email: agent.email || '',
          dob: agent.dob || agent.dateOfBirth || '',
          nid: agent.nid || '',
          passport: agent.passport || '',
          licenseNumber: agent.licenseNumber || '',
          bankAccount: agent.bankAccount || '',
          paymentMethod: agent.paymentMethod || '',
          isActive: agent.isActive !== undefined ? agent.isActive : true,
          totalDue: agent.totalDue ?? 0,
          hajDue: agent.hajDue ?? 0,
          umrahDue: agent.umrahDue ?? 0,
          totalDeposit: agent.totalDeposit ?? 0,
          totalRevenue: agent.totalRevenue ?? 0,
          commissionRate: agent.commissionRate ?? 0,
          pendingPayments: agent.pendingPayments ?? 0,
          lastActivity: agent.lastActivity || null,
          createdAt: agent.createdAt || null,
          updatedAt: agent.updatedAt || null,
          // Preserve any other fields
          ...agent,
        };
      }
      throw new Error(data?.message || 'Failed to load agent');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Custom hook for creating a new agent
export const useCreateAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData) => {
      const response = await axiosSecure.post('/api/haj-umrah/agents', agentData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to create agent');
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent created successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for updating an agent
export const useUpdateAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...agentData }) => {
      const response = await axiosSecure.put(`/api/haj-umrah/agents/${id}`, agentData);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to update agent');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch agents list and specific agent detail
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.id) });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent updated successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Custom hook for deleting an agent
export const useDeleteAgent = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.delete(`/api/haj-umrah/agents/${id}`);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to delete agent');
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Agent deleted successfully',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete agent';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    },
  });
};

// Bulk Create Agents from Excel Upload
export const useBulkAgentOperation = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentsDataArray) => {
      // Validate that we have an array with data
      if (!Array.isArray(agentsDataArray) || agentsDataArray.length === 0) {
        throw new Error('Agents array is required and must not be empty');
      }

      // Filter out invalid records and collect errors
      const validRecords = [];
      const invalidRecords = [];
      
      for (let i = 0; i < agentsDataArray.length; i++) {
        const record = agentsDataArray[i];
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
        
        // Validate required fields
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
        
        // Validate phone format (same regex as backend)
        const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
        if (!phoneRegex.test(String(contactNo).trim())) {
          invalidRecords.push({ row: rowNumber, error: 'Enter a valid phone number' });
          continue;
        }
        
        // Validate NID if provided (same regex as backend)
        if (nid && nid.trim() && !/^[0-9]{8,20}$/.test(String(nid).trim())) {
          invalidRecords.push({ row: rowNumber, error: 'NID should be 8-20 digits' });
          continue;
        }
        
        // Validate Passport if provided (same regex as backend)
        if (passport && passport.trim() && !/^[A-Za-z0-9]{6,12}$/.test(String(passport).trim())) {
          invalidRecords.push({ row: rowNumber, error: 'Passport should be 6-12 chars' });
          continue;
        }
        
        // Validate date format if provided (backend uses isValidDate function)
        if (dob && dob.trim()) {
          // Basic date validation - YYYY-MM-DD format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(String(dob).trim())) {
            invalidRecords.push({ row: rowNumber, error: 'Invalid date format for dob (YYYY-MM-DD)' });
            continue;
          }
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

      // Backend accepts either array directly or { agents: [...] }
      // Send as array directly as per backend code: const agentsPayload = Array.isArray(req.body) ? req.body : req.body?.agents;
      const response = await axiosSecure.post('/api/haj-umrah/agents/bulk', validRecords);
      const data = response?.data;
      if (data?.success) return data;
      throw new Error(data?.message || 'Failed to bulk create agents');
    },
    onSuccess: (data) => {
      const count = data?.count || data?.data?.length || 0;
      
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      
      // Show success message with details
      Swal.fire({
        title: 'সফল!',
        html: `${count} টি এজেন্ট সফলভাবে তৈরি হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        timer: 5000,
        showConfirmButton: true,
      });
    },
    onError: (error) => {
      // Backend returns error format: { error: true, message: "..." }
      const errorMessage = error?.response?.data?.message || error?.message || 'Excel থেকে এজেন্ট তৈরি করতে সমস্যা হয়েছে।';
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

// Custom hook for agent statistics
export const useAgentStats = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [...agentKeys.all, 'stats'],
    queryFn: async () => {
      const response = await axiosSecure.get('/api/haj-umrah/agents/stats');
      const data = response?.data;
      if (data?.success) return data?.data;
      throw new Error(data?.message || 'Failed to load agent statistics');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
