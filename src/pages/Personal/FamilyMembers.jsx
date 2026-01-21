import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Users, Plus, Trash2, Camera, X, Loader2, Building2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary';
import useFamilyMemberQueries from '../../hooks/useFamilyMemberQueries';

const FamilyMembers = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Family Members Queries
  const { useFamilyMembers, useCreateFamilyMember, useDeleteFamilyMember } = useFamilyMemberQueries();
  const { data: familyMembersData, isLoading, error } = useFamilyMembers({ page: 1, limit: 200 });
  const createFamilyMember = useCreateFamilyMember();
  const deleteFamilyMember = useDeleteFamilyMember();

  const familyMembers = familyMembersData?.members || [];

  // Family Members State
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [familyFormData, setFamilyFormData] = useState({
    picture: '',
    name: '',
    fatherName: '',
    motherName: '',
    relationship: '',
    mobileNumber: ''
  });
  const [picturePreview, setPicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Family Members Functions
  const uploadPictureToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setUploadingPicture(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('ফাইল সাইজ ৫MB এর কম হতে হবে');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'family-members');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `আপলোড ব্যর্থ: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setFamilyFormData(prev => ({ ...prev, picture: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি সফলভাবে আপলোড হয়েছে!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPictureToCloudinary(file);
    }
  };

  const resetFamilyForm = () => {
    setFamilyFormData({
      picture: '',
      name: '',
      fatherName: '',
      motherName: '',
      relationship: '',
      mobileNumber: ''
    });
    setPicturePreview(null);
  };

  const handleAddFamilyMember = () => {
    resetFamilyForm();
    setIsFamilyModalOpen(true);
  };

  const handleFamilySubmit = async (e) => {
    e.preventDefault();

    if (!familyFormData.name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে নাম পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    if (!familyFormData.relationship) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে সম্পর্ক নির্বাচন করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
      const memberData = {
        picture: familyFormData.picture || '',
        name: familyFormData.name.trim(),
        fatherName: familyFormData.fatherName ? familyFormData.fatherName.trim() : '',
        motherName: familyFormData.motherName ? familyFormData.motherName.trim() : '',
        relationship: familyFormData.relationship,
        mobileNumber: familyFormData.mobileNumber ? familyFormData.mobileNumber.trim() : '',
      };

      await createFamilyMember.mutateAsync(memberData);
      
      Swal.fire({
        title: 'সফল!',
        text: 'পারিবারিক সদস্য সফলভাবে যোগ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

      setIsFamilyModalOpen(false);
      resetFamilyForm();
    } catch (error) {
      console.error('Create family member error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'পারিবারিক সদস্য যোগ করতে সমস্যা হয়েছে।';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDeleteFamilyMember = async (id) => {
    const res = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: 'এই সদস্যকে মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });
    
    if (!res.isConfirmed) return;
    
    try {
      await deleteFamilyMember.mutateAsync(id);
      
      await Swal.fire({ 
        icon: 'success', 
        title: 'মুছে ফেলা হয়েছে', 
        timer: 900, 
        showConfirmButton: false 
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'সদস্য মুছে ফেলতে ব্যর্থ';
      await Swal.fire({ 
        icon: 'error', 
        title: 'ত্রুটি', 
        text: message, 
        confirmButtonColor: '#ef4444' 
      });
    }
  };

  // Profile Navigation
  const handleOpenProfile = (member) => {
    navigate(`/personal/family-members/${member.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>পারিবারিক সদস্যবৃন্দ</title>
        <meta name="description" content="পারিবারিক সদস্যদের তালিকা দেখুন এবং পরিচালনা করুন।" />
      </Helmet>
      
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">পারিবারিক সদস্যবৃন্দ</h1>
            <p className="text-gray-600 dark:text-gray-400">পারিবারিক সদস্যদের তালিকা এবং পরিচালনা</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/personal/administrative-expenses"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5"
          >
            <Building2 className="w-4 h-4" /> পরিচালন খরচ
          </Link>
          <button
            onClick={handleAddFamilyMember}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
          >
            <Plus className="w-4 h-4" /> নতুন সদস্য যোগ করুন
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">মোট সদস্য</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {familyMembers.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Family Members Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-2">ত্রুটি: {error.message || 'ডেটা লোড করতে সমস্যা হয়েছে'}</p>
          </div>
        ) : familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleOpenProfile(member)}
                  >
                    {member.picture ? (
                      <img
                        src={member.picture}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 dark:border-purple-800"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-purple-200 dark:border-purple-800">
                        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{member.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProfile(member)}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                      title="প্রোফাইল দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFamilyMember(member.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {member.fatherName && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">পিতার নাম:</span>
                      <span>{member.fatherName}</span>
                    </div>
                  )}
                  {member.motherName && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">মাতার নাম:</span>
                      <span>{member.motherName}</span>
                    </div>
                  )}
                  {member.mobileNumber && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">মোবাইল:</span>
                      <span>{member.mobileNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">কোন পারিবারিক সদস্য নেই</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              নতুন সদস্য যোগ করতে উপরের বাটনে ক্লিক করুন
            </p>
            <button
              onClick={handleAddFamilyMember}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              <Plus className="w-4 h-4" /> নতুন সদস্য যোগ করুন
            </button>
          </div>
        )}
      </div>

      {/* Family Member Form Modal */}
      <Modal
        isOpen={isFamilyModalOpen}
        onClose={() => {
          setIsFamilyModalOpen(false);
          resetFamilyForm();
        }}
        title="পারিবারিক সদস্য যোগ করুন"
        size="lg"
      >
        <form onSubmit={handleFamilySubmit} className="space-y-4">
          {/* Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ছবি
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {picturePreview || familyFormData.picture ? (
                  <div className="relative">
                    <img
                      src={picturePreview || familyFormData.picture}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-purple-200 dark:border-purple-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPicturePreview(null);
                        setFamilyFormData(prev => ({ ...prev, picture: '' }));
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-purple-500 transition-colors">
                      {uploadingPicture ? (
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ছবি আপলোড করুন (সর্বোচ্চ ৫MB)
                </p>
                {!picturePreview && !familyFormData.picture && (
                  <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    ছবি নির্বাচন করুন
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={familyFormData.name}
              onChange={(e) => setFamilyFormData({ ...familyFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="নাম লিখুন"
              required
            />
          </div>

          {/* Father's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              পিতার নাম
            </label>
            <input
              type="text"
              value={familyFormData.fatherName}
              onChange={(e) => setFamilyFormData({ ...familyFormData, fatherName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="পিতার নাম লিখুন"
            />
          </div>

          {/* Mother's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মাতার নাম
            </label>
            <input
              type="text"
              value={familyFormData.motherName}
              onChange={(e) => setFamilyFormData({ ...familyFormData, motherName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="মাতার নাম লিখুন"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              আব্দুর রশিদের সাথে সম্পর্ক <span className="text-red-500">*</span>
            </label>
            <select
              value={familyFormData.relationship}
              onChange={(e) => setFamilyFormData({ ...familyFormData, relationship: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">সম্পর্ক নির্বাচন করুন</option>
              <option value="স্ত্রী">স্ত্রী</option>
              <option value="ভাই">ভাই</option>
              <option value="বোন">বোন</option>
              <option value="ছেলে">ছেলে</option>
              <option value="মেয়ে">মেয়ে</option>
              <option value="ছেলের বৌ">ছেলের বৌ</option>
              <option value="জামাই">জামাই</option>
              <option value="নাতি">নাতি</option>
              <option value="নাতনি">নাতনি</option>
              <option value="ফুফি">ফুফি</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              মোবাইল নাম্বার
            </label>
            <input
              type="tel"
              value={familyFormData.mobileNumber}
              onChange={(e) => setFamilyFormData({ ...familyFormData, mobileNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="মোবাইল নাম্বার লিখুন"
            />
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                setIsFamilyModalOpen(false);
                resetFamilyForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={uploadingPicture}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {uploadingPicture ? 'আপলোড হচ্ছে...' : 'যোগ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default FamilyMembers;
