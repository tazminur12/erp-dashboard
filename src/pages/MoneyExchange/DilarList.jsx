import React, { useMemo, useState, useEffect } from 'react';
import { Building2, Search, Plus, Phone, User, Loader2, Trash2, Eye, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Swal from 'sweetalert2';
import { 
  useDilars, 
  useDeleteDilar
} from '../../hooks/useDilarQueries';


const DilarList = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  // React Query hooks
  const { data: dilars = [], isLoading: loading, error: dilarsError } = useDilars();
  const deleteDilarMutation = useDeleteDilar();
  
  // Local state
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Show error if dilars failed to load
  useEffect(() => {
    if (dilarsError) {
      console.error('Error fetching dilars:', dilarsError);
    }
  }, [dilarsError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(dilars) ? dilars : [];
    return Array.isArray(dilars) ? dilars.filter((d) =>
      [d.tradeName, d.tradeLocation, d.ownerName, d.contactNo, d.nid, d.passport]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    ) : [];
  }, [query, dilars]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleDeleteDilar = async (dilar) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `ডিলার "${dilar.tradeName || dilar.dilarId}" মুছে ফেলা হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (!result.isConfirmed) return;

    try {
      const idToDelete = dilar._id || dilar.id || dilar.dilarId;
      await deleteDilarMutation.mutateAsync(idToDelete);
    } catch (error) {
      console.error('Failed to delete dilar:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Dilar List</title>
        <meta name="description" content="Browse and manage the list of dilars." />
      </Helmet>
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ডিলার তালিকা</h1>
            <p className="text-gray-600 dark:text-gray-400">সব ডিলারের তালিকা</p>
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
              placeholder="ডিলার খুঁজুন..."
            />
          </div>
          <Link
            to="/money-exchange/dilar/add"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
          >
            <Plus className="w-4 h-4" /> নতুন ডিলার
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">আইডি</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ব্যবসায়ীক নাম</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অবস্থান</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মালিকের নাম</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোবাইল নং</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">এনআইডি</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      লোড হচ্ছে...
                    </div>
                  </td>
                </tr>
              ) : dilarsError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-red-500 dark:text-red-400">
                    ডিলার লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
                  </td>
                </tr>
              ) : paged.length > 0 ? paged.map((d) => {
                  return (
                  <tr key={d._id || d.dilarId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{d.dilarId || d._id || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {d.logo && (
                        <img src={d.logo} alt={d.tradeName} className="w-10 h-10 rounded" />
                      )}
                      {!d.logo && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">{d.tradeName || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {d.tradeLocation || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> {d.ownerName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" /> {d.contactNo || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {d.nid || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/money-exchange/dilar/${d._id || d.dilarId}/edit`)}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/money-exchange/dilar/${d._id || d.dilarId}`)}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => handleDeleteDilar(d)}
                        disabled={
                          (() => {
                            const currentId = d._id || d.id || d.dilarId;
                            return deleteDilarMutation.isPending && deleteDilarMutation.variables === currentId;
                          })()
                        }
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        title="মুছে ফেলুন"
                      >
                        {(() => {
                          const currentId = d._id || d.id || d.dilarId;
                          return deleteDilarMutation.isPending && deleteDilarMutation.variables === currentId;
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
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">কোন ডিলার পাওয়া যায়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            দেখানো হচ্ছে <span className="font-medium">{paged.length}</span> এর <span className="font-medium">{filtered.length}</span> ডিলার
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              আগে
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {currentPage} এর {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DilarList;
