import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import FilterBar from '../../../components/common/FilterBar';
import Modal from '../../../components/common/Modal';
import ExcelUploader from '../../../components/common/ExcelUploader';
import { useHajiList, useDeleteHaji, useBulkCreateHaji } from '../../../hooks/UseHajiQueries';
import { usePackages } from '../../../hooks/usePackageQueries';
import Swal from 'sweetalert2';

const HajiList = () => {
  const navigate = useNavigate();
  const [filteredHajis, setFilteredHajis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHaji, setSelectedHaji] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    package: 'all',
    dateRange: 'all'
  });
  // Add local state for loading indicator for delete per row
  const [deletingHajiId, setDeletingHajiId] = useState(null);

  // Fetch Haji data with proper error handling - request all data (limit 20000 to get all hajis)
  // Backend now supports up to 20000 records
  const { data: hajiData, isLoading, error } = useHajiList({ 
    limit: 20000,  // Backend max limit is 20000, so request all data
    page: 1 
  });
  const hajis = useMemo(() => hajiData?.data || [], [hajiData?.data]);
  
  // Get total count from API response pagination (if available) or use hajis.length
  // Backend returns pagination.total which has the total count
  const totalHajis = hajiData?.pagination?.total || hajis.length;

  // Load packages for package name lookup
  const { data: packagesResp } = usePackages({ status: 'Active', limit: 200, page: 1 });
  const packageList = packagesResp?.data || packagesResp?.packages || [];
  
  // Debug: Log counts to verify
  useEffect(() => {
    console.log('API Response:', hajiData);
    console.log('Total Hajis (from API pagination):', hajiData?.pagination?.total);
    console.log('Hajis array length:', hajis.length);
    console.log('Filtered Hajis:', filteredHajis.length);
  }, [hajiData, hajis.length, filteredHajis.length]);
  
  // Delete Haji mutation
  const deleteHajiMutation = useDeleteHaji();
  
  // Bulk Create Haji mutation
  const bulkCreateHajiMutation = useBulkCreateHaji();

  // Filter and search functionality
  useEffect(() => {
    let filtered = hajis;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(haji =>
        (haji.name && haji.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.passportNumber && haji.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.mobile && haji.mobile.includes(searchTerm)) ||
        (haji.email && haji.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji._id && haji._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.nidNumber && haji.nidNumber.includes(searchTerm)) ||
        (haji.manualSerialNumber && haji.manualSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter (prefer serviceStatus from backend)
    if (filters.status !== 'all') {
      filtered = filtered.filter(haji => {
        const statusValue = haji.serviceStatus || haji.status;
        return statusValue === filters.status;
      });
    }

    // Package filter
    if (filters.package !== 'all') {
      filtered = filtered.filter(haji => 
        haji.customerType && haji.customerType.toLowerCase().includes(filters.package.toLowerCase())
      );
    }

    setFilteredHajis(filtered);
    // Remove selections that are no longer in the filtered list
    const filteredIds = new Set(filtered.map(h => h._id));
    setSelectedIds(prev => prev.filter(id => filteredIds.has(id)));
  }, [hajis, searchTerm, filters]);

  const handleViewDetails = (haji) => {
    // Get the primary ID for navigation
    const hajiId = haji._id || haji.id || haji.customerId;
    
    if (!hajiId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'হাজির ID পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    // Navigate to details page using the found ID
    navigate(`/hajj-umrah/haji/${hajiId}`);
  };

  const handleEdit = (haji) => {
    // Get the primary ID for navigation
    const hajiId = haji._id || haji.id || haji.customerId;
    
    if (!hajiId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'হাজির ID পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    // Navigate to edit page with haji data
    navigate(`/hajj-umrah/haji/${hajiId}/edit`);
  };

  const handleDelete = (haji) => {
    const hajiId = haji._id;
    // Debug output to help identify ID issue
    console.log('Deleting Haji object:', haji);
    console.log('Using _id for delete:', hajiId);
    if (!hajiId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'হাজির _id (MongoDB ID) পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `আপনি কি ${haji.name || 'এই হাজি'} কে মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingHajiId(hajiId);
        deleteHajiMutation.mutate(hajiId, {
          onSettled: () => {
            setDeletingHajiId(null);
            setSelectedIds(prev => prev.filter(id => id !== hajiId));
          }
        });
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (selectableHajis.length === 0) return;
    const allIds = selectableHajis.map(h => h._id);
    const currentlyAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(currentlyAllSelected ? [] : allIds);
  };

  const handleToggleSelect = (haji) => {
    if (!haji?._id) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'হাজির _id পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    setSelectedIds(prev => 
      prev.includes(haji._id) ? prev.filter(id => id !== haji._id) : [...prev, haji._id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      Swal.fire({
        title: 'নির্বাচন করুন',
        text: 'কমপক্ষে একটি হাজি নির্বাচন করুন।',
        icon: 'info',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    const count = selectedIds.length;
    const name = count === 1 ? 'এই হাজি' : `${count} টি হাজি`;
    const confirmText = count === 1 ? 'হ্যাঁ, মুছে ফেলুন' : 'হ্যাঁ, সবগুলো মুছুন';

    const result = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `আপনি কি ${name} মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      setBulkDeleting(true);
      const results = await Promise.allSettled(
        selectedIds.map(id => deleteHajiMutation.mutateAsync(id))
      );
      const rejected = results.filter(r => r.status === 'rejected');
      if (rejected.length) {
        Swal.fire({
          title: 'কিছু মুছতে সমস্যা হয়েছে',
          text: `${rejected.length} টি মুছতে ব্যর্থ হয়েছে। বাকি গুলো মুছে ফেলা হয়েছে (যদি সফল হয়ে থাকে)।`,
          icon: 'warning',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } else {
        Swal.fire({
          title: 'সম্পন্ন!',
          text: `${count} টি হাজি মুছে ফেলা হয়েছে।`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
      }
    } finally {
      setBulkDeleting(false);
      setSelectedIds([]);
    }
  };

  const handleExcelUpload = () => {
    setShowExcelUploader(true);
  };

  const handleExcelDataProcessed = (processedData) => {
    // Validate that we have data to process
    if (!Array.isArray(processedData) || processedData.length === 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'Excel ফাইলে কোনো ডাটা পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    // Close the Excel uploader modal
    setShowExcelUploader(false);

    // Use bulk create mutation to process the data
    bulkCreateHajiMutation.mutate(processedData);
  };

  const getStatusBadge = (status, serviceStatus) => {
    const displayStatus = serviceStatus || status;
    if (!displayStatus) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          N/A
        </span>
      );
    }

    const normalized = displayStatus.toLowerCase ? displayStatus.toLowerCase() : String(displayStatus);
    
    // Define specific colors for each status
    let badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    
    // Check for specific Hajj statuses
    if (normalized.includes('পাসপোর্ট রেডি নয়') || normalized.includes('passport not ready')) {
      badgeClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else if (normalized.includes('পাসপোর্ট রেডি') || normalized.includes('passport ready')) {
      badgeClasses = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    } else if (normalized.includes('প্যাকেজ যুক্ত') || normalized.includes('package added')) {
      badgeClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    } else if (normalized.includes('রেডি ফর হজ্ব') || normalized.includes('ready for hajj')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('হজ্ব সম্পন্ন') || normalized.includes('hajj completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('আর্কাইভ') || normalized.includes('archive')) {
      badgeClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    } else if (normalized.includes('অন্যান্য') || normalized.includes('other')) {
      badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    } else if (normalized === 'pending' || normalized.includes('pending')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (normalized === 'active' || normalized.includes('active')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized === 'inactive' || normalized.includes('inactive')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('রেডি') || normalized.includes('ready')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('নিবন্ধিত') || normalized.includes('registered')) {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    } else if (normalized.includes('আনপেইড') || normalized.includes('unpaid')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
        {displayStatus}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  // Helper function to get package name from multiple possible locations
  const getPackageName = (haji) => {
    if (!haji) return 'N/A';
    
    // Check populated package object first
    if (haji.package?.packageName) {
      return haji.package.packageName;
    }
    
    // Check packageInfo object
    if (haji.packageInfo?.packageName) {
      return haji.packageInfo.packageName;
    }
    
    // Check flat packageName field
    if (haji.packageName) {
      return haji.packageName;
    }
    
    // If we have a packageId, look it up from packageList
    const packageId = haji.packageId || haji.packageInfo?.packageId || haji.package?._id || haji.package?.id;
    if (packageId && packageList.length > 0) {
      const foundPackage = packageList.find(
        pkg => pkg._id === packageId || pkg.id === packageId || String(pkg._id) === String(packageId) || String(pkg.id) === String(packageId)
      );
      if (foundPackage?.packageName) {
        return foundPackage.packageName;
      }
      // Also check for 'name' field as fallback
      if (foundPackage?.name) {
        return foundPackage.name;
      }
    }
    
    return 'N/A';
  };

  const selectableHajis = useMemo(
    () => filteredHajis.filter(h => h._id),
    [filteredHajis]
  );
  const allSelected = selectableHajis.length > 0 && selectableHajis.every(h => selectedIds.includes(h._id));
  const partiallySelected = selectableHajis.some(h => selectedIds.includes(h._id)) && !allSelected;

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onChange={handleToggleSelectAll}
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = partiallySelected;
          }}
          aria-label="Select all"
        />
      ),
      render: (value, haji) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={selectedIds.includes(haji._id)}
          onChange={() => handleToggleSelect(haji)}
          disabled={!haji._id}
          aria-label="Select row"
        />
      )
    },
    {
      key: '_id',
      header: 'হাজী আইডি',
      sortable: true,
        render: (value, haji) => (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {haji.customerId || haji._id || haji.id}
          </span>
        )
    },
    {
      key: 'manualSerialNumber',
      header: 'ম্যানুয়াল সিরিয়াল',
      sortable: true,
      render: (value, haji) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {haji.manualSerialNumber || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'নাম',
      sortable: true,
      render: (value, haji) => {
        const photoUrl = haji.photo || haji.photoUrl || haji.image;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={haji.name || 'Haji'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${photoUrl ? 'hidden' : 'flex'}`}>
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {haji.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{haji.passportNumber || 'N/A'}</div>
          </div>
        </div>
        );
      }
    },
    {
      key: 'contact',
      header: 'যোগাযোগ',
      render: (value, haji) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{haji.mobile || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{haji.email || 'N/A'}</span>
          </div>
          {haji.whatsappNo && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>{haji.whatsappNo}</span>
            </div>
          )}
        </div>
      )
    },
  
    {
      key: 'package',
      header: 'প্যাকেজ',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{getPackageName(haji)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'স্ট্যাটাস',
      sortable: true,
      render: (value, haji) => getStatusBadge(haji.status, haji.serviceStatus)
    },
    {
      key: 'payment',
      header: 'পেমেন্ট',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          {getPaymentBadge(haji.paymentStatus || 'pending')}
          <div className="text-gray-500 dark:text-gray-400 mt-1">
            ৳{(haji.paidAmount || 0).toLocaleString()} / ৳{(haji.totalAmount || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'অ্যাকশন',
      render: (value, haji) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(haji)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(haji)}
            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(haji)}
            className={`p-2 rounded-lg ${
              deletingHajiId === haji._id
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
            }`}
            title={deletingHajiId === haji._id ? 'Deleting...' : 'Delete'}
            disabled={deletingHajiId === haji._id}
          >
            {deletingHajiId === haji._id ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )
    }
  ];

  const filterOptions = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'all', label: 'সব স্ট্যাটাস' },
        { value: 'আনপেইড', label: 'আনপেইড' },
        { value: 'প্রাক-নিবন্ধিত', label: 'প্রাক-নিবন্ধিত' },
        { value: 'নিবন্ধিত', label: 'নিবন্ধিত' },
        { value: 'হজ্ব সম্পন্ন', label: 'হজ্ব সম্পন্ন' },
        { value: 'আর্কাইভ', label: 'আর্কাইভ' },
        { value: 'রেডি রিপ্লেস', label: 'রেডি রিপ্লেস' },
        { value: 'রিফান্ডেড', label: 'রিফান্ডেড' },
        { value: 'অন্যান্য', label: 'অন্যান্য' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      label: 'Package',
      key: 'package',
      options: [
        { value: 'all', label: 'All Packages' },
        { value: 'haj', label: 'Haj' }
      ]
    }
  ];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading Haji data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'Failed to load Haji data. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Haji List</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all registered Haji</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || bulkDeleting}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
              selectedIds.length === 0 || bulkDeleting
                ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                : 'text-red-600 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            {bulkDeleting ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{bulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleExcelUpload}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <Link
            to="/hajj-umrah/haji/add"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Haji</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Haji</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHajis}</p>
            </div>
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hajis.filter(h => h.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {hajis.filter(h => h.status === 'inactive').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ৳{hajis.reduce((sum, h) => sum + (h.paidAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, passport, mobile, email, Haji ID, NID, or Manual Serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <FilterBar
            filters={filterOptions}
            onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredHajis}
        columns={columns}
        searchable={false}
        exportable={false}
        actions={false}
        pagination={true}
        pageSize={50}
      />

      {/* Haji Details Modal */}
      {showModal && selectedHaji && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Haji Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Haji ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.customerId || selectedHaji._id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Manual Serial Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.manualSerialNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Mobile</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.mobile || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.whatsappNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">NID Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.nidNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Division</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.division || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">District</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.district || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Upazila</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.upazila || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Post Code</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.postCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Passport Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Passport Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Passport Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.passportNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Issue Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.issueDate ? new Date(selectedHaji.issueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.expiryDate ? new Date(selectedHaji.expiryDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.dateOfBirth ? new Date(selectedHaji.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Package Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Package</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.packageName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reference By</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.referenceBy || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reference Customer ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.referenceCustomerId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedHaji.status || 'active')}</div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Total Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{(selectedHaji.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{(selectedHaji.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Due Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{((selectedHaji.totalAmount || 0) - (selectedHaji.paidAmount || 0)).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Created At</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.createdAt ? new Date(selectedHaji.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Updated At</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.updatedAt ? new Date(selectedHaji.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Haji Data from Excel"
          acceptedFields={[
            'name', 'mobile no', 'fathers name', 'mother\'s name', 'manual serial number', 'districts', 'upazila', 'area', 'pid no', 'ng serial no', 'tracking no'
          ]}
          requiredFields={['name', 'mobile no']}
          sampleData={[
            [
              'Name', 'Mobile no', 'Fathers name', 'Mother\'s Name', 'Manual Serial Number', 'Districts', 'Upazila', 'Area', 'PID No', 'NG Serial No', 'Tracking No'
            ],
            [
              'Md. Abdul Rahman', '+8801712345678', 'Md. Karim Uddin', 'Fatima Begum', 'MSN-001',
              'Dhaka', 'Dhamrai', 'Area 1', 'PID-001', 'NG-001', 'TRK-001'
            ],
            [
              'Fatima Begum', '+8801712345679', 'Abdul Mannan', 'Ayesha Khatun', 'MSN-002',
              'Chittagong', 'Kotwali', 'Area 2', 'PID-002', 'NG-002', 'TRK-002'
            ],
            [
              'Md. Karim Uddin', '+8801712345680', 'Md. Rahim Uddin', 'Nasima Begum', 'MSN-003',
              'Sylhet', 'Sylhet Sadar', 'Area 3', 'PID-003', 'NG-003', 'TRK-003'
            ]
          ]}
        />
      )}
    </div>
  );
};

export default HajiList;
