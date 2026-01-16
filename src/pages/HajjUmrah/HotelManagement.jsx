import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Upload, X, Image as ImageIcon, MapPin, Phone, Mail, Star, Users, Bed } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary';
import Swal from 'sweetalert2';

const HotelManagement = () => {
  // Mock data - Replace with actual API hooks when backend is ready
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [formData, setFormData] = useState({
    logo: '',
    hotelName: '',
    hotelCode: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    phone: '',
    email: '',
    website: '',
    rating: '',
    totalRooms: '',
    roomTypes: '',
    amenities: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      logo: '',
      hotelName: '',
      hotelCode: '',
      address: '',
      city: '',
      country: 'Saudi Arabia',
      phone: '',
      email: '',
      website: '',
      rating: '',
      totalRooms: '',
      roomTypes: '',
      amenities: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      description: ''
    });
    setLogoPreview(null);
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

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      logo: hotel.logo || '',
      hotelName: hotel.hotelName || '',
      hotelCode: hotel.hotelCode || '',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || 'Saudi Arabia',
      phone: hotel.phone || '',
      email: hotel.email || '',
      website: hotel.website || '',
      rating: hotel.rating || '',
      totalRooms: hotel.totalRooms || '',
      roomTypes: hotel.roomTypes || '',
      amenities: hotel.amenities || '',
      contactPerson: hotel.contactPerson || '',
      contactPhone: hotel.contactPhone || '',
      contactEmail: hotel.contactEmail || '',
      description: hotel.description || ''
    });
    setLogoPreview(hotel.logo || null);
    setIsModalOpen(true);
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
      cloudinaryFormData.append('folder', 'hotel-logos');
      
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
        ...formData,
        hotelName: formData.hotelName.trim(),
        hotelCode: formData.hotelCode.trim() || '',
        address: formData.address.trim() || '',
        city: formData.city.trim() || '',
        country: formData.country.trim() || 'Saudi Arabia',
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        website: formData.website.trim() || '',
        rating: formData.rating.trim() || '',
        totalRooms: formData.totalRooms.trim() || '',
        roomTypes: formData.roomTypes.trim() || '',
        amenities: formData.amenities.trim() || '',
        contactPerson: formData.contactPerson.trim() || '',
        contactPhone: formData.contactPhone.trim() || '',
        contactEmail: formData.contactEmail.trim() || '',
        description: formData.description.trim() || ''
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
        // await createHotel.mutateAsync(payload);
        
        Swal.fire({
          title: 'সফল!',
          text: 'হোটেল সফলভাবে তৈরি হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
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
      (hotel.hotelCode && hotel.hotelCode.toLowerCase().includes(search)) ||
      (hotel.city && hotel.city.toLowerCase().includes(search)) ||
      (hotel.address && hotel.address.toLowerCase().includes(search)) ||
      (hotel.phone && hotel.phone.includes(search)) ||
      (hotel.email && hotel.email.toLowerCase().includes(search))
    );
  }, [hotels, searchTerm]);

  const columns = [
    {
      key: 'logo',
      header: 'লোগো',
      sortable: false,
      render: (value, hotel) => (
        <div className="flex items-center">
          {hotel.logo ? (
            <img 
              src={hotel.logo} 
              alt={hotel.hotelName || 'Logo'} 
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
      key: 'hotelCode',
      header: 'হোটেল কোড',
      sortable: true,
      render: (value, hotel) => (
        <span className="text-gray-900 dark:text-white">
          {hotel.hotelCode || 'N/A'}
        </span>
      )
    },
    {
      key: 'location',
      header: 'ঠিকানা',
      sortable: true,
      render: (value, hotel) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{hotel.city || 'N/A'}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">{hotel.country || ''}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'যোগাযোগ',
      sortable: false,
      render: (value, hotel) => (
        <div className="text-sm space-y-1">
          {hotel.phone && (
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Phone className="w-3 h-3" />
              <span>{hotel.phone}</span>
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
      key: 'rating',
      header: 'রেটিং',
      sortable: true,
      render: (value, hotel) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-gray-900 dark:text-white">{hotel.rating || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'totalRooms',
      header: 'মোট রুম',
      sortable: true,
      render: (value, hotel) => (
        <div className="flex items-center space-x-1">
          <Bed className="w-4 h-4 text-blue-500" />
          <span className="text-gray-900 dark:text-white">{hotel.totalRooms || 'N/A'}</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট হোটেল</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{hotels.length.toLocaleString('bn-BD')}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট রুম</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hotels.reduce((sum, h) => sum + (Number(h.totalRooms) || 0), 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <Bed className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">৫-স্টার হোটেল</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {hotels.filter(h => h.rating === '5' || h.rating === 5).length.toLocaleString('bn-BD')}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400 fill-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">সক্রিয় হোটেল</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {hotels.filter(h => h.status === 'active' || h.isActive !== false).length.toLocaleString('bn-BD')}
              </p>
            </div>
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="হোটেলের নাম, কোড, শহর, ঠিকানা, ফোন বা ইমেইল দিয়ে খুঁজুন..."
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                হোটেল কোড
              </label>
              <input
                type="text"
                value={formData.hotelCode}
                onChange={(e) => setFormData({ ...formData, hotelCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="হোটেল কোড লিখুন"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ঠিকানা
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="ঠিকানা লিখুন"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                শহর
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="শহর লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                দেশ
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="দেশ লিখুন"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ফোন নাম্বার
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="ফোন নাম্বার লিখুন"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ওয়েবসাইট
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রেটিং
              </label>
              <input
                type="text"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="রেটিং (১-৫)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                মোট রুম
              </label>
              <input
                type="number"
                value={formData.totalRooms}
                onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="মোট রুম সংখ্যা"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রুম টাইপ
              </label>
              <input
                type="text"
                value={formData.roomTypes}
                onChange={(e) => setFormData({ ...formData, roomTypes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="রুম টাইপ (কমা দিয়ে আলাদা করুন)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              সুবিধা
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="সুবিধা (কমা দিয়ে আলাদা করুন)"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">যোগাযোগ ব্যক্তির তথ্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগাযোগ ব্যক্তির নাম
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="নাম লিখুন"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগাযোগ ফোন
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ফোন নাম্বার"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  যোগাযোগ ইমেইল
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ইমেইল"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              বিবরণ
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="হোটেল সম্পর্কে বিবরণ লিখুন"
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
              disabled={logoUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logoUploading ? 'সংরক্ষণ হচ্ছে...' : editingHotel ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default HotelManagement;
