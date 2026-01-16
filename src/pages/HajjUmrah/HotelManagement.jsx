import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import useLicenseQueries from '../../hooks/useLicenseQueries';
import Swal from 'sweetalert2';

const HotelManagement = () => {
  // Mock data - Replace with actual API hooks when backend is ready
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createdHotelId, setCreatedHotelId] = useState(null);
  
  // License queries for Nusuk Agency dropdown
  const { useLicenses } = useLicenseQueries();
  const { data: licensesData } = useLicenses();
  const licenses = useMemo(() => (Array.isArray(licensesData) ? licensesData : licensesData?.data || []), [licensesData]);
  const [formData, setFormData] = useState({
    area: '',
    hotelName: '',
    tasrihNumber: '',
    tasnifNumber: '',
    address: '',
    distanceFromHaram: '',
    email: '',
    mobileNumber: ''
  });

  // Contract form data
  const [contractFormData, setContractFormData] = useState({
    contractType: 'হজ্ব', // হজ্ব / উমরাহ / অন্যান্য
    nusukAgencyId: '',
    requestNumber: '',
    hotelName: '',
    contractNumber: '',
    contractStart: '',
    contractEnd: '',
    hajjiCount: '',
    nusukPayment: '',
    cashPayment: '',
    otherBills: ''
  });

  const resetForm = () => {
    setFormData({
      area: '',
      hotelName: '',
      tasrihNumber: '',
      tasnifNumber: '',
      address: '',
      distanceFromHaram: '',
      email: '',
      mobileNumber: ''
    });
    setEditingHotel(null);
  };

  const resetContractForm = () => {
    setContractFormData({
      contractType: 'হজ্ব',
      nusukAgencyId: '',
      requestNumber: '',
      hotelName: formData.hotelName || '',
      contractNumber: '',
      contractStart: '',
      contractEnd: '',
      hajjiCount: '',
      nusukPayment: '',
      cashPayment: '',
      otherBills: ''
    });
  };

  // Update hotel name in contract form when formData changes
  useEffect(() => {
    if (isContractModalOpen && formData.hotelName) {
      setContractFormData(prev => ({
        ...prev,
        hotelName: formData.hotelName
      }));
    }
  }, [isContractModalOpen, formData.hotelName]);

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      area: hotel.area || '',
      hotelName: hotel.hotelName || '',
      tasrihNumber: hotel.tasrihNumber || '',
      tasnifNumber: hotel.tasnifNumber || '',
      address: hotel.address || '',
      distanceFromHaram: hotel.distanceFromHaram || '',
      email: hotel.email || '',
      mobileNumber: hotel.mobileNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hotelName.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে হোটেলের নাম পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
      // TODO: Replace with actual API call when backend is ready
      const payload = {
        area: formData.area.trim(),
        hotelName: formData.hotelName.trim(),
        tasrihNumber: formData.tasrihNumber.trim() || '',
        tasnifNumber: formData.tasnifNumber.trim() || '',
        address: formData.address.trim() || '',
        distanceFromHaram: formData.distanceFromHaram.trim() || '',
        email: formData.email.trim() || '',
        mobileNumber: formData.mobileNumber.trim() || ''
      };

      if (editingHotel) {
        // TODO: Update hotel API call
        // await updateHotel.mutateAsync({ id: editingHotel._id || editingHotel.id, data: payload });
        
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      } else {
        // TODO: Create hotel API call
        // const result = await createHotel.mutateAsync(payload);
        // const hotelId = result.data._id || result.data.id;
        
        // For now, use a mock ID
        const mockHotelId = 'hotel_' + Date.now();
        setCreatedHotelId(mockHotelId);
        
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে তৈরি হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });

        // Open contract modal after hotel creation
        handleCloseModal();
        resetContractForm();
        setIsContractModalOpen(true);
        return;
      }

      handleCloseModal();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = (hotel) => {
    const hotelId = hotel._id || hotel.id;
    const hotelName = hotel.hotelName || 'এই হোটেল';

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `${hotelName} কে কি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Replace with actual API call when backend is ready
        // deleteHotel.mutate(hotelId, {
        //   onSuccess: () => {
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        //   },
        //   onError: (error) => {
        //     Swal.fire({
        //       title: 'ত্রুটি!',
        //       text: error.message || 'হোটেল মুছতে সমস্যা হয়েছে।',
        //       icon: 'error',
        //       confirmButtonText: 'ঠিক আছে',
        //       confirmButtonColor: '#EF4444',
        //     });
        //   }
        // });
      }
    });
  };

  const filteredHotels = useMemo(() => {
    if (!searchTerm) return hotels;
    
    const search = searchTerm.toLowerCase();
    return hotels.filter(hotel =>
      (hotel.hotelName && hotel.hotelName.toLowerCase().includes(search)) ||
      (hotel.area && hotel.area.toLowerCase().includes(search)) ||
      (hotel.tasrihNumber && hotel.tasrihNumber.toLowerCase().includes(search)) ||
      (hotel.tasnifNumber && hotel.tasnifNumber.toLowerCase().includes(search)) ||
      (hotel.address && hotel.address.toLowerCase().includes(search)) ||
      (hotel.distanceFromHaram && hotel.distanceFromHaram.includes(search)) ||
      (hotel.mobileNumber && hotel.mobileNumber.includes(search)) ||
      (hotel.email && hotel.email.toLowerCase().includes(search))
    );
  }, [hotels, searchTerm]);

  const columns = [
    {
      key: 'area',
      header: 'এলাকা',
      sortable: true,
      render: (value, hotel) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {hotel.area || 'N/A'}
        </span>
      )
    },
    {
      key: 'hotelName',
      header: 'হোটেলের নাম',
      sortable: true,
      render: (value, hotel) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {hotel.hotelName || 'N/A'}
        </span>
      )
    },
    {
      key: 'tasrihNumber',
      header: 'তাসরিহ নং',
      sortable: true,
      render: (value, hotel) => (
        <span className="text-gray-900 dark:text-white">
          {hotel.tasrihNumber || 'N/A'}
        </span>
      )
    },
    {
      key: 'tasnifNumber',
      header: 'তাসনিফ নং',
      sortable: true,
      render: (value, hotel) => (
        <span className="text-gray-900 dark:text-white">
          {hotel.tasnifNumber || 'N/A'}
        </span>
      )
    },
    {
      key: 'address',
      header: 'ঠিকানা',
      sortable: true,
      render: (value, hotel) => (
        <span className="text-gray-900 dark:text-white">
          {hotel.address || 'N/A'}
        </span>
      )
    },
    {
      key: 'distanceFromHaram',
      header: 'হারাম এলাকা থেকে দুরত্ব(মিটারে)',
      sortable: true,
      render: (value, hotel) => (
        <span className="text-gray-900 dark:text-white">
          {hotel.distanceFromHaram ? `${hotel.distanceFromHaram} মি` : 'N/A'}
        </span>
      )
    },
    {
      key: 'contact',
      header: 'যোগাযোগ',
      sortable: false,
      render: (value, hotel) => (
        <div className="text-sm space-y-1">
          {hotel.mobileNumber && (
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Phone className="w-3 h-3" />
              <span>{hotel.mobileNumber}</span>
            </div>
          )}
          {hotel.email && (
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Mail className="w-3 h-3" />
              <span className="truncate">{hotel.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'অ্যাকশন',
      render: (value, hotel) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(hotel)}
            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
            title="সম্পাদনা করুন"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(hotel)}
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
            <p className="text-gray-600 dark:text-gray-400">হোটেল ডেটা লোড হচ্ছে...</p>
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
              {error.message || 'হোটেল ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
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
        <title>হোটেল ব্যবস্থাপনা</title>
        <meta name="description" content="সকল হোটেল ব্যবস্থাপনা করুন।" />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">হোটেল ব্যবস্থাপনা</h1>
          <p className="text-gray-600 dark:text-gray-400">সকল হোটেল ব্যবস্থাপনা করুন</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>হোটেল যোগ করুন</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">মোট হোটেল</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{hotels.length.toLocaleString('bn-BD')}</p>
          </div>
          <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="হোটেলের নাম, এলাকা, তাসরিহ নং, তাসনিফ নং, ঠিকানা, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Hotel List Table */}
      <DataTable
        data={filteredHotels}
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
        title={editingHotel ? 'হোটেল সম্পাদনা করুন' : 'হোটেল যোগ করুন'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              এলাকা <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">এলাকা নির্বাচন করুন</option>
              <option value="মক্কা">মক্কা</option>
              <option value="মদিনা">মদিনা</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              হোটেলের নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelName}
              onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="হোটেলের নাম লিখুন"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                তাসরিহ নং
              </label>
              <input
                type="text"
                value={formData.tasrihNumber}
                onChange={(e) => setFormData({ ...formData, tasrihNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="তাসরিহ নং লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                তাসনিফ নং
              </label>
              <input
                type="text"
                value={formData.tasnifNumber}
                onChange={(e) => setFormData({ ...formData, tasnifNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="তাসনিফ নং লিখুন"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              হারাম এলাকা থেকে দুরত্ব(মিটারে)
            </label>
            <input
              type="number"
              value={formData.distanceFromHaram}
              onChange={(e) => setFormData({ ...formData, distanceFromHaram: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="দুরত্ব মিটারে লিখুন"
              min="0"
              step="1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                মোবাইল নং
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="মোবাইল নং লিখুন"
              />
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingHotel ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Hotel Contract Modal */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          resetContractForm();
          setCreatedHotelId(null);
        }}
        title="হোটেল চুক্তি"
        size="xl"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          // TODO: Save contract data
          Swal.fire({
            title: 'সফল!',
            text: 'হোটেল চুক্তি সফলভাবে সংরক্ষণ হয়েছে।',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
          setIsContractModalOpen(false);
          resetContractForm();
          setCreatedHotelId(null);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              হোটেল চুক্তি (হজ্ব / উমরাহ / অন্যান্য) <span className="text-red-500">*</span>
            </label>
            <select
              value={contractFormData.contractType}
              onChange={(e) => setContractFormData({ ...contractFormData, contractType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="হজ্ব">হজ্ব</option>
              <option value="উমরাহ">উমরাহ</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              নুসুক এজেন্সি <span className="text-red-500">*</span>
            </label>
            <select
              value={contractFormData.nusukAgencyId}
              onChange={(e) => setContractFormData({ ...contractFormData, nusukAgencyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">নুসুক এজেন্সি নির্বাচন করুন</option>
              {licenses.map((license) => (
                <option key={license._id || license.id} value={license._id || license.id}>
                  {license.licenseNumber} - {license.licenseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              রিকোয়েস্ট নাম্বার <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contractFormData.requestNumber}
              onChange={(e) => setContractFormData({ ...contractFormData, requestNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="রিকোয়েস্ট নাম্বার লিখুন"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              হোটেল নেম (নুসুক অনুযায়ী) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contractFormData.hotelName}
              onChange={(e) => setContractFormData({ ...contractFormData, hotelName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="হোটেল নেম লিখুন"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              চুক্তি নাম্বার <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contractFormData.contractNumber}
              onChange={(e) => setContractFormData({ ...contractFormData, contractNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="চুক্তি নাম্বার লিখুন"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                চুক্তি শুরু <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={contractFormData.contractStart}
                onChange={(e) => setContractFormData({ ...contractFormData, contractStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                চুক্তি শেষ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={contractFormData.contractEnd}
                onChange={(e) => setContractFormData({ ...contractFormData, contractEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              হাজ্বী সংখ্যা <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={contractFormData.hajjiCount}
              onChange={(e) => setContractFormData({ ...contractFormData, hajjiCount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="হাজ্বী সংখ্যা লিখুন"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Payment Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">পেমেন্ট তথ্য</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  নুসুক পেমেন্ট
                </label>
                <input
                  type="number"
                  value={contractFormData.nusukPayment}
                  onChange={(e) => setContractFormData({ ...contractFormData, nusukPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="নুসুক পেমেন্ট লিখুন"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ক্যাশ পেমেন্ট
                </label>
                <input
                  type="number"
                  value={contractFormData.cashPayment}
                  onChange={(e) => setContractFormData({ ...contractFormData, cashPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ক্যাশ পেমেন্ট লিখুন"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  অন্যান্য বিল
                </label>
                <input
                  type="number"
                  value={contractFormData.otherBills}
                  onChange={(e) => setContractFormData({ ...contractFormData, otherBills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="অন্যান্য বিল লিখুন"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Calculated Values */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">গণনা</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট বিল (নুসুক অনুযায়ী):</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {(
                    parseFloat(contractFormData.nusukPayment || 0) +
                    parseFloat(contractFormData.cashPayment || 0) +
                    parseFloat(contractFormData.otherBills || 0)
                  ).toLocaleString('bn-BD')} ৳
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">জনপ্রতি:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {contractFormData.hajjiCount && parseFloat(contractFormData.hajjiCount) > 0
                    ? (
                        (
                          (parseFloat(contractFormData.nusukPayment || 0) +
                           parseFloat(contractFormData.cashPayment || 0) +
                           parseFloat(contractFormData.otherBills || 0)) /
                          parseFloat(contractFormData.hajjiCount)
                        ).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      ) + ' ৳'
                    : '0.00 ৳'}
                </span>
              </div>
            </div>
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                setIsContractModalOpen(false);
                resetContractForm();
                setCreatedHotelId(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default HotelManagement;
