import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Camera,
  X
} from 'lucide-react';
import { useEmployee, useUpdateEmployee, useActiveBranches } from '../../../hooks/useHRQueries';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading: employeeLoading } = useEmployee(id);
  const updateEmployeeMutation = useUpdateEmployee();
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useActiveBranches();
  
  // Mock branches for fallback
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
    branch: '',
    
    // Salary Information
    basicSalary: '',
    allowances: '',
    benefits: '',
    bankAccount: '',
    bankName: '',
    
    // Documents
    profilePicture: null,
    profilePictureUrl: '',
    resume: null,
    resumeUrl: '',
    nidCopy: null,
    nidCopyUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [uploadStates, setUploadStates] = useState({
    profilePicture: { uploading: false, success: false, error: null },
    resume: { uploading: false, success: false, error: null },
    nidCopy: { uploading: false, success: false, error: null }
  });
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

  // Cloudinary Upload Function for Images
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  // Cloudinary Upload Function for Documents
  const uploadDocumentToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid document file (PDF, DOC, DOCX)');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'employees/documents');
      
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
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  };

  // Populate form data when employee data is loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        dateOfBirth: employee.dateOfBirth || '',
        gender: employee.gender || '',
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        employeeId: employee.employeeId || '',
        position: employee.position || '',
        department: employee.department || '',
        manager: employee.manager || '',
        joinDate: employee.joinDate || '',
        employmentType: employee.employmentType || '',
        workLocation: employee.workLocation || '',
        branch: employee.branch || employee.branchId || '',
        basicSalary: employee.basicSalary || '',
        allowances: employee.allowances || '',
        benefits: employee.benefits || '',
        bankAccount: employee.bankAccount || '',
        bankName: employee.bankName || '',
        profilePicture: employee.profilePicture || null,
        profilePictureUrl: employee.profilePictureUrl || employee.profilePicture || '',
        resume: employee.resume || null,
        resumeUrl: employee.resumeUrl || employee.resume || '',
        nidCopy: employee.nidCopy || null,
        nidCopyUrl: employee.nidCopyUrl || employee.nidCopy || ''
      });
    }
  }, [employee]);

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

    // For profile picture
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
        const uploadResult = await uploadToCloudinary(file);
        
        setFormData(prev => ({
          ...prev,
          profilePicture: uploadResult.secure_url,
          profilePictureUrl: uploadResult.secure_url
        }));

        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
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

    // For resume upload
    if (name === 'resume') {
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        const uploadResult = await uploadDocumentToCloudinary(file);
        
        setFormData(prev => ({
          ...prev,
          resume: uploadResult.secure_url,
          resumeUrl: uploadResult.secure_url
        }));

        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
        let errorMessage = 'Upload failed';
        if (error.message.includes('configuration')) {
          errorMessage = 'Upload service not configured. Please contact administrator.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File too large. Please choose a smaller file.';
        } else if (error.message.includes('valid document')) {
          errorMessage = 'Please select a valid document file (PDF, DOC, DOCX).';
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
      setUploadStates(prev => ({
        ...prev,
        [name]: { uploading: true, success: false, error: null }
      }));

      try {
        const uploadResult = await uploadToCloudinary(file);
        
        setFormData(prev => ({
          ...prev,
          nidCopy: uploadResult.secure_url,
          nidCopyUrl: uploadResult.secure_url
        }));

        setUploadStates(prev => ({
          ...prev,
          [name]: { uploading: false, success: true, error: null }
        }));

      } catch (error) {
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
      await updateEmployeeMutation.mutateAsync({
        id,
        data: formData
      });
      
      // Navigate back to profile
      navigate(`/office-management/hr/employee/profile/${id}`);
      
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleGoBack = () => {
    navigate(`/office-management/hr/employee/profile/${id}`);
  };

  const handleCancel = () => {
    navigate('/office-management/hr/employee/list');
  };

  if (employeeLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Employee not found</div>
          <button
            onClick={() => navigate('/office-management/hr/employee/list')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
              <p className="text-gray-600 mt-2">Update employee information</p>
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
                    accept="image/*"
                    className="hidden"
                    id="profilePicture"
                    disabled={uploadStates.profilePicture.uploading}
                  />
                  <label htmlFor="profilePicture" className={`cursor-pointer ${uploadStates.profilePicture.uploading ? 'cursor-not-allowed' : ''}`}>
                    {uploadStates.profilePicture.uploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </>
                    ) : uploadStates.profilePicture.success ? (
                      <>
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-sm text-green-600">Upload successful!</p>
                        {(formData.profilePicture || imagePreview) && (
                          <img 
                            src={formData.profilePicture || imagePreview} 
                            alt="Profile preview" 
                            className="w-16 h-16 rounded-full mx-auto mt-2 object-cover"
                          />
                        )}
                      </>
                    ) : uploadStates.profilePicture.error ? (
                      <>
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✗</span>
                        </div>
                        <p className="text-sm text-red-600">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{uploadStates.profilePicture.error}</p>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new profile picture</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  uploadStates.resume.uploading 
                    ? 'border-blue-300 bg-blue-50' 
                    : uploadStates.resume.success 
                    ? 'border-green-300 bg-green-50' 
                    : uploadStates.resume.error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="resume"
                    disabled={uploadStates.resume.uploading}
                  />
                  <label htmlFor="resume" className={`cursor-pointer ${uploadStates.resume.uploading ? 'cursor-not-allowed' : ''}`}>
                    {uploadStates.resume.uploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </>
                    ) : uploadStates.resume.success ? (
                      <>
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-sm text-green-600">Upload successful!</p>
                        <p className="text-xs text-gray-500 mt-1">Resume uploaded</p>
                      </>
                    ) : uploadStates.resume.error ? (
                      <>
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✗</span>
                        </div>
                        <p className="text-sm text-red-600">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{uploadStates.resume.error}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new resume</p>
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
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </>
                    ) : uploadStates.nidCopy.success ? (
                      <>
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-sm text-green-600">Upload successful!</p>
                        <p className="text-xs text-gray-500 mt-1">NID copy uploaded</p>
                      </>
                    ) : uploadStates.nidCopy.error ? (
                      <>
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">✗</span>
                        </div>
                        <p className="text-sm text-red-600">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{uploadStates.nidCopy.error}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new NID copy</p>
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
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateEmployeeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {updateEmployeeMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Employee...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
