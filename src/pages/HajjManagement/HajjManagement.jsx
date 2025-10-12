import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Camera, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Scale,
  Tag,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  User,
  Plane,
  Building,
  Star,
  FileText,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HajjManagement = () => {
  const navigate = useNavigate();
  const [hajjList, setHajjList] = useState([]);
  const [filteredHajj, setFilteredHajj] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHajj, setSelectedHajj] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newHajj, setNewHajj] = useState({
    id: '',
    name: '',
    fatherName: '',
    motherName: '',
    age: '',
    nid: '',
    passportNumber: '',
    passportExpiry: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    hajjType: 'hajj',
    packageType: '',
    departureDate: '',
    returnDate: '',
    status: 'registered',
    image: null,
    emergencyContact: '',
    medicalCondition: '',
    notes: ''
  });

  const statusOptions = [
    { value: 'registered', label: 'নিবন্ধিত', color: 'text-blue-600 bg-blue-100' },
    { value: 'confirmed', label: 'নিশ্চিত', color: 'text-green-600 bg-green-100' },
    { value: 'visa_issued', label: 'ভিসা জারি', color: 'text-purple-600 bg-purple-100' },
    { value: 'departed', label: 'যাত্রা করেছেন', color: 'text-orange-600 bg-orange-100' },
    { value: 'returned', label: 'ফিরে এসেছেন', color: 'text-gray-600 bg-gray-100' },
    { value: 'cancelled', label: 'বাতিল', color: 'text-red-600 bg-red-100' }
  ];

  const hajjTypeOptions = [
    'হজ্জ',
    'উমরাহ',
    'হজ্জ ও উমরাহ'
  ];

  const packageTypeOptions = [
    'প্রিমিয়াম প্যাকেজ',
    'স্ট্যান্ডার্ড প্যাকেজ',
    'ইকোনমি প্যাকেজ',
    'কাস্টম প্যাকেজ'
  ];

  const districtOptions = [
    'ঢাকা',
    'চট্টগ্রাম',
    'সিলেট',
    'রাজশাহী',
    'খুলনা',
    'বরিশাল',
    'রংপুর',
    'ময়মনসিংহ',
    'কুমিল্লা',
    'নোয়াখালী',
    'জামালপুর',
    'শেরপুর',
    'নেত্রকোনা',
    'কিশোরগঞ্জ',
    'গাজীপুর',
    'নারায়ণগঞ্জ',
    'টাঙ্গাইল',
    'মানিকগঞ্জ',
    'মুন্সিগঞ্জ',
    'মাদারীপুর',
    'শরীয়তপুর',
    'ফরিদপুর',
    'গোপালগঞ্জ',
    'বাগেরহাট',
    'পিরোজপুর',
    'ঝালকাঠি',
    'পটুয়াখালী',
    'ভোলা',
    'বরগুনা',
    'সাতক্ষীরা',
    'যশোর',
    'নড়াইল',
    'মাগুরা',
    'চুয়াডাঙ্গা',
    'মেহেরপুর',
    'কুষ্টিয়া',
    'ঝিনাইদহ',
    'চাঁদপুর',
    'লক্ষ্মীপুর',
    'ফেনী',
    'ব্রাহ্মণবাড়িয়া',
    'কক্সবাজার',
    'বান্দরবান',
    'রাঙ্গামাটি',
    'খাগড়াছড়ি',
    'বগুড়া',
    'জয়পুরহাট',
    'নওগাঁ',
    'নাটোর',
    'চাঁপাইনবাবগঞ্জ',
    'পাবনা',
    'সিরাজগঞ্জ',
    'দিনাজপুর',
    'গাইবান্ধা',
    'কুড়িগ্রাম',
    'লালমনিরহাট',
    'নীলফামারী',
    'পঞ্চগড়',
    'ঠাকুরগাঁও',
    'নেত্রকোনা',
    'কিশোরগঞ্জ',
    'জামালপুর',
    'শেরপুর',
    'ময়মনসিংহ',
    'নেত্রকোনা'
  ];

  useEffect(() => {
    loadHajjData();
  }, []);

  useEffect(() => {
    filterHajj();
  }, [hajjList, searchTerm, filterStatus, filterType]);

  const loadHajjData = () => {
    // Mock data - replace with actual API calls
    const mockData = [
      {
        id: 'HAJJ001',
        name: 'আব্দুল রহমান',
        fatherName: 'মোহাম্মদ আলী',
        motherName: 'রহিমা খাতুন',
        age: 45,
        nid: '1234567890123',
        passportNumber: 'A1234567',
        passportExpiry: '2026-12-31',
        phone: '01712345678',
        email: 'abdul@example.com',
        address: 'ধানমন্ডি, ঢাকা',
        district: 'ঢাকা',
        hajjType: 'হজ্জ',
        packageType: 'প্রিমিয়াম প্যাকেজ',
        departureDate: '2024-07-15',
        returnDate: '2024-08-15',
        status: 'confirmed',
        image: null,
        emergencyContact: '01787654321',
        medicalCondition: 'ডায়াবেটিস',
        notes: 'প্রথমবার হজ্জে যাচ্ছেন'
      },
      {
        id: 'HAJJ002',
        name: 'ফাতেমা খাতুন',
        fatherName: 'আবুল কালাম',
        motherName: 'সালেহা বেগম',
        age: 38,
        nid: '9876543210987',
        passportNumber: 'B9876543',
        passportExpiry: '2025-06-30',
        phone: '01876543210',
        email: 'fatema@example.com',
        address: 'কুমিল্লা সদর',
        district: 'কুমিল্লা',
        hajjType: 'উমরাহ',
        packageType: 'স্ট্যান্ডার্ড প্যাকেজ',
        departureDate: '2024-03-20',
        returnDate: '2024-04-05',
        status: 'visa_issued',
        image: null,
        emergencyContact: '01987654321',
        medicalCondition: 'নিরোগ',
        notes: 'পরিবারের সাথে যাচ্ছেন'
      },
      {
        id: 'HAJJ003',
        name: 'মোহাম্মদ হোসেন',
        fatherName: 'করিম উদ্দিন',
        motherName: 'নাসিরা খাতুন',
        age: 52,
        nid: '4567890123456',
        passportNumber: 'C4567890',
        passportExpiry: '2027-03-15',
        phone: '01654321098',
        email: 'hossen@example.com',
        address: 'সিলেট সদর',
        district: 'সিলেট',
        hajjType: 'হজ্জ ও উমরাহ',
        packageType: 'ইকোনমি প্যাকেজ',
        departureDate: '2024-08-01',
        returnDate: '2024-09-01',
        status: 'registered',
        image: null,
        emergencyContact: '01543210987',
        medicalCondition: 'উচ্চ রক্তচাপ',
        notes: 'দ্বিতীয়বার হজ্জে যাচ্ছেন'
      }
    ];
    setHajjList(mockData);
  };

  const filterHajj = () => {
    let filtered = hajjList.filter(hajj => 
      hajj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hajj.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hajj.nid.includes(searchTerm) ||
      hajj.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hajj.phone.includes(searchTerm)
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(hajj => hajj.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(hajj => hajj.hajjType === filterType);
    }

    setFilteredHajj(filtered);
  };

  const handleAddHajj = () => {
    const hajj = {
      ...newHajj,
      id: `HAJJ${String(hajjList.length + 1).padStart(3, '0')}`
    };
    
    setHajjList([...hajjList, hajj]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditHajj = () => {
    const updatedList = hajjList.map(hajj => 
      hajj.id === selectedHajj.id ? selectedHajj : hajj
    );
    setHajjList(updatedList);
    setShowEditModal(false);
    setSelectedHajj(null);
  };

  const handleDeleteHajj = (id) => {
    if (window.confirm('আপনি কি এই হাজী তথ্য মুছে ফেলতে চান?')) {
      setHajjList(hajjList.filter(hajj => hajj.id !== id));
    }
  };

  const resetForm = () => {
    setNewHajj({
      id: '',
      name: '',
      fatherName: '',
      motherName: '',
      age: '',
      nid: '',
      passportNumber: '',
      passportExpiry: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      hajjType: 'হজ্জ',
      packageType: '',
      departureDate: '',
      returnDate: '',
      status: 'registered',
      image: null,
      emergencyContact: '',
      medicalCondition: '',
      notes: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'visa_issued':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'departed':
        return <Plane className="w-5 h-5 text-orange-600" />;
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'cancelled':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusClass = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  const getHajjTypeIcon = (type) => {
    switch (type) {
      case 'হজ্জ':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'উমরাহ':
        return <Star className="w-4 h-4 text-blue-600" />;
      case 'হজ্জ ও উমরাহ':
        return <Heart className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">হজ্জ ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">হাজী তথ্য সংরক্ষণ ও ব্যবস্থাপনা</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          নতুন হাজী যোগ করুন
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="নাম, NID, পাসপোর্ট বা ফোন নম্বর দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব অবস্থা</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব ধরন</option>
              {hajjTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Hajj List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  হাজী তথ্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যোগাযোগ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  হজ্জ ধরন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্যাকেজ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যাত্রার তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়া
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHajj.map((hajj) => (
                <tr key={hajj.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {hajj.image ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={hajj.image} alt={hajj.name} />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{hajj.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {hajj.id}
                        </div>
                        <div className="text-sm text-gray-500">{hajj.age} বছর</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hajj.phone}</div>
                    <div className="text-sm text-gray-500">{hajj.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hajj.district}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getHajjTypeIcon(hajj.hajjType)}
                      <span className="text-sm text-gray-900">{hajj.hajjType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hajj.packageType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(hajj.departureDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(hajj.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(hajj.status)}`}>
                        {statusOptions.find(opt => opt.value === hajj.status)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedHajj(hajj);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHajj(hajj);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHajj(hajj.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hajj Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">নতুন হাজী যোগ করুন</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddHajj(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">হাজীর নাম</label>
                  <input
                    type="text"
                    required
                    value={newHajj.name}
                    onChange={(e) => setNewHajj({...newHajj, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="হাজীর পূর্ণ নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    required
                    value={newHajj.fatherName}
                    onChange={(e) => setNewHajj({...newHajj, fatherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পিতার নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    required
                    value={newHajj.motherName}
                    onChange={(e) => setNewHajj({...newHajj, motherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="মাতার নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বয়স</label>
                  <input
                    type="number"
                    required
                    value={newHajj.age}
                    onChange={(e) => setNewHajj({...newHajj, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বয়স"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">জাতীয় পরিচয়পত্র নম্বর</label>
                  <input
                    type="text"
                    required
                    value={newHajj.nid}
                    onChange={(e) => setNewHajj({...newHajj, nid: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NID নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসপোর্ট নম্বর</label>
                  <input
                    type="text"
                    required
                    value={newHajj.passportNumber}
                    onChange={(e) => setNewHajj({...newHajj, passportNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পাসপোর্ট নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসপোর্ট মেয়াদ শেষ</label>
                  <input
                    type="date"
                    required
                    value={newHajj.passportExpiry}
                    onChange={(e) => setNewHajj({...newHajj, passportExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={newHajj.phone}
                    onChange={(e) => setNewHajj({...newHajj, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ফোন নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={newHajj.email}
                    onChange={(e) => setNewHajj({...newHajj, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ইমেইল ঠিকানা"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    required
                    value={newHajj.address}
                    onChange={(e) => setNewHajj({...newHajj, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বিস্তারিত ঠিকানা"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">জেলা</label>
                  <select
                    required
                    value={newHajj.district}
                    onChange={(e) => setNewHajj({...newHajj, district: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    {districtOptions.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">হজ্জ ধরন</label>
                  <select
                    required
                    value={newHajj.hajjType}
                    onChange={(e) => setNewHajj({...newHajj, hajjType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {hajjTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">প্যাকেজ ধরন</label>
                  <select
                    required
                    value={newHajj.packageType}
                    onChange={(e) => setNewHajj({...newHajj, packageType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">প্যাকেজ নির্বাচন করুন</option>
                    {packageTypeOptions.map(pkg => (
                      <option key={pkg} value={pkg}>{pkg}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">যাত্রার তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newHajj.departureDate}
                    onChange={(e) => setNewHajj({...newHajj, departureDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফেরার তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newHajj.returnDate}
                    onChange={(e) => setNewHajj({...newHajj, returnDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">জরুরি যোগাযোগ</label>
                  <input
                    type="tel"
                    value={newHajj.emergencyContact}
                    onChange={(e) => setNewHajj({...newHajj, emergencyContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="জরুরি যোগাযোগ নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">চিকিৎসা অবস্থা</label>
                  <input
                    type="text"
                    value={newHajj.medicalCondition}
                    onChange={(e) => setNewHajj({...newHajj, medicalCondition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="চিকিৎসা অবস্থা"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ছবি আপলোড</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewHajj({...newHajj, image: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newHajj.notes}
                  onChange={(e) => setNewHajj({...newHajj, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য বা নোট"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Hajj Modal */}
      {showViewModal && selectedHajj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">হাজীর বিস্তারিত তথ্য</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {selectedHajj.image ? (
                    <img className="h-24 w-24 rounded-full object-cover" src={selectedHajj.image} alt={selectedHajj.name} />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedHajj.name}</h3>
                  <p className="text-gray-600">ID: {selectedHajj.id} | {selectedHajj.age} বছর</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon(selectedHajj.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(selectedHajj.status)}`}>
                      {statusOptions.find(opt => opt.value === selectedHajj.status)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">ব্যক্তিগত তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">পিতার নাম:</span>
                      <span className="font-medium">{selectedHajj.fatherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">মাতার নাম:</span>
                      <span className="font-medium">{selectedHajj.motherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NID:</span>
                      <span className="font-medium">{selectedHajj.nid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">পাসপোর্ট:</span>
                      <span className="font-medium">{selectedHajj.passportNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">পাসপোর্ট মেয়াদ:</span>
                      <span className="font-medium">{new Date(selectedHajj.passportExpiry).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">যোগাযোগ তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ফোন:</span>
                      <span className="font-medium">{selectedHajj.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ইমেইল:</span>
                      <span className="font-medium">{selectedHajj.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ঠিকানা:</span>
                      <span className="font-medium">{selectedHajj.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">জেলা:</span>
                      <span className="font-medium">{selectedHajj.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">জরুরি যোগাযোগ:</span>
                      <span className="font-medium">{selectedHajj.emergencyContact}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">হজ্জ তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">হজ্জ ধরন:</span>
                      <span className="font-medium">{selectedHajj.hajjType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">প্যাকেজ:</span>
                      <span className="font-medium">{selectedHajj.packageType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">যাত্রার তারিখ:</span>
                      <span className="font-medium">{new Date(selectedHajj.departureDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ফেরার তারিখ:</span>
                      <span className="font-medium">{new Date(selectedHajj.returnDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">অতিরিক্ত তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">চিকিৎসা অবস্থা:</span>
                      <span className="font-medium">{selectedHajj.medicalCondition}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedHajj.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">নোট</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedHajj.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HajjManagement;
