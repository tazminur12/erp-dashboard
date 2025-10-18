// Export all hooks
export { default as useAxiosSecure } from './UseAxiosSecure';
export { default as axiosInstance, api } from './Axios';
export { default as useUserRole } from './useUserRole';

// React Query hooks
export * from './useCustomerQueries';
export * from './useTransactionQueries';
export * from './useHRQueries';
export * from './useEmployeeQueries';
export * from './useAgentQueries';
export * from './useAccountQueries';
// Re-export for convenience
export { default as Axios } from './Axios';
export { default as UseAxiosSecure } from './UseAxiosSecure';
export { default as UseUserRole } from './useUserRole';
