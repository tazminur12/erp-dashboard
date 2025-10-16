import React, { useMemo, useState, useEffect } from 'react';
import { Users, Save, RotateCcw, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSecureAxios from '../../hooks/UseAxiosSecure.js';
import Swal from 'sweetalert2';
import AllDivision from '../../jsondata/AllDivision.json';

const initialFormState = {
  agentId: '',
  name: '',
  tradeName: '',
  nid: '',
  dob: '',
  email: '',
  phone: '',
  whatsappNumber: '',
  onWhatsapp: false,
  division: '',
  district: '',
  upazila: '',
  category: '',
  remarks: '',
  status: 'Active'
};

const AddAgent = () => {
  const navigate = useNavigate();
  const axiosSecure = useSecureAxios();
  const [form, setForm] = useState(initialFormState);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [upazilaOptions, setUpazilaOptions] = useState([]);

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

  const errors = useMemo(() => {
    const newErrors = {};
    if (!form.agentId.trim()) newErrors.agentId = 'Agent ID is required';
    if (!form.name.trim()) newErrors.name = 'Agent name is required';
    if (!form.tradeName.trim()) newErrors.tradeName = 'Trade name is required';
    if (form.nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(form.nid.trim())) newErrors.nid = 'NID should be 8-20 digits';
    }
    if (form.dob.trim()) {
      // Basic YYYY-MM-DD check handled by input type=date; no extra validation
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) newErrors.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!phoneRegex.test(form.phone.trim())) newErrors.phone = 'Enter a valid phone number';
    }
    if (form.whatsappNumber.trim()) {
      const whatsappRegex = /^\+?[0-9\-()\s]{6,20}$/;
      if (!whatsappRegex.test(form.whatsappNumber.trim())) newErrors.whatsappNumber = 'Enter a valid WhatsApp number';
    }
    if (!form.division.trim()) newErrors.division = 'Division is required';
    if (!form.district.trim()) newErrors.district = 'District is required';
    if (!form.upazila.trim()) newErrors.upazila = 'Upazila is required';
    if (!form.status.trim()) newErrors.status = 'Status is required';
    return newErrors;
  }, [form]);

  const hasError = (field) => touched[field] && errors[field];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'onWhatsapp' && checked) {
      // If checking "Number is on WhatsApp", auto-fill WhatsApp field with phone number
      setForm((prev) => ({ 
        ...prev, 
        [name]: checked,
        whatsappNumber: prev.phone || ''
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    setForm(initialFormState);
    setTouched({});
  };

  const handleCancel = () => {
    navigate('/fly-oval/agents');
  };

  const handleWhatsAppClick = (phoneNumber) => {
    if (!phoneNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'No WhatsApp Number',
        text: 'Please enter a WhatsApp number first'
      });
      return;
    }
    
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Open WhatsApp with the number
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      agentId: true,
      name: true,
      tradeName: true,
      nid: touched.nid || false,
      dob: touched.dob || false,
      email: true,
      phone: true,
      whatsappNumber: touched.whatsappNumber || false,
      onWhatsapp: touched.onWhatsapp || false,
      division: true,
      district: true,
      upazila: true,
      category: touched.category || false,
      remarks: touched.remarks || false,
      status: true
    });

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      await axiosSecure.post('/fly-oval/agents', {
        agentId: form.agentId.trim(),
        name: form.name.trim(),
        tradeName: form.tradeName.trim(),
        nid: form.nid.trim(),
        dob: form.dob.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        onWhatsapp: Boolean(form.onWhatsapp),
        division: form.division,
        district: form.district,
        upazila: form.upazila,
        category: form.category.trim(),
        remarks: form.remarks.trim(),
        status: form.status
      });

      await Swal.fire({
        icon: 'success',
        title: 'Agent added successfully',
        showConfirmButton: false,
        timer: 1400
      });

      handleReset();
      navigate('/fly-oval/agents');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to add agent. Please try again.';
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
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Agent</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new Fly Oval agent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="agentId"
              value={form.agentId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('agentId') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter unique agent ID"
              autoComplete="off"
            />
            {hasError('agentId') && (
              <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('name') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter agent name"
              autoComplete="name"
            />
            {hasError('name') && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="tradeName"
              value={form.tradeName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('tradeName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter trade name"
              autoComplete="organization"
            />
            {hasError('tradeName') && (
              <p className="mt-1 text-sm text-red-600">{errors.tradeName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NID Number</label>
            <input
              type="text"
              name="nid"
              value={form.nid}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('nid') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter NID number"
              inputMode="numeric"
            />
            {hasError('nid') && (
              <p className="mt-1 text-sm text-red-600">{errors.nid}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('email') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter email address"
              autoComplete="email"
            />
            {hasError('email') && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('phone') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="e.g. +8801XXXXXXXXX"
              autoComplete="tel"
            />
            {hasError('phone') && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input 
                id="onWhatsapp" 
                name="onWhatsapp" 
                type="checkbox" 
                checked={form.onWhatsapp} 
                onChange={handleChange} 
                className="h-4 w-4 focus:outline-none focus:ring-0 focus:ring-offset-0" 
              />
              <label htmlFor="onWhatsapp" className="text-sm text-gray-700 dark:text-gray-300">Number is on WhatsApp</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number</label>
            <div className="relative">
              <input
                type="tel"
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 pr-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('whatsappNumber') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="e.g. +8801XXXXXXXXX"
                autoComplete="tel"
              />
              {form.whatsappNumber.trim() && (
                <button
                  type="button"
                  onClick={() => handleWhatsAppClick(form.whatsappNumber)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  title="Open WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            {hasError('whatsappNumber') && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division <span className="text-red-500">*</span></label>
            <select
              name="division"
              value={form.division}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('division') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
            >
              <option value="">Select Division</option>
              {divisionOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {hasError('division') && (
              <p className="mt-1 text-sm text-red-600">{errors.division}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District <span className="text-red-500">*</span></label>
            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!form.division}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('district') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
            >
              <option value="">Select District</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {hasError('district') && (
              <p className="mt-1 text-sm text-red-600">{errors.district}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upazila <span className="text-red-500">*</span></label>
            <select
              name="upazila"
              value={form.upazila}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!form.district}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('upazila') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
            >
              <option value="">Select Upazila</option>
              {upazilaOptions.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            {hasError('upazila') && (
              <p className="mt-1 text-sm text-red-600">{errors.upazila}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-700"
              placeholder="e.g., B2B, Corporate, Partner"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasError('status') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            {hasError('status') && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              className="w-full rounded-lg border px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-700"
              placeholder="Any additional notes"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAgent;


