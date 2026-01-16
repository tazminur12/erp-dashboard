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
  DollarSign,
  FileText,
  Briefcase,
  Clock
} from 'lucide-react';
import useEmployeeQueries from '../../hooks/useEmployeeQueries';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useGetEmployee, useUpdateEmployee } = useEmployeeQueries();
  const { data: employee, isLoading: employeeLoading } = useGetEmployee(id);
  const updateEmployeeMutation = useUpdateEmployee();

  const positionOptions = [
    'খামার ম্যানেজার',
    'গরু যত্নকারী',
    'দুধ সংগ্রহকারী',
    'খাদ্য ব্যবস্থাপক',
    'সিকিউরিটি গার্ড',
    'ড্রাইভার',
    'ক্লিনার',
    'অন্যান্য'
  ];

  const statusOptions = [
    { value: 'active', label: 'সক্রিয়' },
    { value: 'inactive', label: 'নিষ্ক্রিয়' },
    { value: 'on_leave', label: 'ছুটিতে' },
    { value: 'terminated', label: 'চাকরি ছাড়া' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    address: '',
    joinDate: '',
    salary: '',
    workHours: '',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        position: employee.position || '',
        phone: employee.phone || '',
        email: employee.email || '',
        address: employee.address || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
        salary: employee.salary || '',
        workHours: employee.workHours || '',
        status: employee.status || 'active',
        notes: employee.notes || ''
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'নাম আবশ্যক';
    if (!formData.position.trim()) newErrors.position = 'পদ আবশ্যক';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর আবশ্যক';
    if (!formData.joinDate) newErrors.joinDate = 'যোগদান তারিখ আবশ্যক';
    if (!formData.salary || Number(formData.salary) <= 0) newErrors.salary = 'বেতন আবশ্যক এবং ০ এর বেশি হতে হবে';
    if (!formData.workHours || Number(formData.workHours) <= 0) newErrors.workHours = 'কাজের সময় আবশ্যক এবং ০ এর বেশি হতে হবে';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন।',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    try {
      await updateEmployeeMutation.mutateAsync({
        id,
        name: formData.name,
        position: formData.position,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address || '',
        joinDate: formData.joinDate,
        salary: Number(formData.salary),
        workHours: Number(formData.workHours),
        status: formData.status,
        notes: formData.notes || ''
      });
      
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'কর্মচারী তথ্য সফলভাবে আপডেট করা হয়েছে।',
        confirmButtonColor: '#10B981',
        timer: 2000
      }).then(() => {
        navigate(`/miraj-industries/employee/${id}`);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'কর্মচারী আপডেট করতে সমস্যা হয়েছে',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleGoBack = () => {
    navigate(`/miraj-industries/employee/${id}`);
  };

  if (employeeLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-600">কর্মচারী পাওয়া যায়নি</div>
        <button
          onClick={() => navigate('/miraj-industries/employees')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          কর্মচারী তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Helmet>
        <title>কর্মচারী সম্পাদনা - {employee.name}</title>
        <meta name="description" content={`${employee.name} এর তথ্য সম্পাদনা করুন`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGoBack} 
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            ফিরে যান
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">কর্মচারী সম্পাদনা</h1>
            <p className="text-gray-600 text-sm mt-1">{employee.name} - {employee.position}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="কর্মচারীর নাম"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পদ <span className="text-red-500">*</span>
              </label>
              <select
                name="position"
                required
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">পদ নির্বাচন করুন</option>
                {positionOptions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ফোন নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ফোন নম্বর"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ইমেইল ঠিকানা"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ঠিকানা"
              />
            </div>

            {/* Join Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                যোগদান তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joinDate"
                required
                value={formData.joinDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.joinDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.joinDate && <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                বেতন (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                required
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.salary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="মাসিক বেতন"
              />
              {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
            </div>

            {/* Work Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কাজের সময় (ঘণ্টা) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="workHours"
                required
                min="0"
                step="0.5"
                value={formData.workHours}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.workHours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="প্রতিদিনের কাজের সময়"
              />
              {errors.workHours && <p className="text-red-500 text-xs mt-1">{errors.workHours}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অবস্থা</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="অতিরিক্ত তথ্য"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleGoBack}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={updateEmployeeMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateEmployeeMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
