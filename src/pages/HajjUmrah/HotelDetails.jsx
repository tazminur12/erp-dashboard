import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Plus
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import useLicenseQueries from '../../hooks/useLicenseQueries';
import useHotelQueries from '../../hooks/useHotelQueries';
import Swal from 'sweetalert2';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hotel queries
  const { 
    useGetHotel, 
    useCreateHotelContract,
    useHotelContractsByHotelId
  } = useHotelQueries();
  
  // License queries for Nusuk Agency dropdown
  const { useLicenses } = useLicenseQueries();
  const { data: licensesData } = useLicenses();
  const licenses = useMemo(() => (Array.isArray(licensesData) ? licensesData : licensesData?.data || []), [licensesData]);

  // Fetch hotel data
  const { data: hotelResponse, isLoading, error } = useGetHotel(id);
  const hotel = hotelResponse?.data || null;

  // Fetch contracts for this hotel
  const { data: contractsResponse, isLoading: contractsLoading, refetch: refetchContracts } = useHotelContractsByHotelId(id);
  const contracts = useMemo(() => {
    if (!contractsResponse?.data) return [];
    return Array.isArray(contractsResponse.data) ? contractsResponse.data : [];
  }, [contractsResponse]);

  // Mutations
  const createContract = useCreateHotelContract();

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Contract form data
  const [contractFormData, setContractFormData] = useState({
    contractType: 'হজ্ব',
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


  const resetContractForm = () => {
    setContractFormData({
      contractType: 'হজ্ব',
      nusukAgencyId: '',
      requestNumber: '',
      hotelName: hotel?.hotelName || '',
      contractNumber: '',
      contractStart: '',
      contractEnd: '',
      hajjiCount: '',
      nusukPayment: '',
      cashPayment: '',
      otherBills: ''
    });
  };

  useEffect(() => {
    if (hotel?.hotelName) {
      setContractFormData(prev => ({
        ...prev,
        hotelName: hotel.hotelName
      }));
    }
  }, [hotel?.hotelName]);

  const handleGoBack = () => {
    navigate('/hajj-umrah/hotel-management');
  };

  const handleEdit = () => {
    navigate(`/hajj-umrah/hotel-management/${id}/edit`);
  };

  const handleCreateContract = () => {
    resetContractForm();
    setIsContractModalOpen(true);
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        hotelId: id,
        contractType: contractFormData.contractType,
        nusukAgencyId: contractFormData.nusukAgencyId,
        requestNumber: contractFormData.requestNumber,
        hotelName: contractFormData.hotelName,
        contractNumber: contractFormData.contractNumber,
        contractStart: contractFormData.contractStart,
        contractEnd: contractFormData.contractEnd,
        hajjiCount: contractFormData.hajjiCount,
        nusukPayment: contractFormData.nusukPayment || 0,
        cashPayment: contractFormData.cashPayment || 0,
        otherBills: contractFormData.otherBills || 0
      };

      await createContract.mutateAsync(payload);
      
      // Refetch contracts to show the new one immediately
      await refetchContracts();
      
      Swal.fire({
        title: 'সফল!',
        text: 'হোটেল চুক্তি সফলভাবে সংরক্ষণ হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
      
      setIsContractModalOpen(false);
      resetContractForm();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল চুক্তি সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">হোটেল ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">হোটেল পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-4">আপনি যে হোটেল খুঁজছেন তা বিদ্যমান নেই।</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            হোটেল তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>{hotel.hotelName} - হোটেল বিবরণ</title>
        <meta name="description" content={`${hotel.hotelName} এর বিস্তারিত তথ্য`} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {hotel.hotelName}
              </h1>
              <p className="text-gray-600 mt-2">{hotel.area} • {hotel.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateContract}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                হোটেল চুক্তি তৈরি করুন
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Edit className="w-5 h-5" />
                সম্পাদনা করুন
              </button>
            </div>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            হোটেল তথ্য
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">এলাকা</label>
                <p className="text-gray-900">{hotel.area || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">হোটেলের নাম</label>
                <p className="text-gray-900">{hotel.hotelName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">তাসরিহ নং</label>
                <p className="text-gray-900">{hotel.tasrihNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">তাসনিফ নং</label>
                <p className="text-gray-900">{hotel.tasnifNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ঠিকানা</label>
                <p className="text-gray-900">{hotel.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">হারাম এলাকা থেকে দুরত্ব</label>
                <p className="text-gray-900">{hotel.distanceFromHaram ? `${hotel.distanceFromHaram} মি` : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ইমেইল</p>
                  <p className="text-gray-900">{hotel.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">মোবাইল নং</p>
                  <p className="text-gray-900">{hotel.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Contracts Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              হোটেল চুক্তি
            </h3>
            <button
              onClick={handleCreateContract}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              নতুন চুক্তি
            </button>
          </div>
          
          {/* Contracts List */}
          {contractsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">চুক্তি লোড হচ্ছে...</p>
            </div>
          ) : contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract._id || contract.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {contract.contractNumber} - {contract.contractType}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contract.hotelName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      contract.contractType === 'হজ্ব' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : contract.contractType === 'উমরাহ'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {contract.contractType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">চুক্তি শুরু</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contract.contractStart ? new Date(contract.contractStart).toLocaleDateString('bn-BD') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">চুক্তি শেষ</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contract.contractEnd ? new Date(contract.contractEnd).toLocaleDateString('bn-BD') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">হাজ্বী সংখ্যা</p>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.hajjiCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">মোট বিল</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ৳{contract.totalBill?.toLocaleString('bn-BD') || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>কোন চুক্তি পাওয়া যায়নি</p>
              <p className="text-sm mt-2">নতুন চুক্তি তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
            </div>
          )}
        </div>
      </div>

      {/* Hotel Contract Modal */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          resetContractForm();
        }}
        title="হোটেল চুক্তি"
        size="xl"
      >
        <form onSubmit={handleContractSubmit} className="space-y-4">
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
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={createContract.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{createContract.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default HotelDetails;
