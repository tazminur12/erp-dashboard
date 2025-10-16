import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';

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

const AddHaji = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    passport: '',
    passportExpiry: '',
    nid: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    phone: '',
    email: '',
    address: '',
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
    previousHajj: true,
    previousUmrah: false,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null
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
    const requiredFields = ['name', 'passport', 'phone', 'packageId', 'agentId', 'departureDate'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (Number(formData.paidAmount) > Number(formData.totalAmount)) {
      toast.error('Paid amount cannot be greater than total amount');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const hajiId = `H${String(Date.now()).slice(-6)}`;
      const hajiData = {
        ...formData,
        id: hajiId,
        registrationDate: new Date().toISOString().split('T')[0],
        status: Number(formData.paidAmount) === Number(formData.totalAmount) ? 'confirmed' : 'pending',
        type: 'hajj'
      };
      console.log('New Hajj Haji created:', hajiData);
      toast.success('Haji registered successfully!');
      navigate('/hajj-umrah/haji-list');
    } catch (error) {
      console.error('Error creating Haji:', error);
      toast.error('Failed to register Haji. Please try again.');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Haji</h1>
            <p className="text-gray-600 dark:text-gray-400">Register a new pilgrim for Hajj</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Haji'}</span>
        </button>
      </div>

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
              required 
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
              required 
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
              required 
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
              required 
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
  );
};

export default AddHaji;
