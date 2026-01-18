import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const hrKeys = {
  all: ['hr'],
  employees: () => [...hrKeys.all, 'employees'],
  employeesList: (filters) => [...hrKeys.employees(), 'list', { filters }],
  employeeDetail: (id) => [...hrKeys.employees(), 'detail', id],
  stats: () => [...hrKeys.all, 'stats', 'overview'],
  departments: () => [...hrKeys.all, 'departments'],
  positions: () => [...hrKeys.all, 'positions'],
  branches: () => [...hrKeys.all, 'branches'],
  activeBranches: () => [...hrKeys.branches(), 'active'],
};

// Hook to fetch all employees with pagination and filters
// Backend: GET /api/hr/employers
// Supports: page, limit, search, department, status, branch, position, employmentType
// Backend returns: { success: true, data: employees[], pagination: {...} }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useEmployees = (filters = {}, options = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.employeesList(filters),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        // Add pagination parameters (backend defaults: page=1, limit=1000)
        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
        
        // Add filter parameters (matches backend query params)
        // Only add non-empty values to avoid backend errors
        if (filters.search && String(filters.search).trim()) {
          params.append('search', String(filters.search).trim());
        }
        if (filters.department && String(filters.department).trim()) {
          params.append('department', String(filters.department).trim());
        }
        if (filters.position && String(filters.position).trim()) {
          params.append('position', String(filters.position).trim());
        }
        if (filters.employmentType && String(filters.employmentType).trim()) {
          params.append('employmentType', String(filters.employmentType).trim());
        }
        if (filters.status && String(filters.status).trim()) {
          params.append('status', String(filters.status).trim());
        }
        if (filters.branch && String(filters.branch).trim()) {
          params.append('branch', String(filters.branch).trim());
        }
        
        const response = await axiosSecure.get(`/api/hr/employers?${params.toString()}`);
        
        // Backend returns: { success: true, data: employees[], pagination: {...} }
        if (response.data.success) {
          // Ensure employees is an array (backend handles this, but be defensive)
          const employees = Array.isArray(response.data.data) ? response.data.data : [];
          return {
            employees,
            pagination: response.data.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 10
            }
          };
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details || 
            'Failed to load employees'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to load employees';
        throw new Error(errorMessage);
      }
    },
    enabled: options.enabled !== false, // Allow disabling the query
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for 5xx errors (server errors)
      return failureCount < 3;
    },
  });
};

// Hook to fetch a single employee by ID
// Backend: GET /api/hr/employers/:id
// Supports: _id, employeeId, or employerId (for backward compatibility)
// Backend returns: { success: true, data: employee }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useEmployee = (employeeId) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.employeeDetail(employeeId),
    queryFn: async () => {
      if (!employeeId) {
        return null;
      }
      
      try {
        const response = await axiosSecure.get(`/api/hr/employers/${employeeId}`);
        
        // Backend returns: { success: true, data: employee }
        if (response.data.success) {
          return response.data.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details || 
            'Failed to load employee'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to load employee';
        throw new Error(errorMessage);
      }
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors like 404)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to fetch employee statistics
// Backend: GET /api/hr/employers/stats/overview
// Supports: branch or branchId query params
// Returns: { totalEmployees, activeEmployees, inactiveEmployees, departmentStats, positionStats, employmentTypeStats }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useEmployeeStats = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...hrKeys.stats(), filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.branch && String(filters.branch).trim()) {
          params.append('branch', String(filters.branch).trim());
        }
        if (filters.branchId && String(filters.branchId).trim()) {
          params.append('branchId', String(filters.branchId).trim());
        }
        
        const url = `/api/hr/employers/stats/overview${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axiosSecure.get(url);
        
        // Backend returns: { success: true, data: { totalEmployees, activeEmployees, ... } }
        if (response.data.success) {
          // Ensure arrays are valid (backend handles this, but be defensive)
          const data = response.data.data || {};
          return {
            totalEmployees: data.totalEmployees || 0,
            activeEmployees: data.activeEmployees || 0,
            inactiveEmployees: data.inactiveEmployees || 0,
            departmentStats: Array.isArray(data.departmentStats) ? data.departmentStats : [],
            positionStats: Array.isArray(data.positionStats) ? data.positionStats : [],
            employmentTypeStats: Array.isArray(data.employmentTypeStats) ? data.employmentTypeStats : []
          };
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details || 
            'Failed to load statistics'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to load statistics';
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to fetch departments
export const useDepartments = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.departments(),
    queryFn: async () => {
      const response = await axiosSecure.get('/hr/departments');
      
      if (response.data.success) {
        return response.data.departments || [];
      } else {
        throw new Error(response.data.message || 'Failed to load departments');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch positions
export const usePositions = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.positions(),
    queryFn: async () => {
      const response = await axiosSecure.get('/hr/positions');
      
      if (response.data.success) {
        return response.data.positions || [];
      } else {
        throw new Error(response.data.message || 'Failed to load positions');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation to create a new employee
// Backend: POST /api/hr/employers
// Required fields: firstName, lastName, email, phone, employeeId, position, department, branch, joinDate, basicSalary
// Returns: { success: true, message: "...", data: { id, employeeId, firstName, lastName, ... } }
// Backend error: { success: false, error: "...", message: "..." }
export const useCreateEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeData) => {
      try {
        const response = await axiosSecure.post('/api/hr/employers', employeeData);
        
        // Backend returns: { success: true, message: "...", data: {...} }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            'Failed to create employee'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error ||
                           error?.message || 
                           'Failed to create employee';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch employee list
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
      
      // Add the new employee to the cache if needed
      if (data.data) {
        const employeeId = data.data.id || data.data.employeeId || data.data._id;
        if (employeeId) {
          queryClient.setQueryData(
            hrKeys.employeeDetail(employeeId),
            data.data
          );
        }
      }
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'নতুন কর্মচারী সফলভাবে যোগ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "..." }
      const message = error?.response?.data?.message || error?.response?.data?.error || 'কর্মচারী যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update an employee
// Backend: PUT /api/hr/employers/:id
// Supports: _id, employeeId, or employerId (for backward compatibility)
// Cannot update: _id, employeeId, employerId, createdAt
// Returns: { success: true, message: "...", data: updatedEmployee }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useUpdateEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data: employeeData }) => {
      try {
        const response = await axiosSecure.put(`/api/hr/employers/${id}`, employeeData);
        
        // Backend returns: { success: true, message: "...", data: updatedEmployee }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details ||
            'Failed to update employee'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to update employee';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, { id }) => {
      // Invalidate and refetch employee list
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
      
      // Invalidate specific employee details
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeDetail(id) });
      
      // Update the employee in cache if needed
      if (data.data) {
        queryClient.setQueryData(
          hrKeys.employeeDetail(id),
          data.data
        );
      }
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: data.message || 'কর্মচারী তথ্য সফলভাবে আপডেট করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "..." }
      const message = error?.response?.data?.message || error?.response?.data?.error || 'কর্মচারী আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to delete an employee (soft delete)
// Backend: DELETE /api/hr/employers/:id
// Supports: _id, employeeId, or employerId (for backward compatibility)
// Sets: isActive = false, deletedAt = new Date()
// Returns: { success: true, message: "..." }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useDeleteEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeId) => {
      try {
        const response = await axiosSecure.delete(`/api/hr/employers/${employeeId}`);
        
        // Backend returns: { success: true, message: "..." }
        if (response.data.success) {
          return response.data;
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details ||
            'Failed to delete employee'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Failed to delete employee';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, employeeId) => {
      // Invalidate and refetch employee list
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
      
      // Remove the specific employee from cache
      queryClient.removeQueries({ queryKey: hrKeys.employeeDetail(employeeId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
      
      // Show success message
      Swal.fire({
        title: 'মুছে ফেলা হয়েছে!',
        text: data.message || 'কর্মচারী সফলভাবে মুছে ফেলা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      // Backend error format: { success: false, error: "...", message: "..." }
      const message = error?.response?.data?.message || error?.response?.data?.error || 'কর্মচারী মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Mutation to update employee status
export const useUpdateEmployeeStatus = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, status }) => {
      // Backend uses PUT for updates, so we'll use PUT with status field
      const response = await axiosSecure.put(`/api/hr/employers/${employeeId}`, {
        status
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to update employee status');
      }
    },
    onSuccess: (data, { employeeId }) => {
      // Invalidate and refetch employee list
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
      
      // Invalidate specific employee details
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeDetail(employeeId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: hrKeys.stats() });
      
      // Show success message
      const statusText = data.data?.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়';
      Swal.fire({
        title: 'সফল!',
        text: `কর্মচারী স্ট্যাটাস ${statusText} করা হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'কর্মচারী স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    },
  });
};

// Hook to fetch active branches
export const useActiveBranches = () => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.activeBranches(),
    queryFn: async () => {
      try {
        const response = await axiosSecure.get('/api/branches/active');
        
        // Handle different response structures
        if (response.data.success) {
          return response.data.branches || response.data.data || [];
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Failed to load branches');
        }
      } catch (error) {
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to search employees for reference functionality
// Backend: GET /api/hr/employers?search=...&limit=10
// Backend returns: { success: true, data: employees[], pagination: {...} }
// Backend error: { success: false, error: "...", message: "...", details: "..." }
export const useEmployeeSearch = (searchTerm, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  // Ensure enabled is a boolean - check if searchTerm exists and has at least 2 characters
  const searchTermStr = searchTerm ? String(searchTerm).trim() : '';
  const isEnabled = Boolean(enabled && searchTermStr.length >= 2);
  
  return useQuery({
    queryKey: [...hrKeys.employees(), 'search', searchTermStr],
    queryFn: async () => {
      if (!searchTermStr || searchTermStr.length < 2) {
        return [];
      }
      
      try {
        // Use the main endpoint with search parameter (backend supports search in GET /api/hr/employers)
        // Backend handles regex escaping automatically
        const response = await axiosSecure.get(`/api/hr/employers?search=${encodeURIComponent(searchTermStr)}&limit=10`);
        
        // Backend returns: { success: true, data: employees[], pagination: {...} }
        if (response.data.success) {
          // Ensure employees is an array (backend handles this, but be defensive)
          return Array.isArray(response.data.data) ? response.data.data : [];
        } else {
          // Backend error format: { success: false, error: "...", message: "...", details: "..." }
          throw new Error(
            response.data.message || 
            response.data.error || 
            response.data.details ||
            'Search failed'
          );
        }
      } catch (error) {
        // Enhanced error handling to match backend error structure
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.data?.details ||
                           error?.message || 
                           'Search failed';
        throw new Error(errorMessage);
      }
    },
    enabled: isEnabled, // Always a boolean
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry search queries to avoid unnecessary API calls
  });
};

