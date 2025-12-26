import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';
import Swal from 'sweetalert2';

// Query keys
export const vendorBankKeys = {
  all: ['vendorBankAccounts'],
  lists: () => [...vendorBankKeys.all, 'list'],
  list: (vendorId) => [...vendorBankKeys.lists(), vendorId],
  details: () => [...vendorBankKeys.all, 'detail'],
  detail: (vendorId, accountId) => [...vendorBankKeys.details(), vendorId, accountId],
};

// Hook to fetch all bank accounts for a vendor
export const useVendorBankAccounts = (vendorId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorBankKeys.list(vendorId),
    queryFn: async () => {
      if (!vendorId) return [];
      
      const response = await axiosSecure.get(`/vendors/${vendorId}/bank-accounts`);
      
      return response.data?.data || [];
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to fetch a single bank account
export const useVendorBankAccount = (vendorId, accountId) => {
  const axiosSecure = useSecureAxios();
  
  return useQuery({
    queryKey: vendorBankKeys.detail(vendorId, accountId),
    queryFn: async () => {
      if (!vendorId || !accountId) return null;
      
      const response = await axiosSecure.get(`/vendors/${vendorId}/bank-accounts/${accountId}`);
      
      return response.data?.data || null;
    },
    enabled: !!vendorId && !!accountId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to create a vendor bank account
export const useCreateVendorBankAccount = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, bankAccountData }) => {
      const response = await axiosSecure.post(
        `/vendors/${vendorId}/bank-accounts`,
        bankAccountData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vendor bank accounts list
      queryClient.invalidateQueries({ queryKey: vendorBankKeys.list(variables.vendorId) });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Bank account created successfully',
        confirmButtonColor: '#7c3aed',
        timer: 1500
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to create bank account';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#EF4444'
      });
    }
  });
};

// Hook to update a vendor bank account
export const useUpdateVendorBankAccount = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, accountId, updateData }) => {
      const response = await axiosSecure.patch(
        `/vendors/${vendorId}/bank-accounts/${accountId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vendor bank accounts list and detail
      queryClient.invalidateQueries({ queryKey: vendorBankKeys.list(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: vendorBankKeys.detail(variables.vendorId, variables.accountId) });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Bank account updated successfully',
        confirmButtonColor: '#7c3aed',
        timer: 1500
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to update bank account';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#EF4444'
      });
    }
  });
};

// Hook to delete a vendor bank account
export const useDeleteVendorBankAccount = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, accountId }) => {
      const response = await axiosSecure.delete(
        `/vendors/${vendorId}/bank-accounts/${accountId}`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vendor bank accounts list
      queryClient.invalidateQueries({ queryKey: vendorBankKeys.list(variables.vendorId) });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Bank account deleted successfully',
        confirmButtonColor: '#7c3aed',
        timer: 1500
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to delete bank account';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#EF4444'
      });
    }
  });
};

