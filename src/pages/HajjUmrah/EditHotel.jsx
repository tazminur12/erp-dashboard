import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import useHotelQueries from '../../hooks/useHotelQueries';
import Swal from 'sweetalert2';

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hotel queries
  const { useGetHotel, useUpdateHotel } = useHotelQueries();
  
  // Fetch hotel data
  const { data: hotelResponse, isLoading, error } = useGetHotel(id);
  const hotel = hotelResponse?.data || null;
  
  // Mutations
  const updateHotel = useUpdateHotel();
  
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

  // Load hotel data into form when hotel is fetched
  useEffect(() => {
    if (hotel) {
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
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      await updateHotel.mutateAsync({ 
        id: id, 
        data: payload 
      });
      
      Swal.fire({
        title: 'সফল!',
        text: 'হোটেল সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      }).then(() => {
        navigate(`/hajj-umrah/hotel-management/${id}`);
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'হোটেল আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleGoBack = () => {
    navigate(`/hajj-umrah/hotel-management/${id}`);
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
          <p className="text-gray-600 mb-4">আপনি যে হোটেল সম্পাদনা করতে চান তা বিদ্যমান নেই।</p>
          <button
            onClick={() => navigate('/hajj-umrah/hotel-management')}
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
        <title>{hotel.hotelName} - সম্পাদনা করুন</title>
        <meta name="description" content={`${hotel.hotelName} সম্পাদনা করুন`} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
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
                হোটেল সম্পাদনা করুন
              </h1>
              <p className="text-gray-600 mt-2">{hotel.hotelName}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                এলাকা <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">এলাকা নির্বাচন করুন</option>
                <option value="মক্কা">মক্কা</option>
                <option value="মদিনা">মদিনা</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                হোটেলের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="হোটেলের নাম লিখুন"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  তাসরিহ নং
                </label>
                <input
                  type="text"
                  name="tasrihNumber"
                  value={formData.tasrihNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="তাসরিহ নং লিখুন"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  তাসনিফ নং
                </label>
                <input
                  type="text"
                  name="tasnifNumber"
                  value={formData.tasnifNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="তাসনিফ নং লিখুন"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ঠিকানা
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ঠিকানা লিখুন"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                হারাম এলাকা থেকে দুরত্ব(মিটারে)
              </label>
              <input
                type="number"
                name="distanceFromHaram"
                value={formData.distanceFromHaram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="দুরত্ব মিটারে লিখুন"
                min="0"
                step="1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ইমেইল
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ইমেইল লিখুন"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মোবাইল নং
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="মোবাইল নং লিখুন"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={updateHotel.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {updateHotel.isPending ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHotel;
