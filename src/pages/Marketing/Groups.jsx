import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  Calendar,
  UserPlus
} from 'lucide-react';

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock groups data
  const groups = [
    {
      id: 1,
      name: 'VIP Customers',
      description: 'High-value customers with premium services',
      contactCount: 145,
      color: 'purple',
      createdDate: '2024-01-01',
      lastUpdated: '2024-01-10'
    },
    {
      id: 2,
      name: 'Hajj Customers',
      description: 'Customers who booked Hajj packages',
      contactCount: 320,
      color: 'green',
      createdDate: '2023-12-15',
      lastUpdated: '2024-01-09'
    },
    {
      id: 3,
      name: 'Umrah Customers',
      description: 'Customers who booked Umrah packages',
      contactCount: 480,
      color: 'blue',
      createdDate: '2023-12-10',
      lastUpdated: '2024-01-08'
    },
    {
      id: 4,
      name: 'Air Ticket Customers',
      description: 'Regular air ticket booking customers',
      contactCount: 650,
      color: 'orange',
      createdDate: '2023-11-20',
      lastUpdated: '2024-01-07'
    },
    {
      id: 5,
      name: 'New Leads',
      description: 'Recent inquiries and potential customers',
      contactCount: 95,
      color: 'yellow',
      createdDate: '2024-01-05',
      lastUpdated: '2024-01-11'
    },
    {
      id: 6,
      name: 'Visa Processing Clients',
      description: 'Customers using visa processing services',
      contactCount: 210,
      color: 'red',
      createdDate: '2023-12-01',
      lastUpdated: '2024-01-06'
    }
  ];

  const stats = [
    { label: 'Total Groups', value: '12', color: 'blue', icon: FolderOpen },
    { label: 'Total Contacts', value: '2,450', color: 'green', icon: Users },
    { label: 'Active Groups', value: '10', color: 'purple', icon: Tag },
    { label: 'New This Month', value: '3', color: 'orange', icon: Plus }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Groups - Bin Rashid ERP</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Groups</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize your contacts into groups for targeted marketing
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Group Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-${group.color}-100 dark:bg-${group.color}-900/20 flex items-center justify-center`}>
                    <FolderOpen className={`w-6 h-6 text-${group.color}-600 dark:text-${group.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {group.contactCount} contacts
                    </p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Group Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {group.description}
              </p>

              {/* Group Meta */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Created: {group.createdDate}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="w-3.5 h-3.5" />
                  Last updated: {group.lastUpdated}
                </div>
              </div>

              {/* Group Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm">
                  <UserPlus className="w-4 h-4" />
                  Add Contacts
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Group Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Group</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group name..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter group description..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {['blue', 'green', 'purple', 'orange', 'red', 'yellow'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full bg-${color}-500 hover:ring-2 ring-offset-2 ring-${color}-500`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Groups;
