import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  ToggleLeft, 
  ToggleRight,
  Save,
  Building2,
  Plane,
  Home,
  Users,
  Upload,
  Loader2,
  Search,
  X,
  MessageCircle,
  Wand2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import divisionData from '../../jsondata/AllDivision.json';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary.js';
import useAxiosSecure from '../../hooks/UseAxiosSecure';

const AddCustomer = () => {
  const { isDark } = useTheme();
  const axiosSecure = useAxiosSecure();
  const [formData, setFormData] = useState({
    // কাস্টমার তথ্য
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
    
    // পাসপোর্ট তথ্য
    passportNumber: '',
    passportType: '',
    issueDate: '',
    expiryDate: '',
    dateOfBirth: '', // 
    nidNumber: '',
    passportFirstName: '',
    passportLastName: '',
    nationality: '',
    previousPassport: '',
    gender: '',
    
    // পরিবার তথ্য
    fatherName: '',
    motherName: '',
    spouseName: '',
    maritalStatus: '',
    
    // অতিরিক্ত তথ্য
    customerImage: null,
    isActive: true,
    notes: '',
    referenceBy: '',
    referenceCustomerId: '', // Reference customer ID for linking
    // Service linkage
    serviceType: '',
    serviceStatus: ''
  });

  const [useMobileAsWhatsApp, setUseMobileAsWhatsApp] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState(null);
  // Dependent service status state
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [serviceStatusesLoading, setServiceStatusesLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);

  useEffect(() => {
    // Load service types list
    const loadServices = async () => {
      try {
        setServiceTypesLoading(true);
        const res = await axiosSecure.get('/api/services');
        const list = res?.data?.services || res?.data || [];
        setServiceTypes(Array.isArray(list) ? list : []);
      } catch (e) {
        setServiceTypes([]);
      } finally {
        setServiceTypesLoading(false);
      }
    };
    loadServices();

    if (!formData.serviceType) {
      setServiceStatuses([]);
      return;
    }

    let isCancelled = false;
    setServiceStatusesLoading(true);
    axiosSecure
      .get(`/api/services/${formData.serviceType}/statuses`)
      .then((res) => {
        if (isCancelled) return;
        const apiStatuses = res?.data?.statuses || res?.data || [];
        setServiceStatuses(Array.isArray(apiStatuses) ? apiStatuses : []);
      })
      .catch(() => {
        if (isCancelled) return;
        setServiceStatuses([]);
      })
      .finally(() => {
        if (isCancelled) return;
        setServiceStatusesLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [formData.serviceType, axiosSecure]);

  // Service type management
  const handleAddServiceType = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Service Type',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Value (e.g., hajj)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Label (e.g., Hajj)">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const value = document.getElementById('swal-input1').value?.trim();
        const label = document.getElementById('swal-input2').value?.trim();
        if (!value || !label) {
          Swal.showValidationMessage('Both value and label are required');
          return false;
        }
        return { value, label };
      }
    });

    if (!formValues) return;

    try {
      await axiosSecure.post('/api/services', formValues);
      const res = await axiosSecure.get('/api/services');
      const list = res?.data?.services || res?.data || [];
      setServiceTypes(Array.isArray(list) ? list : []);
      Swal.fire('Success', 'Service Type added', 'success');
    } catch (e) {
      Swal.fire('Error', 'Failed to add service type', 'error');
    }
  };

  const handleDeleteServiceType = async () => {
    if (!formData.serviceType) {
      Swal.fire('Info', 'Select a Service Type to delete', 'info');
      return;
    }
    const confirm = await Swal.fire({
      title: 'Confirm',
      text: 'Delete selected Service Type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    });
    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.delete(`/api/services/${formData.serviceType}`);
      const res = await axiosSecure.get('/api/services');
      const list = res?.data?.services || res?.data || [];
      setServiceTypes(Array.isArray(list) ? list : []);
      // reset selections
      setFormData(prev => ({ ...prev, serviceType: '', serviceStatus: '' }));
      setServiceStatuses([]);
      Swal.fire('Deleted', 'Service Type deleted', 'success');
    } catch (e) {
      Swal.fire('Error', 'Failed to delete service type', 'error');
    }
  };

  // Service status management
  const handleAddServiceStatus = async () => {
    if (!formData.serviceType) {
      Swal.fire('Info', 'Select a Service Type first', 'info');
      return;
    }
    const { value: formValues } = await Swal.fire({
      title: 'Add Status',
      html:
        '<input id="swal-st-value" class="swal2-input" placeholder="Value (e.g., registered)">' +
        '<input id="swal-st-label" class="swal2-input" placeholder="Label (e.g., Registered)">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const value = document.getElementById('swal-st-value').value?.trim();
        const label = document.getElementById('swal-st-label').value?.trim();
        if (!value || !label) {
          Swal.showValidationMessage('Both value and label are required');
          return false;
        }
        return { value, label };
      }
    });
    if (!formValues) return;
    try {
      await axiosSecure.post(`/api/services/${formData.serviceType}/statuses`, formValues);
      const res = await axiosSecure.get(`/api/services/${formData.serviceType}/statuses`);
      const apiStatuses = res?.data?.statuses || res?.data || [];
      setServiceStatuses(Array.isArray(apiStatuses) ? apiStatuses : []);
      Swal.fire('Success', 'Status added', 'success');
    } catch (e) {
      Swal.fire('Error', 'Failed to add status', 'error');
    }
  };

  const handleDeleteServiceStatus = async () => {
    if (!formData.serviceType || !formData.serviceStatus) {
      Swal.fire('Info', 'Select a Service Type and Status to delete', 'info');
      return;
    }
    const confirm = await Swal.fire({
      title: 'Confirm',
      text: 'Delete selected Status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    });
    if (!confirm.isConfirmed) return;
    try {
      // Try path param delete; if backend expects body, it will still work with fallback
      await axiosSecure.delete(`/api/services/${formData.serviceType}/statuses/${formData.serviceStatus}`);
      const res = await axiosSecure.get(`/api/services/${formData.serviceType}/statuses`);
      const apiStatuses = res?.data?.statuses || res?.data || [];
      setServiceStatuses(Array.isArray(apiStatuses) ? apiStatuses : []);
      setFormData(prev => ({ ...prev, serviceStatus: '' }));
      Swal.fire('Deleted', 'Status deleted', 'success');
    } catch (e) {
      try {
        await axiosSecure.delete(`/api/services/${formData.serviceType}/statuses`, { data: { value: formData.serviceStatus } });
        const res = await axiosSecure.get(`/api/services/${formData.serviceType}/statuses`);
        const apiStatuses = res?.data?.statuses || res?.data || [];
        setServiceStatuses(Array.isArray(apiStatuses) ? apiStatuses : []);
        setFormData(prev => ({ ...prev, serviceStatus: '' }));
        Swal.fire('Deleted', 'Status deleted', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete status', 'error');
      }
    }
  };
  
  // Date states for DatePicker
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [passportScanFile, setPassportScanFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Division data from JSON
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  
  // Categories management - Integrated with CategoryManagement
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  // Customer type management is now handled by CategoryManagement component
  
  // Reference customer search states
  const [showReferenceSearchModal, setShowReferenceSearchModal] = useState(false);
  const [referenceSearchTerm, setReferenceSearchTerm] = useState('');
  const [referenceSearchResults, setReferenceSearchResults] = useState([]);
  const [referenceSearchLoading, setReferenceSearchLoading] = useState(false);

  // Available icons for customer types
  const availableIcons = [
    { value: 'Home', label: 'হোম', icon: Home },
    { value: 'Plane', label: 'প্লেন', icon: Plane },
    { value: 'Building2', label: 'বিল্ডিং', icon: Building2 },
    { value: 'Users', label: 'ব্যবহারকারী', icon: Users },
    { value: 'FileText', label: 'ডকুমেন্ট', icon: FileText }
  ];

  // Function to get icon component
  const getIconComponent = (iconName) => {
    const iconData = availableIcons.find(icon => icon.value === iconName);
    return iconData ? iconData.icon : Home;
  };
  
  // Load division data and customer types on component mount
  useEffect(() => {
    if (divisionData.Bangladesh) {
      setDivisions(divisionData.Bangladesh.map(item => item.Division));
    }
    
    // Check Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      // Cloudinary configuration incomplete
    }
    
    // Load categories from backend
    loadCategories();
  }, []);

  // Load customer types from backend
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axiosSecure.get('/customer-types');

      if (response.data?.success) {
        const customerTypes = response.data.customerTypes || [];
        setCategories(customerTypes);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading customer types:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Update districts when division changes
  useEffect(() => {
    if (formData.division) {
      const selectedDivision = divisionData.Bangladesh.find(item => item.Division === formData.division);
      if (selectedDivision) {
        setDistricts(selectedDivision.Districts.map(item => item.District));
        // Reset district and upazila when division changes
        setFormData(prev => ({ ...prev, district: '', upazila: '' }));
        setUpazilas([]);
      }
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [formData.division]);

  // Update upazilas when district changes
  useEffect(() => {
    if (formData.division && formData.district) {
      const selectedDivision = divisionData.Bangladesh.find(item => item.Division === formData.division);
      if (selectedDivision) {
        const selectedDistrict = selectedDivision.Districts.find(item => item.District === formData.district);
        if (selectedDistrict) {
          setUpazilas(selectedDistrict.Upazilas);
          // Reset upazila when district changes
          setFormData(prev => ({ ...prev, upazila: '' }));
        }
      }
    } else {
      setUpazilas([]);
    }
  }, [formData.division, formData.district]);

  // Update WhatsApp number when mobile number changes and checkbox is checked
  useEffect(() => {
    if (useMobileAsWhatsApp && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!useMobileAsWhatsApp) {
      // Clear WhatsApp number when checkbox is unchecked
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  }, [formData.mobile, useMobileAsWhatsApp]);

  // Debounced search for reference customers
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (referenceSearchTerm.trim()) {
        searchReferenceCustomers(referenceSearchTerm);
      } else {
        setReferenceSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [referenceSearchTerm]);

  // Handle checkbox change
  const handleWhatsAppCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setUseMobileAsWhatsApp(isChecked);
    
    if (isChecked && formData.mobile) {
      // Copy mobile number to WhatsApp number
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!isChecked) {
      // Clear WhatsApp number when unchecked
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  };

  // Real OCR/MRZ extraction via backend API
  // TODO: Implement the backend endpoint `/api/passport/scan` to return structured fields from the uploaded image
  const scanPassportViaApi = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/passport/scan', {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      throw new Error('Scan failed');
    }
    const data = await res.json();
    // Expected response shape (example):
    // {
    //   passportNumber, passportFirstName, passportLastName, nationality,
    //   dateOfBirth: 'YYYY-MM-DD', issueDate: 'YYYY-MM-DD', expiryDate: 'YYYY-MM-DD',
    //   gender, previousPassport, nidNumber
    // }
    return data || {};
  };

  const handlePassportScanFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setPassportScanFile(file || null);
  };

  const handleScanAndFill = async () => {
    if (!passportScanFile) return;
    setIsScanning(true);
    try {
      const parsed = await scanPassportViaApi(passportScanFile);
      setFormData((prev) => ({
        ...prev,
        passportNumber: parsed.passportNumber || prev.passportNumber,
        passportFirstName: parsed.passportFirstName || prev.passportFirstName,
        passportLastName: parsed.passportLastName || prev.passportLastName,
        nationality: parsed.nationality || prev.nationality,
        dateOfBirth: parsed.dateOfBirth || prev.dateOfBirth,
        issueDate: parsed.issueDate || prev.issueDate,
        expiryDate: parsed.expiryDate || prev.expiryDate,
        gender: parsed.gender || prev.gender,
        previousPassport: parsed.previousPassport || prev.previousPassport,
        nidNumber: parsed.nidNumber || prev.nidNumber,
      }));
      // Sync DatePicker states if parse dates provided
      if (parsed.dateOfBirth) setDateOfBirth(new Date(parsed.dateOfBirth));
      if (parsed.issueDate) setIssueDate(new Date(parsed.issueDate));
      if (parsed.expiryDate) setExpiryDate(new Date(parsed.expiryDate));
    } catch (err) {
      Swal.fire({
        title: 'স্ক্যান ব্যর্থ',
        text: 'পাসপোর্ট স্ক্যান করা যায়নি। পরে আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Date change handlers
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
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setImageUploading(true);
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', CLOUDINARY_CONFIG.FOLDER);
      
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
      
      // Set uploaded image data - Just the URL
      const imageUrl = result.secure_url;
      
      // Set image states
      setUploadedImageUrl(imageUrl);
      setUploadedImageData({ cloudinaryUrl: imageUrl });
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, customerImage: imageUrl }));
      
      // Show success message
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      

      
    } catch (error) {
      // Show error message
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl('');
    setUploadedImageData(null);
    setFormData(prev => ({ ...prev, customerImage: null }));
    
    Swal.fire({
      title: 'ছবি সরানো হয়েছে!',
      text: 'আপলোড করা ছবি সরানো হয়েছে।',
      icon: 'info',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#3B82F6'
    });
  };

  // Search reference customers
  const searchReferenceCustomers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setReferenceSearchResults([]);
      return;
    }

    try {
      setReferenceSearchLoading(true);
      const response = await axiosSecure.get(`/customers?search=${searchTerm}`);
      
      if (response.data.success) {
        const customers = response.data.customers || [];
        setReferenceSearchResults(customers);
      } else {
        setReferenceSearchResults([]);
      }
    } catch (error) {
      setReferenceSearchResults([]);
    } finally {
      setReferenceSearchLoading(false);
    }
  };

  // Select reference customer
  const selectReferenceCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      referenceBy: customer.name,
      referenceCustomerId: customer.customerId
    }));
    setShowReferenceSearchModal(false);
    setReferenceSearchTerm('');
    setReferenceSearchResults([]);
  };

  // Customer type management is now handled by CategoryManagement component



  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        
        // Upload to Cloudinary
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
    
    // Validate required fields
    if (!formData.customerType) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমারের ধরন নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      return;
    }
    
    if (!(formData.firstName && formData.firstName.trim()) || !formData.mobile) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'প্রথম নাম ও মোবাইল নম্বর অবশ্যই পূরণ করতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      return;
    }
    
    // Validate mobile number format
    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(formData.mobile)) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সঠিক মোবাইল নম্বর লিখুন (01XXXXXXXXX)',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      return;
    }
    
    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'সঠিক ইমেইল ঠিকানা লিখুন',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2',
          customClass: {
            title: 'text-red-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
        return;
      }
    }
    
    // Check if image is being uploaded
    if (imageUploading) {
      Swal.fire({
        title: 'অপেক্ষা করুন!',
        text: 'ছবি আপলোড হচ্ছে। দয়া করে অপেক্ষা করুন।',
        icon: 'info',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3B82F6',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-blue-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      return;
    }
    

    
    try {
      const customerData = {
        // Basic customer information
        name: (formData.firstName || '') + (formData.lastName ? ' ' + formData.lastName : ''),
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        mobile: formData.mobile,
        email: formData.email || null,
        occupation: formData.occupation || null,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        postCode: formData.postCode || null,
        whatsappNo: formData.whatsappNo || null,
        customerType: formData.customerType,
        
        // Image data - just the URL
        customerImage: formData.customerImage || null,
        
        // Passport information
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

        // Family details
        fatherName: formData.fatherName || null,
        motherName: formData.motherName || null,
        spouseName: formData.spouseName || null,
        maritalStatus: formData.maritalStatus || null,

        // Service linkage
        serviceType: formData.serviceType || null,
        serviceStatus: formData.serviceStatus || null,

        // Additional information
        notes: formData.notes || null,
        referenceBy: formData.referenceBy || null,
        referenceCustomerId: formData.referenceCustomerId || null,
        
        // System fields
        isActive: true
      };
      
      
      // Call backend API using UseAxiosSecure
      const response = await axiosSecure.post('/customers', customerData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create customer');
      }
      

      
      // Success popup
      Swal.fire({
        title: 'সফল!',
        text: 'সফলভাবে কাস্টমার যুক্ত হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      // Reset form
      setFormData({
        customerType: '',
        name: '',
        firstName: '',
        lastName: '',
        mobile: '',
        whatsappNo: '',
        email: '',
        address: '',
        division: '',
        district: '',
        upazila: '',
        postCode: '',
        occupation: '',
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
        serviceType: '',
        serviceStatus: ''
      });
      setImagePreview(null);
      setUploadedImageUrl('');
      setUploadedImageData(null);
      setDistricts([]);
      setUpazilas([]);
      setUseMobileAsWhatsApp(false);
      
      // Reset date states
      setIssueDate(null);
      setExpiryDate(null);
      setDateOfBirth(null);
      
    } catch (error) {
      let errorMessage = 'কাস্টমার যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          errorMessage = 'Backend endpoint পাওয়া যায়নি। Server running আছে কিনা check করুন।';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error। Backend logs check করুন।';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Server থেকে response পাওয়া যায়নি। Network connection check করুন।';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      // Error popup
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  return (
    <>
      {/* Custom DatePicker Styles */}
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          font-family: inherit;
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'};
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          background: ${isDark ? '#1f2937' : '#ffffff'};
        }
        
        .react-datepicker__header {
          background: ${isDark ? '#374151' : '#f9fafb'};
          border-bottom: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};
          border-radius: 12px 12px 0 0;
          padding: 16px;
        }
        
        .react-datepicker__current-month {
          color: ${isDark ? '#f9fafb' : '#111827'};
          font-weight: 600;
          font-size: 16px;
        }
        
        .react-datepicker__day-name {
          color: ${isDark ? '#9ca3af' : '#6b7280'};
          font-weight: 500;
          font-size: 14px;
        }
        
        .react-datepicker__day {
          color: ${isDark ? '#f9fafb' : '#111827'};
          border-radius: 8px;
          margin: 2px;
          width: 32px;
          height: 32px;
          line-height: 30px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .react-datepicker__day:hover {
          background: ${isDark ? '#4b5563' : '#e5e7eb'};
          color: ${isDark ? '#ffffff' : '#111827'};
        }
        
        .react-datepicker__day--selected {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background: ${isDark ? '#4b5563' : '#e5e7eb'};
          color: ${isDark ? '#ffffff' : '#111827'};
        }
        
        .react-datepicker__day--today {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          color: ${isDark ? '#f9fafb' : '#111827'};
          font-weight: 600;
        }
        
        .react-datepicker__day--disabled {
          color: ${isDark ? '#6b7280' : '#9ca3af'};
          cursor: not-allowed;
        }
        
        .react-datepicker__month-container {
          background: ${isDark ? '#1f2937' : '#ffffff'};
        }
        
        .react-datepicker__year-dropdown,
        .react-datepicker__month-dropdown {
          background: ${isDark ? '#1f2937' : '#ffffff'};
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'};
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .react-datepicker__year-option,
        .react-datepicker__month-option {
          color: ${isDark ? '#f9fafb' : '#111827'};
          padding: 8px 12px;
          transition: all 0.2s ease;
        }
        
        .react-datepicker__year-option:hover,
        .react-datepicker__month-option:hover {
          background: ${isDark ? '#374151' : '#f3f4f6'};
        }
        
        .react-datepicker__year-option--selected,
        .react-datepicker__month-option--selected {
          background: #3b82f6;
          color: #ffffff;
        }
        
        .react-datepicker__close-icon {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          border-radius: 50%;
          width: 24px;
          height: 24px;
          right: 8px;
          top: 8px;
        }
        
        .react-datepicker__close-icon::after {
          background: ${isDark ? '#9ca3af' : '#6b7280'};
          font-size: 16px;
          font-weight: bold;
        }
      `}</style>
      
      <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            নতুন কাস্টমার যুক্ত করুন
          </h1>
          <p className={`mt-1 text-sm lg:text-base transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            আপনার ব্যবসায় নতুন কাস্টমার যোগ করুন
          </p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* কাস্টমারের ধরন */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  কাস্টমারের ধরন *
                </label>
                <div className="relative">
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                    required
                    disabled={categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    } ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {categoriesLoading ? 'লোড হচ্ছে...' : 'ধরন নির্বাচন করুন'}
                    </option>
                    {categories.map(category => {
                      const IconComponent = availableIcons.find(icon => icon.value === category.icon)?.icon || Home;
                      return (
                      <option key={category.value} value={category.value}>
                        {category.label} ({category.prefix})
                      </option>
                      );
                    })}
                  </select>
                  {categoriesLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                
                {/* Customer Type Management */}
                <div className="mt-2">
                  {/* Customer type management is now handled by CategoryManagement component */}
                </div>
              </div>

              {/* নাম: First & Last */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  নাম * (First & Last)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="First Name"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
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
                {/* WhatsApp checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useMobileAsWhatsApp"
                    checked={useMobileAsWhatsApp}
                    onChange={handleWhatsAppCheckboxChange}
                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="useMobileAsWhatsApp" className={`text-xs transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    এটিই WhatsApp No?
                  </label>
                </div>
              </div>

              {/* WhatsApp নাম্বার (icon click to open chat) */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  WhatsApp নাম্বার
                  {useMobileAsWhatsApp && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (মোবাইল নাম্বার থেকে কপি করা হয়েছে)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Phone className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="tel"
                    name="whatsappNo"
                    value={formData.whatsappNo}
                    onChange={handleInputChange}
                    placeholder="017xxxxxxxx"
                    disabled={useMobileAsWhatsApp}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    } ${useMobileAsWhatsApp ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                  />
                  {formData.whatsappNo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.whatsappNo.trim()) {
                          Swal.fire({
                            icon: 'warning',
                            title: 'No WhatsApp Number',
                            text: 'Please enter a WhatsApp number first'
                          });
                          return;
                        }
                        
                        const num = formData.whatsappNo.replace(/\D/g, '');
                        const url = `https://wa.me/88${num}`;
                        window.open(url, '_blank');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Open WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* পেশা (Occupation) */}
              <div className="space-y-1">
                <label className={`block text-xs font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পেশা (Occupation)
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
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ইমেইল
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* বিভাগ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  বিভাগ
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map(division => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
                <p className={`text-xs transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  বিভাগ নির্বাচন করার পর জেলা এবং উপজেলা নির্বাচন করতে পারবেন
                </p>
              </div>

              {/* জেলা */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  জেলা
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!formData.division}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${!formData.division ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {formData.division ? 'জেলা নির্বাচন করুন' : 'প্রথমে বিভাগ নির্বাচন করুন'}
                  </option>
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* উপজেলা */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  উপজেলা
                </label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {formData.district ? 'উপজেলা নির্বাচন করুন' : 'প্রথমে জেলা নির্বাচন করুন'}
                  </option>
                  {upazilas.map(upazila => (
                    <option key={upazila} value={upazila}>
                      {upazila}
                    </option>
                  ))}
                </select>
              </div>

              {/* পোস্ট কোড */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ঠিকানা - Full width */}
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ঠিকানা
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="বিস্তারিত ঠিকানা লিখুন..."
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* পাসপোর্ট তথ্য Section */}
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>পাসপোর্ট তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Passport Scan & Fill */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Passport Scan (optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="file" accept="image/*,.pdf" onChange={handlePassportScanFileChange} className="w-full sm:w-auto flex-1 border rounded-xl px-4 py-3" />
                  <button
                    type="button"
                    onClick={handleScanAndFill}
                    disabled={!passportScanFile || isScanning}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${
                      !passportScanFile || isScanning ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    title="Scan and auto-fill passport fields"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isScanning ? 'Scanning…' : 'Scan & Fill'}
                  </button>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>TODO: Integrate real OCR/MRZ service to parse fields from the uploaded image.</p>
              </div>

              {/* পাসপোর্ট নাম্বার */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পাসপোর্ট নাম্বার
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="A12345678"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* পাসপোর্ট টাইপ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পাসপোর্ট টাইপ
                </label>
                <select
                  name="passportType"
                  value={formData.passportType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="">পাসপোর্ট টাইপ নির্বাচন করুন</option>
                  <option value="Ordinary">Ordinary Passport (সাধারণ পাসপোর্ট)</option>
                  <option value="Official">Official Passport (সরাসরি সরকারি পাসপোর্ট)</option>
                  <option value="Diplomatic">Diplomatic Passport (কূটনৈতিক পাসপোর্ট)</option>
                </select>
              </div>

              {/* Last/Surname Name */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Last/Surname Name
                </label>
                <input
                  type="text"
                  name="passportLastName"
                  value={formData.passportLastName}
                  onChange={handleInputChange}
                  placeholder="Surname"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  First Name
                </label>
                <input
                  type="text"
                  name="passportFirstName"
                  value={formData.passportFirstName}
                  onChange={handleInputChange}
                  placeholder="Given Name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ইস্যু তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ইস্যু তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <DatePicker
                    selected={issueDate}
                    onChange={handleIssueDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="তারিখ নির্বাচন করুন"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    isClearable
                    popperClassName="react-datepicker-popper"
                  />
                </div>
              </div>

              {/* মেয়াদ শেষের তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  মেয়াদ শেষের তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <DatePicker
                    selected={expiryDate}
                    onChange={handleExpiryDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="তারিখ নির্বাচন করুন"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown
                    minDate={issueDate || new Date()}
                    isClearable
                    popperClassName="react-datepicker-popper"
                  />
                </div>
              </div>

              {/* জন্ম তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  জন্ম তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <DatePicker
                    selected={dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="তারিখ নির্বাচন করুন"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    maxDate={new Date()}
                    isClearable
                    popperClassName="react-datepicker-popper"
                  />
                </div>
              </div>

              {/* এনআইডি নাম্বার */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  এনআইডি নাম্বার
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="১২৩৪৫৬৭৮৯০"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  placeholder="e.g., Bangladeshi"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* NID/BRC No */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  NID/BRC No
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="NID or BRC No"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Previous Passport */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Previous Passport No
                </label>
                <input
                  type="text"
                  name="previousPassport"
                  value={formData.previousPassport}
                  onChange={handleInputChange}
                  placeholder="Old passport number"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
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
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Family Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Father's name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Mother Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Mother's name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Spouse Name</label>
                <input
                  type="text"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleInputChange}
                  placeholder="Spouse name (if applicable)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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

          {/* অতিরিক্ত তথ্য Section */}
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>অতিরিক্ত তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Type */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Service Type
                </label>
                <div className="flex gap-2">
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({ ...prev, serviceType: value, serviceStatus: '' }));
                    }}
                    disabled={serviceTypesLoading}
                    className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${serviceTypesLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="">{serviceTypesLoading ? 'Loading services...' : 'Select a service'}</option>
                    {serviceTypes.map((s) => {
                      const value = s?.id || s?.value || s?.slug || s;
                      const label = s?.name || s?.label || s?.title || s;
                      return (
                        <option key={String(value)} value={String(value)}>{String(label)}</option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddServiceType}
                    className={`px-3 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200`}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteServiceType}
                    className={`px-3 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Status (dependent) */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Status
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <select
                      name="serviceStatus"
                      value={formData.serviceStatus}
                      onChange={handleInputChange}
                      disabled={!formData.serviceType || serviceStatusesLoading}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${(!formData.serviceType || serviceStatusesLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <option value="">{serviceStatusesLoading ? 'Loading statuses...' : 'Select status'}</option>
                      {serviceStatuses.map((s) => {
                        const value = s?.id || s?.value || s?.slug || s;
                        const label = s?.name || s?.label || s?.title || s;
                        return (
                          <option key={String(value)} value={String(value)}>{String(label)}</option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddServiceStatus}
                      disabled={!formData.serviceType}
                      className={`px-3 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ${!formData.serviceType ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteServiceStatus}
                      disabled={!formData.serviceType || !formData.serviceStatus}
                      className={`px-3 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 ${(!formData.serviceType || !formData.serviceStatus) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Delete
                    </button>
                  </div>
                  {serviceStatusesLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                  )}
                </div>
              </div>
              {/* কাস্টমার ছবি */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  কাস্টমার ছবি
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 hover:border-purple-400' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}>
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className={`w-24 h-24 mx-auto rounded-lg object-cover border-2 transition-colors duration-300 ${
                          isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      />
                      
                      {/* Upload Status */}
                      {imageUploading && (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Cloudinary এ আপলোড হচ্ছে...</span>
                        </div>
                      )}
                      
                      {/* Cloudinary Link */}
                      {uploadedImageUrl && !imageUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs">Cloudinary এ আপলোড হয়েছে</span>
                          </div>
                          <a 
                            href={uploadedImageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-xs text-blue-600 hover:text-blue-800 underline block ${
                              isDark ? 'text-blue-400 hover:text-blue-300' : ''
                            }`}
                          >
                            Cloudinary লিংক দেখুন
                          </a>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        ছবি সরান
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className={`w-12 h-12 mx-auto transition-colors duration-300 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <label htmlFor="customerImage" className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            ছবি আপলোড করুন
                          </span>
                          <span className={`text-xs block mt-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            PNG, JPG, GIF (সর্বোচ্চ ৫MB)
                          </span>
                          <span className={`text-xs block mt-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Cloudinary এ আপলোড হবে
                          </span>
                        </label>
                        <input
                          id="customerImage"
                          type="file"
                          name="customerImage"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  স্ট্যাটাস
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }`}
                  >
                    <ToggleRight className="w-5 h-5" />
                    <span className="font-medium">Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                      !formData.isActive 
                        ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }`}
                  >
                    <ToggleLeft className="w-5 h-5" />
                    <span className="font-medium">Inactive</span>
                  </button>
                </div>
              </div>

              {/* Reference By */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Reference By
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="referenceBy"
                    value={formData.referenceBy}
                    onChange={handleInputChange}
                    placeholder="রেফারেন্সের নাম"
                    className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowReferenceSearchModal(true)}
                    className={`px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 ${
                      isDark ? 'hover:bg-blue-600' : ''
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {formData.referenceCustomerId && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✅ রেফারেন্স কাস্টমার লিংক করা হয়েছে
                  </p>
                )}
              </div>

              {/* নোট - Full width */}
              <div className="md:col-span-2 space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  নোট
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="কাস্টমার সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-green-700"
            >
              <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              কাস্টমার যুক্ত করুন
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
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
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                রেফারেন্স কাস্টমার খুঁজুন
              </h3>
              <button
                onClick={() => setShowReferenceSearchModal(false)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={referenceSearchTerm}
                  onChange={(e) => setReferenceSearchTerm(e.target.value)}
                  placeholder="নাম, মোবাইল নম্বর বা কাস্টমার আইডি দিয়ে খুঁজুন..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Search Results */}
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
                          <h4 className={`font-semibold transition-colors duration-300 ${
                            isDark ? 'text-white' : 'text-gray-800'
                          }`}>
                            {customer.name}
                          </h4>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {customer.mobile} • {customer.customerId}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {customer.customerType} • {customer.division}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectReferenceCustomer(customer);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                        >
                          নির্বাচন করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : referenceSearchTerm ? (
                <div className="text-center py-8">
                  <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    কোন কাস্টমার পাওয়া যায়নি
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    রেফারেন্স কাস্টমার খুঁজতে নাম, মোবাইল নম্বর বা কাস্টমার আইডি লিখুন
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer type management is now handled by CategoryManagement component */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-2xl shadow-2xl transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                কাস্টমার ধরন ব্যবস্থাপনা
              </h3>
              <button
                onClick={() => setShowAddCustomerTypeModal(false)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Add/Edit Type */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {editingCustomerType ? 'ধরন সম্পাদনা করুন' : 'নতুন ধরন যোগ করুন'}
                </h4>
                
                {/* Value Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Value (ইংরেজি) *
                  </label>
                  <input
                    type="text"
                    value={editingCustomerType ? editingCustomerType.value : newCustomerType.value}
                    onChange={(e) => {
                      if (editingCustomerType) {
                        setEditingCustomerType(prev => ({ ...prev, value: e.target.value }));
                      } else {
                        setNewCustomerType(prev => ({ ...prev, value: e.target.value }));
                      }
                    }}
                    placeholder="hajj, umrah, air"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Label Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Label (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={editingCustomerType ? editingCustomerType.label : newCustomerType.label}
                    onChange={(e) => {
                      if (editingCustomerType) {
                        setEditingCustomerType(prev => ({ ...prev, label: e.target.value }));
                      } else {
                        setNewCustomerType(prev => ({ ...prev, label: e.target.value }));
                      }
                    }}
                    placeholder="হাজ্জ, ওমরাহ, এয়ার"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Prefix Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Prefix (প্রিফিক্স) *
                  </label>
                  <input
                    type="text"
                    value={editingCustomerType ? editingCustomerType.prefix : newCustomerType.prefix}
                    onChange={(e) => {
                      if (editingCustomerType) {
                        setEditingCustomerType(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }));
                      } else {
                        setNewCustomerType(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }));
                      }
                    }}
                    placeholder="H, U, A"
                    maxLength="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    কাস্টমার আইডি জেনারেশনের জন্য (সর্বোচ্চ ৩ অক্ষর)
                  </p>
                </div>

                {/* Icon Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    আইকন
                  </label>
                  <select
                    value={editingCustomerType ? editingCustomerType.icon : newCustomerType.icon}
                    onChange={(e) => {
                      if (editingCustomerType) {
                        setEditingCustomerType(prev => ({ ...prev, icon: e.target.value }));
                      } else {
                        setNewCustomerType(prev => ({ ...prev, icon: e.target.value }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {availableIcons.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label} ({icon.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {editingCustomerType ? (
                    <>
                      <button
                        onClick={handleUpdateCustomerType}
                        disabled={!editingCustomerType.value || !editingCustomerType.label || !editingCustomerType.prefix}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          !editingCustomerType.value || !editingCustomerType.label || !editingCustomerType.prefix
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        আপডেট করুন
                      </button>
                      <button
                        onClick={() => setEditingCustomerType(null)}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
                      >
                        বাতিল
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddCustomerType}
                      disabled={!newCustomerType.value || !newCustomerType.label || !newCustomerType.prefix}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        !newCustomerType.value || !newCustomerType.label || !newCustomerType.prefix
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      যোগ করুন
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side - Manage Existing Types */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  বর্তমান ধরনসমূহ
                </h4>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customerTypesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">লোড হচ্ছে...</span>
                    </div>
                  ) : customerTypes.length > 0 ? (
                    customerTypes.map(type => {
                      const IconComponent = getIconComponent(type.icon);
                      return (
                        <div
                          key={type._id || type.value}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700 text-gray-200' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{type.label}</span>
                              <div className="flex gap-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {type.value}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isDark ? 'bg-blue-600 text-blue-200' : 'bg-blue-200 text-blue-600'
                                }`}>
                                  {type.prefix}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingCustomerType(type)}
                              className={`p-1.5 rounded-lg hover:bg-blue-100 transition-colors duration-200 ${
                                isDark ? 'hover:bg-blue-900' : 'hover:bg-blue-100'
                              }`}
                              title="সম্পাদনা করুন"
                            >
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomerType(type._id, type.value)}
                              className={`p-1.5 rounded-lg hover:bg-red-100 transition-colors duration-200 ${
                                isDark ? 'hover:bg-red-900' : 'hover:bg-red-100'
                              }`}
                              title="মুছে ফেলুন"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        কোন কাস্টমার ধরন পাওয়া যায়নি
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowAddCustomerTypeModal(false);
                  setEditingCustomerType(null);
                  setNewCustomerType({ value: '', label: '', icon: 'Home', prefix: '' });
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      
      </div>
    </>
  );
};

export default AddCustomer;