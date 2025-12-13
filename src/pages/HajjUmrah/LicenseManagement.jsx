import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import Modal, { ModalFooter } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import useLicenseQueries from '../../hooks/useLicenseQueries';
import Swal from 'sweetalert2';

const LicenseManagement = () => {
  const { useLicenses, useCreateLicense, useUpdateLicense, useDeleteLicense } = useLicenseQueries();
  const { data: licensesData, isLoading, error } = useLicenses();
  const licenses = useMemo(() => (Array.isArray(licensesData) ? licensesData : licensesData?.data || []), [licensesData]);
  
  const createLicense = useCreateLicense();
  const updateLicense = useUpdateLicense();
  const deleteLicense = useDeleteLicense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseName: ''
  });

  const resetForm = () => {
    setFormData({
      licenseNumber: '',
      licenseName: ''
    });
    setEditingLicense(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      licenseNumber: license.licenseNumber || '',
      licenseName: license.licenseName || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.licenseNumber.trim() || !formData.licenseName.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে সব ফিল্ড পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
      const payload = {
        licenseNumber: formData.licenseNumber.trim(),
        licenseName: formData.licenseName.trim()
      };

      if (editingLicense) {
        const licenseId = editingLicense._id || editingLicense.id;
        await updateLicense.mutateAsync({ id: licenseId, data: payload });
        
        Swal.fire({
          title: 'সফল!',
          text: 'লাইসেন্স সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      } else {
        await createLicense.mutateAsync(payload);
        
        Swal.fire({
          title: 'সফল!',
          text: 'লাইসেন্স সফলভাবে তৈরি হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      }

      handleCloseModal();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লাইসেন্স সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = (license) => {
    const licenseId = license._id || license.id;
    const licenseName = license.licenseName || 'এই লাইসেন্স';

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `${licenseName} কে কি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLicense.mutate(licenseId, {
          onSuccess: () => {
            Swal.fire({
              title: 'সফল!',
              text: 'লাইসেন্স সফলভাবে মুছে ফেলা হয়েছে।',
              icon: 'success',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#10B981',
            });
          },
          onError: (error) => {
            Swal.fire({
              title: 'ত্রুটি!',
              text: error.message || 'লাইসেন্স মুছতে সমস্যা হয়েছে।',
              icon: 'error',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#EF4444',
            });
          }
        });
      }
    });
  };

  const filteredLicenses = useMemo(() => {
    if (!searchTerm) return licenses;
    
    const search = searchTerm.toLowerCase();
    return licenses.filter(license =>
      (license.licenseNumber && license.licenseNumber.toLowerCase().includes(search)) ||
      (license.licenseName && license.licenseName.toLowerCase().includes(search))
    );
  }, [licenses, searchTerm]);

  const columns = [
    {
      key: 'licenseNumber',
      header: 'লাইসেন্স নম্বর',
      sortable: true,
      render: (value, license) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {license.licenseNumber || 'N/A'}
        </span>
      )
    },
    {
      key: 'licenseName',
      header: 'লাইসেন্স নাম',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {license.licenseName || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'অ্যাকশন',
      render: (value, license) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(license)}
            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(license)}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading licenses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'Failed to load licenses. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all licenses</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create License</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Licenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{licenses.length}</p>
          </div>
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by license number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* License List Table */}
      <DataTable
        data={filteredLicenses}
        columns={columns}
        searchable={false}
        exportable={false}
        actions={false}
        pagination={true}
        pageSize={10}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLicense ? 'Edit License' : 'Create License'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter license number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.licenseName}
              onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter license name"
              required
            />
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLicense.isPending || updateLicense.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLicense.isPending || updateLicense.isPending ? 'Saving...' : 'Submit'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default LicenseManagement;
