import React, { useState, useEffect, memo, useCallback } from 'react';
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
  Search,
  CheckCircle,
  Users,
} from 'lucide-react';
import { useCreateUmrah, useUpdateUmrah, useUmrah } from '../../../hooks/UseUmrahQuries';
import { useCustomers } from '../../../hooks/useCustomerQueries';
import { usePackages } from '../../../hooks/usePackageQueries';
import { useAgents } from '../../../hooks/useAgentQueries';
import Swal from 'sweetalert2';

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
        <div className="text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <label className="cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <input
              type="file"
              accept={accept}
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  </div>
));

const AddUmrahHaji = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAutoFilled, setCustomerAutoFilled] = useState(false);
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(location.search);
  const umrahIdParam = urlParams.get('umrahId');
  const editMode = urlParams.get('edit') === 'true';
  
  // Fetch customers for search functionality
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
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
    isActive: true
  });

  // Populate form for edit mode using loaded Umrah data
  useEffect(() => {
    if (!editMode || !umrahData) return;
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
    }));
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

  // Customer search functionality - prioritize Umrah customers
  const filteredCustomers = customers.filter(customer => {
    const searchTerm = customerSearchTerm.toLowerCase();
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm) ||
      customer.mobile?.includes(customerSearchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.customerId?.toLowerCase().includes(searchTerm) ||
      customer.passportNumber?.toLowerCase().includes(searchTerm);
    
    return matchesSearch;
  }).sort((a, b) => {
    // Prioritize Umrah customers in search results
    const aIsUmrah = a.serviceType === 'umrah' || a.customerType === 'umrah';
    const bIsUmrah = b.serviceType === 'umrah' || b.customerType === 'umrah';
    
    if (aIsUmrah && !bIsUmrah) return -1;
    if (!aIsUmrah && bIsUmrah) return 1;
    return 0;
  });

  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
    
    // Auto-fill form with customer data
    setFormData(prev => ({
      ...prev,
      name: customer.name || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      mobile: customer.mobile || '',
      whatsappNo: customer.whatsappNo || '',
      email: customer.email || '',
      address: customer.address || '',
      division: customer.division || '',
      district: customer.district || '',
      upazila: customer.upazila || '',
      postCode: customer.postCode || '',
      passportNumber: customer.passportNumber || '',
      passport: customer.passportNumber || '',
      issueDate: customer.issueDate || '',
      expiryDate: customer.expiryDate || '',
      nidNumber: customer.nidNumber || '',
      nid: customer.nidNumber || '',
      dateOfBirth: customer.dateOfBirth || '',
      gender: customer.gender || 'male',
      maritalStatus: customer.maritalStatus || 'single',
      nationality: customer.nationality || 'Bangladeshi',
      fatherName: customer.fatherName || '',
      motherName: customer.motherName || '',
      spouseName: customer.spouseName || '',
      occupation: customer.occupation || '',
      customerId: customer.customerId || '',
      referenceBy: customer.referenceBy || '',
      referenceCustomerId: customer.referenceCustomerId || '',
      serviceType: customer.serviceType || 'umrah',
      serviceStatus: customer.serviceStatus || '',
      notes: customer.notes || ''
    }));
    
    setCustomerAutoFilled(true);
    
    Swal.fire({
      title: 'Customer Selected!',
      text: `${customer.name} - Auto-filled with existing data`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerAutoFilled(false);
    // Reset form to initial state
    setFormData(prev => ({
      ...prev,
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
      passportNumber: '',
      passport: '',
      issueDate: '',
      expiryDate: '',
      nidNumber: '',
      nid: '',
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single',
      nationality: 'Bangladeshi',
      fatherName: '',
      motherName: '',
      spouseName: '',
      occupation: '',
      customerId: '',
      referenceBy: '',
      referenceCustomerId: '',
      serviceType: 'umrah',
      serviceStatus: '',
      notes: ''
    }));
  }, []);

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
        // Add file uploads if needed
        passportCopy: formData.passportCopy,
        nidCopy: formData.nidCopy,
        photo: formData.photo
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
        <button
          type="button"
          onClick={() => setShowCustomerSearch(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Search className="w-4 h-4" />
          <span>Quick Search Customer</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/umrah/haji-list')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <User className="w-4 h-4" />
          <span>View Umrah List</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Search Section */}
        <FormSection title="Customer Selection - Search Existing Umrah Customer" icon={Users}>
          {!selectedCustomer ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Search for Existing Umrah Customer
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Find existing customers to auto-fill information or create new Umrah pilgrim
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>{showCustomerSearch ? 'Hide Search' : 'Search Customer'}</span>
                  </button>
                </div>
              </div>
              
              {showCustomerSearch && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search Umrah customers by name, mobile, email, customer ID, or passport..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                    />
                  </div>
                  
                  {customerSearchTerm && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredCustomers.length > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          Found {filteredCustomers.length} customer(s) - Umrah customers shown first
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          No customers found. You can create a new Umrah pilgrim below.
                        </span>
                      )}
                    </div>
                  )}
                  
                  {customerSearchTerm && (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => {
                          const isUmrahCustomer = customer.serviceType === 'umrah' || customer.customerType === 'umrah';
                          return (
                            <div
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                isUmrahCustomer ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{customer.name}</h4>
                                    {isUmrahCustomer && (
                                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                        Umrah Customer
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                                    <p>ID: {customer.customerId}</p>
                                    <p>Mobile: {customer.mobile}</p>
                                    <p>Email: {customer.email}</p>
                                    {customer.passportNumber && <p>Passport: {customer.passportNumber}</p>}
                                    {customer.serviceType && (
                                      <p>Service: <span className="font-medium capitalize">{customer.serviceType}</span></p>
                                    )}
                                    {customer.serviceStatus && (
                                      <p>Status: <span className="font-medium capitalize">{customer.serviceStatus}</span></p>
                                    )}
                                  </div>
                                </div>
                                <CheckCircle className={`w-5 h-5 ${isUmrahCustomer ? 'text-green-600' : 'text-blue-600'}`} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No customers found matching "{customerSearchTerm}"</p>
                          <p className="text-sm mt-1">You can create a new Umrah pilgrim using the form below</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Selected Customer: {selectedCustomer.name}
                      </h4>
                      {(selectedCustomer.serviceType === 'umrah' || selectedCustomer.customerType === 'umrah') && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          Umrah Customer
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ID: {selectedCustomer.customerId} | Mobile: {selectedCustomer.mobile}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Customer data auto-filled - Ready to register for Umrah
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                  title="Clear selected customer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </FormSection>

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


