import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Calendar,
  Package,
  Building,
  FileText,
  Upload,
  X,
  Search,
  CheckCircle,
  Users,
  Wand2,
  Edit3,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUpdateHaji, useHaji } from '../../../hooks/UseHajiQueries';
import Swal from 'sweetalert2';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';
import useLicenseQueries from '../../../hooks/useLicenseQueries';
import divisionData from '../../../jsondata/AllDivision.json';

// Reusable components
const FormSection = memo(({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center space-x-3 mb-6">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
));

const InputGroup = memo(({ label, name, type = 'text', required = false, value, onChange, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
      {...props}
    />
  </div>
));

const SelectGroup = memo(({ label, name, options = [], required = false, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.id || option.value} value={option.id || option.value}>
          {option.name || option.label}
        </option>
      ))}
    </select>
  </div>
));

const FileUploadGroup = memo(({ label, name, accept, required = false, value, onFileChange, onRemoveFile, preview, uploading }) => {
  const isImage = preview || (value && typeof value === 'string' && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (value.startsWith('http') && !value.match(/\.pdf(\?|$)/i))));
  const isPdf = value && typeof value === 'string' && (value.match(/\.pdf(\?|$)/i) || (value.includes('pdf') && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)));
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading to Cloudinary...</span>
          </div>
        ) : isImage ? (
          <div className="flex flex-col items-center space-y-3">
            <img 
              src={preview || value} 
              alt={label}
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={onRemoveFile}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove {label}</span>
            </button>
          </div>
        ) : isPdf || (value && typeof value === 'string') ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label} Uploaded
                </span>
                {isPdf && (
                  <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View PDF
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove {label}</span>
            </button>
          </div>
        ) : value && value.name ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">
                {value.name}
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label htmlFor={`file-${name}`} className="block text-center cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <input
              id={`file-${name}`}
              type="file"
              accept={accept}
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
});

