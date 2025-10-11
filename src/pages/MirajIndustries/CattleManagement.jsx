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
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CattleManagement = () => {
  const navigate = useNavigate();
  const [cattleList, setCattleList] = useState([]);
  const [filteredCattle, setFilteredCattle] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCattle, setNewCattle] = useState({
    id: '',
    name: '',
    breed: '',
    age: '',
    weight: '',
    purchaseDate: '',
    healthStatus: 'healthy',
    image: null,
    gender: 'female',
    color: '',
    tagNumber: '',
    purchasePrice: '',
    vendor: '',
    notes: ''
  });

  const healthStatusOptions = [
    { value: 'healthy', label: 'সুস্থ', color: 'text-green-600 bg-green-100' },
    { value: 'sick', label: 'অসুস্থ', color: 'text-red-600 bg-red-100' },
    { value: 'under_treatment', label: 'চিকিৎসাধীন', color: 'text-yellow-600 bg-yellow-100' }
  ];

  const breedOptions = [
    'হলস্টেইন ফ্রিজিয়ান',
    'জার্সি',
    'সাহিওয়াল',
    'রেড সিন্ধি',
    'গির',
    'থারপারকার',
    'ক্রস ব্রিড',
    'স্থানীয় জাত',
    'অন্যান্য'
  ];

  useEffect(() => {
    loadCattleData();
  }, []);

  useEffect(() => {
    filterCattle();
  }, [cattleList, searchTerm, filterStatus]);

  const loadCattleData = () => {
    // Mock data - replace with actual API calls
    const mockData = [
      {
        id: 'COW001',
        name: 'রাণী',
        breed: 'হলস্টেইন ফ্রিজিয়ান',
        age: 4,
        weight: 450,
        purchaseDate: '2023-01-15',
        healthStatus: 'healthy',
        image: null,
        gender: 'female',
        color: 'কালো-সাদা',
        tagNumber: 'TAG001',
        purchasePrice: 85000,
        vendor: 'আবুল খালেদ',
        notes: 'উৎকৃষ্ট দুধ উৎপাদনকারী'
      },
      {
        id: 'COW002',
        name: 'মালতি',
        breed: 'সাহিওয়াল',
        age: 3,
        weight: 380,
        purchaseDate: '2023-03-20',
        healthStatus: 'sick',
        image: null,
        gender: 'female',
        color: 'লাল',
        tagNumber: 'TAG002',
        purchasePrice: 65000,
        vendor: 'করিম উদ্দিন',
        notes: 'হালকা অসুস্থ, চিকিৎসাধীন'
      },
      {
        id: 'COW003',
        name: 'সোনালী',
        breed: 'জার্সি',
        age: 5,
        weight: 420,
        purchaseDate: '2022-11-10',
        healthStatus: 'under_treatment',
        image: null,
        gender: 'female',
        color: 'বাদামী',
        tagNumber: 'TAG003',
        purchasePrice: 72000,
        vendor: 'রহিম উদ্দিন',
        notes: 'প্রজননের জন্য প্রস্তুত'
      }
    ];
    setCattleList(mockData);
  };

  const filterCattle = () => {
    let filtered = cattleList.filter(cattle => 
      cattle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cattle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cattle.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cattle.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(cattle => cattle.healthStatus === filterStatus);
    }

    setFilteredCattle(filtered);
  };

  const handleAddCattle = () => {
    const cattle = {
      ...newCattle,
      id: `COW${String(cattleList.length + 1).padStart(3, '0')}`,
      tagNumber: `TAG${String(cattleList.length + 1).padStart(3, '0')}`
    };
    
    setCattleList([...cattleList, cattle]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCattle = () => {
    const updatedList = cattleList.map(cattle => 
      cattle.id === selectedCattle.id ? selectedCattle : cattle
    );
    setCattleList(updatedList);
    setShowEditModal(false);
    setSelectedCattle(null);
  };

  const handleDeleteCattle = (id) => {
    if (window.confirm('আপনি কি এই গরুটি মুছে ফেলতে চান?')) {
      setCattleList(cattleList.filter(cattle => cattle.id !== id));
    }
  };

  const resetForm = () => {
    setNewCattle({
      id: '',
      name: '',
      breed: '',
      age: '',
      weight: '',
      purchaseDate: '',
      healthStatus: 'healthy',
      image: null,
      gender: 'female',
      color: '',
      tagNumber: '',
      purchasePrice: '',
      vendor: '',
      notes: ''
    });
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'sick':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'under_treatment':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Heart className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHealthStatusClass = (status) => {
    const statusObj = healthStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">গবাদি পশু ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">গরুর তথ্য সংরক্ষণ ও ব্যবস্থাপনা</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          নতুন গরু যোগ করুন
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
                placeholder="গরুর নাম, ID, জাত বা ট্যাগ নম্বর দিয়ে খুঁজুন..."
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
              <option value="healthy">সুস্থ</option>
              <option value="sick">অসুস্থ</option>
              <option value="under_treatment">চিকিৎসাধীন</option>
            </select>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Cattle List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গরুর তথ্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  জাত ও বয়স
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ওজন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রয় তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্বাস্থ্য অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়া
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCattle.map((cattle) => (
                <tr key={cattle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {cattle.image ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={cattle.image} alt={cattle.name} />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cattle.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {cattle.tagNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cattle.breed}</div>
                    <div className="text-sm text-gray-500">{cattle.age} বছর</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{cattle.weight} কেজি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(cattle.purchaseDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(cattle.healthStatus)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusClass(cattle.healthStatus)}`}>
                        {healthStatusOptions.find(opt => opt.value === cattle.healthStatus)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCattle(cattle);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCattle(cattle);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCattle(cattle.id)}
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

      {/* Add Cattle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">নতুন গরু যোগ করুন</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddCattle(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">গরুর নাম</label>
                  <input
                    type="text"
                    required
                    value={newCattle.name}
                    onChange={(e) => setNewCattle({...newCattle, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="গরুর নাম লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">জাত</label>
                  <select
                    required
                    value={newCattle.breed}
                    onChange={(e) => setNewCattle({...newCattle, breed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">জাত নির্বাচন করুন</option>
                    {breedOptions.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বয়স (বছর)</label>
                  <input
                    type="number"
                    required
                    value={newCattle.age}
                    onChange={(e) => setNewCattle({...newCattle, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বয়স লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ওজন (কেজি)</label>
                  <input
                    type="number"
                    required
                    value={newCattle.weight}
                    onChange={(e) => setNewCattle({...newCattle, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ওজন লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্রয় তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newCattle.purchaseDate}
                    onChange={(e) => setNewCattle({...newCattle, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">স্বাস্থ্য অবস্থা</label>
                  <select
                    value={newCattle.healthStatus}
                    onChange={(e) => setNewCattle({...newCattle, healthStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {healthStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্গ</label>
                  <select
                    value={newCattle.gender}
                    onChange={(e) => setNewCattle({...newCattle, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">মহিষা</option>
                    <option value="male">ষাঁড়</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">রং</label>
                  <input
                    type="text"
                    value={newCattle.color}
                    onChange={(e) => setNewCattle({...newCattle, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="গরুর রং"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    value={newCattle.purchasePrice}
                    onChange={(e) => setNewCattle({...newCattle, purchasePrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ক্রয় মূল্য"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিক্রেতা</label>
                  <input
                    type="text"
                    value={newCattle.vendor}
                    onChange={(e) => setNewCattle({...newCattle, vendor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বিক্রেতার নাম"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ছবি আপলোড</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCattle({...newCattle, image: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newCattle.notes}
                  onChange={(e) => setNewCattle({...newCattle, notes: e.target.value})}
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

      {/* View Cattle Modal */}
      {showViewModal && selectedCattle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">গরুর বিস্তারিত তথ্য</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {selectedCattle.image ? (
                    <img className="h-24 w-24 rounded-full object-cover" src={selectedCattle.image} alt={selectedCattle.name} />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCattle.name}</h3>
                  <p className="text-gray-600">ID: {selectedCattle.id} | ট্যাগ: {selectedCattle.tagNumber}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getHealthStatusIcon(selectedCattle.healthStatus)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusClass(selectedCattle.healthStatus)}`}>
                      {healthStatusOptions.find(opt => opt.value === selectedCattle.healthStatus)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">মৌলিক তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">জাত:</span>
                      <span className="font-medium">{selectedCattle.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">বয়স:</span>
                      <span className="font-medium">{selectedCattle.age} বছর</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ওজন:</span>
                      <span className="font-medium">{selectedCattle.weight} কেজি</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">লিঙ্গ:</span>
                      <span className="font-medium">{selectedCattle.gender === 'female' ? 'মহিষা' : 'ষাঁড়'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">রং:</span>
                      <span className="font-medium">{selectedCattle.color}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">ক্রয় তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ক্রয় তারিখ:</span>
                      <span className="font-medium">{new Date(selectedCattle.purchaseDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ক্রয় মূল্য:</span>
                      <span className="font-medium">৳{selectedCattle.purchasePrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">বিক্রেতা:</span>
                      <span className="font-medium">{selectedCattle.vendor}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedCattle.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">নোট</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedCattle.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CattleManagement;
