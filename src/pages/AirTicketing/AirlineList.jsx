import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Eye, Plane, Building, Phone, Mail, Globe, MapPin } from 'lucide-react';

const AirlineList = () => {
  const [airlines, setAirlines] = useState([
    {
      id: 1,
      name: 'Biman Bangladesh Airlines',
      code: 'BG',
      country: 'Bangladesh',
      headquarters: 'Dhaka, Bangladesh',
      phone: '+880-2-8901000',
      email: 'info@biman-airlines.com',
      website: 'www.biman-airlines.com',
      established: '1972',
      status: 'Active',
      routes: 45,
      fleet: 18,
      logo: '/api/placeholder/100/60'
    },
    {
      id: 2,
      name: 'US-Bangla Airlines',
      code: 'BS',
      country: 'Bangladesh',
      headquarters: 'Dhaka, Bangladesh',
      phone: '+880-2-8952000',
      email: 'info@us-bangla.com',
      website: 'www.us-bangla.com',
      established: '2014',
      status: 'Active',
      routes: 28,
      fleet: 12,
      logo: '/api/placeholder/100/60'
    },
    {
      id: 3,
      name: 'Emirates',
      code: 'EK',
      country: 'UAE',
      headquarters: 'Dubai, UAE',
      phone: '+971-4-2944444',
      email: 'info@emirates.com',
      website: 'www.emirates.com',
      established: '1985',
      status: 'Active',
      routes: 158,
      fleet: 270,
      logo: '/api/placeholder/100/60'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
    fleet: ''
  });

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
      fleet: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAirline) {
      // Update existing airline
      setAirlines(airlines.map(airline => 
        airline.id === editingAirline.id 
          ? { ...airline, ...formData, routes: parseInt(formData.routes), fleet: parseInt(formData.fleet) }
          : airline
      ));
    } else {
      // Add new airline
      const newAirline = {
        id: Date.now(),
        ...formData,
        routes: parseInt(formData.routes),
        fleet: parseInt(formData.fleet),
        logo: '/api/placeholder/100/60'
      };
      setAirlines([...airlines, newAirline]);
    }
    
    setIsModalOpen(false);
    setEditingAirline(null);
    resetForm();
  };

  const handleEdit = (airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name,
      code: airline.code,
      country: airline.country,
      headquarters: airline.headquarters,
      phone: airline.phone,
      email: airline.email,
      website: airline.website,
      established: airline.established,
      status: airline.status,
      routes: airline.routes.toString(),
      fleet: airline.fleet.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = (airline) => {
    setAirlineToDelete(airline);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setAirlines(airlines.filter(airline => airline.id !== airlineToDelete.id));
    setShowDeleteModal(false);
    setAirlineToDelete(null);
  };

  const filteredAirlines = airlines.filter(airline => {
    const matchesSearch = airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airline.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airline.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || airline.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <p className="text-3xl font-bold text-gray-900">{airlines.length}</p>
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
                {airlines.filter(a => a.status === 'Active').length}
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
                {airlines.reduce((sum, airline) => sum + airline.routes, 0)}
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
                {airlines.reduce((sum, airline) => sum + airline.fleet, 0)}
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
              {filteredAirlines.map((airline) => (
                <tr key={airline.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/air-ticketing/airline/${airline.id}`} className="flex items-center group">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          src={airline.logo}
                          alt={airline.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{airline.name}</div>
                        <div className="text-sm text-gray-500">Est. {airline.established}</div>
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
                        <div className="font-medium">{airline.country}</div>
                        <div className="text-gray-500 text-xs">{airline.headquarters}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{airline.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate max-w-32">{airline.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Plane className="w-4 h-4 text-gray-400 mr-1" />
                          {airline.fleet} Aircraft
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-1" />
                          {airline.routes} Routes
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
                      {airline.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(airline)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Airline"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(airline)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Airline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAirlines.length === 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No airlines found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first airline.'}
            </p>
            {!searchTerm && statusFilter === 'All' && (
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAirline ? 'Edit Airline' : 'Add New Airline'}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingAirline ? 'Update airline information' : 'Enter airline details'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter airline name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="3"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BG, EK"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headquarters *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.headquarters}
                    onChange={(e) => setFormData({...formData, headquarters: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter headquarters location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter website URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.established}
                    onChange={(e) => setFormData({...formData, established: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter established year"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Routes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.routes}
                    onChange={(e) => setFormData({...formData, routes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of routes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fleet Size
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.fleet}
                    onChange={(e) => setFormData({...formData, fleet: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter fleet size"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAirline(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAirline ? 'Update Airline' : 'Add Airline'}
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
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Airline
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
