import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Save,
  Users,
  Loader2,
  Search,
  X,
  MessageCircle,
  Wand2,
  Upload,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import divisionData from '../../../jsondata/AllDivision.json';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary.js';
import useAirCustomersQueries from '../../../hooks/useAirCustomersQueries.js';

const PassengerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { useAirCustomer, useUpdateAirCustomer, useSearchAirCustomers } = useAirCustomersQueries();
  
  // Fetch passenger data
  const { data: passenger, isPending: isLoading, error } = useAirCustomer(id);
  const updateAirCustomerMutation = useUpdateAirCustomer();
  
  // Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerType: '',
    name: '',
    firstName: '',
    lastName: '',
    mobile: '',
    whatsappNo: '',
    email: '',
    occupation: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    postCode: '',
    passportNumber: '',
    passportType: '',
    issueDate: '',
    expiryDate: '',
    dateOfBirth: '',
    nidNumber: '',
    passportFirstName: '',
    passportLastName: '',
    nationality: '',
    previousPassport: '',
    gender: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    maritalStatus: '',
    customerImage: null,
    isActive: true,
    notes: '',
    referenceBy: '',
    referenceCustomerId: '',
    passportCopy: null,
    nidCopy: null
  });

  const [useMobileAsWhatsApp, setUseMobileAsWhatsApp] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [passportCopyUploading, setPassportCopyUploading] = useState(false);
  const [passportCopyPreview, setPassportCopyPreview] = useState(null);
  const [nidCopyUploading, setNidCopyUploading] = useState(false);
  const [nidCopyPreview, setNidCopyPreview] = useState(null);
  
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  
  const [showReferenceSearchModal, setShowReferenceSearchModal] = useState(false);
  const [referenceSearchTerm, setReferenceSearchTerm] = useState('');
  
  const { data: referenceSearchResults = [], isPending: referenceSearchLoading } = useSearchAirCustomers(
    referenceSearchTerm,
    { enabled: showReferenceSearchModal && !!referenceSearchTerm.trim() }
  );

  // Load division data
  useEffect(() => {
    if (divisionData.Bangladesh) {
      setDivisions(divisionData.Bangladesh.map(item => item.Division));
    }
  }, []);

  // Populate form when passenger data loads
  useEffect(() => {
    if (passenger) {
      setFormData({
        customerType: passenger.customerType || '',
        name: passenger.name || '',
        firstName: passenger.firstName || '',
        lastName: passenger.lastName || '',
        mobile: passenger.mobile || '',
        whatsappNo: passenger.whatsappNo || '',
        email: passenger.email || '',
        occupation: passenger.occupation || '',
        address: passenger.address || '',
        division: passenger.division || '',
        district: passenger.district || '',
        upazila: passenger.upazila || '',
        postCode: passenger.postCode || '',
        passportNumber: passenger.passportNumber || '',
        passportType: passenger.passportType || '',
        issueDate: passenger.issueDate || '',
        expiryDate: passenger.expiryDate || '',
        dateOfBirth: passenger.dateOfBirth || '',
        nidNumber: passenger.nidNumber || '',
        passportFirstName: passenger.passportFirstName || '',
        passportLastName: passenger.passportLastName || '',
        nationality: passenger.nationality || '',
        previousPassport: passenger.previousPassport || '',
        gender: passenger.gender || '',
        fatherName: passenger.fatherName || '',
        motherName: passenger.motherName || '',
        spouseName: passenger.spouseName || '',
        maritalStatus: passenger.maritalStatus || '',
        customerImage: passenger.customerImage || null,
        isActive: passenger.isActive !== false,
        notes: passenger.notes || '',
        referenceBy: passenger.referenceBy || '',
        referenceCustomerId: passenger.referenceCustomerId || '',
        passportCopy: passenger.passportCopy || null,
        nidCopy: passenger.nidCopy || null
      });

      // Set date states
      if (passenger.issueDate) setIssueDate(new Date(passenger.issueDate));
      if (passenger.expiryDate) setExpiryDate(new Date(passenger.expiryDate));
      if (passenger.dateOfBirth) setDateOfBirth(new Date(passenger.dateOfBirth));

      // Set previews
      if (passenger.customerImage) setImagePreview(passenger.customerImage);
      if (passenger.passportCopy) setPassportCopyPreview(passenger.passportCopy);
      if (passenger.nidCopy) setNidCopyPreview(passenger.nidCopy);

      // Check if whatsapp same as mobile
      if (passenger.whatsappNo && passenger.mobile && passenger.whatsappNo === passenger.mobile) {
        setUseMobileAsWhatsApp(true);
      }
    }
  }, [passenger]);

  // Update districts when division changes
  useEffect(() => {
    if (formData.division) {
      const selectedDivision = divisionData.Bangladesh.find(item => item.Division === formData.division);
      if (selectedDivision) {
        setDistricts(selectedDivision.Districts.map(item => item.District));
      }
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [formData.division]);

  // Update upazilas when district changes
  useEffect(() => {
    if (formData.division && formData.district) {
      const selectedDivision = divisionData.Bangladesh.find((item) => item.Division === formData.division);
      if (selectedDivision) {
        const selectedDistrict = selectedDivision.Districts.find(item => item.District === formData.district);
        if (selectedDistrict) {
          setUpazilas(selectedDistrict.Upazilas);
        }
      }
    } else {
      setUpazilas([]);
    }
  }, [formData.division, formData.district]);

  // Update WhatsApp number when mobile changes
  useEffect(() => {
    if (useMobileAsWhatsApp && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    }
  }, [formData.mobile, useMobileAsWhatsApp]);

  const handleWhatsAppCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setUseMobileAsWhatsApp(isChecked);
    if (isChecked && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    }
  };

  const handleIssueDateChange = (date) => {
    setIssueDate(date);
    setFormData(prev => ({ 
      ...prev, 
      issueDate: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleExpiryDateChange = (date) => {
    setExpiryDate(date);
    setFormData(prev => ({ 
      ...prev, 
      expiryDate: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleDateOfBirthChange = (date) => {
    setDateOfBirth(date);
    setFormData(prev => ({ 
      ...prev, 
      dateOfBirth: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete.');
      }
      
      setImageUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', CLOUDINARY_CONFIG.FOLDER);
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      setFormData(prev => ({ ...prev, customerImage: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, customerImage: null }));
  };

  // Upload Passport Copy
  const uploadPassportCopy = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete.');
      }
      setPassportCopyUploading(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPassportCopyPreview(e.target.result);
        reader.readAsDataURL(file);
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'air-passengers/passport');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, passportCopy: result.secure_url }));

      Swal.fire({
        title: 'সফল!',
        text: 'পাসপোর্ট কপি আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setPassportCopyPreview(null);
    } finally {
      setPassportCopyUploading(false);
    }
  }, []);

  // Upload NID Copy
  const uploadNidCopy = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete.');
      }
      setNidCopyUploading(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setNidCopyPreview(e.target.result);
        reader.readAsDataURL(file);
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'air-passengers/nid');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, nidCopy: result.secure_url }));

      Swal.fire({
        title: 'সফল!',
        text: 'NID কপি আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setNidCopyPreview(null);
    } finally {
      setNidCopyUploading(false);
    }
  }, []);

  const handleRemovePassportCopy = () => {
    setPassportCopyPreview(null);
    setFormData(prev => ({ ...prev, passportCopy: null }));
  };

  const handleRemoveNidCopy = () => {
    setNidCopyPreview(null);
    setFormData(prev => ({ ...prev, nidCopy: null }));
  };

  const selectReferenceCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      referenceBy: customer.name,
      referenceCustomerId: customer.customerId
    }));
    setShowReferenceSearchModal(false);
    setReferenceSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        uploadToCloudinary(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(formData.firstName && formData.firstName.trim())) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমারের নাম অবশ্যই পূরণ করতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (!formData.mobile) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'মোবাইল নম্বর অবশ্যই পূরণ করতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (imageUploading || passportCopyUploading || nidCopyUploading) {
      Swal.fire({
        title: 'অপেক্ষা করুন!',
        text: 'ফাইল আপলোড হচ্ছে।',
        icon: 'info',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }
    
    const customerData = {
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      mobile: formData.mobile,
      email: formData.email || null,
      occupation: formData.occupation || null,
      address: formData.address || null,
      division: formData.division || null,
      district: formData.district || null,
      upazila: formData.upazila || null,
      postCode: formData.postCode || null,
      whatsappNo: formData.whatsappNo || null,
      customerType: formData.customerType || null,
      customerImage: formData.customerImage || null,
      passportNumber: formData.passportNumber || null,
      passportType: formData.passportType || null,
      issueDate: formData.issueDate || null,
      expiryDate: formData.expiryDate || null,
      dateOfBirth: formData.dateOfBirth || null,
      nidNumber: formData.nidNumber || null,
      passportFirstName: formData.passportFirstName || null,
      passportLastName: formData.passportLastName || null,
      nationality: formData.nationality || null,
      previousPassport: formData.previousPassport || null,
      gender: formData.gender || null,
      fatherName: formData.fatherName || null,
      motherName: formData.motherName || null,
      spouseName: formData.spouseName || null,
      maritalStatus: formData.maritalStatus || null,
      notes: formData.notes || null,
      referenceBy: formData.referenceBy || null,
      referenceCustomerId: formData.referenceCustomerId || null,
      passportCopy: formData.passportCopy || null,
      nidCopy: formData.nidCopy || null
    };
    
    setIsSubmitting(true);
    updateAirCustomerMutation.mutate(
      { id, data: customerData },
      {
        onSuccess: () => {
          Swal.fire({
            title: 'সফল!',
            text: 'প্যাসেঞ্জার তথ্য আপডেট হয়েছে!',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
          }).then(() => {
            navigate(`/air-ticketing/passengers/${id}`);
          });
        },
        onError: (error) => {
          Swal.fire({
            title: 'ত্রুটি!',
            text: error.message || 'আপডেট করতে সমস্যা হয়েছে।',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading passenger data</p>
          <button
            onClick={() => navigate('/air-ticketing/passengers/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Passengers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/air-ticketing/passengers/${id}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                প্যাসেঞ্জার এডিট করুন
              </h1>
              <p className={`mt-1 text-sm lg:text-base transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                প্যাসেঞ্জার তথ্য আপডেট করুন
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* কাস্টমার তথ্য Section */}
          <div className={`rounded-xl shadow-lg p-4 lg:p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>কাস্টমার তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* নাম: First & Last */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  নাম * (First & Last)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="First Name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* মোবাইল নাম্বার */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  মোবাইল নাম্বার *
                </label>
                <div className="relative">
                  <Phone className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    placeholder="017xxxxxxxx"
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useMobileAsWhatsApp"
                    checked={useMobileAsWhatsApp}
                    onChange={handleWhatsAppCheckboxChange}
                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <label htmlFor="useMobileAsWhatsApp" className={`text-xs transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    এটিই WhatsApp No?
                  </label>
                </div>
              </div>

              {/* WhatsApp নাম্বার */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  WhatsApp নাম্বার
                </label>
                <input
                  type="tel"
                  name="whatsappNo"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                  placeholder="017xxxxxxxx"
                  disabled={useMobileAsWhatsApp}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  } ${useMobileAsWhatsApp ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* পেশা */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পেশা
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Occupation"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ইমেইল */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ইমেইল
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* বিভাগ */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  বিভাগ
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
              </div>

              {/* জেলা */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  জেলা
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!formData.division}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${!formData.division ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* উপজেলা */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  উপজেলা
                </label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">উপজেলা নির্বাচন করুন</option>
                  {upazilas.map(upazila => (
                    <option key={upazila} value={upazila}>{upazila}</option>
                  ))}
                </select>
              </div>

              {/* পোস্ট কোড */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পোস্ট কোড
                </label>
                <input
                  type="text"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="1234"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ঠিকানা */}
              <div className="md:col-span-2 lg:col-span-3 space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ঠিকানা
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="বিস্তারিত ঠিকানা লিখুন..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* পাসপোর্ট তথ্য Section */}
          <div className={`rounded-xl shadow-lg p-4 lg:p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>পাসপোর্ট তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  পাসপোর্ট নাম্বার
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="A12345678"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  পাসপোর্ট টাইপ
                </label>
                <select
                  name="passportType"
                  value={formData.passportType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">পাসপোর্ট টাইপ নির্বাচন করুন</option>
                  <option value="Ordinary">Ordinary Passport</option>
                  <option value="Official">Official Passport</option>
                  <option value="Diplomatic">Diplomatic Passport</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Last/Surname Name
                </label>
                <input
                  type="text"
                  name="passportLastName"
                  value={formData.passportLastName}
                  onChange={handleInputChange}
                  placeholder="Surname"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  First Name
                </label>
                <input
                  type="text"
                  name="passportFirstName"
                  value={formData.passportFirstName}
                  onChange={handleInputChange}
                  placeholder="Given Name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  ইস্যু তারিখ
                </label>
                <DatePicker
                  selected={issueDate}
                  onChange={handleIssueDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="তারিখ নির্বাচন করুন"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  isClearable
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  মেয়াদ শেষের তারিখ
                </label>
                <DatePicker
                  selected={expiryDate}
                  onChange={handleExpiryDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="তারিখ নির্বাচন করুন"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  minDate={issueDate || new Date()}
                  isClearable
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  জন্ম তারিখ
                </label>
                <DatePicker
                  selected={dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="তারিখ নির্বাচন করুন"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  isClearable
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  এনআইডি নাম্বার
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="NID Number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  placeholder="e.g., Bangladeshi"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Previous Passport No
                </label>
                <input
                  type="text"
                  name="previousPassport"
                  value={formData.previousPassport}
                  onChange={handleInputChange}
                  placeholder="Old passport number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* পরিবার তথ্য Section */}
          <div className={`rounded-xl shadow-lg p-4 lg:p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Family Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Father's name"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Mother Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Mother's name"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Spouse Name</label>
                <input
                  type="text"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleInputChange}
                  placeholder="Spouse name"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`block text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className={`rounded-xl shadow-lg p-4 lg:p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Document Upload</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Photo
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  {imageUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                  ) : imagePreview || formData.customerImage ? (
                    <div className="flex flex-col items-center space-y-3">
                      <img 
                        src={imagePreview || formData.customerImage} 
                        alt="Profile Photo"
                        className="max-h-48 max-w-full rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload photo</span>
                      <input
                        type="file"
                        name="customerImage"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Passport Copy Upload */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Passport Copy
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  {passportCopyUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                  ) : passportCopyPreview || formData.passportCopy ? (
                    <div className="flex flex-col items-center space-y-3">
                      {(passportCopyPreview || formData.passportCopy)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (passportCopyPreview && passportCopyPreview.startsWith('data:image')) ? (
                        <img 
                          src={passportCopyPreview || formData.passportCopy} 
                          alt="Passport Copy"
                          className="max-h-48 max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FileText className="w-8 h-8 text-red-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Passport Copy Uploaded</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemovePassportCopy}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload passport copy</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files[0] && uploadPassportCopy(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* NID Copy Upload */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  NID Copy
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  {nidCopyUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                  ) : nidCopyPreview || formData.nidCopy ? (
                    <div className="flex flex-col items-center space-y-3">
                      {(nidCopyPreview || formData.nidCopy)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (nidCopyPreview && nidCopyPreview.startsWith('data:image')) ? (
                        <img 
                          src={nidCopyPreview || formData.nidCopy} 
                          alt="NID Copy"
                          className="max-h-48 max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FileText className="w-8 h-8 text-red-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">NID Copy Uploaded</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveNidCopy}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload NID copy</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files[0] && uploadNidCopy(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={updateAirCustomerMutation.isPending || isSubmitting || imageUploading || passportCopyUploading || nidCopyUploading}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {(updateAirCustomerMutation.isPending || isSubmitting) ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  আপডেট হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  আপডেট করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Reference Customer Search Modal */}
      {showReferenceSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-2xl shadow-2xl transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                রেফারেন্স কাস্টমার খুঁজুন
              </h3>
              <button
                onClick={() => setShowReferenceSearchModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={referenceSearchTerm}
                  onChange={(e) => setReferenceSearchTerm(e.target.value)}
                  placeholder="নাম, মোবাইল নম্বর বা কাস্টমার আইডি দিয়ে খুঁজুন..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {referenceSearchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                </div>
              ) : referenceSearchResults.length > 0 ? (
                <div className="space-y-2">
                  {referenceSearchResults.map((customer) => (
                    <div
                      key={customer.customerId}
                      onClick={() => selectReferenceCustomer(customer)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isDark 
                          ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                          : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {customer.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.mobile} • {customer.customerId}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                          নির্বাচন করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : referenceSearchTerm ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">কোন কাস্টমার পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    রেফারেন্স কাস্টমার খুঁজতে নাম, মোবাইল নম্বর বা কাস্টমার আইডি লিখুন
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerEdit;
