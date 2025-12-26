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
export const useEmployees = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: hrKeys.employeesList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      // Add filter parameters
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.position) params.append('position', filters.position);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);
      if (filters.status) params.append('status', filters.status);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axiosSecure.get(`/api/hr/employers?${params.toString()}`);
      
      if (response.data.success) {
        return {
          employees: response.data.data || [],
          pagination: response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10
          }
        };
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to load employees');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to fetch a single employee by ID
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
        
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || response.data.error || 'Failed to load employee');
        }
      } catch (error) {
        throw error;
      }
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to fetch employee statistics
export const useEmployeeStats = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...hrKeys.stats(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.branchId) params.append('branchId', filters.branchId);
      
      const url = `/api/hr/employers/stats/overview${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosSecure.get(url);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to load statistics');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
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
export const useCreateEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeData) => {
      const response = await axiosSecure.post('/api/hr/employers', employeeData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to create employee');
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
export const useUpdateEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data: employeeData }) => {
      const response = await axiosSecure.put(`/api/hr/employers/${id}`, employeeData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to update employee');
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
export const useDeleteEmployee = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeId) => {
      const response = await axiosSecure.delete(`/api/hr/employers/${employeeId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to delete employee');
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
export const useEmployeeSearch = (searchTerm, enabled = true) => {
  const axiosSecure = useAxiosSecure();
  
  return useQuery({
    queryKey: [...hrKeys.employees(), 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      
      try {
        // Use the main endpoint with search parameter (backend supports search in GET /api/hr/employers)
        const response = await axiosSecure.get(`/api/hr/employers?search=${encodeURIComponent(searchTerm)}&limit=10`);
        
        if (response.data.success) {
          return response.data.data || [];
        } else {
          throw new Error(response.data.message || response.data.error || 'Search failed');
        }
      } catch (error) {
        // Log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Employee search error:', error);
        }
        
        // Return empty array on error
        return [];
      }
    },
    enabled: enabled && searchTerm && searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry search queries
  });
};

