import { useMemo } from 'react';

// Define the available roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ACCOUNT: 'account',
  RESERVATION: 'reservation',
  USER: 'user'
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.ACCOUNT]: 3,
  [USER_ROLES.RESERVATION]: 2,
  [USER_ROLES.USER]: 1
};

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.ACCOUNT]: 'Account',
  [USER_ROLES.RESERVATION]: 'Reservation',
  [USER_ROLES.USER]: 'User'
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.SUPER_ADMIN]: 'Full system access with all permissions',
  [USER_ROLES.ADMIN]: 'Administrative access with most permissions',
  [USER_ROLES.ACCOUNT]: 'Financial and accounting operations access',
  [USER_ROLES.RESERVATION]: 'Booking and reservation management access',
  [USER_ROLES.USER]: 'Basic user access with limited permissions'
};

const useUserRole = (userRole) => {
  const role = useMemo(() => {
    if (!userRole || !Object.values(USER_ROLES).includes(userRole)) {
      return USER_ROLES.USER; // Default to user role if invalid
    }
    return userRole;
  }, [userRole]);

  const isSuperAdmin = useMemo(() => role === USER_ROLES.SUPER_ADMIN, [role]);
  const isAdmin = useMemo(() => role === USER_ROLES.ADMIN, [role]);
  const isAccount = useMemo(() => role === USER_ROLES.ACCOUNT, [role]);
  const isReservation = useMemo(() => role === USER_ROLES.RESERVATION, [role]);
  const isUser = useMemo(() => role === USER_ROLES.USER, [role]);

  // Check if user has permission based on role hierarchy
  const hasPermission = useMemo(() => {
    return (requiredRole) => {
      const userRoleLevel = ROLE_HIERARCHY[role] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
      return userRoleLevel >= requiredRoleLevel;
    };
  }, [role]);

  // Check if user can access specific features
  const canAccess = useMemo(() => ({
    // Dashboard access
    dashboard: true, // All roles can access dashboard
    
    // User management
    manageUsers: isSuperAdmin || isAdmin,
    viewUsers: isSuperAdmin || isAdmin || isAccount,
    
    // Financial operations
    manageAccounts: isSuperAdmin || isAdmin || isAccount,
    viewFinancialReports: isSuperAdmin || isAdmin || isAccount,
    manageTransactions: isSuperAdmin || isAdmin || isAccount,
    
    // Reservation operations
    manageReservations: isSuperAdmin || isAdmin || isReservation,
    viewReservations: isSuperAdmin || isAdmin || isReservation || isAccount,
    
    // System settings
    systemSettings: isSuperAdmin || isAdmin,
    backupRestore: isSuperAdmin || isAdmin,
    
    // Business operations
    manageBusinesses: isSuperAdmin || isAdmin,
    manageVendors: isSuperAdmin || isAdmin || isAccount,
    manageCustomers: isSuperAdmin || isAdmin || isReservation,
    
    // Air ticketing
    manageTickets: isSuperAdmin || isAdmin || isReservation,
    viewTickets: isSuperAdmin || isAdmin || isReservation || isAccount,
    
    // Hajj & Umrah
    manageHajjUmrah: isSuperAdmin || isAdmin || isReservation,
    viewHajjUmrah: isSuperAdmin || isAdmin || isReservation || isAccount,
    
    // Visa processing
    manageVisa: isSuperAdmin || isAdmin || isReservation,
    viewVisa: isSuperAdmin || isAdmin || isReservation || isAccount,
    
    // Money exchange
    manageExchange: isSuperAdmin || isAdmin || isAccount,
    viewExchange: isSuperAdmin || isAdmin || isAccount || isReservation,
    
    // Office management
    manageOffice: isSuperAdmin || isAdmin,
    viewOffice: isSuperAdmin || isAdmin || isAccount,
    
    // Personal finance
    personalFinance: true, // All roles can manage personal finance
    
    // Profile management
    manageProfile: true, // All roles can manage their own profile
    viewProfile: true
  }), [isSuperAdmin, isAdmin, isAccount, isReservation, isUser]);

  // Get role information
  const roleInfo = useMemo(() => ({
    role,
    displayName: ROLE_DISPLAY_NAMES[role],
    description: ROLE_DESCRIPTIONS[role],
    level: ROLE_HIERARCHY[role]
  }), [role]);

  // Get all available roles (useful for role selection in forms)
  const availableRoles = useMemo(() => {
    return Object.values(USER_ROLES).map(roleKey => ({
      value: roleKey,
      label: ROLE_DISPLAY_NAMES[roleKey],
      description: ROLE_DESCRIPTIONS[roleKey],
      level: ROLE_HIERARCHY[roleKey]
    }));
  }, []);

  return {
    // Role checks
    isSuperAdmin,
    isAdmin,
    isAccount,
    isReservation,
    isUser,
    
    // Permission utilities
    hasPermission,
    canAccess,
    
    // Role information
    roleInfo,
    availableRoles,
    
    // Constants
    USER_ROLES,
    ROLE_DISPLAY_NAMES,
    ROLE_DESCRIPTIONS
  };
};

export default useUserRole;
