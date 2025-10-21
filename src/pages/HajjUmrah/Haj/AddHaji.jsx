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
  Wand2
} from 'lucide-react';
import { useCreateHaji, useUpdateHaji, useHaji } from '../../../hooks/UseHajiQueries';
import { useCustomers } from '../../../hooks/useCustomerQueries';
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

const AddHaji = () => {
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
  const hajiIdParam = urlParams.get('hajiId');
  const editMode = urlParams.get('edit') === 'true';
  
  // Fetch customers for search functionality
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createHajiMutation = useCreateHaji();
  const updateHajiMutation = useUpdateHaji();
  
  // Fetch Haji data for edit mode
  const { data: hajiData, isLoading: hajiLoading } = useHaji(hajiIdParam);
  
  // Combined loading state
  const isLoading = loading || createHajiMutation.isPending || updateHajiMutation.isPending || (editMode && hajiLoading);
  
  // Load Haji data for edit mode
  useEffect(() => {
    if (editMode && hajiData && !customerAutoFilled) {
      // Populate form with Haji data
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
        notes: hajiData.notes || ''
      });
      setCustomerAutoFilled(true);
    }
  }, [editMode, hajiData, customerAutoFilled]);

  // Auto-select customer if customerId is provided in URL (for backward compatibility)
  useEffect(() => {
    const customerIdParam = urlParams.get('customerId');
    if (customerIdParam && customers.length > 0 && !selectedCustomer) {
      const customer = customers.find(c => c.customerId === customerIdParam);
      if (customer) {
        handleCustomerSelect(customer);
      }
    }
  }, [customers, selectedCustomer]);
  
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
    // Additional Haji-specific fields
    customerType: 'haj',
    customerId: '',
    whatsappNo: '',
    passportNumber: '',
    issueDate: '',
    expiryDate: '',
    nidNumber: '',
    nationality: 'Bangladeshi',
    spouseName: '',
    occupation: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceType: '',
    serviceStatus: '',
    isActive: true
  });

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

  // Customer search functionality
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.mobile?.includes(customerSearchTerm) ||
    customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.customerId?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.passportNumber?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

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
      phone: customer.mobile || '',
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
      serviceType: customer.serviceType || '',
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
      phone: '',
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
      serviceType: '',
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
        // Link to customer if selected/known
        customerId: selectedCustomer?.customerId || formData.customerId || undefined,

        // Personal
        name: computedName,
        firstName: formData.firstName || formData.name.split(' ')[0] || '',
        lastName: formData.lastName || formData.name.split(' ').slice(1).join(' ') || '',
        mobile: formData.mobile || formData.phone,
        phone: formData.mobile || formData.phone,
        whatsappNo: formData.whatsappNo,
        email: formData.email,
        occupation: formData.occupation,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
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
        serviceStatus: formData.paymentStatus === 'paid' ? 'confirmed' : 'pending',
        isActive: formData.isActive,
        notes: formData.notes,
        referenceBy: formData.referenceBy,
        referenceCustomerId: formData.referenceCustomerId,

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
        packageInfo: {
          packageName: packages.find(p => p.id === formData.packageId)?.name || '',
          packageType: 'hajj',
          agent: agents.find(a => a.id === formData.agentId)?.name || '',
          agentContact: agents.find(a => a.id === formData.agentId)?.phone || ''
        }
      };

      if (editMode) {
        const targetId = hajiIdParam || selectedCustomer?._id || selectedCustomer?.id || selectedCustomer?.customerId;
        if (!targetId) {
          throw new Error('Missing Haji identifier for update');
        }
        const result = await updateHajiMutation.mutateAsync({ id: targetId, updates: hajiPayload });
        const updated = result?.data || {};
        const navId = targetId;
        navigate(`/hajj-umrah/haji/${navId}`);
        return;
      }

      const result = await createHajiMutation.mutateAsync(hajiPayload);
      const created = result?.data || {};
      const createdId = created._id || created.id || created.customerId;
      if (createdId) {
        navigate(`/hajj-umrah/haji/${createdId}`);
        return;
      }
      
      // Fallback navigation if no id available
      navigate('/hajj-umrah/haji-list');
    } catch (error) {
      console.error('Error creating/updating Haji:', error);
      // Error handling is already done in the mutation hooks
      // This catch block is for any additional error handling if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/hajj-umrah/haji-list')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editMode ? 'Edit Haji Information' : 'Add New Haji'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {editMode ? 'Update pilgrim information for Hajj' : 'Register a new pilgrim for Hajj'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : editMode ? 'Update Haji' : 'Save Haji'}</span>
        </button>
      </div>

      {/* Loading indicator for edit mode */}
      {editMode && hajiLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 dark:text-blue-300">Loading Haji data...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Search Section */}
        <FormSection title="Customer Selection" icon={Users}>
          {!selectedCustomer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search for existing customer to auto-fill information or create new Haji
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Customer</span>
                </button>
              </div>
              
              {showCustomerSearch && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, mobile, email, customer ID, or passport..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {customerSearchTerm && (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{customer.name}</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                  <p>ID: {customer.customerId}</p>
                                  <p>Mobile: {customer.mobile}</p>
                                  <p>Email: {customer.email}</p>
                                  {customer.passportNumber && <p>Passport: {customer.passportNumber}</p>}
                                </div>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No customers found matching "{customerSearchTerm}"
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
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      Selected Customer: {selectedCustomer.name}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ID: {selectedCustomer.customerId} | Mobile: {selectedCustomer.mobile}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
          disabled={isLoading}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-medium"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Saving...' : 'Save Haji'}</span>
        </button>
      </div>
    </div>
  );
};

export default AddHaji;
