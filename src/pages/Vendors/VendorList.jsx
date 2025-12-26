import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Search, Plus, Phone, User, MapPin, Calendar, CreditCard, FileText, Upload, Loader2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ExcelUploader from '../../components/common/ExcelUploader';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Swal from 'sweetalert2';
import { 
  useVendors, 
  useDeleteVendor,
  useBulkVendorOperation
} from '../../hooks/useVendorQueries';


const VendorList = () => {
  const { isDark } = useTheme();
  
  // React Query hooks
  const { data: vendors = [], isLoading: loading, error: vendorsError } = useVendors();
  const deleteVendorMutation = useDeleteVendor();
  const bulkUploadMutation = useBulkVendorOperation();
  
  // Local state
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showExcelUploader, setShowExcelUploader] = useState(false);

  // Show error if vendors failed to load
  useEffect(() => {
    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
    }
  }, [vendorsError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(vendors) ? vendors : [];
    return Array.isArray(vendors) ? vendors.filter((v) =>
      [v.tradeName, v.tradeLocation, v.ownerName, v.contactNo, v.nid, v.passport]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    ) : [];
  }, [query, vendors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExcelDataProcessed = (processedData) => {
    // Validate that we have data to process
    if (!Array.isArray(processedData) || processedData.length === 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'Excel ফাইলে কোনো ডাটা পাওয়া যায়নি।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    // Close the Excel uploader modal
    setShowExcelUploader(false);

    // Use bulk create mutation to process the data (sends array directly to backend)
    bulkUploadMutation.mutate(processedData);
  };

  const handleDeleteVendor = async (vendor) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Vendor "${vendor.tradeName || vendor.vendorId}" will be removed permanently.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const idToDelete = vendor._id || vendor.id || vendor.vendorId;
      await deleteVendorMutation.mutateAsync(idToDelete);
    } catch (error) {
      console.error('Failed to delete vendor:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Vendor List</title>
        <meta name="description" content="Browse and manage the list of vendors." />
      </Helmet>
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Vendor List</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse all vendors</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search vendors..."
            />
          </div>
          <button
            onClick={() => setShowExcelUploader(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3.5 py-2.5"
          >
            <Upload className="w-4 h-4" /> Excel Upload
          </button>
          <Link
            to="/vendors/add"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trade Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trade Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">DOB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">NID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">Passport</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading vendors...
                    </div>
                  </td>
                </tr>
              ) : vendorsError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-red-500 dark:text-red-400">
                    Failed to load vendors. Please try again.
                  </td>
                </tr>
              ) : paged.length > 0 ? paged.map((v) => {
            
                  return (
                  <tr key={v._id || v.vendorId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{v.vendorId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {v.logo && (
                        <img src={v.logo} alt={v.tradeName} className="w-10 h-10 rounded" />
                      )}
                      {!v.logo && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link to={`/vendors/${v._id || v.vendorId}`} className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline block truncate">{v.tradeName}</Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{v.tradeLocation}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{v.tradeLocation}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> {v.ownerName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /> {v.contactNo}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /> {v.dob}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-500" /> {v.nid}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> {v.passport}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/vendors/${v._id || v.vendorId}`}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </Link>
                      <button
                        onClick={() => handleDeleteVendor(v)}
                        disabled={
                          (() => {
                            const currentId = v._id || v.id || v.vendorId;
                            return deleteVendorMutation.isPending && deleteVendorMutation.variables === currentId;
                          })()
                        }
                        className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Delete vendor"
                      >
                        {(() => {
                          const currentId = v._id || v.id || v.vendorId;
                          return deleteVendorMutation.isPending && deleteVendorMutation.variables === currentId;
                        })() ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No vendors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{paged.length}</span> of <span className="font-medium">{filtered.length}</span> vendors
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Vendor Data"
          acceptedFields={['tradeName', 'tradeLocation', 'ownerName', 'contactNo', 'dob', 'nid', 'passport']}
          requiredFields={['tradeName', 'tradeLocation', 'ownerName', 'contactNo']}
          sampleData={[
            ['Trade Name', 'Trade Location', 'Owner Name', 'Contact No', 'Date of Birth', 'NID', 'Passport'],
            ['Miraj Traders', 'Dhaka, Bangladesh', 'Abdul Karim', '+8801711223344', '1984-05-12', '197845623412', 'BA1234567'],
            ['Nazmul Enterprise', 'Chattogram', 'Nazmul Hasan', '+8801911334455', '1990-08-21', '199045623411', 'EC7654321'],
            ['Green Line Supplies', 'Sylhet', 'Shahadat Hossain', '+8801555667788', '1988-12-01', '188845623499', 'ZP1122334'],
            ['City Hardware', 'Khulna', 'Rubel Mia', '+8801311223344', '1982-03-30', '198245623477', 'AA9988776']
          ]}
        />
      )}
    </div>
  );
};

export default VendorList;
