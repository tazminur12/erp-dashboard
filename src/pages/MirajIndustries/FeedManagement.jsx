import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Scale,
  DollarSign,
  Truck,
  Store,
  BarChart3
} from 'lucide-react';

const FeedManagement = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [feedStock, setFeedStock] = useState([]);
  const [feedUsage, setFeedUsage] = useState([]);
  const [filteredUsage, setFilteredUsage] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [showAddUsageModal, setShowAddUsageModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);

  const [newFeed, setNewFeed] = useState({
    name: '',
    type: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: '',
    description: ''
  });

  const [newStock, setNewStock] = useState({
    feedTypeId: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplier: '',
    cost: '',
    notes: ''
  });

  const [newUsage, setNewUsage] = useState({
    feedTypeId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    cattleId: '',
    purpose: '',
    notes: ''
  });

  const feedTypeOptions = [
    'ঘাস (Grass)',
    'দানাদার খাদ্য (Grain Feed)',
    'সম্পূরক খাবার (Supplement)',
    'খড় (Straw)',
    'মিনারেল মিক্স (Mineral Mix)',
    'প্রোটিন মিক্স (Protein Mix)',
    'ভিটামিন সাপ্লিমেন্ট',
    'অন্যান্য'
  ];

  const unitOptions = ['kg', 'gm', 'liter', 'bag', 'ton'];

  const [stats, setStats] = useState({
    totalStockValue: 0,
    lowStockItems: 0,
    monthlyFeedCost: 0,
    averageDailyUsage: 0,
    totalFeedTypes: 0,
    stockAlert: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsage();
    calculateStats();
  }, [feedUsage, feedStock, searchTerm, filterDate]);

  const loadData = () => {
    // Mock feed types
    const mockFeedTypes = [
      { id: 'FEED001', name: 'প্রিমিয়াম গরুর খাদ্য', type: 'দানাদার খাদ্য', unit: 'kg', costPerUnit: 45, supplier: 'আগ্রো ফিড লিমিটেড', description: 'উচ্চমানের প্রোটিন সমৃদ্ধ খাদ্য' },
      { id: 'FEED002', name: 'সবুজ ঘাস', type: 'ঘাস', unit: 'kg', costPerUnit: 8, supplier: 'স্থানীয় সরবরাহকারী', description: 'তাজা সবুজ ঘাস' },
      { id: 'FEED003', name: 'খড়', type: 'খড়', unit: 'kg', costPerUnit: 5, supplier: 'স্থানীয় সরবরাহকারী', description: 'শুকনো খড়' },
      { id: 'FEED004', name: 'মিনারেল মিক্স', type: 'মিনারেল মিক্স', unit: 'kg', costPerUnit: 120, supplier: 'ভেটেরিনারি সাপ্লাই', description: 'প্রয়োজনীয় খনিজ পদার্থ' }
    ];
    setFeedTypes(mockFeedTypes);

    // Mock stock data
    const mockStock = [
      { id: 'STOCK001', feedTypeId: 'FEED001', feedName: 'প্রিমিয়াম গরুর খাদ্য', currentStock: 250, minStock: 100, purchaseDate: '2024-01-10', expiryDate: '2024-06-10', supplier: 'আগ্রো ফিড লিমিটেড', cost: 11250 },
      { id: 'STOCK002', feedTypeId: 'FEED002', feedName: 'সবুজ ঘাস', currentStock: 80, minStock: 150, purchaseDate: '2024-01-14', expiryDate: '2024-01-21', supplier: 'স্থানীয় সরবরাহকারী', cost: 640 },
      { id: 'STOCK003', feedTypeId: 'FEED003', feedName: 'খড়', currentStock: 200, minStock: 100, purchaseDate: '2024-01-12', expiryDate: '2024-12-12', supplier: 'স্থানীয় সরবরাহকারী', cost: 1000 },
      { id: 'STOCK004', feedTypeId: 'FEED004', feedName: 'মিনারেল মিক্স', currentStock: 15, minStock: 20, purchaseDate: '2024-01-08', expiryDate: '2024-07-08', supplier: 'ভেটেরিনারি সাপ্লাই', cost: 1800 }
    ];
    setFeedStock(mockStock);

    // Mock usage data
    const mockUsage = [
      { id: 'USAGE001', feedTypeId: 'FEED001', feedName: 'প্রিমিয়াম গরুর খাদ্য', date: '2024-01-15', quantity: 25, cattleId: 'COW001', purpose: 'দৈনিক খাদ্য', notes: 'সকালের খাদ্য' },
      { id: 'USAGE002', feedTypeId: 'FEED002', feedName: 'সবুজ ঘাস', date: '2024-01-15', quantity: 40, cattleId: 'ALL', purpose: 'দৈনিক খাদ্য', notes: 'সব গরুর জন্য' },
      { id: 'USAGE003', feedTypeId: 'FEED003', feedName: 'খড়', date: '2024-01-14', quantity: 30, cattleId: 'ALL', purpose: 'দৈনিক খাদ্য', notes: 'রাতের খাদ্য' },
      { id: 'USAGE004', feedTypeId: 'FEED004', feedName: 'মিনারেল মিক্স', date: '2024-01-13', quantity: 2, cattleId: 'COW002', purpose: 'সম্পূরক', notes: 'অসুস্থ গরুর জন্য' }
    ];
    setFeedUsage(mockUsage);
  };

  const filterUsage = () => {
    let filtered = feedUsage.filter(usage => 
      usage.feedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.cattleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterDate) {
      filtered = filtered.filter(usage => usage.date === filterDate);
    }

    setFilteredUsage(filtered);
  };

  const calculateStats = () => {
    const totalStockValue = feedStock.reduce((sum, stock) => {
      const feedType = feedTypes.find(feed => feed.id === stock.feedTypeId);
      return sum + (stock.currentStock * (feedType?.costPerUnit || 0));
    }, 0);

    const lowStockItems = feedStock.filter(stock => stock.currentStock <= stock.minStock).length;

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyFeedCost = feedUsage
      .filter(usage => usage.date.startsWith(thisMonth))
      .reduce((sum, usage) => {
        const feedType = feedTypes.find(feed => feed.id === usage.feedTypeId);
        return sum + (usage.quantity * (feedType?.costPerUnit || 0));
      }, 0);

    const averageDailyUsage = feedUsage.length > 0 
      ? feedUsage.reduce((sum, usage) => sum + usage.quantity, 0) / feedUsage.length 
      : 0;

    setStats({
      totalStockValue,
      lowStockItems,
      monthlyFeedCost,
      averageDailyUsage,
      totalFeedTypes: feedTypes.length,
      stockAlert: lowStockItems > 0
    });
  };

  const handleAddFeed = () => {
    const feed = {
      ...newFeed,
      id: `FEED${String(feedTypes.length + 1).padStart(3, '0')}`
    };
    setFeedTypes([...feedTypes, feed]);
    setShowAddFeedModal(false);
    resetFeedForm();
  };

  const handleAddStock = () => {
    const stock = {
      ...newStock,
      id: `STOCK${String(feedStock.length + 1).padStart(3, '0')}`,
      feedName: feedTypes.find(feed => feed.id === newStock.feedTypeId)?.name || '',
      currentStock: parseFloat(newStock.quantity),
      minStock: parseFloat(newStock.quantity) * 0.3 // 30% of purchase as minimum stock
    };
    setFeedStock([...feedStock, stock]);
    setShowAddStockModal(false);
    resetStockForm();
  };

  const handleAddUsage = () => {
    const usage = {
      ...newUsage,
      id: `USAGE${String(feedUsage.length + 1).padStart(3, '0')}`,
      feedName: feedTypes.find(feed => feed.id === newUsage.feedTypeId)?.name || ''
    };
    setFeedUsage([usage, ...feedUsage]);
    
    // Update stock
    const updatedStock = feedStock.map(stock => {
      if (stock.feedTypeId === newUsage.feedTypeId) {
        return { ...stock, currentStock: stock.currentStock - parseFloat(newUsage.quantity) };
      }
      return stock;
    });
    setFeedStock(updatedStock);
    
    setShowAddUsageModal(false);
    resetUsageForm();
  };

  const resetFeedForm = () => {
    setNewFeed({
      name: '',
      type: '',
      unit: 'kg',
      costPerUnit: '',
      supplier: '',
      description: ''
    });
  };

  const resetStockForm = () => {
    setNewStock({
      feedTypeId: '',
      quantity: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      supplier: '',
      cost: '',
      notes: ''
    });
  };

  const resetUsageForm = () => {
    setNewUsage({
      feedTypeId: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      cattleId: '',
      purpose: '',
      notes: ''
    });
  };

  const getStockStatus = (current, minimum) => {
    if (current <= minimum) {
      return { status: 'low', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    } else if (current <= minimum * 1.5) {
      return { status: 'medium', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">খাদ্য ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">খাদ্যের স্টক, ক্রয় ও ব্যবহারের রেকর্ড</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddFeedModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            খাদ্যের ধরন
          </button>
          <button 
            onClick={() => setShowAddStockModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Truck className="w-5 h-5" />
            স্টক যোগ
          </button>
          <button 
            onClick={() => setShowAddUsageModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Utensils className="w-5 h-5" />
            ব্যবহার
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট স্টক মূল্য</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.totalStockValue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Store className="w-4 h-4 mr-1" />
            <span>{stats.totalFeedTypes} ধরনের খাদ্য</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">নিম্ন স্টক</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>সতর্কতা প্রয়োজন</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক খাদ্য খরচ</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.monthlyFeedCost.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>এই মাসের খরচ</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">গড় দৈনিক ব্যবহার</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageDailyUsage.toFixed(1)} কেজি</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Scale className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span>গড় ব্যবহার</span>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">খাদ্য স্টক অবস্থা</h3>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2">
            <Download className="w-5 h-5" />
            রিপোর্ট
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  খাদ্যের নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বর্তমান স্টক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ন্যূনতম স্টক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রয় তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মেয়াদ শেষ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedStock.map((stock) => {
                const stockStatus = getStockStatus(stock.currentStock, stock.minStock);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.feedName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Scale className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{stock.currentStock} কেজি</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{stock.minStock} কেজি</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.status === 'low' ? 'নিম্ন' : 
                           stockStatus.status === 'medium' ? 'মধ্যম' : 'ভাল'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{new Date(stock.purchaseDate).toLocaleDateString('bn-BD')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{new Date(stock.expiryDate).toLocaleDateString('bn-BD')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">খাদ্য ব্যবহার রেকর্ড</h3>
          <div className="flex gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  খাদ্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গরু
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  উদ্দেশ্য
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়া
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsage.map((usage) => (
                <tr key={usage.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(usage.date).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usage.feedName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{usage.quantity} কেজি</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{usage.cattleId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{usage.purpose}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteRecord(usage.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Feed Type Modal */}
      {showAddFeedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">নতুন খাদ্যের ধরন যোগ করুন</h2>
              <button onClick={() => setShowAddFeedModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddFeed(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খাদ্যের নাম</label>
                <input
                  type="text"
                  required
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="খাদ্যের নাম লিখুন"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খাদ্যের ধরন</label>
                <select
                  required
                  value={newFeed.type}
                  onChange={(e) => setNewFeed({...newFeed, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ধরন নির্বাচন করুন</option>
                  {feedTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">একক</label>
                  <select
                    value={newFeed.unit}
                    onChange={(e) => setNewFeed({...newFeed, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">একক প্রতি খরচ (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newFeed.costPerUnit}
                    onChange={(e) => setNewFeed({...newFeed, costPerUnit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="খরচ"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সরবরাহকারী</label>
                <input
                  type="text"
                  value={newFeed.supplier}
                  onChange={(e) => setNewFeed({...newFeed, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="সরবরাহকারীর নাম"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                <textarea
                  value={newFeed.description}
                  onChange={(e) => setNewFeed({...newFeed, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="খাদ্যের বিবরণ"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddFeedModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">খাদ্য স্টক যোগ করুন</h2>
              <button onClick={() => setShowAddStockModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddStock(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খাদ্যের ধরন</label>
                <select
                  required
                  value={newStock.feedTypeId}
                  onChange={(e) => setNewStock({...newStock, feedTypeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">খাদ্য নির্বাচন করুন</option>
                  {feedTypes.map(feed => (
                    <option key={feed.id} value={feed.id}>{feed.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStock.cost}
                    onChange={(e) => setNewStock({...newStock, cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="মূল্য"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্রয় তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newStock.purchaseDate}
                    onChange={(e) => setNewStock({...newStock, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ শেষ</label>
                  <input
                    type="date"
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({...newStock, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সরবরাহকারী</label>
                <input
                  type="text"
                  value={newStock.supplier}
                  onChange={(e) => setNewStock({...newStock, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="সরবরাহকারীর নাম"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newStock.notes}
                  onChange={(e) => setNewStock({...newStock, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
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

      {/* Add Usage Modal */}
      {showAddUsageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">খাদ্য ব্যবহার রেকর্ড</h2>
              <button onClick={() => setShowAddUsageModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddUsage(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খাদ্যের ধরন</label>
                <select
                  required
                  value={newUsage.feedTypeId}
                  onChange={(e) => setNewUsage({...newUsage, feedTypeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">খাদ্য নির্বাচন করুন</option>
                  {feedTypes.map(feed => (
                    <option key={feed.id} value={feed.id}>{feed.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newUsage.date}
                    onChange={(e) => setNewUsage({...newUsage, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newUsage.quantity}
                    onChange={(e) => setNewUsage({...newUsage, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পরিমাণ"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">গরু</label>
                <input
                  type="text"
                  value={newUsage.cattleId}
                  onChange={(e) => setNewUsage({...newUsage, cattleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="গরুর ID বা 'ALL' সব গরুর জন্য"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">উদ্দেশ্য</label>
                <input
                  type="text"
                  value={newUsage.purpose}
                  onChange={(e) => setNewUsage({...newUsage, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="খাদ্য ব্যবহারের উদ্দেশ্য"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newUsage.notes}
                  onChange={(e) => setNewUsage({...newUsage, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUsageModal(false)}
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
    </div>
  );
};

export default FeedManagement;
