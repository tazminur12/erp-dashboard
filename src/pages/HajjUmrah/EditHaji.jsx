import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Loader
} from 'lucide-react';
import { useCustomer, useCustomers, useUpdateCustomer } from '../../hooks/useCustomerQueries';
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

const InputGroup = memo(({ label, name, type = 'text', required = false, value, onChange, placeholder, options = [] }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
      />
    )}
  </div>
));

const SelectGroup = memo(({ label, name, value, onChange, options = [], required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.id || option.value} value={option.id || option.value}>
          {option.name || option.label} {option.price && `- ৳${option.price.toLocaleString()}`}
        </option>
      ))}
    </select>
  </div>
));

const FileUploadGroup = memo(({ label, name, onChange, accept, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center space-x-4">
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        required={required}
        className="hidden"
        id={name}
      />
      <label
        htmlFor={name}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Upload className="w-4 h-4" />
        <span>Choose File</span>
      </label>
    </div>
  </div>
));

const EditHaji = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAutoFilled, setCustomerAutoFilled] = useState(false);
  
  // Fetch customer data and update mutation
  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomer(id);
  const { data: customers = [] } = useCustomers();
  const updateCustomerMutation = useUpdateCustomer();
  
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
    // Additional fields
    customerType: 'hajj',
    customerId: '',
    passportFirstName: '',
    passportLastName: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceType: 'hajj',
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

  // Load customer data when component mounts or customer data changes
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        fatherName: customer.fatherName || '',
        motherName: customer.motherName || '',
        spouseName: customer.spouseName || '',
        occupation: customer.occupation || '',
        passport: customer.passportNumber || '',
        passportNumber: customer.passportNumber || '',
        passportType: customer.passportType || '',
        issueDate: customer.issueDate || '',
        passportExpiry: customer.expiryDate || '',
        expiryDate: customer.expiryDate || '',
        nid: customer.nidNumber || '',
        nidNumber: customer.nidNumber || '',
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || 'male',
        maritalStatus: customer.maritalStatus || 'single',
        nationality: customer.nationality || 'Bangladeshi',
        phone: customer.mobile || '',
        mobile: customer.mobile || '',
        whatsappNo: customer.whatsappNo || '',
        email: customer.email || '',
        address: customer.address || '',
        division: customer.division || '',
        district: customer.district || '',
        upazila: customer.upazila || '',
        postCode: customer.postCode || '',
        emergencyContact: customer.emergencyContact || '',
        emergencyPhone: customer.emergencyPhone || '',
        packageId: customer.packageInfo?.packageName || '',
        agentId: customer.packageInfo?.agent || '',
        departureDate: customer.packageInfo?.departureDate || '',
        returnDate: customer.packageInfo?.returnDate || '',
        totalAmount: customer.totalAmount || 0,
        paidAmount: customer.paidAmount || 0,
        paymentMethod: customer.paymentMethod || 'cash',
        paymentStatus: customer.paymentStatus || 'pending',
        previousHajj: customer.packageInfo?.previousHajj || false,
        previousUmrah: customer.packageInfo?.previousUmrah || false,
        specialRequirements: customer.packageInfo?.specialRequirements || '',
        notes: customer.notes || '',
        customerType: customer.customerType || 'hajj',
        customerId: customer.customerId || '',
        passportFirstName: customer.passportFirstName || '',
        passportLastName: customer.passportLastName || '',
        referenceBy: customer.referenceBy || '',
        referenceCustomerId: customer.referenceCustomerId || '',
        serviceType: customer.serviceType || 'hajj',
        serviceStatus: customer.serviceStatus || '',
        isActive: customer.isActive !== false
      }));
      setSelectedCustomer(customer);
      setCustomerAutoFilled(true);
    }
  }, [customer]);

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
      serviceType: customer.serviceType || 'hajj',
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
      serviceType: 'hajj',
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

  const handlePackageChange = useCallback((e) => {
    const packageId = e.target.value;
    const selectedPackage = packages.find(p => p.id === packageId);
    setFormData(prev => ({
      ...prev,
      packageId,
      totalAmount: selectedPackage ? selectedPackage.price : 0
    }));
  }, [packages]);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null
    }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = ['name', 'mobile', 'passportNumber', 'dateOfBirth'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Swal.fire({
        title: 'Validation Error',
        text: `Please fill in all required fields: ${missingFields.join(', ')}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const customerData = {
        ...formData,
        packageInfo: {
          packageName: packages.find(p => p.id === formData.packageId)?.name || '',
          packageType: 'hajj',
          agent: agents.find(a => a.id === formData.agentId)?.name || '',
          agentContact: agents.find(a => a.id === formData.agentId)?.phone || '',
          departureDate: formData.departureDate,
          returnDate: formData.returnDate,
          previousHajj: formData.previousHajj,
          previousUmrah: formData.previousUmrah,
          specialRequirements: formData.specialRequirements
        }
      };

      await updateCustomerMutation.mutateAsync({ id, data: customerData });
      
      Swal.fire({
        title: 'Success!',
        text: 'Haji information updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate(`/hajj-umrah/haji/${id}`);
      });
      
    } catch (error) {
      console.error('Error updating customer:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update Haji information. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, packages, agents, updateCustomerMutation, id, navigate]);

  // Handle loading state
  if (customerLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading Haji information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (customerError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {customerError.message || 'Failed to load Haji information. Please try again.'}
            </p>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Haji Information</h1>
            <p className="text-gray-600 dark:text-gray-400">Update Haji details and information</p>
          </div>
        </div>
        <button
          type="submit"
          form="edit-haji-form"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Updating...' : 'Update Haji'}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(`/hajj-umrah/haji/${id}`)}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <User className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </div>

      <form id="edit-haji-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <FormSection title="Customer Information" icon={Users}>
          {selectedCustomer ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      Editing: {selectedCustomer.name}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ID: {selectedCustomer.customerId} | Mobile: {selectedCustomer.mobile}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customer information will be loaded automatically
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
            </div>
          )}
          
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
        </FormSection>

        {/* Personal Information */}
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
              required 
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Gender" 
              name="gender" 
              type="select" 
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
              ]} 
            />
            <InputGroup 
              label="Marital Status" 
              name="maritalStatus" 
              type="select" 
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

        {/* Passport Information */}
        <FormSection title="Passport Information" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputGroup 
              label="Passport Number" 
              name="passportNumber" 
              required 
              value={formData.passportNumber}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Passport Type" 
              name="passportType" 
              value={formData.passportType}
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
              label="Passport First Name" 
              name="passportFirstName" 
              value={formData.passportFirstName}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Passport Last Name" 
              name="passportLastName" 
              value={formData.passportLastName}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Contact Information */}
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
            <InputGroup 
              label="Division" 
              name="division" 
              value={formData.division}
              onChange={handleInputChange}
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
              label="Emergency Contact" 
              name="emergencyContact" 
              value={formData.emergencyContact}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Emergency Phone" 
              name="emergencyPhone" 
              type="tel" 
              value={formData.emergencyPhone}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Package Information */}
        <FormSection title="Package Information" icon={Package}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectGroup 
              label="Package" 
              name="packageId" 
              value={formData.packageId}
              options={packages}
              required 
              onChange={handlePackageChange}
            />
            <SelectGroup 
              label="Agent" 
              name="agentId" 
              value={formData.agentId}
              options={agents}
              required 
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
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="previousHajj"
                  checked={formData.previousHajj}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Previous Hajj Experience</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="previousUmrah"
                  checked={formData.previousUmrah}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Previous Umrah Experience</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <InputGroup 
                label="Special Requirements" 
                name="specialRequirements" 
                value={formData.specialRequirements}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </FormSection>

        {/* Financial Information */}
        <FormSection title="Financial Information" icon={CreditCard}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Total Amount" 
              name="totalAmount" 
              type="number" 
              value={formData.totalAmount}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Paid Amount" 
              name="paidAmount" 
              type="number" 
              value={formData.paidAmount}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Payment Method" 
              name="paymentMethod" 
              type="select" 
              value={formData.paymentMethod}
              onChange={handleInputChange}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'mobile_banking', label: 'Mobile Banking' },
                { value: 'check', label: 'Check' }
              ]} 
            />
            <InputGroup 
              label="Payment Status" 
              name="paymentStatus" 
              type="select" 
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

        {/* Additional Information */}
        <FormSection title="Additional Information" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Reference By" 
              name="referenceBy" 
              value={formData.referenceBy}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Reference Customer ID" 
              name="referenceCustomerId" 
              value={formData.referenceCustomerId}
              onChange={handleInputChange}
            />
            <InputGroup 
              label="Service Type" 
              name="serviceType" 
              type="select" 
              value={formData.serviceType}
              onChange={handleInputChange}
              options={[
                { value: 'hajj', label: 'Hajj' },
                { value: 'umrah', label: 'Umrah' }
              ]} 
            />
            <InputGroup 
              label="Service Status" 
              name="serviceStatus" 
              value={formData.serviceStatus}
              onChange={handleInputChange}
            />
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active Customer</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <InputGroup 
                label="Notes" 
                name="notes" 
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </FormSection>

        {/* Document Upload */}
        <FormSection title="Document Upload" icon={Upload}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploadGroup 
              label="Passport Copy" 
              name="passportCopy" 
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <FileUploadGroup 
              label="NID Copy" 
              name="nidCopy" 
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <FileUploadGroup 
              label="Photo" 
              name="photo" 
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </FormSection>
      </form>

      {/* Extra Save Button after Document Upload */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          form="edit-haji-form"
          disabled={loading}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Updating...' : 'Update Haji'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditHaji;
