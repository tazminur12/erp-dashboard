import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock, Edit } from 'lucide-react';
import useSecureAxios from '../../hooks/UseAxiosSecure.js';
import Swal from 'sweetalert2';



const VendorDetails = () => {
  const { id } = useParams();
  const axiosSecure = useSecureAxios();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Function to fetch vendor activities
  const fetchVendorActivities = async (vendorId) => {
    try {
      setActivitiesLoading(true);
      // Try to fetch activities from different possible endpoints
      const endpoints = [
        `/vendors/${vendorId}/activities`,
        `/activities?vendorId=${vendorId}`,
        `/vendor-activities/${vendorId}`
      ];
      
      let activitiesData = [];
      for (const endpoint of endpoints) {
        try {
          const response = await axiosSecure.get(endpoint);
          activitiesData = response.data?.activities || response.data || [];
          if (activitiesData.length > 0) break;
        } catch (error) {
          // Continue to next endpoint if this one fails
          continue;
        }
      }
      
      // If no activities found from API, show a message
      if (activitiesData.length === 0) {
        activitiesData = [
          {
            id: 'no-activity',
            type: 'info',
            title: 'No recent activity found',
            time: new Date().toISOString()
          }
        ];
      }
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching vendor activities:', error);
      // Set a fallback message if all API calls fail
      setActivities([
        {
          id: 'error-activity',
          type: 'error',
          title: 'Unable to load activities',
          time: new Date().toISOString()
        }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        // Fetch all vendors and filter by vendorId
        const response = await axiosSecure.get('/vendors');
        
        // Extract vendors array from response
        const vendorsData = response.data?.vendors || response.data || [];
        
        // Find vendor by vendorId
        const vendorData = vendorsData.find(v => 
          v.vendorId === id || v._id === id || v.id === id
        );
        
        if (vendorData) {
          // Transform vendor data to match frontend expectations
          const transformedVendor = {
            vendorId: vendorData.vendorId || vendorData._id || vendorData.id,
            tradeName: vendorData.tradeName || '',
            tradeLocation: vendorData.tradeLocation || '',
            ownerName: vendorData.ownerName || '',
            contactNo: vendorData.contactNo || '',
            dob: vendorData.dob || '',
            nid: vendorData.nid || '',
            passport: vendorData.passport || ''
          };
          
          setVendor(transformedVendor);
          // Fetch activities for this vendor
          fetchVendorActivities(transformedVendor.vendorId);
        } else {
          setVendor(null);
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to fetch vendor details: ${error.response?.status || error.message}`,
          confirmButtonColor: '#7c3aed'
        });
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id, axiosSecure]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading vendor details...</div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Vendor not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{vendor.tradeName}</h1>
            <p className="text-gray-600 dark:text-gray-400">Vendor Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/vendors/${vendor.vendorId}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3.5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Edit className="w-4 h-4" /> Edit Vendor
          </Link>
          <Link to="/vendors" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3.5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Vendor ID</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.vendorId}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Owner</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.ownerName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Trade Location</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.tradeLocation}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Contact</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.contactNo}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Date of Birth</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.dob || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">NID</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.nid || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Passport</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.passport || '-'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading activities...</div>
            </div>
          ) : (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{activity.title}</div>
                    <div className="text-xs text-gray-500">
                      {activity.time ? new Date(activity.time).toLocaleString() : 'No timestamp'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


