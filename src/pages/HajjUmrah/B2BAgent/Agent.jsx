import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Edit, Trash2, Eye, Search, Filter, Upload, FileSpreadsheet } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import ExcelUploader from '../../../components/common/ExcelUploader';
import { useAgents, useDeleteAgent, useBulkAgentOperation } from '../../../hooks/useAgentQueries';

const Agent = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit, view, delete
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    tradeName: '',
    tradeLocation: '',
    ownerName: '',
    contactNo: '',
    dob: '',
    nid: '',
    passport: ''
  });

  // React Query hooks
  const { data: agentsData, isLoading, error } = useAgents(page, limit, searchTerm);
  const deleteAgentMutation = useDeleteAgent();
  const bulkUploadMutation = useBulkAgentOperation();

  // Extract data from query result
  const agents = agentsData?.data || [];
  const totalPages = agentsData?.pagination?.totalPages || 1;
  const total = agentsData?.pagination?.total || 0;

  // Client-side filtered list to ensure search works even without API support
  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    const query = searchTerm.toLowerCase().trim();
    return agents.filter((a) => {
      const tradeName = (a.tradeName || '').toLowerCase();
      const tradeLocation = (a.tradeLocation || '').toLowerCase();
      const ownerName = (a.ownerName || '').toLowerCase();
      const contactNo = (a.contactNo || '').toLowerCase();
      const nid = (a.nid || '').toLowerCase();
      const passport = (a.passport || '').toLowerCase();
      return (
        tradeName.includes(query) ||
        tradeLocation.includes(query) ||
        ownerName.includes(query) ||
        contactNo.includes(query) ||
        nid.includes(query) ||
        passport.includes(query)
      );
    });
  }, [agents, searchTerm]);

  const handleAdd = () => {
    setModalType('add');
    setFormData({
      tradeName: '',
      tradeLocation: '',
      ownerName: '',
      contactNo: '',
      dob: '',
      nid: '',
      passport: ''
    });
    setShowModal(true);
  };

  const handleEdit = (agent) => {
    setModalType('edit');
    setSelectedAgent(agent);
    setFormData({
      tradeName: agent.tradeName || '',
      tradeLocation: agent.tradeLocation || '',
      ownerName: agent.ownerName || '',
      contactNo: agent.contactNo || '',
      dob: agent.dob || '',
      nid: agent.nid || '',
      passport: agent.passport || ''
    });
    setShowModal(true);
  };

  const handleView = async (agent) => {
    try {
      const id = agent._id || agent.id;
      if (id) {
        navigate(`/hajj-umrah/agent/${id}`);
        return;
      }
      // Fallback to modal if no id present
      setModalType('view');
      setSelectedAgent(agent);
      setShowModal(true);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to fetch agent details';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  };

  const handleDelete = (agent) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${agent.tradeName} এর তথ্য মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const agentId = agent._id || agent.id;
        if (agentId) {
          deleteAgentMutation.mutate(agentId);
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'add') {
      const newAgent = {
        id: Date.now(),
        ...formData
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

  const handleExcelUpload = () => {
    setShowExcelUploader(true);
  };

  const handleExcelDataProcessed = (processedData) => {
    // Create FormData for bulk upload
    const formData = new FormData();
    formData.append('agents', JSON.stringify(processedData));
    
    // Use React Query mutation for bulk upload
    bulkUploadMutation.mutate(formData);
    setShowExcelUploader(false);
  };

  // Show error if query fails
  if (error) {
    console.error('Error fetching agents:', error);
  }

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
              এজেন্টের ট্রেড তথ্য ব্যবস্থাপনা
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={handleExcelUpload}
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm sm:text-base">Excel Upload</span>
          </button>
          <Link
            to="/hajj-umrah/agent/add"
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">নতুন এজেন্ট যোগ করুন</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ট্রেড নাম, লোকেশন, মালিক, ফোন, NID, পাসপোর্ট দিয়ে সার্চ করুন..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ট্রেড নাম</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">লোকেশন</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">মালিক</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">যোগাযোগ</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">জন্ম তারিখ</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">NID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">Passport</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading agents...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-12 h-12 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No agents found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                <tr key={agent._id || agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                            {(agent.tradeName || '?').charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleView(agent)}
                          className="text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate hover:underline"
                          title="বিস্তারিত দেখুন"
                        >
                          {agent.tradeName}
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.tradeLocation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{agent.tradeLocation}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{agent.ownerName}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{agent.contactNo}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell text-xs sm:text-sm text-gray-900 dark:text-white">{agent.dob || '-'}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden xl:table-cell text-xs sm:text-sm text-gray-900 dark:text-white">{agent.nid || '-'}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden xl:table-cell text-xs sm:text-sm text-gray-900 dark:text-white">{agent.passport || '-'}</td>
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
                ))
              )}
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
                  ট্রেড নাম
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.tradeName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  লোকেশন
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.tradeLocation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  মালিকের নাম
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.ownerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগাযোগ
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.contactNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  জন্ম তারিখ
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.dob || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  NID
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.nid || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passport
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{selectedAgent.passport || '-'}</p>
            </div>
          </div>
        )}

        {(modalType === 'add' || modalType === 'edit') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ট্রেড নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ট্রেড নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ট্রেড লোকেশন <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tradeLocation"
                  value={formData.tradeLocation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="লোকেশন"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  মালিকের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="মালিকের নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  যোগাযোগ নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জন্ম তারিখ</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NID</label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="NID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passport</label>
                <input
                  type="text"
                  name="passport"
                  value={formData.passport}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Passport"
                />
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

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Hajj & Umrah Agent Data from Excel"
          acceptedFields={['tradeName', 'tradeLocation', 'ownerName', 'contactNo', 'dob', 'nid', 'passport']}
          requiredFields={['tradeName', 'tradeLocation', 'ownerName', 'contactNo']}
          sampleData={[
            ['Trade Name', 'Trade Location', 'Owner Name', 'Contact No', 'Date of Birth', 'NID', 'Passport'],
            ['Green Line Supplies', 'Sylhet', 'Shahadat Hossain', '+8801555667788', '1988-12-01', '188845623499', 'ZP1122334'],
            ['Nazmul Enterprise', 'Chattogram', 'Nazmul Hasan', '+8801911334455', '1990-08-21', '199045623411', 'EC7654321'],
            ['Miraj Traders', 'Dhaka, Bangladesh', 'Abdul Karim', '+8801711223344', '1984-05-12', '197845623412', 'BA1234567']
          ]}
        />
      )}
    </div>
  );
};

export default Agent;

