import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Building2, MapPin, Phone, Mail, Eye } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import useHotelQueries from '../../hooks/useHotelQueries';
import Swal from 'sweetalert2';

const HotelManagement = () => {
  const navigate = useNavigate();
  
  // Hotel queries
  const { 
    useHotels, 
    useCreateHotel, 
    useUpdateHotel, 
    useDeleteHotel
  } = useHotelQueries();

  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  
  // Fetch hotels with filters
  const { data: hotelsResponse, isLoading, error, refetch } = useHotels({
    page: 1,
    limit: 1000,
    search: searchTerm || undefined,
    area: areaFilter || undefined
  });
  
  const hotels = useMemo(() => {
    if (!hotelsResponse?.data) return [];
    return Array.isArray(hotelsResponse.data) ? hotelsResponse.data : [];
  }, [hotelsResponse]);

  // Mutations
  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();
  const deleteHotel = useDeleteHotel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
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


  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleView = (hotel) => {
    const hotelId = hotel._id || hotel.id;
    
    if (!hotelId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'হোটেল ID পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    navigate(`/hajj-umrah/hotel-management/${hotelId}`);
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

    if (!formData.hotelName.trim() || !formData.area.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে হোটেলের নাম এবং এলাকা পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
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
        const result = await updateHotel.mutateAsync({ 
          id: editingHotel._id || editingHotel.id, 
          data: payload 
        });
        
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      } else {
        await createHotel.mutateAsync(payload);
        
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে তৈরি হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });

        handleCloseModal();
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteHotel.mutateAsync(hotelId);
          Swal.fire({
            title: 'সফল!',
            text: 'হোটেল সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          });
        } catch (error) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: error.message || 'হোটেল মুছতে সমস্যা হয়েছে।',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
        }
      }
    });
  };

  // Hotels are already filtered by backend, but we can do client-side filtering if needed
  const filteredHotels = hotels;

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
            onClick={() => handleView(hotel)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
            title="বিস্তারিত দেখুন"
          >
            <Eye className="w-4 h-4" />
          </button>
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
            {hotelsResponse?.pagination && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                মোট: {hotelsResponse.pagination.totalItems}
              </p>
            )}
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
              disabled={createHotel.isPending || updateHotel.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createHotel.isPending || updateHotel.isPending 
                ? 'সংরক্ষণ হচ্ছে...' 
                : editingHotel 
                  ? 'আপডেট করুন' 
                  : 'সংরক্ষণ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

    </div>
  );
};

export default HotelManagement;
