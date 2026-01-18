import React, { useMemo, useState, useEffect } from 'react';
import { Users, Save, RotateCcw, X, Building2, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSecureAxios from '../../hooks/UseAxiosSecure.js';
import Swal from 'sweetalert2';
import AllDivision from '../../jsondata/AllDivision.json';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';

// B2B initial form state
const initialB2BFormState = {
  agentId: '',
  agencyName: '',
  ownersName: '',
  email: '',
  contactNo: '',
  division: '',
  district: '',
  upazila: '',
  address: '',
  zipCode: ''
};

// B2C initial form state
const initialB2CFormState = {
  customerId: '',
  firstName: '',
  lastName: '',
  email: '',
  contactNo: '',
  division: '',
  district: '',
  upazila: '',
  address: '',
  zipCode: ''
};

const AddCustomer = () => {
  const navigate = useNavigate();
  const axiosSecure = useSecureAxios();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('B2B'); // 'B2B' or 'B2C'
  const [b2bForm, setB2bForm] = useState(initialB2BFormState);
  const [b2cForm, setB2cForm] = useState(initialB2CFormState);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [upazilaOptions, setUpazilaOptions] = useState([]);

  // Get current form based on active tab
  const form = activeTab === 'B2B' ? b2bForm : b2cForm;
  const setForm = activeTab === 'B2B' ? setB2bForm : setB2cForm;

  // Prepare Division/District/Upazila options from JSON
  useEffect(() => {
    try {
      const countryKey = 'Bangladesh';
      const divisions = (AllDivision && AllDivision[countryKey]) ? AllDivision[countryKey] : [];
      const mappedDivisions = divisions.map(d => d['Division']);
      setDivisionOptions(mappedDivisions);
    } catch (_) {
      setDivisionOptions([]);
    }
  }, []);

  useEffect(() => {
    // When division changes, derive districts
    try {
      const countryKey = 'Bangladesh';
      const divisions = (AllDivision && AllDivision[countryKey]) ? AllDivision[countryKey] : [];
      const selectedDivisionObj = divisions.find(d => d['Division'] === form.division);
      const districts = selectedDivisionObj ? selectedDivisionObj['Districts'] : [];
      const mappedDistricts = districts.map(x => x['District']);
      setDistrictOptions(mappedDistricts);
      // Reset children when parent changes
      setForm(prev => ({ ...prev, district: '', upazila: '' }));
      setUpazilaOptions([]);
    } catch (_) {
      setDistrictOptions([]);
      setUpazilaOptions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.division]);

  useEffect(() => {
    // When district changes, derive upazilas
    try {
      const countryKey = 'Bangladesh';
      const divisions = (AllDivision && AllDivision[countryKey]) ? AllDivision[countryKey] : [];
      const selectedDivisionObj = divisions.find(d => d['Division'] === form.division);
      const districts = selectedDivisionObj ? selectedDivisionObj['Districts'] : [];
      const selectedDistrictObj = districts.find(x => x['District'] === form.district);
      const upazilas = selectedDistrictObj ? selectedDistrictObj['Upazilas'] : [];
      setUpazilaOptions(upazilas);
      setForm(prev => ({ ...prev, upazila: '' }));
    } catch (_) {
      setUpazilaOptions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.district]);

  // Validation errors
  const errors = useMemo(() => {
    const newErrors = {};
    
    if (activeTab === 'B2B') {
      if (!form.agentId.trim()) newErrors.agentId = 'Agent ID is required';
      if (!form.agencyName.trim()) newErrors.agencyName = 'Agency Name is required';
      if (!form.ownersName.trim()) newErrors.ownersName = "Owner's Name is required";
    } else {
      if (!form.customerId.trim()) newErrors.customerId = 'Customer ID is required';
      if (!form.firstName.trim()) newErrors.firstName = 'First Name is required';
      if (!form.lastName.trim()) newErrors.lastName = 'Last Name is required';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) newErrors.email = 'Enter a valid email address';
    }
    
    if (!form.contactNo.trim()) {
      newErrors.contactNo = 'Contact No is required';
    } else {
      const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!phoneRegex.test(form.contactNo.trim())) newErrors.contactNo = 'Enter a valid contact number';
    }
    
    if (!form.division.trim()) newErrors.division = 'Division is required';
    if (!form.district.trim()) newErrors.district = 'District is required';
    if (!form.upazila.trim()) newErrors.upazila = 'Upazila is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    
    if (form.zipCode.trim()) {
      const zipRegex = /^[0-9]{4,6}$/;
      if (!zipRegex.test(form.zipCode.trim())) newErrors.zipCode = 'ZIP code should be 4-6 digits';
    }
    
    return newErrors;
  }, [form, activeTab]);

  const hasError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    if (activeTab === 'B2B') {
      setB2bForm(initialB2BFormState);
    } else {
      setB2cForm(initialB2CFormState);
    }
    setTouched({});
  };

  const handleCancel = () => {
    navigate('/fly-oval/customers');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = activeTab === 'B2B' 
      ? ['agentId', 'agencyName', 'ownersName', 'email', 'contactNo', 'division', 'district', 'upazila', 'address', 'zipCode']
      : ['customerId', 'firstName', 'lastName', 'email', 'contactNo', 'division', 'district', 'upazila', 'address', 'zipCode'];
    
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      
      const payload = activeTab === 'B2B' 
        ? {
            type: 'B2B',
            agentId: form.agentId.trim(),
            agencyName: form.agencyName.trim(),
            ownersName: form.ownersName.trim(),
            email: form.email.trim(),
            contactNo: form.contactNo.trim(),
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            address: form.address.trim(),
            zipCode: form.zipCode.trim()
          }
        : {
            type: 'B2C',
            customerId: form.customerId.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            contactNo: form.contactNo.trim(),
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            address: form.address.trim(),
            zipCode: form.zipCode.trim()
          };

      await axiosSecure.post('/fly-oval/customers', payload);

      await Swal.fire({
        icon: 'success',
        title: `${activeTab} Customer added successfully`,
        showConfirmButton: false,
        timer: 1400
      });

      handleReset();
      navigate('/fly-oval/customers');
    } catch (error) {
      const message = error?.response?.data?.message || `Failed to add ${activeTab} customer. Please try again.`;
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Add Customer - Fly Oval Limited</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/fly-oval/customers')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Customers
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Customer</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new B2B or B2C customer</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('B2B');
                  setTouched({});
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'B2B'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>B2B Customer</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('B2C');
                  setTouched({});
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'B2C'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>B2C Customer</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {activeTab === 'B2B' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agent ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="agentId"
                      value={form.agentId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('agentId') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter agent ID"
                      autoComplete="off"
                    />
                    {hasError('agentId') && (
                      <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="agencyName"
                      value={form.agencyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('agencyName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter agency name"
                      autoComplete="organization"
                    />
                    {hasError('agencyName') && (
                      <p className="mt-1 text-sm text-red-600">{errors.agencyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Owner's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownersName"
                      value={form.ownersName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('ownersName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter owner's name"
                      autoComplete="name"
                    />
                    {hasError('ownersName') && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownersName}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerId"
                      value={form.customerId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('customerId') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter customer ID"
                      autoComplete="off"
                    />
                    {hasError('customerId') && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('firstName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter first name"
                      autoComplete="given-name"
                    />
                    {hasError('firstName') && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasError('lastName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                      placeholder="Enter last name"
                      autoComplete="family-name"
                    />
                    {hasError('lastName') && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </>
              )}

              {/* Common fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('email') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="Enter email address"
                  autoComplete="email"
                />
                {hasError('email') && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('contactNo') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="Enter contact number"
                  autoComplete="tel"
                />
                {hasError('contactNo') && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  name="division"
                  value={form.division}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('division') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Select Division</option>
                  {divisionOptions.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
                {hasError('division') && (
                  <p className="mt-1 text-sm text-red-600">{errors.division}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!form.division}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('district') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } ${!form.division ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select District</option>
                  {districtOptions.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {hasError('district') && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  name="upazila"
                  value={form.upazila}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!form.district}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('upazila') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } ${!form.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Upazila</option>
                  {upazilaOptions.map((upazila) => (
                    <option key={upazila} value={upazila}>
                      {upazila}
                    </option>
                  ))}
                </select>
                {hasError('upazila') && (
                  <p className="mt-1 text-sm text-red-600">{errors.upazila}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('address') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="Enter full address"
                  autoComplete="street-address"
                />
                {hasError('address') && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasError('zipCode') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="Enter ZIP code"
                  autoComplete="postal-code"
                />
                {hasError('zipCode') && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Add Customer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
