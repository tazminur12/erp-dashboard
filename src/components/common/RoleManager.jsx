import React, { useState, useEffect } from 'react';
import { Shield, User, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import useUserRole from '../../hooks/useUserRole';

const RoleManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { USER_ROLES, ROLE_DISPLAY_NAMES, canAccess } = useUserRole();

  // Check if user can manage users
  if (!canAccess.manageUsers) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            You don't have permission to manage user roles.
          </span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showMessage('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  const handleSaveRole = async () => {
    if (!newRole || newRole === editingUser.role) {
      handleCancelEdit();
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/role/${editingUser.uniqueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.uniqueId === editingUser.uniqueId 
                ? { ...user, role: newRole }
                : user
            )
          );
          showMessage('success', 'User role updated successfully');
        } else {
          showMessage('error', 'Failed to update user role');
        }
      } else {
        showMessage('error', 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showMessage('error', 'Network error while updating role');
    }

    handleCancelEdit();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case USER_ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case USER_ROLES.ACCOUNT:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case USER_ROLES.RESERVATION:
        return 'bg-green-100 text-green-800 border-green-200';
      case USER_ROLES.USER:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.ADMIN:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.ACCOUNT:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.RESERVATION:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.USER:
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Role Management</h2>
            <p className="text-sm text-gray-600">Manage user roles and permissions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Role Manager</span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-6 py-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border-l-4 border-green-400' 
            : 'bg-red-50 border-l-4 border-red-400'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.uniqueId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user.uniqueId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.branchName}</div>
                  <div className="text-sm text-gray-500">{user.branchLocation}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.uniqueId === user.uniqueId ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {Object.entries(USER_ROLES).map(([key, value]) => (
                        <option key={value} value={value}>
                          {ROLE_DISPLAY_NAMES[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{ROLE_DISPLAY_NAMES[user.role] || 'Unknown'}</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUser?.uniqueId === user.uniqueId ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveRole}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditRole(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new user account.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
