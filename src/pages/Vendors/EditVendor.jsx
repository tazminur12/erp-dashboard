import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Save, RotateCcw, X, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import useSecureAxios from '../../hooks/UseAxiosSecure.js';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary';

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useSecureAxios();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tradeName: '',
    tradeLocation: '',
    ownerName: '',
    contactNo: '',
    dob: '',
    nid: '',
    passport: '',
    logo: ''
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const errors = useMemo(() => {
    const newErrors = {};
    if (!form.tradeName.trim()) newErrors.tradeName = 'Trade Name is required';
    if (!form.tradeLocation.trim()) newErrors.tradeLocation = 'Trade Location is required';
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner's Name is required";

    if (!form.contactNo.trim()) {
      newErrors.contactNo = 'Contact No is required';
    } else {
      const phone = form.contactNo.trim();
      const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!phoneRegex.test(phone)) newErrors.contactNo = 'Enter a valid phone number';
    }

    if (form.nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(form.nid.trim())) newErrors.nid = 'NID should be 8-20 digits';
    }

    if (form.passport.trim()) {
      const passportRegex = /^[A-Za-z0-9]{6,12}$/;
      if (!passportRegex.test(form.passport.trim())) newErrors.passport = 'Passport should be 6-12 chars';
    }

    return newErrors;
  }, [form]);

  const hasError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    if (vendor) {
      setForm({
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        dob: vendor.dob || '',
        nid: vendor.nid || '',
        passport: vendor.passport || '',
        logo: vendor.logo || ''
      });
      setLogoPreview(vendor.logo || null);
    }
    setTouched({});
  };

  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'vendors');
      
      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setForm(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'Success!',
        text: 'Logo uploaded successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed',
        timer: 1500
      });
      
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to upload logo. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setForm(prev => ({ ...prev, logo: '' }));
  };

  const handleCancel = () => {
    navigate('/vendors');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      tradeName: true,
      tradeLocation: true,
      ownerName: true,
      contactNo: true,
      dob: touched.dob || false,
      nid: touched.nid || false,
      passport: touched.passport || false
    });

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      await axiosSecure.patch(`/vendors/${id}`, form);

      await Swal.fire({
        icon: 'success',
        title: 'Vendor updated successfully',
        showConfirmButton: false,
        timer: 1400
      });

      navigate(`/vendors/${id}`);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update vendor. Please try again.';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get('/vendors');
        
        // Extract vendors array from response
        const vendorsData = response.data?.vendors || response.data || [];
        
        // Find vendor by vendorId
        const vendorData = vendorsData.find(v => 
          v._id === id || v.vendorId === id || v.id === id
        );
        
        if (vendorData) {
          // Transform vendor data to match frontend expectations
          const transformedVendor = {
            _id: vendorData._id || vendorData.id,
            vendorId: vendorData.vendorId || vendorData._id || vendorData.id,
            tradeName: vendorData.tradeName || '',
            tradeLocation: vendorData.tradeLocation || '',
            ownerName: vendorData.ownerName || '',
            contactNo: vendorData.contactNo || '',
            dob: vendorData.dob || '',
            nid: vendorData.nid || '',
            passport: vendorData.passport || '',
            logo: vendorData.logo || ''
          };
          
          setVendor(transformedVendor);
          setForm({
            tradeName: transformedVendor.tradeName,
            tradeLocation: transformedVendor.tradeLocation,
            ownerName: transformedVendor.ownerName,
            contactNo: transformedVendor.contactNo,
            dob: transformedVendor.dob,
            nid: transformedVendor.nid,
            passport: transformedVendor.passport,
            logo: transformedVendor.logo || ''
          });
          setLogoPreview(transformedVendor.logo || null);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Vendor not found',
            text: 'The vendor you are trying to edit does not exist.',
            confirmButtonColor: '#7c3aed'
          }).then(() => {
            navigate('/vendors');
          });
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to fetch vendor details: ${error.response?.status || error.message}`,
          confirmButtonColor: '#7c3aed'
        }).then(() => {
          navigate('/vendors');
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id, axiosSecure, navigate]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading vendor details...</div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Vendor not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Edit Vendor - {vendor.tradeName}</title>
        <meta name="description" content={`Edit vendor profile for ${vendor.tradeName}.`} />
      </Helmet>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/vendors/${id}`)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Vendor</h1>
            <p className="text-gray-600 dark:text-gray-400">{vendor.tradeName}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Logo Upload Section */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Vendor Logo
          </label>
          <div className="flex items-center gap-4">
            {(logoPreview || form.logo || vendor?.logo) ? (
              <div className="relative">
                <img
                  src={logoPreview || form.logo || vendor?.logo}
                  alt="Vendor logo"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    // If image fails to load, hide it and show placeholder
                    e.target.style.display = 'none';
                    e.target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4" />
                {logoUploading ? 'Uploading...' : logoPreview || form.logo ? 'Change Logo' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Recommended: Square image, max 5MB (PNG, JPG)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trade Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tradeName"
              value={form.tradeName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('tradeName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter trade name"
              autoComplete="organization"
            />
            {hasError('tradeName') && (
              <p className="mt-1 text-sm text-red-600">{errors.tradeName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trade Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tradeLocation"
              value={form.tradeLocation}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('tradeLocation') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter trade location"
              autoComplete="address-level2"
            />
            {hasError('tradeLocation') && (
              <p className="mt-1 text-sm text-red-600">{errors.tradeLocation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owner's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('ownerName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter owner's name"
              autoComplete="name"
            />
            {hasError('ownerName') && (
              <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact No <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="contactNo"
              value={form.contactNo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('contactNo') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="e.g. +8801XXXXXXXXX"
              autoComplete="tel"
            />
            {hasError('contactNo') && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NID</label>
            <input
              type="text"
              name="nid"
              value={form.nid}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('nid') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter NID number"
              inputMode="numeric"
            />
            {hasError('nid') && (
              <p className="mt-1 text-sm text-red-600">{errors.nid}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport</label>
            <input
              type="text"
              name="passport"
              value={form.passport}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasError('passport') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter passport number"
              autoComplete="off"
            />
            {hasError('passport') && (
              <p className="mt-1 text-sm text-red-600">{errors.passport}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Updating...' : 'Update Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVendor;