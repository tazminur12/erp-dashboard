import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Edit3,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUpdateUmrah, useUmrah } from '../../../hooks/UseUmrahQuries';
import { usePackages } from '../../../hooks/usePackageQueries';
import { useAgents } from '../../../hooks/useAgentQueries';
import Swal from 'sweetalert2';

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

const FileUploadGroup = memo(({ label, name, accept, required = false, value, onFileChange, onRemoveFile }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
      {value ? (
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
));

const EditUmrahHaji = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  
  const updateUmrahMutation = useUpdateUmrah();
  
  // Fetch Umrah data for edit mode
  const { data: umrahData, isLoading: umrahLoading, error: umrahError } = useUmrah(id);
  
  // Fetch packages and agents from backend
  const { data: packagesResponse, isLoading: packagesLoading } = usePackages({ customPackageType: 'Custom Umrah', limit: 1000 });
  const { data: agentsResponse, isLoading: agentsLoading } = useAgents(1, 1000, '');
  
  // Combined loading state
  const isLoading = loading || updateUmrahMutation.isPending || umrahLoading || packagesLoading || agentsLoading;

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
    previousUmrah: false,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null,
    customerType: 'umrah',
    customerId: '',
    passportFirstName: '',
    passportLastName: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceType: 'umrah',
    serviceStatus: '',
    isActive: true
  });

  // Load Umrah data for edit mode
  useEffect(() => {
    if (umrahData) {
      setFormData({
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
        customerId: umrahData._id || umrahData.customerId || '',
        passportFirstName: umrahData.passportFirstName || '',
        passportLastName: umrahData.passportLastName || '',
        referenceBy: umrahData.referenceBy || '',
        referenceCustomerId: umrahData.referenceCustomerId || '',
        serviceType: 'umrah',
        serviceStatus: umrahData.serviceStatus || '',
        isActive: umrahData.status ? umrahData.status === 'active' : true
      });
    }
  }, [umrahData]);

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
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
  }, []);

  const handleFileUpload = useCallback((fieldName) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  }, []);

  const removeFile = useCallback((fieldName) => () => {
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
      const umrahPayload = {
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
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
        passportCopy: formData.passportCopy,
        nidCopy: formData.nidCopy,
        photo: formData.photo
      };

      await updateUmrahMutation.mutateAsync({ id, updates: umrahPayload });
      navigate(`/umrah/haji/${id}`);
    } catch (error) {
      console.error('Error updating Umrah haji:', error);
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (umrahError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Umrah Haji</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {umrahError?.message || 'Failed to load Umrah information'}
            </p>
            <button
              onClick={() => navigate('/umrah/haji-list')}
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/umrah/haji-list')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Edit3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Umrah Haji Information
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update pilgrim information for Umrah
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/umrah/haji/${id}`)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Updating...' : 'Update Umrah Haji'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {umrahLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              <span className="text-green-700 dark:text-green-300 font-medium">Loading Umrah Haji data...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!umrahLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormSection title="Personal Information" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    options={[
                      { value: 'Dhaka', label: 'Dhaka' },
                      { value: 'Chittagong', label: 'Chittagong' },
                      { value: 'Sylhet', label: 'Sylhet' },
                      { value: 'Rajshahi', label: 'Rajshahi' },
                      { value: 'Khulna', label: 'Khulna' },
                      { value: 'Barisal', label: 'Barisal' },
                      { value: 'Rangpur', label: 'Rangpur' },
                      { value: 'Mymensingh', label: 'Mymensingh' }
                    ]} 
                  />
                  <InputGroup 
                    label="District" 
                    name="district" 
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                  <InputGroup 
                    label="Upazila" 
                    name="upazila" 
                    value={formData.upazila}
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
                  <InputGroup 
                    label="Reference By" 
                    name="referenceBy" 
                    value={formData.referenceBy}
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
                  />
                  <FileUploadGroup 
                    label="NID Copy" 
                    name="nidCopy" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={formData.nidCopy}
                    onFileChange={handleFileUpload('nidCopy')}
                    onRemoveFile={removeFile('nidCopy')}
                  />
                  <FileUploadGroup 
                    label="Photo" 
                    name="photo" 
                    accept=".jpg,.jpeg,.png"
                    value={formData.photo}
                    onFileChange={handleFileUpload('photo')}
                    onRemoveFile={removeFile('photo')}
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

export default EditUmrahHaji;

