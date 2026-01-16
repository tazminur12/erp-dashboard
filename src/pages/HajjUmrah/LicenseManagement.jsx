import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Upload, X, Image as ImageIcon, Users, CheckCircle, Clock, Archive, RefreshCw, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import useLicenseQueries from '../../hooks/useLicenseQueries';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary';
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
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [formData, setFormData] = useState({
    logo: '',
    licenseNumber: '',
    licenseName: '',
    agencyName: '',
    ownerName: '',
    mobileNumber: '',
    email: '',
    address: ''
  });

  const resetForm = () => {
    setFormData({
      logo: '',
      licenseNumber: '',
      licenseName: '',
      agencyName: '',
      ownerName: '',
      mobileNumber: '',
      email: '',
      address: ''
    });
    setLogoPreview(null);
    setEditingLicense(null);
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'license-logos');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `আপলোড ব্যর্থ হয়েছে: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'লোগো সফলভাবে আপলোড হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    setLogoPreview(null);
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
      logo: license.logo || '',
      licenseNumber: license.licenseNumber || '',
      licenseName: license.licenseName || '',
      agencyName: license.agencyName || '',
      ownerName: license.ownerName || '',
      mobileNumber: license.mobileNumber || '',
      email: license.email || '',
      address: license.address || ''
    });
    setLogoPreview(license.logo || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.licenseNumber.trim() || !formData.licenseName.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে লাইসেন্স নম্বর এবং লাইসেন্স নাম পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
      const payload = {
        logo: formData.logo || '',
        licenseNumber: formData.licenseNumber.trim(),
        licenseName: formData.licenseName.trim(),
        agencyName: formData.agencyName.trim() || '',
        ownerName: formData.ownerName.trim() || '',
        mobileNumber: formData.mobileNumber.trim() || '',
        email: formData.email.trim() || '',
        address: formData.address.trim() || ''
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
      key: 'logo',
      header: 'লোগো',
      sortable: false,
      render: (value, license) => (
        <div className="flex items-center">
          {license.logo ? (
            <img 
              src={license.logo} 
              alt={license.licenseName || 'Logo'} 
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'licenseNumber',
      header: 'লাইসেন্স নম্বর',
      sortable: true,
      render: (value, license) => {
        const licenseNumber = license.licenseNumber || '1461'; // Demo license number
        const licenseUrl = `https://hajj.gov.bd/agencies/${licenseNumber}`;
        
        return (
          <a
            href={licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
          >
            {licenseNumber}
          </a>
        );
      }
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
      key: 'totalHajjPerformers',
      header: 'হজ্ব সম্পন্নকারী হাজ্বী সংখ্যা',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.totalHajjPerformers || license.hajjPerformersCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'preRegistered',
      header: 'প্রাক-নিবন্ধিত',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.preRegistered || license.preRegisteredCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'registered',
      header: 'নিবন্ধিত',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.registered || license.registeredCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'archive',
      header: 'আর্কাইভ',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.archive || license.archiveCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'refunded',
      header: 'রিফান্ডেড',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.refunded || license.refundedCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'received',
      header: 'রিসিভড',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.received || license.receivedCount || 0).toLocaleString('bn-BD')}
        </span>
      )
    },
    {
      key: 'transferred',
      header: 'ট্রান্সফার্ড',
      sortable: true,
      render: (value, license) => (
        <span className="text-gray-900 dark:text-white">
          {(license.transferred || license.transferredCount || 0).toLocaleString('bn-BD')}
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
            title="সম্পাদনা করুন"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(license)}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
            title="মুছুন"
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
            <p className="text-gray-600 dark:text-gray-400">লাইসেন্স ডেটা লোড হচ্ছে...</p>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'লাইসেন্স ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>লাইসেন্স ব্যবস্থাপনা</title>
        <meta name="description" content="সকল লাইসেন্স ব্যবস্থাপনা করুন।" />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">লাইসেন্স ব্যবস্থাপনা</h1>
          <p className="text-gray-600 dark:text-gray-400">সকল লাইসেন্স ব্যবস্থাপনা করুন</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>লাইসেন্স তৈরি করুন</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট লাইসেন্স</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{licenses.length.toLocaleString('bn-BD')}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট হজ্ব সম্পন্নকারী</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {licenses.reduce((sum, l) => sum + (Number(l.totalHajjPerformers) || Number(l.hajjPerformersCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট প্রাক-নিবন্ধিত</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {licenses.reduce((sum, l) => sum + (Number(l.preRegistered) || Number(l.preRegisteredCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট নিবন্ধিত</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {licenses.reduce((sum, l) => sum + (Number(l.registered) || Number(l.registeredCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট আর্কাইভ</p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {licenses.reduce((sum, l) => sum + (Number(l.archive) || Number(l.archiveCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <Archive className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট রিফান্ডেড</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {licenses.reduce((sum, l) => sum + (Number(l.refunded) || Number(l.refundedCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট রিসিভড</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {licenses.reduce((sum, l) => sum + (Number(l.received) || Number(l.receivedCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট ট্রান্সফার্ড</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {licenses.reduce((sum, l) => sum + (Number(l.transferred) || Number(l.transferredCount) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="লাইসেন্স নম্বর বা নাম দিয়ে খুঁজুন..."
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
        title={editingLicense ? 'লাইসেন্স সম্পাদনা করুন' : 'লাইসেন্স তৈরি করুন'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              লোগো
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {logoUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cloudinary তে আপলোড হচ্ছে...</span>
                </div>
              ) : logoPreview || formData.logo ? (
                <div className="flex flex-col items-center space-y-3">
                  <img 
                    src={logoPreview || formData.logo} 
                    alt="Logo Preview" 
                    className="max-h-32 max-w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>লোগো সরান</span>
                  </button>
                </div>
              ) : (
                <label htmlFor="logo-upload" className="block text-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ক্লিক করে আপলোড করুন বা ড্র্যাগ করুন
                  </span>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        uploadToCloudinary(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              লাইসেন্স নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="লাইসেন্স নম্বর লিখুন"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              লাইসেন্স নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.licenseName}
              onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="লাইসেন্স নাম লিখুন"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              এজেন্সির নাম
            </label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="এজেন্সির নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মালিকের নাম
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="মালিকের নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মোবাইল নাম্বার
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="মোবাইল নাম্বার লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ইমেইল
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="ইমেইল লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ঠিকানা
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="ঠিকানা লিখুন"
              rows="3"
            />
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={createLicense.isPending || updateLicense.isPending || logoUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLicense.isPending || updateLicense.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default LicenseManagement;