const EditHaji = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passportUploading, setPassportUploading] = useState(false);
  const [passportPreview, setPassportPreview] = useState(null);
  const [nidUploading, setNidUploading] = useState(false);
  const [nidPreview, setNidPreview] = useState(null);
  
  const updateHajiMutation = useUpdateHaji();
  
  // Fetch Haji data for edit mode
  const { data: hajiData, isLoading: hajiLoading, error: hajiError } = useHaji(id);
  
  // Fetch licenses from backend
  const { useLicenses } = useLicenseQueries();
  const { data: licensesResponse, isLoading: licensesLoading } = useLicenses();
  
  // Combined loading state
  const isLoading = loading || updateHajiMutation.isPending || hajiLoading || licensesLoading;
  
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    passport: '',
    passportExpiry: '',
    nid: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    mobile: '',
    phone: '',
    email: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    area: '',
    postCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    packageId: '',
    agentId: '',
    licenseId: '',
    departureDate: '',
    returnDate: '',
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    previousHajj: false,
    previousUmrah: false,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null,
    // Additional Haji-specific fields
    whatsappNo: '',
    passportNumber: '',
    passportType: 'ordinary',
    issueDate: '',
    expiryDate: '',
    nidNumber: '',
    nationality: 'Bangladeshi',
    spouseName: '',
    occupation: '',
    referenceBy: '',
    referenceHajiId: '',
    serviceType: 'hajj',
    serviceStatus: 'আনপেইড',
    isActive: true,
    // Package/agent meta
    packageName: '',
    packageType: 'hajj',
    agent: '',
    agentContact: '',
    manualSerialNumber: '',
    pidNo: '',
    ngSerialNo: '',
    trackingNo: ''
  });

  // Location options derived from AllDivision.json
  const divisionOptions = useMemo(
    () => (divisionData?.Bangladesh || []).map((d) => ({ value: d.Division, label: d.Division })),
    []
  );

  const districtOptions = useMemo(() => {
    const division = (divisionData?.Bangladesh || []).find((d) => d.Division === formData.division);
    return (division?.Districts || []).map((d) => ({ value: d.District, label: d.District }));
  }, [formData.division]);

  const upazilaOptions = useMemo(() => {
    const division = (divisionData?.Bangladesh || []).find((d) => d.Division === formData.division);
    const district = (division?.Districts || []).find((dist) => dist.District === formData.district);
    return (district?.Upazilas || []).map((u) => ({ value: u, label: u }));
  }, [formData.division, formData.district]);

  // Load Haji data for edit mode
  useEffect(() => {
    if (hajiData) {
      // Populate form with Haji data
      const photoUrl = hajiData.photo || hajiData.photoUrl || '';
      const passportUrl = hajiData.passportCopy || hajiData.passportCopyUrl || '';
      const nidUrl = hajiData.nidCopy || hajiData.nidCopyUrl || '';
      
      setFormData({
        name: hajiData.name || '',
        firstName: hajiData.firstName || '',
        lastName: hajiData.lastName || '',
        mobile: hajiData.mobile || '',
        email: hajiData.email || '',
        whatsappNo: hajiData.whatsappNo || '',
        address: hajiData.address || '',
        division: hajiData.division || '',
        district: hajiData.district || '',
        upazila: hajiData.upazila || '',
        area: hajiData.area || '',
        postCode: hajiData.postCode || '',
        passportNumber: hajiData.passportNumber || '',
        passportType: hajiData.passportType || '',
        issueDate: hajiData.issueDate || '',
        expiryDate: hajiData.expiryDate || '',
        dateOfBirth: hajiData.dateOfBirth || '',
        gender: hajiData.gender || '',
        maritalStatus: hajiData.maritalStatus || '',
        nationality: hajiData.nationality || '',
        occupation: hajiData.occupation || '',
        fatherName: hajiData.fatherName || '',
        motherName: hajiData.motherName || '',
        spouseName: hajiData.spouseName || '',
        nidNumber: hajiData.nidNumber || '',
        passportFirstName: hajiData.passportFirstName || '',
        passportLastName: hajiData.passportLastName || '',
        emergencyContact: hajiData.emergencyContact || '',
        emergencyPhone: hajiData.emergencyPhone || '',
        packageName: hajiData.packageName || '',
        packageType: hajiData.packageType || '',
        agent: hajiData.agent || '',
        agentContact: hajiData.agentContact || '',
        packageId: hajiData.packageId || hajiData.package?._id || hajiData.package?.id || '',
        agentId: hajiData.agentId || hajiData.agent?._id || hajiData.agent?.id || '',
        licenseId: hajiData.licenseId || hajiData.license?._id || hajiData.license?.id || '',
        departureDate: hajiData.departureDate || '',
        returnDate: hajiData.returnDate || '',
        previousHajj: hajiData.previousHajj || false,
        previousUmrah: hajiData.previousUmrah || false,
        specialRequirements: hajiData.specialRequirements || '',
        totalAmount: hajiData.totalAmount || 0,
        paidAmount: hajiData.paidAmount || 0,
        paymentMethod: hajiData.paymentMethod || '',
        paymentStatus: hajiData.paymentStatus || 'pending',
        status: hajiData.status || 'active',
        referenceBy: hajiData.referenceBy || '',
        referenceHajiId: hajiData.referenceHajiId || '',
        serviceStatus: hajiData.serviceStatus || '',
        notes: hajiData.notes || '',
        manualSerialNumber: hajiData.manualSerialNumber || '',
        pidNo: hajiData.pidNo || '',
        ngSerialNo: hajiData.ngSerialNo || '',
        trackingNo: hajiData.trackingNo || '',
        photo: photoUrl,
        passportCopy: passportUrl,
        nidCopy: nidUrl
      });
      
      // Set previews if URLs exist
      if (photoUrl) {
        setPhotoPreview(photoUrl);
      }
      if (passportUrl) {
        // Only set preview if it's an image
        if (passportUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || passportUrl.startsWith('http')) {
          setPassportPreview(passportUrl);
        }
      }
      if (nidUrl) {
        // Only set preview if it's an image
        if (nidUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || nidUrl.startsWith('http')) {
          setNidPreview(nidUrl);
        }
      }
    }
  }, [hajiData]);

  useEffect(() => {
    const mockPackages = [
      { id: 'P001', name: 'Premium Hajj 2024', price: 450000, type: 'hajj' },
      { id: 'P002', name: 'Standard Hajj 2024', price: 350000, type: 'hajj' }
    ];

    const mockAgents = [
      { id: 'A001', name: 'Al-Hijrah Travels', phone: '+8801712345678' },
      { id: 'A002', name: 'Madina Tours', phone: '+8801712345679' },
      { id: 'A003', name: 'Mecca Travels', phone: '+8801712345680' }
    ];

    setPackages(mockPackages);
    setAgents(mockAgents);
  }, []);

  // Load licenses from backend
  useEffect(() => {
    if (licensesResponse) {
      const list = Array.isArray(licensesResponse) ? licensesResponse : licensesResponse?.data || [];
      const normalized = list.map(l => ({
        id: l._id || l.id,
        name: `${l.licenseNumber || ''} - ${l.licenseName || ''}`.trim(),
        licenseNumber: l.licenseNumber || '',
        licenseName: l.licenseName || ''
      })).filter(opt => opt.id && opt.name);
      setLicenses(normalized);
    }
  }, [licensesResponse]);


  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updates = { [name]: nextValue };
      
      // Reset district and upazila when division changes
      if (name === 'division') {
        updates.district = '';
        updates.upazila = '';
      }
      
      // Reset upazila when district changes
      if (name === 'district') {
        updates.upazila = '';
      }
      
      return {
        ...prev,
        ...updates
      };
    });
  }, []);

  const handleFileUpload = useCallback((fieldName) => (e) => {
    const file = e.target.files[0];
    if (file) {
      // Upload to Cloudinary for photo, passport, and nid
      if (fieldName === 'photo') {
        uploadPhotoToCloudinary(file);
      } else if (fieldName === 'passportCopy') {
        uploadPassportToCloudinary(file);
      } else if (fieldName === 'nidCopy') {
        uploadNidToCloudinary(file);
      } else {
        // For other files, store directly
        setFormData(prev => ({
          ...prev,
          [fieldName]: file
        }));
      }
    }
  }, []);

  // Cloudinary Upload Function for Photo
  const uploadPhotoToCloudinary = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      setPhotoUploading(true);

      if (!file || !file.type.startsWith('image/')) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Please select a valid image file',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'File size must be less than 5MB',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'hajj-photos');

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

      // Update form data with Cloudinary URL
      setFormData(prev => ({
        ...prev,
        photo: imageUrl
      }));

      Swal.fire({
        title: 'সফল!',
        text: 'ছবি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  // Cloudinary Upload Function for Passport
  const uploadPassportToCloudinary = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      setPassportUploading(true);

      if (!file) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Please select a valid file',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'File size must be less than 5MB',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPassportPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }

      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'hajj-documents/passport');

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
      const fileUrl = result.secure_url;

      // Update form data with Cloudinary URL
      setFormData(prev => ({
        ...prev,
        passportCopy: fileUrl
      }));

      Swal.fire({
        title: 'সফল!',
        text: 'পাসপোর্ট কপি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setPassportPreview(null);
    } finally {
      setPassportUploading(false);
    }
  }, []);

  // Cloudinary Upload Function for NID
  const uploadNidToCloudinary = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      setNidUploading(true);

      if (!file) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'Please select a valid file',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'File size must be less than 5MB',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNidPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }

      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'hajj-documents/nid');

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
      const fileUrl = result.secure_url;

      // Update form data with Cloudinary URL
      setFormData(prev => ({
        ...prev,
        nidCopy: fileUrl
      }));

      Swal.fire({
        title: 'সফল!',
        text: 'NID কপি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setNidPreview(null);
    } finally {
      setNidUploading(false);
    }
  }, []);

  const removeFile = useCallback((fieldName) => () => {
    if (fieldName === 'photo') {
      setPhotoPreview(null);
    } else if (fieldName === 'passportCopy') {
      setPassportPreview(null);
    } else if (fieldName === 'nidCopy') {
      setNidPreview(null);
    }
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  const handlePackageChange = useCallback((e) => {
    const packageId = e.target.value;
    const selectedPackage = packages.find(p => p.id === packageId);
    setFormData(prev => ({
      ...prev,
      packageId,
      totalAmount: selectedPackage ? selectedPackage.price : 0
    }));
  }, [packages]);

  const validateForm = () => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      Swal.fire({
        title: 'ভ্যালিডেশন ত্রুটি',
        text: 'নাম আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return false;
    }

    if (!formData.mobile || !formData.mobile.trim()) {
      Swal.fire({
        title: 'ভ্যালিডেশন ত্রুটি',
        text: 'মোবাইল নম্বর আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return false;
    }

    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Swal.fire({
        title: 'ভ্যালিডেশন ত্রুটি',
        text: 'সঠিক ইমেইল ঠিকানা দিন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const computedName = (formData.name && formData.name.trim())
        ? formData.name.trim()
        : `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      // Prepare Haji payload for API
      const hajiPayload = {
        // Personal
        name: computedName,
        firstName: formData.firstName || formData.name.split(' ')[0] || '',
        lastName: formData.lastName || formData.name.split(' ').slice(1).join(' ') || '',
        manualSerialNumber: formData.manualSerialNumber,
        pidNo: formData.pidNo,
        ngSerialNo: formData.ngSerialNo,
        trackingNo: formData.trackingNo,
        mobile: formData.mobile || formData.phone,
        phone: formData.mobile || formData.phone,
        whatsappNo: formData.whatsappNo,
        email: formData.email,
        occupation: formData.occupation,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        area: formData.area,
        postCode: formData.postCode,

        // Passport/NID and dates (hooks validate YYYY-MM-DD)
        passportNumber: formData.passportNumber || formData.passport,
        passportType: formData.passportType || 'ordinary',
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        dateOfBirth: formData.dateOfBirth,
        nidNumber: formData.nidNumber || formData.nid,
        nationality: formData.nationality,
        gender: formData.gender,

        // Family
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        spouseName: formData.spouseName,
        maritalStatus: formData.maritalStatus,

        // Service and status
        serviceType: 'hajj',
        serviceStatus: formData.serviceStatus,
        isActive: formData.isActive,
        notes: formData.notes,
        referenceBy: formData.referenceBy,
        referenceHajiId: formData.referenceHajiId,

        // Financial
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,

        // Haji-specific journey
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        previousHajj: formData.previousHajj,
        previousUmrah: formData.previousUmrah,
        specialRequirements: formData.specialRequirements,

        // Package/agent meta
        packageId: formData.packageId,
        agentId: formData.agentId,
        licenseId: formData.licenseId,
        packageInfo: {
          packageName: packages.find(p => p.id === formData.packageId)?.name || '',
          packageType: 'hajj',
          agent: agents.find(a => a.id === formData.agentId)?.name || '',
          agentContact: agents.find(a => a.id === formData.agentId)?.phone || ''
        },

        // Documents (Cloudinary URLs)
        photo: formData.photo || undefined,
        photoUrl: formData.photo || undefined,
        passportCopy: formData.passportCopy || undefined,
        passportCopyUrl: formData.passportCopy || undefined,
        nidCopy: formData.nidCopy || undefined,
        nidCopyUrl: formData.nidCopy || undefined
      };

      const result = await updateHajiMutation.mutateAsync({ id, updates: hajiPayload });
      const updated = result?.data || {};
      navigate(`/hajj-umrah/haji/${id}`);
      return;
    } catch (error) {
      console.error('Error updating Haji:', error);
      // Error handling is already done in the mutation hooks
      // This catch block is for any additional error handling if needed
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (hajiError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Haji</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hajiError?.message || 'Failed to load Haji information'}
            </p>
            <button
              onClick={() => navigate('/hajj-umrah/haji-list')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
       <Helmet>
              <title>Edit Haji</title>
              <meta name="description" content="Edit existing Haji information." />
            </Helmet>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/hajj-umrah/haji-list')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Haji Information
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update pilgrim information for Hajj
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/hajj-umrah/haji/${id}`)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Updating...' : 'Update Haji'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {hajiLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">Loading Haji data...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!hajiLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormSection title="Personal Information" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputGroup 
                    label="Manual Serial Number" 
                    name="manualSerialNumber" 
                    value={formData.manualSerialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter manual serial number"
                  />
                  <InputGroup 
                    label="Full Name" 
                    name="name" 
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="First Name" 
                    name="firstName" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Last Name" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Father's Name" 
                    name="fatherName" 
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Mother's Name" 
                    name="motherName" 
                    value={formData.motherName}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Spouse Name" 
                    name="spouseName" 
                    value={formData.spouseName}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Occupation" 
                    name="occupation" 
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Date of Birth" 
                    name="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  <SelectGroup 
                    label="Gender" 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' }
                    ]} 
                  />
                  <SelectGroup 
                    label="Marital Status" 
                    name="maritalStatus" 
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'divorced', label: 'Divorced' },
                      { value: 'widowed', label: 'Widowed' }
                    ]} 
                  />
                  <InputGroup 
                    label="Nationality" 
                    name="nationality" 
                    value={formData.nationality}
                    onChange={handleInputChange}
                  />
                  <SelectGroup
                    label="Haji Status"
                    name="serviceStatus"
                    value={formData.serviceStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: 'আনপেইড', label: 'আনপেইড' },
                      { value: 'প্রাক-নিবন্ধিত', label: 'প্রাক-নিবন্ধিত' },
                      { value: 'নিবন্ধিত', label: 'নিবন্ধিত' },
                      { value: 'হজ্ব সম্পন্ন', label: 'হজ্ব সম্পন্ন' },
                      { value: 'আর্কাইভ', label: 'আর্কাইভ' },
                      { value: 'রেডি রিপ্লেস', label: 'রেডি রিপ্লেস' },
                      { value: 'রিফান্ডেড', label: 'রিফান্ডেড' },
                      { value: 'অন্যান্য', label: 'অন্যান্য' }
                    ]}
                  />
                </div>
              </FormSection>

              <FormSection title="Passport Information" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputGroup 
                    label="Passport Number" 
                    name="passportNumber" 
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Passport Type" 
                    name="passportType" 
                    value={formData.passportType || 'ordinary'}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Issue Date" 
                    name="issueDate" 
                    type="date" 
                    value={formData.issueDate}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Expiry Date" 
                    name="expiryDate" 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="NID Number" 
                    name="nidNumber" 
                    value={formData.nidNumber}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="PID No" 
                    name="pidNo" 
                    value={formData.pidNo}
                    onChange={handleInputChange}
                    placeholder="Enter PID Number"
                  />
                  <InputGroup 
                    label="NG Serial No" 
                    name="ngSerialNo" 
                    value={formData.ngSerialNo}
                    onChange={handleInputChange}
                    placeholder="Enter NG Serial Number"
                  />
                  <InputGroup 
                    label="Tracking No" 
                    name="trackingNo" 
                    value={formData.trackingNo}
                    onChange={handleInputChange}
                    placeholder="Enter Tracking Number (Check from PRP)"
                  />
                </div>
              </FormSection>

              <FormSection title="Contact Information" icon={Phone}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup 
                    label="Mobile Number" 
                    name="mobile" 
                    type="tel" 
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="WhatsApp Number" 
                    name="whatsappNo" 
                    type="tel" 
                    value={formData.whatsappNo}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <div className="md:col-span-2">
                    <InputGroup 
                      label="Address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <SelectGroup 
                    label="Division" 
                    name="division" 
                    value={formData.division}
                    onChange={handleInputChange}
                    options={divisionOptions} 
                  />
                  <SelectGroup 
                    label="District" 
                    name="district" 
                    value={formData.district}
                    onChange={handleInputChange}
                    options={districtOptions}
                  />
                  <SelectGroup 
                    label="Upazila" 
                    name="upazila" 
                    value={formData.upazila}
                    onChange={handleInputChange}
                    options={upazilaOptions}
                  />
                  <InputGroup 
                    label="Area" 
                    name="area" 
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Post Code" 
                    name="postCode" 
                    value={formData.postCode}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Emergency Contact Name" 
                    name="emergencyContact" 
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Emergency Contact Phone" 
                    name="emergencyPhone" 
                    type="tel" 
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </FormSection>

              <FormSection title="Package Information" icon={Package}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectGroup 
                    label="Package" 
                    name="packageId" 
                    value={formData.packageId}
                    options={packages}
                    onChange={handlePackageChange}
                  />
                  <SelectGroup 
                    label="Agent" 
                    name="agentId" 
                    value={formData.agentId}
                    options={agents}
                    onChange={handleInputChange}
                  />
                  <SelectGroup 
                    label="License" 
                    name="licenseId" 
                    value={formData.licenseId}
                    options={licenses}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Departure Date" 
                    name="departureDate" 
                    type="date" 
                    value={formData.departureDate}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Return Date" 
                    name="returnDate" 
                    type="date" 
                    value={formData.returnDate}
                    onChange={handleInputChange}
                  />
                </div>
              </FormSection>

              <FormSection title="Financial Information" icon={CreditCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputGroup 
                    label="Total Amount" 
                    name="totalAmount" 
                    type="number" 
                    readOnly 
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Paid Amount" 
                    name="paidAmount" 
                    type="number" 
                    min="0"
                    max={formData.totalAmount}
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                  />
                  <SelectGroup 
                    label="Payment Method" 
                    name="paymentMethod" 
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'mobile_banking', label: 'Mobile Banking' },
                      { value: 'check', label: 'Check' }
                    ]} 
                  />
                  <SelectGroup 
                    label="Payment Status" 
                    name="paymentStatus" 
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'partial', label: 'Partial' },
                      { value: 'paid', label: 'Paid' }
                    ]} 
                  />
                </div>
              </FormSection>

              <FormSection title="Additional Information" icon={FileText}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="previousHajj"
                        checked={formData.previousHajj}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Previous Hajj Experience</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="previousUmrah"
                        checked={formData.previousUmrah}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Previous Umrah Experience</span>
                    </label>
                  </div>
                  <InputGroup 
                    label="Special Requirements" 
                    name="specialRequirements" 
                    placeholder="Any special dietary, medical, or other requirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Additional notes or comments"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Document Upload" icon={Upload}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FileUploadGroup
                    label="Passport Copy"
                    name="passportCopy"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={formData.passportCopy}
                    onFileChange={handleFileUpload('passportCopy')}
                    onRemoveFile={removeFile('passportCopy')}
                    preview={passportPreview}
                    uploading={passportUploading}
                  />
                  <FileUploadGroup
                    label="NID Copy"
                    name="nidCopy"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={formData.nidCopy}
                    onFileChange={handleFileUpload('nidCopy')}
                    onRemoveFile={removeFile('nidCopy')}
                    preview={nidPreview}
                    uploading={nidUploading}
                  />
                  <FileUploadGroup
                    label="Photo"
                    name="photo"
                    accept=".jpg,.jpeg,.png"
                    value={formData.photo}
                    onFileChange={handleFileUpload('photo')}
                    onRemoveFile={removeFile('photo')}
                    preview={photoPreview}
                    uploading={photoUploading}
                  />
                </div>
              </FormSection>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHaji;