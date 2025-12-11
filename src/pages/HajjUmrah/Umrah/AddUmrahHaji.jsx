import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useCreateUmrah, useUpdateUmrah, useUmrah } from '../../../hooks/UseUmrahQuries';
import { usePackages } from '../../../hooks/usePackageQueries';
import { useAgents } from '../../../hooks/useAgentQueries';
import Swal from 'sweetalert2';
import divisionData from '../../../jsondata/AllDivision.json';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';

const toast = {
  success: (message) => console.log('Success:', message),
  error: (message) => console.log('Error:', message)
};

// Move subcomponents outside to prevent re-creation
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

const AddUmrahHaji = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passportUploading, setPassportUploading] = useState(false);
  const [passportPreview, setPassportPreview] = useState(null);
  const [nidUploading, setNidUploading] = useState(false);
  const [nidPreview, setNidPreview] = useState(null);
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(location.search);
  const umrahIdParam = urlParams.get('umrahId');
  const editMode = urlParams.get('edit') === 'true';
  
  const createUmrahMutation = useCreateUmrah();
  const updateUmrahMutation = useUpdateUmrah();
  
  // Fetch Umrah data for edit mode
  const { data: umrahData, isLoading: umrahLoading } = useUmrah(umrahIdParam);
  
  // Fetch real packages and agents from backend
  const { data: packagesResponse, isLoading: packagesLoading } = usePackages({ customPackageType: 'Custom Umrah', limit: 1000 });
  const { data: agentsResponse, isLoading: agentsLoading } = useAgents(1, 1000, '');
  
  // Combined loading state
  const isLoading = loading || createUmrahMutation.isPending || updateUmrahMutation.isPending || (editMode && umrahLoading) || packagesLoading || agentsLoading;
  const isSubmitting = loading || createUmrahMutation.isPending;

  
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    occupation: '',
    passport: '',
    passportNumber: '',
    passportType: '',
    issueDate: '',
    passportExpiry: '',
    expiryDate: '',
    nid: '',
    nidNumber: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    nationality: 'Bangladeshi',
    phone: '',
    mobile: '',
    whatsappNo: '',
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
    departureDate: '',
    returnDate: '',
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    previousHajj: false,
    previousUmrah: true,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null,
    // Additional Umrah-specific fields
    customerType: 'umrah',
    customerId: '',
    passportFirstName: '',
    passportLastName: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceType: 'umrah',
    serviceStatus: '',
    isActive: true,
    manualSerialNumber: ''
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

  // Populate form for edit mode using loaded Umrah data
  useEffect(() => {
    if (!editMode || !umrahData) return;
    const photoUrl = umrahData.photo || umrahData.photoUrl || '';
    const passportUrl = umrahData.passportCopy || umrahData.passportCopyUrl || '';
    const nidUrl = umrahData.nidCopy || umrahData.nidCopyUrl || '';
    
    setFormData(prev => ({
      ...prev,
      name: umrahData.name || '',
      firstName: umrahData.firstName || '',
      lastName: umrahData.lastName || '',
      fatherName: umrahData.fatherName || '',
      motherName: umrahData.motherName || '',
      spouseName: umrahData.spouseName || '',
      occupation: umrahData.occupation || '',
      passportNumber: umrahData.passportNumber || '',
      passport: umrahData.passportNumber || '',
      passportType: umrahData.passportType || '',
      issueDate: umrahData.issueDate || '',
      expiryDate: umrahData.expiryDate || '',
      passportExpiry: umrahData.expiryDate || '',
      nidNumber: umrahData.nidNumber || '',
      nid: umrahData.nidNumber || '',
      dateOfBirth: umrahData.dateOfBirth || '',
      gender: umrahData.gender || 'male',
      maritalStatus: umrahData.maritalStatus || 'single',
      nationality: umrahData.nationality || 'Bangladeshi',
      phone: umrahData.mobile || '',
      mobile: umrahData.mobile || '',
      whatsappNo: umrahData.whatsappNo || '',
      email: umrahData.email || '',
      address: umrahData.address || '',
      division: umrahData.division || '',
      district: umrahData.district || '',
      upazila: umrahData.upazila || '',
      area: umrahData.area || '',
      postCode: umrahData.postCode || '',
      emergencyContact: umrahData.emergencyContact || '',
      emergencyPhone: umrahData.emergencyPhone || '',
      packageId: umrahData.packageId || '',
      agentId: umrahData.agentId || '',
      departureDate: umrahData.departureDate || '',
      returnDate: umrahData.returnDate || '',
      totalAmount: umrahData.totalAmount ?? 0,
      paidAmount: umrahData.paidAmount ?? 0,
      paymentMethod: umrahData.paymentMethod || 'cash',
      paymentStatus: umrahData.paymentStatus || 'pending',
      previousHajj: !!umrahData.previousHajj,
      previousUmrah: !!umrahData.previousUmrah,
      specialRequirements: umrahData.specialRequirements || '',
      notes: umrahData.notes || '',
      // Preserve business/customer ID; don't overwrite with Mongo _id
      customerId: umrahData.customerId || '',
      passportFirstName: umrahData.passportFirstName || '',
      passportLastName: umrahData.passportLastName || '',
      referenceBy: umrahData.referenceBy || '',
      referenceCustomerId: umrahData.referenceCustomerId || '',
      serviceType: 'umrah',
      serviceStatus: umrahData.serviceStatus || '',
      isActive: umrahData.status ? umrahData.status === 'active' : true,
      manualSerialNumber: umrahData.manualSerialNumber || '',
      photo: photoUrl,
      passportCopy: passportUrl,
      nidCopy: nidUrl
    }));
    
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
    setNameManuallyEdited(false);
  }, [editMode, umrahData]);

  // Load packages from backend
  useEffect(() => {
    const list = packagesResponse?.data || packagesResponse?.packages || [];
    if (Array.isArray(list)) {
      const normalized = list.map(p => ({
        id: p._id || p.id || p.packageId,
        name: p.packageName || p.name,
        price: p.totalPriceBdt ?? p.totals?.grandTotal ?? p.totals?.subtotal ?? p.price ?? 0,
        type: p.type || p.customPackageType || 'umrah'
      })).filter(opt => opt.id && opt.name);
      setPackages(normalized);
    }
  }, [packagesResponse]);

  // Load agents from backend
  useEffect(() => {
    const list = agentsResponse?.data || agentsResponse?.agents || [];
    if (Array.isArray(list)) {
      const normalized = list.map(a => ({
        id: a._id || a.id || a.agentId,
        name: a.tradeName || a.name,
        phone: a.contactNo || a.phone || ''
      })).filter(opt => opt.id && opt.name);
      setAgents(normalized);
    }
  }, [agentsResponse]);


  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    if (name === 'name') {
      setNameManuallyEdited(true);
      setFormData(prev => ({
        ...prev,
        name: nextValue
      }));
      return;
    }

    if (name === 'firstName' || name === 'lastName') {
      setFormData(prev => {
        const updated = { ...prev, [name]: nextValue };
        const composedFirst = (name === 'firstName' ? nextValue : updated.firstName || '').trim();
        const composedLast = (name === 'lastName' ? nextValue : updated.lastName || '').trim();
        const composedFull = `${composedFirst} ${composedLast}`.trim();
        if (!nameManuallyEdited || !prev.name?.trim()) {
          updated.name = composedFull;
        }
        return updated;
      });
      return;
    }

    if (name === 'division') {
      setFormData(prev => ({
        ...prev,
        division: nextValue,
        district: '',
        upazila: '',
        area: ''
      }));
      return;
    }

    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        district: nextValue,
        upazila: '',
        area: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
  }, [nameManuallyEdited]);

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
      cloudinaryFormData.append('folder', 'umrah-photos');

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
      cloudinaryFormData.append('folder', 'umrah-documents/passport');

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
      cloudinaryFormData.append('folder', 'umrah-documents/nid');

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
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        Swal.fire({
          title: 'Validation Error',
          text: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
        });
        return false;
      }
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
      return false;
    }
    if (Number(formData.paidAmount) > Number(formData.totalAmount)) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Paid amount cannot be greater than total amount',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: editMode ? 'Confirm Update' : 'Confirm Umrah Registration',
      text: editMode
        ? `Are you sure you want to update ${formData.name}'s Umrah information?`
        : `Are you sure you want to register ${formData.name} for Umrah?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: editMode ? 'Yes, Update' : 'Yes, Register',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
    });
    
    if (!result.isConfirmed) return;
    
    setLoading(true);
    
    try {
      // Prepare the data for API submission
      const umrahData = {
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        manualSerialNumber: formData.manualSerialNumber,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        spouseName: formData.spouseName,
        occupation: formData.occupation,
        passportNumber: formData.passport || formData.passportNumber,
        passportType: formData.passportType,
        issueDate: formData.issueDate,
        expiryDate: formData.passportExpiry || formData.expiryDate,
        nidNumber: formData.nid || formData.nidNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        mobile: formData.phone || formData.mobile,
        whatsappNo: formData.whatsappNo,
        email: formData.email,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        area: formData.area,
        postCode: formData.postCode,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        packageId: formData.packageId,
        agentId: formData.agentId,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        totalAmount: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        previousHajj: formData.previousHajj,
        previousUmrah: formData.previousUmrah,
        specialRequirements: formData.specialRequirements,
        notes: formData.notes,
        customerType: 'umrah',
        customerId: formData.customerId,
        passportFirstName: formData.passportFirstName,
        passportLastName: formData.passportLastName,
        referenceBy: formData.referenceBy,
        referenceCustomerId: formData.referenceCustomerId,
        serviceType: 'umrah',
        serviceStatus: formData.serviceStatus,
        isActive: formData.isActive,
        // Documents (Cloudinary URLs)
        photo: formData.photo || undefined,
        photoUrl: formData.photo || undefined,
        passportCopy: formData.passportCopy || undefined,
        passportCopyUrl: formData.passportCopy || undefined,
        nidCopy: formData.nidCopy || undefined,
        nidCopyUrl: formData.nidCopy || undefined
      };

      if (editMode) {
        await updateUmrahMutation.mutateAsync({ id: umrahIdParam, updates: umrahData });
        navigate(`/hajj-umrah/haji/${umrahIdParam}?type=umrah`);
      } else {
        await createUmrahMutation.mutateAsync(umrahData);
        navigate('/umrah/haji-list');
      }
      
    } catch (error) {
      console.error('Error creating Umrah haji:', error);
      // Error is handled by the mutation's onError callback
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/umrah/haji-list')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editMode ? 'Edit Umrah Haji' : 'Add New Umrah Haji'}</h1>
            <p className="text-gray-600 dark:text-gray-400">{editMode ? 'Update Umrah pilgrim information' : 'Register a new Haji for Umrah'}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'Saving...' : editMode ? 'Update Umrah Haji' : 'Save Umrah Haji'}</span>
        </button>
      </div>

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
              label="Passport Number" 
              name="passport" 
              value={formData.passport}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Passport Expiry Date" 
              name="passportExpiry" 
              type="date" 
              value={formData.passportExpiry}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="NID Number" 
              name="nid" 
              value={formData.nid}
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
            <SelectGroup 
              label="উমরাহ্‌ হাজ্বীর স্ট্যাটাস" 
              name="serviceStatus" 
              value={formData.serviceStatus}
              onChange={handleInputChange}
              options={[
                { value: 'পাসপোর্ট রেডি নয়', label: 'পাসপোর্ট রেডি নয়' },
                { value: 'পাসপোর্ট রেডি', label: 'পাসপোর্ট রেডি' },
                { value: 'প্যাকেজ যুক্ত', label: 'প্যাকেজ যুক্ত' },
                { value: 'রেডি ফর উমরাহ্‌', label: 'রেডি ফর উমরাহ্‌' },
                { value: 'উমরাহ্‌ সম্পন্ন', label: 'উমরাহ্‌ সম্পন্ন' },
                { value: 'রিফান্ডেড', label: 'রিফান্ডেড' },
                { value: 'অন্যান্য', label: 'অন্যান্য' },
              ]}
            />
          </div>
        </FormSection>

        <FormSection title="Contact Information" icon={Phone}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Phone Number" 
              name="phone" 
              type="tel" 
              value={formData.phone}
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
              disabled={!formData.division}
            />
            <SelectGroup 
              label="Upazila" 
              name="upazila" 
              value={formData.upazila}
              onChange={handleInputChange}
              options={upazilaOptions}
              disabled={!formData.district}
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

      {/* Extra Save Button after Document Upload */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isSubmitting ? 'Saving...' : editMode ? 'Update Umrah Haji' : 'Save Umrah Haji'}</span>
        </button>
      </div>
    </div>
  );
};

export default AddUmrahHaji;


