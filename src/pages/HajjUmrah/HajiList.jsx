import React, { useState } from 'react';
import { Building, Search, Filter, Edit, Trash2, Plus, Eye, User, Calendar, Phone, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const HajiList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('haj');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPilgrim, setSelectedPilgrim] = useState(null);
  const [modalType, setModalType] = useState('view');

  // Mock data for Haj Pilgrims
  const hajPilgrims = [
    {
      id: 1,
      name: 'আব্দুল্লাহ আহমেদ',
      nid: '1234567890123',
      trackingId: 'HAJ2024001',
      pidNo: 'PID001',
      year: '2024',
      passportNo: 'A12345678',
      contact: '+8801712345678',
      address: 'ঢাকা, বাংলাদেশ',
      status: 'Confirmed',
      package: 'Premium Package',
      dateOfBirth: '1985-03-15',
      gender: 'পুরুষ',
      emergencyContact: '+8801812345678',
      email: 'abdullah@email.com'
    },
    {
      id: 2,
      name: 'ফাতেমা বেগম',
      nid: '9876543210987',
      trackingId: 'HAJ2024002',
      pidNo: 'PID002',
      year: '2024',
      passportNo: 'B87654321',
      contact: '+8801812345678',
      address: 'চট্টগ্রাম, বাংলাদেশ',
      status: 'Pending',
      package: 'Standard Package',
      dateOfBirth: '1990-07-22',
      gender: 'মহিলা',
      emergencyContact: '+8801912345678',
      email: 'fatema@email.com'
    },
    {
      id: 3,
      name: 'মুহাম্মদ আলী',
      nid: '4567890123456',
      trackingId: 'HAJ2024003',
      pidNo: 'PID003',
      year: '2024',
      passportNo: 'C45678901',
      contact: '+8801912345678',
      address: 'সিলেট, বাংলাদেশ',
      status: 'Confirmed',
      package: 'Premium Package',
      dateOfBirth: '1978-11-08',
      gender: 'পুরুষ',
      emergencyContact: '+8802012345678',
      email: 'ali@email.com'
    }
  ];

  // Mock data for Umrah Pilgrims
  const umrahPilgrims = [
    {
      id: 1,
      name: 'আয়েশা সুলতানা',
      nid: '7890123456789',
      trackingId: 'UMR2024001',
      pidNo: 'PID004',
      year: '2024',
      passportNo: 'D78901234',
      contact: '+8802012345678',
      address: 'রাজশাহী, বাংলাদেশ',
      status: 'Confirmed',
      package: 'Umrah Package',
      dateOfBirth: '1988-05-12',
      gender: 'মহিলা',
      emergencyContact: '+8802112345678',
      email: 'ayesha@email.com'
    },
    {
      id: 2,
      name: 'ইব্রাহিম হোসেন',
      nid: '3210987654321',
      trackingId: 'UMR2024002',
      pidNo: 'PID005',
      year: '2024',
      passportNo: 'E32109876',
      contact: '+8802112345678',
      address: 'খুলনা, বাংলাদেশ',
      status: 'Processing',
      package: 'Umrah Package',
      dateOfBirth: '1982-09-30',
      gender: 'পুরুষ',
      emergencyContact: '+8802212345678',
      email: 'ibrahim@email.com'
    }
  ];

  const handleView = (pilgrim) => {
    setSelectedPilgrim(pilgrim);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (pilgrim) => {
    Swal.fire({
      title: 'সম্পাদনা',
      text: `${pilgrim.name} এর তথ্য সম্পাদনা করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, সম্পাদনা করুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle edit logic here
        console.log('Editing pilgrim:', pilgrim);
        
        Swal.fire({
          title: 'সম্পাদনা',
          text: 'সম্পাদনার জন্য নতুন পেজে নিয়ে যাওয়া হবে।',
          icon: 'info',
          confirmButtonColor: '#8b5cf6',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    });
  };

  const handleDelete = (pilgrim) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${pilgrim.name} এর তথ্য মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle delete logic here
        console.log('Deleting pilgrim:', pilgrim);
        
        // Show success message
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: `${pilgrim.name} এর তথ্য সফলভাবে মুছে ফেলা হয়েছে।`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'নিশ্চিত';
      case 'Pending':
        return 'অপেক্ষমান';
      case 'Processing':
        return 'প্রক্রিয়াধীন';
      case 'Cancelled':
        return 'বাতিল';
      default:
        return status;
    }
  };

  const filteredHajPilgrims = hajPilgrims.filter(pilgrim =>
    pilgrim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.pidNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.contact.includes(searchTerm) ||
    pilgrim.passportNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUmrahPilgrims = umrahPilgrims.filter(pilgrim =>
    pilgrim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.pidNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pilgrim.contact.includes(searchTerm) ||
    pilgrim.passportNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHajPilgrims = hajPilgrims.length;
  const totalUmrahPilgrims = umrahPilgrims.length;
  const confirmedHaj = hajPilgrims.filter(p => p.status === 'Confirmed').length;
  const confirmedUmrah = umrahPilgrims.filter(p => p.status === 'Confirmed').length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ তালিকা
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              হজ্জ ও উমরাহ যাত্রীদের তথ্য ব্যবস্থাপনা
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/hajj-umrah/add-haji')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">নতুন হাজী যোগ করুন</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট হজ্জ যাত্রী</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalHajPilgrims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট উমরাহ যাত্রী</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalUmrahPilgrims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">নিশ্চিত হজ্জ</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{confirmedHaj}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">নিশ্চিত উমরাহ</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{confirmedUmrah}</p>
            </div>
          </div>
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
                placeholder="নাম, ট্র্যাকিং আইডি, PID নং, যোগাযোগ, বা পাসপোর্ট নং দিয়ে সার্চ করুন..."
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

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('haj')}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'haj'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              হজ্জ যাত্রী ({filteredHajPilgrims.length})
            </button>
            <button
              onClick={() => setActiveTab('umrah')}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeTab === 'umrah'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              উমরাহ যাত্রী ({filteredUmrahPilgrims.length})
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    যাত্রী
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ট্র্যাকিং আইডি
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PID নং
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    বছর
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    পাসপোর্ট নং
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    যোগাযোগ
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    প্যাকেজ
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeTab === 'haj' 
                  ? filteredHajPilgrims.map((pilgrim) => (
                      <tr key={pilgrim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                                  {pilgrim.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                {pilgrim.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                NID: {pilgrim.nid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono truncate block">
                            {pilgrim.trackingId}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.pidNo}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.year}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.passportNo}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.contact}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pilgrim.status)}`}>
                            {getStatusText(pilgrim.status)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.package}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleView(pilgrim)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors"
                              title="দেখুন"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(pilgrim)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 transition-colors"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(pilgrim)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : filteredUmrahPilgrims.map((pilgrim) => (
                      <tr key={pilgrim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {pilgrim.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                {pilgrim.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                NID: {pilgrim.nid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono truncate block">
                            {pilgrim.trackingId}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.pidNo}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.year}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.passportNo}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.contact}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pilgrim.status)}`}>
                            {getStatusText(pilgrim.status)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                            {pilgrim.package}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleView(pilgrim)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors"
                              title="দেখুন"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(pilgrim)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 transition-colors"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(pilgrim)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                  হাজী তথ্য দেখুন
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedPilgrim && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        নাম
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ট্র্যাকিং আইডি
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedPilgrim.trackingId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PID নং
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.pidNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        বছর
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.year}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        পাসপোর্ট নং
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.passportNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        যোগাযোগ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.contact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ইমেইল
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        জন্ম তারিখ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.dateOfBirth || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ঠিকানা
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.address}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        স্ট্যাটাস
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPilgrim.status)}`}>
                        {getStatusText(selectedPilgrim.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        প্যাকেজ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.package}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        জরুরি যোগাযোগ
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPilgrim.emergencyContact || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HajiList;
