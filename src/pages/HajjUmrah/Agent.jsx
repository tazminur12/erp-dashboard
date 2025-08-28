import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const Agent = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'আব্দুল করিম',
      licenseNo: 'HAJ001',
      contact: '+8801712345678',
      address: 'ঢাকা, বাংলাদেশ',
      email: 'karim@hajjagency.com',
      status: 'Active',
      experience: '5 years',
      commission: '10%',
      totalBookings: 45
    },
    {
      id: 2,
      name: 'ফাতেমা খাতুন',
      licenseNo: 'HAJ002',
      contact: '+8801812345678',
      address: 'চট্টগ্রাম, বাংলাদেশ',
      email: 'fatema@hajjagency.com',
      status: 'Active',
      experience: '3 years',
      commission: '8%',
      totalBookings: 32
    },
    {
      id: 3,
      name: 'মুহাম্মদ সাবির',
      licenseNo: 'HAJ003',
      contact: '+8801912345678',
      address: 'সিলেট, বাংলাদেশ',
      email: 'sabir@hajjagency.com',
      status: 'Inactive',
      experience: '7 years',
      commission: '12%',
      totalBookings: 78
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit, view, delete
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNo: '',
    contact: '',
    address: '',
    email: '',
    experience: '',
    commission: '',
    status: 'Active'
  });

  const handleAdd = () => {
    setModalType('add');
    setFormData({
      name: '',
      licenseNo: '',
      contact: '',
      address: '',
      email: '',
      experience: '',
      commission: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEdit = (agent) => {
    setModalType('edit');
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      licenseNo: agent.licenseNo,
      contact: agent.contact,
      address: agent.address,
      email: agent.email,
      experience: agent.experience,
      commission: agent.commission,
      status: agent.status
    });
    setShowModal(true);
  };

  const handleView = (agent) => {
    setModalType('view');
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleDelete = (agent) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${agent.name} এর তথ্য মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setAgents(prev => prev.filter(a => a.id !== agent.id));
        
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: `${agent.name} এর তথ্য সফলভাবে মুছে ফেলা হয়েছে।`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'add') {
      const newAgent = {
        id: Date.now(),
        ...formData,
        totalBookings: 0
      };
      setAgents(prev => [...prev, newAgent]);
      
      Swal.fire({
        title: 'সফল!',
        text: 'নতুন এজেন্ট সফলভাবে যোগ করা হয়েছে!',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      });
    } else if (modalType === 'edit') {
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id ? { ...agent, ...formData } : agent
      ));
      
      Swal.fire({
        title: 'আপডেট হয়েছে!',
        text: 'এজেন্টের তথ্য সফলভাবে আপডেট করা হয়েছে!',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      });
    }
    
    setShowModal(false);
    setSelectedAgent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.contact.includes(searchTerm) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ এজেন্ট তালিকা
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              সব এজেন্টদের তথ্য ব্যবস্থাপনা
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">নতুন এজেন্ট যোগ করুন</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="নাম, লাইসেন্স নম্বর, বা যোগাযোগ দিয়ে সার্চ করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            <span className="text-sm sm:text-base">ফিল্টার</span>
          </button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  এজেন্ট
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  লাইসেন্স নম্বর
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  যোগাযোগ
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ঠিকানা
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  অভিজ্ঞতা
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  কমিশন
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  মোট বুকিং
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                            {agent.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {agent.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono truncate block">
                      {agent.licenseNo}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {agent.contact}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {agent.address}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {agent.experience}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {agent.commission}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {agent.totalBookings}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleView(agent)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="দেখুন"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(agent)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(agent)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === 'add' ? 'নতুন এজেন্ট যোগ করুন' :
          modalType === 'edit' ? 'এজেন্ট তথ্য সম্পাদনা করুন' :
          modalType === 'view' ? 'এজেন্ট তথ্য দেখুন' :
          'এজেন্ট মুছুন'
        }
      >
        {modalType === 'view' && selectedAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  নাম
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  লাইসেন্স নম্বর
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedAgent.licenseNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগাযোগ
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.contact}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ইমেইল
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  স্ট্যাটাস
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAgent.status)}`}>
                  {selectedAgent.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  অভিজ্ঞতা
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.experience}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ঠিকানা
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.address}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  কমিশন
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.commission}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  মোট বুকিং
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.totalBookings}</p>
              </div>
            </div>
          </div>
        )}

        {(modalType === 'add' || modalType === 'edit') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="এজেন্টের নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  লাইসেন্স নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="লাইসেন্স নম্বর"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  যোগাযোগ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+8801712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ইমেইল
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ঠিকানা <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="বিস্তারিত ঠিকানা"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  অভিজ্ঞতা
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="5 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  কমিশন
                </label>
                <input
                  type="text"
                  name="commission"
                  value={formData.commission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  স্ট্যাটাস
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Active">সক্রিয়</option>
                  <option value="Inactive">নিষ্ক্রিয়</option>
                  <option value="Pending">অপেক্ষমান</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {modalType === 'add' ? 'যোগ করুন' : 'আপডেট করুন'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Agent;
