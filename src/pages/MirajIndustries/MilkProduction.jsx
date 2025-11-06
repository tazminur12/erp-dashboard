import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Milk,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Scale,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCattleQueries from '../../hooks/useCattleQueries.js';
import useMilkQueries from '../../hooks/useMilkQueries.js';

const MilkProduction = () => {
  const navigate = useNavigate();
  const [milkRecords, setMilkRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const { useCattle } = useCattleQueries();
  const { data: serverCattle = [], isLoading: cattleLoading, error: cattleError } = useCattle();
  const { useMilkRecords, useCreateMilkRecord, useDeleteMilkRecord } = useMilkQueries();
  const { data: serverMilk = [], isLoading: milkLoading, error: milkError } = useMilkRecords();
  const createMilkMutation = useCreateMilkRecord();
  const deleteMilkMutation = useDeleteMilkRecord();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [newRecord, setNewRecord] = useState({
    cattleId: '',
    date: new Date().toISOString().split('T')[0],
    morningQuantity: '',
    afternoonQuantity: '',
    eveningQuantity: '',
    totalQuantity: '',
    quality: 'good',
    notes: ''
  });

  const qualityOptions = [
    { value: 'excellent', label: 'উৎকৃষ্ট', color: 'text-green-600 bg-green-100' },
    { value: 'good', label: 'ভাল', color: 'text-blue-600 bg-blue-100' },
    { value: 'average', label: 'মধ্যম', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'poor', label: 'খারাপ', color: 'text-red-600 bg-red-100' }
  ];

  const [stats, setStats] = useState({
    todayProduction: 0,
    weeklyProduction: 0,
    monthlyProduction: 0,
    averagePerCow: 0,
    totalCows: 0,
    activeCows: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCattleList(serverCattle);
  }, [serverCattle]);

  useEffect(() => {
    setMilkRecords(serverMilk);
  }, [serverMilk]);

  useEffect(() => {
    filterRecords();
  }, [milkRecords, searchTerm, filterDate]);

  useEffect(() => {
    calculateStats();
  }, [milkRecords]);

  const loadData = () => {
    // Data loads via react-query hooks
  };

  const filterRecords = () => {
    let filtered = milkRecords.filter(record => 
      record.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cattleId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }

    setFilteredRecords(filtered);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayProduction = milkRecords
      .filter(record => record.date === today)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity), 0);

    const weeklyProduction = milkRecords
      .filter(record => record.date >= weekAgo)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity), 0);

    const monthlyProduction = milkRecords
      .filter(record => record.date >= monthAgo)
      .reduce((sum, record) => sum + parseFloat(record.totalQuantity), 0);

    const activeCows = new Set(milkRecords.filter(record => record.date === today).map(record => record.cattleId)).size;
    const averagePerCow = activeCows > 0 ? todayProduction / activeCows : 0;

    setStats({
      todayProduction,
      weeklyProduction,
      monthlyProduction,
      averagePerCow,
      totalCows: cattleList.length,
      activeCows
    });
  };

  const handleAddRecord = async () => {
    const payload = {
      cattleId: newRecord.cattleId,
      date: newRecord.date,
      morningQuantity: Number(newRecord.morningQuantity || 0),
      afternoonQuantity: Number(newRecord.afternoonQuantity || 0),
      eveningQuantity: Number(newRecord.eveningQuantity || 0),
      quality: newRecord.quality,
      notes: newRecord.notes || ''
    };
    try {
      await createMilkMutation.mutateAsync(payload);
      setShowAddModal(false);
      resetForm();
    } catch (e) {
      alert('সংরক্ষণ ব্যর্থ: ' + (e?.message || ''));
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!id) return;
    if (window.confirm('আপনি কি এই রেকর্ডটি মুছে ফেলতে চান?')) {
      try {
        await deleteMilkMutation.mutateAsync(id);
      } catch (e) {
        alert('মুছতে ব্যর্থ: ' + (e?.message || ''));
      }
    }
  };

  const resetForm = () => {
    setNewRecord({
      cattleId: '',
      date: new Date().toISOString().split('T')[0],
      morningQuantity: '',
      afternoonQuantity: '',
      eveningQuantity: '',
      totalQuantity: '',
      quality: 'good',
      notes: ''
    });
  };

  const getQualityClass = (quality) => {
    const qualityObj = qualityOptions.find(opt => opt.value === quality);
    return qualityObj ? qualityObj.color : 'text-gray-600 bg-gray-100';
  };

  const generateReport = () => {
    // Generate report logic
    alert('রিপোর্ট তৈরি করা হচ্ছে...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">দুধ উৎপাদন রেকর্ড</h1>
          <p className="text-gray-600 mt-2">দৈনিক দুধ উৎপাদনের তথ্য ও বিশ্লেষণ</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          নতুন রেকর্ড যোগ করুন
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">আজকের উৎপাদন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayProduction.toFixed(1)} লিটার</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Milk className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{stats.activeCows} গরু সক্রিয়</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">সাপ্তাহিক উৎপাদন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weeklyProduction.toFixed(1)} লিটার</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>গত ৭ দিন</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক উৎপাদন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyProduction.toFixed(1)} লিটার</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>গত ৩০ দিন</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">গড় উৎপাদন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePerCow.toFixed(1)} লিটার</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Scale className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <span>প্রতি গরু (আজ)</span>
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
                placeholder="গরুর নাম বা ID দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={generateReport}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Milk Production Records */}
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
                  সকাল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  দুপুর
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সন্ধ্যা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মোট
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মান
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
                      <span className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.cattleName}</div>
                    <div className="text-sm text-gray-500">{record.cattleId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Milk className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{record.morningQuantity} লি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Milk className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{record.afternoonQuantity} লি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Milk className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{record.eveningQuantity} লি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{record.totalQuantity} লি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityClass(record.quality)}`}>
                      {qualityOptions.find(opt => opt.value === record.quality)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
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

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">দুধ উৎপাদন রেকর্ড যোগ করুন</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddRecord(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">গরু নির্বাচন করুন</label>
                  <select
                    required
                    value={newRecord.cattleId}
                    onChange={(e) => setNewRecord({...newRecord, cattleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>{cattleLoading ? 'লোড হচ্ছে...' : 'গরু নির্বাচন করুন'}</option>
                    {!cattleLoading && cattleList.map(cattle => (
                      <option key={cattle.id} value={cattle.id}>{cattle.name} {cattle.tagNumber ? `(${cattle.tagNumber})` : ''}</option>
                    ))}
                  </select>
                  {cattleError && (
                    <p className="text-xs text-red-600 mt-1">গরুর তালিকা লোড করতে সমস্যা হয়েছে</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">সকালের দুধ (লিটার)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.morningQuantity}
                    onChange={(e) => setNewRecord({...newRecord, morningQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="সকালের দুধের পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">দুপুরের দুধ (লিটার)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.afternoonQuantity}
                    onChange={(e) => setNewRecord({...newRecord, afternoonQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="দুপুরের দুধের পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">সন্ধ্যার দুধ (লিটার)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.eveningQuantity}
                    onChange={(e) => setNewRecord({...newRecord, eveningQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="সন্ধ্যার দুধের পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">দুধের মান</label>
                  <select
                    value={newRecord.quality}
                    onChange={(e) => setNewRecord({...newRecord, quality: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {qualityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
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

      {/* View Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">দুধ উৎপাদন বিস্তারিত</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">গরু:</p>
                  <p className="font-medium">{selectedRecord.cattleName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">তারিখ:</p>
                  <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString('en-US')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">সকাল</p>
                  <p className="text-lg font-bold text-blue-600">{selectedRecord.morningQuantity} লি</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">দুপুর</p>
                  <p className="text-lg font-bold text-green-600">{selectedRecord.afternoonQuantity} লি</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">সন্ধ্যা</p>
                  <p className="text-lg font-bold text-purple-600">{selectedRecord.eveningQuantity} লি</p>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">মোট উৎপাদন</p>
                <p className="text-2xl font-bold text-gray-900">{selectedRecord.totalQuantity} লিটার</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">দুধের মান:</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getQualityClass(selectedRecord.quality)}`}>
                  {qualityOptions.find(opt => opt.value === selectedRecord.quality)?.label}
                </span>
              </div>
              
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

export default MilkProduction;
