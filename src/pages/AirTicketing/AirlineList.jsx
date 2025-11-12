import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Eye, Plane, Building, Phone, Mail, Globe, MapPin, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';
import useAirlineQueries from '../../hooks/useAirlineQueries';

const AirlineList = () => {
  const { isDark } = useTheme();
  const { useAirlines, useCreateAirline, useUpdateAirline, useDeleteAirline } = useAirlineQueries();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch airlines with filters
  const { data: airlinesData, isLoading, error, refetch } = useAirlines({
    page,
    limit: 100, // Show more items per page
    q: debouncedSearchTerm,
    status: statusFilter,
  });
  
  const airlines = airlinesData?.airlines || [];
  const createAirline = useCreateAirline();
  const updateAirline = useUpdateAirline();
  const deleteAirline = useDeleteAirline();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    headquarters: '',
    phone: '',
    email: '',
    website: '',
    established: '',
    status: 'Active',
    routes: '',
    fleet: '',
    logo: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      country: '',
      headquarters: '',
      phone: '',
      email: '',
      website: '',
      established: '',
      status: 'Active',
      routes: '',
      fleet: '',
      logo: ''
    });
    setLogoPreview(null);
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setLogoUploading(true);
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'airlines');
      
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
      const imageUrl = result.secure_url;
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'লোগো সফলভাবে আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লোগো আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        country: formData.country || null,
        headquarters: formData.headquarters || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        established: formData.established || null,
        status: formData.status || 'Active',
        routes: formData.routes ? parseInt(formData.routes) : 0,
        fleet: formData.fleet ? parseInt(formData.fleet) : 0,
        logo: formData.logo || null,
      };
      
      if (editingAirline) {
        // Update existing airline
        const airlineId = editingAirline._id || editingAirline.airlineId || editingAirline.id;
        await updateAirline.mutateAsync({ id: airlineId, data: payload });
      } else {
        // Create new airline
        await createAirline.mutateAsync(payload);
      }
      
      setIsModalOpen(false);
      setEditingAirline(null);
      resetForm();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error submitting airline:', error);
    }
  };

  const handleEdit = (airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name || '',
      code: airline.code || '',
      country: airline.country || '',
      headquarters: airline.headquarters || '',
      phone: airline.phone || '',
      email: airline.email || '',
      website: airline.website || '',
      established: airline.established || '',
      status: airline.status || 'Active',
      routes: airline.routes ? airline.routes.toString() : '',
      fleet: airline.fleet ? airline.fleet.toString() : '',
      logo: airline.logo || ''
    });
    setLogoPreview(airline.logo || null);
    setIsModalOpen(true);
  };

  const handleDelete = (airline) => {
    setAirlineToDelete(airline);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const airlineId = airlineToDelete._id || airlineToDelete.airlineId || airlineToDelete.id;
      await deleteAirline.mutateAsync(airlineId);
      setShowDeleteModal(false);
      setAirlineToDelete(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error deleting airline:', error);
    }
  };

  // Search is handled by the API, so we can use airlines directly
  // But we still filter by status on client side if needed (though API also handles it)
  const filteredAirlines = airlines;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Plane className="w-8 h-8 text-blue-600" />
              Airline Management
            </h1>
            <p className="text-gray-600 mt-2">Manage airline information, routes, and fleet details</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Airline
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Airlines</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : airlinesData?.pagination?.total || airlines.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Airlines</p>
              <p className="text-3xl font-bold text-green-600">
                {isLoading ? '...' : airlines.filter(a => a.status === 'Active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-3xl font-bold text-purple-600">
                {isLoading ? '...' : airlines.reduce((sum, airline) => sum + (airline.routes || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fleet</p>
              <p className="text-3xl font-bold text-orange-600">
                {isLoading ? '...' : airlines.reduce((sum, airline) => sum + (airline.fleet || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Plane className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search airlines by name, code, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Airlines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading airlines...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading airlines: {error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Airline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fleet & Routes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAirlines.map((airline) => {
                  const airlineId = airline._id || airline.airlineId || airline.id;
                  return (
                    <tr key={airlineId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/air-ticketing/airline/${airlineId}`} className="flex items-center group">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                              src={airline.logo || '/api/placeholder/100/60'}
                              alt={airline.name}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/100/60';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{airline.name}</div>
                            {airline.established && (
                              <div className="text-sm text-gray-500">Est. {airline.established}</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {airline.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{airline.country || 'N/A'}</div>
                            {airline.headquarters && (
                              <div className="text-gray-500 text-xs">{airline.headquarters}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {airline.phone && (
                            <div className="flex items-center mb-1">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{airline.phone}</span>
                            </div>
                          )}
                          {airline.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="truncate max-w-32">{airline.email}</span>
                            </div>
                          )}
                          {!airline.phone && !airline.email && (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <Plane className="w-4 h-4 text-gray-400 mr-1" />
                              {airline.fleet || 0} Aircraft
                            </span>
                            <span className="flex items-center">
                              <Globe className="w-4 h-4 text-gray-400 mr-1" />
                              {airline.routes || 0} Routes
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          airline.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {airline.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(airline)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Airline"
                            disabled={updateAirline.isPending}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(airline)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Airline"
                            disabled={deleteAirline.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && !error && filteredAirlines.length === 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No airlines found</h3>
            <p className="text-gray-500 mb-4">
              {debouncedSearchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first airline.'}
            </p>
            {!debouncedSearchTerm && statusFilter === 'All' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add New Airline
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAirline ? 'Edit Airline' : 'Add New Airline'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {editingAirline ? 'Update airline information' : 'Enter airline details'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Logo Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Airline Logo
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview || formData.logo ? (
                    <div className="relative">
                      <img
                        src={logoPreview || formData.logo}
                        alt="Airline Logo Preview"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      {logoUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          <span>{logoPreview || formData.logo ? 'লোগো পরিবর্তন করুন' : 'লোগো আপলোড করুন'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={logoUploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG বা GIF (সর্বোচ্চ 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Airline Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter airline name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Airline Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="3"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., BG, EK"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={formData.headquarters}
                    onChange={(e) => setFormData({...formData, headquarters: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter headquarters location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter website URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.established}
                    onChange={(e) => setFormData({...formData, established: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter established year"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Routes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.routes}
                    onChange={(e) => setFormData({...formData, routes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter number of routes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fleet Size
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.fleet}
                    onChange={(e) => setFormData({...formData, fleet: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter fleet size"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAirline(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createAirline.isPending || updateAirline.isPending}
                >
                  {createAirline.isPending || updateAirline.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingAirline ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingAirline ? 'Update Airline' : 'Add Airline'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Airline</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <strong>{airlineToDelete?.name}</strong>? 
                  All associated data will be permanently removed.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleteAirline.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={deleteAirline.isPending}
                >
                  {deleteAirline.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Airline'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirlineList;
