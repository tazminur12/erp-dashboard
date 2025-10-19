import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  DollarSign,
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCreateEmployee, useActiveBranches } from '../../../hooks/useHRQueries';
import { useNavigate } from 'react-router-dom';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';

const AddEmployee = () => {
  const navigate = useNavigate();
  const createEmployeeMutation = useCreateEmployee();
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useActiveBranches();

  // Validate Cloudinary configuration on component mount
  React.useEffect(() => {
    if (!validateCloudinaryConfig()) {
      console.error('Cloudinary configuration is invalid. File uploads may not work properly.');
    }
  }, []);

  // Cloudinary Upload Function for Images (same as AddCustomer)
  const uploadToCloudinary = async (file) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
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
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  // Cloudinary Upload Function for Documents (PDF, DOC, DOCX)
  const uploadDocumentToCloudinary = async (file) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid document file (PDF, DOC, DOCX)');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for documents
        throw new Error('File size must be less than 10MB');
      }
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'employees/documents');
      
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
      return result;
    } catch (error) {
      console.error('Cloudinary document upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  };
  
  
  // Use mock data if API fails or returns empty
  const mockBranches = [
    { id: '1', name: 'Dhaka Branch', branchName: 'Dhaka Branch' },
    { id: '2', name: 'Chittagong Branch', branchName: 'Chittagong Branch' },
    { id: '3', name: 'Sylhet Branch', branchName: 'Sylhet Branch' },
    { id: '4', name: 'Rajshahi Branch', branchName: 'Rajshahi Branch' }
  ];
  
  const displayBranches = branches && branches.length > 0 ? branches : mockBranches;
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Employment Information
    employeeId: '',
    position: '',
    department: '',
    manager: '',
    joinDate: '',
    employmentType: '',
    workLocation: '',
    branch: '', // New field for branch selection
    
    // Salary Information
    basicSalary: '',
    allowances: '',
    benefits: '',
    bankAccount: '',
    bankName: '',
    
    // Documents (now storing URLs instead of files)
    profilePicture: null,
    profilePictureUrl: '',
    nidCopy: null,
    nidCopyUrl: '',
    otherDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [uploadStates, setUploadStates] = useState({
    profilePicture: { uploading: false, success: false, error: null },
    nidCopy: { uploading: false, success: false, error: null }
  });
  
  // Image preview state (same as AddCustomer)
  const [imagePreview, setImagePreview] = useState(null);

  const departments = [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Customer Service',
    'Legal',
    'Administration'
  ];

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Intern',
    'Consultant'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (!file) return;

    // For profile picture, use the same method as AddCustomer
    if (name === 'profilePicture') {
      // Set image preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      
      // Set uploading state
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        // Upload to Cloudinary (same as AddCustomer)
        const uploadResult = await uploadToCloudinary(file);

        // Update form data with URL
        setFormData(prev => ({
          ...prev,
          profilePicture: uploadResult.secure_url,
          profilePictureUrl: uploadResult.secure_url
        }));

        // Set success state
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
        console.error(`Upload error for ${name}:`, error);
        
        // Set error state with user-friendly message
        let errorMessage = 'Upload failed';
        if (error.message.includes('configuration')) {
          errorMessage = 'Upload service not configured. Please contact administrator.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File too large. Please choose a smaller file.';
        } else if (error.message.includes('valid image')) {
          errorMessage = 'Please select a valid image file.';
        }
        
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: false, error: errorMessage }
        }));
      }
      return;
    }


    // For NID copy upload
    if (name === 'nidCopy') {
      // Set uploading state
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        // Upload to Cloudinary using image upload function
        const uploadResult = await uploadToCloudinary(file);

        // Update form data with URL
        setFormData(prev => ({
          ...prev,
          nidCopy: uploadResult.secure_url,
          nidCopyUrl: uploadResult.secure_url
        }));

        // Set success state
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
        console.error(`Upload error for ${name}:`, error);
        
        // Set error state with user-friendly message
        let errorMessage = 'Upload failed';
        if (error.message.includes('configuration')) {
          errorMessage = 'Upload service not configured. Please contact administrator.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File too large. Please choose a smaller file.';
        } else if (error.message.includes('valid image')) {
          errorMessage = 'Please select a valid image file.';
        }
        
        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: false, error: errorMessage }
        }));
      }
      return;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.basicSalary) newErrors.basicSalary = 'Basic salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createEmployeeMutation.mutateAsync(formData);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        emergencyPhone: '',
        employeeId: '',
        position: '',
        department: '',
        manager: '',
        joinDate: '',
        employmentType: '',
        workLocation: '',
        branch: '',
        basicSalary: '',
        allowances: '',
        benefits: '',
        bankAccount: '',
        bankName: '',
        profilePicture: null,
        profilePictureUrl: '',
        nidCopy: null,
        nidCopyUrl: '',
        otherDocuments: []
      });
      
      // Reset upload states
      setUploadStates({
        profilePicture: { uploading: false, success: false, error: null },
        nidCopy: { uploading: false, success: false, error: null }
      });
      
      // Reset image preview
      setImagePreview(null);
      
      // Navigate to employee list
      navigate('/office-management/hr/employee/list');
      
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
              <p className="text-gray-600 mt-2">Fill in the employee details below</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              Employment Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter job position"
                />
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter manager name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.joinDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select employment type</option>
                  {employmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    errors.branch ? 'border-red-500' : 'border-gray-300'
                  } ${branchesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={branchesLoading}
                >
                  <option value="" className="text-gray-500">
                    {branchesLoading ? 'Loading branches...' : 'Select branch'}
                  </option>
                  {displayBranches && displayBranches.length > 0 ? (
                    displayBranches.map(branch => (
                      <option 
                        key={branch.id || branch._id} 
                        value={branch.id || branch._id}
                        className="text-gray-900"
                      >
                        {branch.name || branch.branchName || branch.title}
                      </option>
                    ))
                  ) : (
                    !branchesLoading && (
                      <option value="" disabled className="text-gray-500">
                        No branches available
                      </option>
                    )
                  )}
                </select>
                {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                {branchesError && (
                  <p className="text-red-500 text-sm mt-1">
                    Error loading branches: {branchesError.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Location
                </label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter work location"
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Salary Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Salary *
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.basicSalary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter basic salary"
                />
                {errors.basicSalary && <p className="text-red-500 text-sm mt-1">{errors.basicSalary}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowances
                </label>
                <input
                  type="number"
                  name="allowances"
                  value={formData.allowances}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter allowances"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter benefits"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank account number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>

          {/* Documents Upload */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Documents
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  uploadStates.profilePicture.uploading 
                    ? 'border-blue-300 bg-blue-50' 
                    : uploadStates.profilePicture.success 
                    ? 'border-green-300 bg-green-50' 
                    : uploadStates.profilePicture.error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp,image/gif,image/bmp,image/tiff"
                    className="hidden"
                    id="profilePicture"
                    disabled={uploadStates.profilePicture.uploading}
                  />
                  <label htmlFor="profilePicture" className={`cursor-pointer ${uploadStates.profilePicture.uploading ? 'cursor-not-allowed' : ''}`}>
                    {uploadStates.profilePicture.uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </>
                    ) : uploadStates.profilePicture.success ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-600">Upload successful!</p>
                        {(formData.profilePictureUrl || imagePreview) && (
                          <img 
                            src={formData.profilePictureUrl || imagePreview} 
                            alt="Profile preview" 
                            className="w-16 h-16 rounded-full mx-auto mt-2 object-cover"
                          />
                        )}
                      </>
                    ) : uploadStates.profilePicture.error ? (
                      <>
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{uploadStates.profilePicture.error}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload profile picture</p>
                        <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, HEIC, WebP, GIF, BMP, TIFF</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NID Copy
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  uploadStates.nidCopy.uploading 
                    ? 'border-blue-300 bg-blue-50' 
                    : uploadStates.nidCopy.success 
                    ? 'border-green-300 bg-green-50' 
                    : uploadStates.nidCopy.error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    name="nidCopy"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                    id="nidCopy"
                    disabled={uploadStates.nidCopy.uploading}
                  />
                  <label htmlFor="nidCopy" className={`cursor-pointer ${uploadStates.nidCopy.uploading ? 'cursor-not-allowed' : ''}`}>
                    {uploadStates.nidCopy.uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </>
                    ) : uploadStates.nidCopy.success ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-600">Upload successful!</p>
                        <p className="text-xs text-gray-500 mt-1">NID copy uploaded</p>
                      </>
                    ) : uploadStates.nidCopy.error ? (
                      <>
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{uploadStates.nidCopy.error}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload NID copy</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEmployeeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {createEmployeeMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Employee...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
