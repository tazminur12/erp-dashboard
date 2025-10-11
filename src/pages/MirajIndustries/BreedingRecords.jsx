import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Baby, 
  Heart,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Edit,
  Trash2,
  Bell,
  User,
  FileText,
  Activity,
  Scale
} from 'lucide-react';

const BreedingRecords = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [calvingRecords, setCalvingRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [bullList, setBullList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddBreedingModal, setShowAddBreedingModal] = useState(false);
  const [showAddCalvingModal, setShowAddCalvingModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [newBreeding, setNewBreeding] = useState({
    cowId: '',
    bullId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    method: 'natural',
    success: 'pending',
    notes: '',
    expectedCalvingDate: ''
  });

  const [newCalving, setNewCalving] = useState({
    cowId: '',
    calvingDate: new Date().toISOString().split('T')[0],
    calfGender: '',
    calfWeight: '',
    calfHealth: 'healthy',
    calvingType: 'normal',
    complications: '',
    notes: '',
    calfId: ''
  });

  const breedingMethodOptions = [
    { value: 'natural', label: 'প্রাকৃতিক প্রজনন' },
    { value: 'artificial', label: 'কৃত্রিম প্রজনন' },
    { value: 'et', label: 'ভ্রূণ স্থানান্তর' }
  ];

  const successStatusOptions = [
    { value: 'pending', label: 'অপেক্ষমান', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'successful', label: 'সফল', color: 'text-green-600 bg-green-100' },
    { value: 'failed', label: 'ব্যর্থ', color: 'text-red-600 bg-red-100' },
    { value: 'confirmed_pregnant', label: 'গর্ভবতী নিশ্চিত', color: 'text-blue-600 bg-blue-100' }
  ];

  const calfHealthOptions = [
    { value: 'healthy', label: 'সুস্থ', color: 'text-green-600 bg-green-100' },
    { value: 'weak', label: 'দুর্বল', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'sick', label: 'অসুস্থ', color: 'text-red-600 bg-red-100' },
    { value: 'deceased', label: 'মৃত', color: 'text-gray-600 bg-gray-100' }
  ];

  const calvingTypeOptions = [
    'স্বাভাবিক',
    'অস্ত্রোপচার',
    'জটিলতা',
    'জরুরী'
  ];

  const [stats, setStats] = useState({
    totalBreedings: 0,
    successfulBreedings: 0,
    totalCalvings: 0,
    upcomingCalvings: 0,
    healthyCalves: 0,
    pregnancyRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
    calculateStats();
  }, [breedingRecords, calvingRecords, searchTerm, filterType, filterDate]);

  const loadData = () => {
    // Mock cattle data (cows)
    const mockCattle = [
      { id: 'COW001', name: 'রাণী', breed: 'হলস্টেইন ফ্রিজিয়ান', gender: 'female', age: 4 },
      { id: 'COW002', name: 'মালতি', breed: 'সাহিওয়াল', gender: 'female', age: 3 },
      { id: 'COW003', name: 'সোনালী', breed: 'জার্সি', gender: 'female', age: 5 },
      { id: 'COW004', name: 'কমলা', breed: 'রেড সিন্ধি', gender: 'female', age: 2 },
      { id: 'COW005', name: 'রাজকুমারী', breed: 'গির', gender: 'female', age: 6 }
    ];
    setCattleList(mockCattle);

    // Mock bull data
    const mockBulls = [
      { id: 'BULL001', name: 'রাজা', breed: 'হলস্টেইন ফ্রিজিয়ান', age: 5 },
      { id: 'BULL002', name: 'শাহজাদা', breed: 'সাহিওয়াল', age: 4 },
      { id: 'BULL003', name: 'বীর', breed: 'জার্সি', age: 6 }
    ];
    setBullList(mockBulls);

    // Mock breeding records
    const mockBreedingRecords = [
      {
        id: 'BREED001',
        cowId: 'COW001',
        cowName: 'রাণী',
        bullId: 'BULL001',
        bullName: 'রাজা',
        breedingDate: '2023-08-15',
        method: 'natural',
        success: 'confirmed_pregnant',
        notes: 'প্রথম প্রজনন, সফল',
        expectedCalvingDate: '2024-05-15'
      },
      {
        id: 'BREED002',
        cowId: 'COW003',
        cowName: 'সোনালী',
        bullId: 'BULL002',
        bullName: 'শাহজাদা',
        breedingDate: '2023-09-20',
        method: 'artificial',
        success: 'successful',
        notes: 'কৃত্রিম প্রজনন পদ্ধতি',
        expectedCalvingDate: '2024-06-20'
      },
      {
        id: 'BREED003',
        cowId: 'COW004',
        cowName: 'কমলা',
        bullId: 'BULL003',
        bullName: 'বীর',
        breedingDate: '2023-10-10',
        method: 'natural',
        success: 'pending',
        notes: 'প্রজনন অপেক্ষমান',
        expectedCalvingDate: ''
      }
    ];
    setBreedingRecords(mockBreedingRecords);

    // Mock calving records
    const mockCalvingRecords = [
      {
        id: 'CALV001',
        cowId: 'COW002',
        cowName: 'মালতি',
        calvingDate: '2024-01-10',
        calfGender: 'female',
        calfWeight: 35,
        calfHealth: 'healthy',
        calvingType: 'স্বাভাবিক',
        complications: '',
        notes: 'সুস্থ বাচ্চা জন্মগ্রহণ',
        calfId: 'CALF001'
      },
      {
        id: 'CALV002',
        cowId: 'COW005',
        cowName: 'রাজকুমারী',
        calvingDate: '2023-12-25',
        calfGender: 'male',
        calfWeight: 40,
        calfHealth: 'weak',
        calvingType: 'অস্ত্রোপচার',
        complications: 'জটিল প্রসব',
        notes: 'অস্ত্রোপচারের মাধ্যমে বাচ্চা জন্ম',
        calfId: 'CALF002'
      }
    ];
    setCalvingRecords(mockCalvingRecords);
  };

  const filterRecords = () => {
    let allRecords = [];
    
    if (filterType === 'all' || filterType === 'breeding') {
      allRecords = [...allRecords, ...breedingRecords.map(record => ({ ...record, type: 'breeding' }))];
    }
    
    if (filterType === 'all' || filterType === 'calving') {
      allRecords = [...allRecords, ...calvingRecords.map(record => ({ ...record, type: 'calving' }))];
    }

    let filtered = allRecords.filter(record => 
      record.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.bullName && record.bullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.calfId && record.calfId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterDate) {
      filtered = filtered.filter(record => record.breedingDate === filterDate || record.calvingDate === filterDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.breedingDate || a.calvingDate);
      const dateB = new Date(b.breedingDate || b.calvingDate);
      return dateB - dateA;
    });

    setFilteredRecords(filtered);
  };

  const calculateStats = () => {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const successfulBreedings = breedingRecords.filter(record => 
      record.success === 'successful' || record.success === 'confirmed_pregnant'
    ).length;

    const upcomingCalvings = breedingRecords.filter(record => 
      record.expectedCalvingDate && 
      new Date(record.expectedCalvingDate) <= nextMonth &&
      record.success === 'confirmed_pregnant'
    ).length;

    const healthyCalves = calvingRecords.filter(record => 
      record.calfHealth === 'healthy'
    ).length;

    const pregnancyRate = breedingRecords.length > 0 
      ? (successfulBreedings / breedingRecords.length) * 100 
      : 0;

    setStats({
      totalBreedings: breedingRecords.length,
      successfulBreedings,
      totalCalvings: calvingRecords.length,
      upcomingCalvings,
      healthyCalves,
      pregnancyRate
    });
  };

  const handleAddBreeding = () => {
    const breeding = {
      ...newBreeding,
      id: `BREED${String(breedingRecords.length + 1).padStart(3, '0')}`,
      cowName: cattleList.find(cow => cow.id === newBreeding.cowId)?.name || '',
      bullName: bullList.find(bull => bull.id === newBreeding.bullId)?.name || ''
    };
    
    // Calculate expected calving date (approximately 280 days)
    if (newBreeding.breedingDate) {
      const breedingDate = new Date(newBreeding.breedingDate);
      const expectedCalving = new Date(breedingDate.getTime() + 280 * 24 * 60 * 60 * 1000);
      breeding.expectedCalvingDate = expectedCalving.toISOString().split('T')[0];
    }
    
    setBreedingRecords([breeding, ...breedingRecords]);
    setShowAddBreedingModal(false);
    resetBreedingForm();
  };

  const handleAddCalving = () => {
    const calving = {
      ...newCalving,
      id: `CALV${String(calvingRecords.length + 1).padStart(3, '0')}`,
      cowName: cattleList.find(cow => cow.id === newCalving.cowId)?.name || '',
      calfId: `CALF${String(calvingRecords.length + 1).padStart(3, '0')}`
    };
    setCalvingRecords([calving, ...calvingRecords]);
    setShowAddCalvingModal(false);
    resetCalvingForm();
  };

  const resetBreedingForm = () => {
    setNewBreeding({
      cowId: '',
      bullId: '',
      breedingDate: new Date().toISOString().split('T')[0],
      method: 'natural',
      success: 'pending',
      notes: '',
      expectedCalvingDate: ''
    });
  };

  const resetCalvingForm = () => {
    setNewCalving({
      cowId: '',
      calvingDate: new Date().toISOString().split('T')[0],
      calfGender: '',
      calfWeight: '',
      calfHealth: 'healthy',
      calvingType: 'normal',
      complications: '',
      notes: '',
      calfId: ''
    });
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'breeding':
        return <Heart className="w-5 h-5 text-pink-600" />;
      case 'calving':
        return <Baby className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSuccessStatusClass = (status) => {
    const statusObj = successStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  const getCalfHealthClass = (health) => {
    const healthObj = calfHealthOptions.find(opt => opt.value === health);
    return healthObj ? healthObj.color : 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">প্রজনন ও বাচ্চা প্রসব রেকর্ড</h1>
          <p className="text-gray-600 mt-2">গরুর প্রজনন ও বাচ্চা প্রসবের তথ্য ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddBreedingModal(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            প্রজনন রেকর্ড
          </button>
          <button 
            onClick={() => setShowAddCalvingModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Baby className="w-5 h-5" />
            বাচ্চা প্রসব
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট প্রজনন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBreedings}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-pink-600">
            <Activity className="w-4 h-4 mr-1" />
            <span>{stats.pregnancyRate.toFixed(1)}% সফলতা</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">সফল প্রজনন</p>
              <p className="text-2xl font-bold text-green-600">{stats.successfulBreedings}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>গর্ভধারণ নিশ্চিত</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট বাচ্চা প্রসব</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCalvings}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Baby className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Baby className="w-4 h-4 mr-1" />
            <span>{stats.healthyCalves} সুস্থ বাচ্চা</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">আসন্ন প্রসব</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.upcomingCalvings}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>এই মাসে</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="গরুর নাম, ষাঁড়ের নাম বা বাচ্চার ID দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব রেকর্ড</option>
              <option value="breeding">প্রজনন রেকর্ড</option>
              <option value="calving">বাচ্চা প্রসব রেকর্ড</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গরু
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ধরন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিবরণ
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
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(record.breedingDate || record.calvingDate).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.cowName}</div>
                    <div className="text-sm text-gray-500">{record.cowId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRecordIcon(record.type)}
                      <span className="text-sm text-gray-900">
                        {record.type === 'breeding' ? 'প্রজনন' : 'বাচ্চা প্রসব'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.type === 'breeding' && (
                        <>
                          <div>ষাঁড়: {record.bullName}</div>
                          <div className="text-gray-500">
                            পদ্ধতি: {breedingMethodOptions.find(opt => opt.value === record.method)?.label}
                          </div>
                          {record.expectedCalvingDate && (
                            <div className="text-blue-600">
                              প্রত্যাশিত প্রসব: {new Date(record.expectedCalvingDate).toLocaleDateString('bn-BD')}
                            </div>
                          )}
                        </>
                      )}
                      {record.type === 'calving' && (
                        <>
                          <div>বাচ্চা: {record.calfGender === 'male' ? 'ষাঁড়' : 'মহিষা'}</div>
                          <div className="text-gray-500">
                            ওজন: {record.calfWeight} কেজি | ধরন: {record.calvingType}
                          </div>
                          {record.calfId && (
                            <div className="text-purple-600">ID: {record.calfId}</div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.type === 'breeding' && record.success && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSuccessStatusClass(record.success)}`}>
                        {successStatusOptions.find(opt => opt.value === record.success)?.label}
                      </span>
                    )}
                    {record.type === 'calving' && record.calfHealth && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCalfHealthClass(record.calfHealth)}`}>
                        {calfHealthOptions.find(opt => opt.value === record.calfHealth)?.label}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowViewModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Breeding Modal */}
      {showAddBreedingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">প্রজনন রেকর্ড যোগ করুন</h2>
              <button onClick={() => setShowAddBreedingModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddBreeding(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">গরু নির্বাচন করুন</label>
                <select
                  required
                  value={newBreeding.cowId}
                  onChange={(e) => setNewBreeding({...newBreeding, cowId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">গরু নির্বাচন করুন</option>
                  {cattleList.map(cattle => (
                    <option key={cattle.id} value={cattle.id}>{cattle.name} ({cattle.id})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ষাঁড় নির্বাচন করুন</label>
                <select
                  required
                  value={newBreeding.bullId}
                  onChange={(e) => setNewBreeding({...newBreeding, bullId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ষাঁড় নির্বাচন করুন</option>
                  {bullList.map(bull => (
                    <option key={bull.id} value={bull.id}>{bull.name} ({bull.id})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজননের তারিখ</label>
                <input
                  type="date"
                  required
                  value={newBreeding.breedingDate}
                  onChange={(e) => setNewBreeding({...newBreeding, breedingDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজননের পদ্ধতি</label>
                <select
                  required
                  value={newBreeding.method}
                  onChange={(e) => setNewBreeding({...newBreeding, method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {breedingMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সফলতা</label>
                <select
                  value={newBreeding.success}
                  onChange={(e) => setNewBreeding({...newBreeding, success: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {successStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newBreeding.notes}
                  onChange={(e) => setNewBreeding({...newBreeding, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBreedingModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Calving Modal */}
      {showAddCalvingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">বাচ্চা প্রসব রেকর্ড</h2>
              <button onClick={() => setShowAddCalvingModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddCalving(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">গরু নির্বাচন করুন</label>
                <select
                  required
                  value={newCalving.cowId}
                  onChange={(e) => setNewCalving({...newCalving, cowId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">গরু নির্বাচন করুন</option>
                  {cattleList.map(cattle => (
                    <option key={cattle.id} value={cattle.id}>{cattle.name} ({cattle.id})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রসবের তারিখ</label>
                <input
                  type="date"
                  required
                  value={newCalving.calvingDate}
                  onChange={(e) => setNewCalving({...newCalving, calvingDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বাচ্চার লিঙ্গ</label>
                  <select
                    required
                    value={newCalving.calfGender}
                    onChange={(e) => setNewCalving({...newCalving, calfGender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="male">ষাঁড়</option>
                    <option value="female">মহিষা</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বাচ্চার ওজন (কেজি)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCalving.calfWeight}
                    onChange={(e) => setNewCalving({...newCalving, calfWeight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ওজন"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বাচ্চার স্বাস্থ্য</label>
                  <select
                    value={newCalving.calfHealth}
                    onChange={(e) => setNewCalving({...newCalving, calfHealth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {calfHealthOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">প্রসবের ধরন</label>
                  <select
                    required
                    value={newCalving.calvingType}
                    onChange={(e) => setNewCalving({...newCalving, calvingType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">ধরন নির্বাচন করুন</option>
                    {calvingTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">জটিলতা (যদি থাকে)</label>
                <textarea
                  value={newCalving.complications}
                  onChange={(e) => setNewCalving({...newCalving, complications: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="জটিলতা বা সমস্যার বিবরণ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newCalving.notes}
                  onChange={(e) => setNewCalving({...newCalving, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCalvingModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">রেকর্ড বিস্তারিত</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">গরু:</p>
                  <p className="font-medium">{selectedRecord.cowName} ({selectedRecord.cowId})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">তারিখ:</p>
                  <p className="font-medium">
                    {new Date(selectedRecord.breedingDate || selectedRecord.calvingDate).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
              
              {selectedRecord.type === 'breeding' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ষাঁড়:</p>
                      <p className="font-medium">{selectedRecord.bullName} ({selectedRecord.bullId})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">পদ্ধতি:</p>
                      <p className="font-medium">
                        {breedingMethodOptions.find(opt => opt.value === selectedRecord.method)?.label}
                      </p>
                    </div>
                  </div>
                  {selectedRecord.expectedCalvingDate && (
                    <div>
                      <p className="text-sm text-gray-600">প্রত্যাশিত প্রসব তারিখ:</p>
                      <p className="font-medium text-blue-600">
                        {new Date(selectedRecord.expectedCalvingDate).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {selectedRecord.type === 'calving' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">বাচ্চার লিঙ্গ:</p>
                      <p className="font-medium">{selectedRecord.calfGender === 'male' ? 'ষাঁড়' : 'মহিষা'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ওজন:</p>
                      <p className="font-medium">{selectedRecord.calfWeight} কেজি</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">প্রসবের ধরন:</p>
                      <p className="font-medium">{selectedRecord.calvingType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">বাচ্চার ID:</p>
                      <p className="font-medium text-purple-600">{selectedRecord.calfId}</p>
                    </div>
                  </div>
                  {selectedRecord.complications && (
                    <div>
                      <p className="text-sm text-gray-600">জটিলতা:</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecord.complications}</p>
                    </div>
                  )}
                </>
              )}
              
              {selectedRecord.notes && (
                <div>
                  <p className="text-sm text-gray-600">নোট:</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreedingRecords;
