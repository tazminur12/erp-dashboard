import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, User, Phone, Calendar, CalendarDays, Edit, UserCircle, Clock, DollarSign, Building2, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';
import useFamilyMemberQueries from '../../hooks/useFamilyMemberQueries';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';

const FamilyMemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Family Member Query
  const { useFamilyMember } = useFamilyMemberQueries();
  const { data: selectedMember, isLoading, error } = useFamilyMember(id);
  
  // Fetch personal expense categories
  const { usePersonalCategories } = usePersonalCategoryQueries();
  const { data: allCategories = [], isLoading: categoriesLoading, refetch: refetchCategories } = usePersonalCategories();
  
  // Refetch categories when component mounts or when member changes
  React.useEffect(() => {
    if (selectedMember?.id) {
      refetchCategories();
    }
  }, [selectedMember?.id, refetchCategories]);
  
  // Filter categories for this family member
  const memberCategories = useMemo(() => {
    if (!selectedMember?.id || !allCategories.length) return [];
    return allCategories.filter(cat => {
      const catFamilyMemberId = cat.familyMemberId || cat.familyMember?.id || cat.familyMember?._id;
      return catFamilyMemberId && String(catFamilyMemberId) === String(selectedMember.id);
    });
  }, [allCategories, selectedMember]);
  
  // Calculate total debit for this member
  const totalDebit = useMemo(() => {
    return memberCategories.reduce((sum, cat) => sum + Number(cat.totalAmount || 0), 0);
  }, [memberCategories]);
  
  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  
  const iconMap = {
    Building2,
    DollarSign,
    Calendar,
    CalendarDays,
    FileText
  };


  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedMember) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {error ? `ত্রুটি: ${error.message || 'সদস্য লোড করতে সমস্যা হয়েছে'}` : 'সদস্য পাওয়া যায়নি'}
          </p>
          <button
            onClick={() => navigate('/personal/family-members')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{selectedMember.name} - প্রোফাইল</title>
        <meta name="description" content={`${selectedMember.name} এর প্রোফাইল`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/personal/family-members')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{selectedMember.name} - প্রোফাইল</h1>
            <p className="text-gray-600 dark:text-gray-400">পারিবারিক সদস্যের বিবরণ</p>
          </div>
        </div>
      </div>

      {/* Member Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {selectedMember.picture ? (
              <img
                src={selectedMember.picture}
                alt={selectedMember.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 dark:border-purple-800 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-4 border-purple-200 dark:border-purple-800 shadow-lg">
                <UserCircle className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedMember.name}</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{selectedMember.relationship}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ব্যক্তিগত তথ্য
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">নাম</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMember.name || '—'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">সম্পর্ক</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMember.relationship || '—'}</p>
              </div>
            </div>

            {selectedMember.fatherName && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">পিতার নাম</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMember.fatherName}</p>
                </div>
              </div>
            )}

            {selectedMember.motherName && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মাতার নাম</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMember.motherName}</p>
                </div>
              </div>
            )}

            {selectedMember.mobileNumber && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মোবাইল নম্বর</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMember.mobileNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            অতিরিক্ত তথ্য
          </h4>
          <div className="space-y-4">
            {selectedMember.createdAt && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">যোগ করা হয়েছে</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedMember.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {selectedMember.updatedAt && selectedMember.updatedAt !== selectedMember.createdAt && (
              <div className="flex items-start gap-3">
                <Edit className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">সর্বশেষ আপডেট</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedMember.updatedAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {selectedMember.id && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">সদস্য আইডি</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{selectedMember.id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories and Debit Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          ক্যাটাগরি এবং খরচের বিবরণ
        </h4>
        
        {categoriesLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : memberCategories.length > 0 ? (
          <div className="space-y-4">
            {/* Total Summary */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">মোট খরচ</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {formatCurrency(totalDebit)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            
            {/* Categories List */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ক্যাটাগরি তালিকা ({memberCategories.length})
              </h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ক্যাটাগরি</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বর্ণনা</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ধরন</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">মোট খরচ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {memberCategories.map((category) => {
                      const Icon = iconMap[category.icon] || DollarSign;
                      return (
                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                                <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {category.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {category.description || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              category.type === 'regular'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            }`}>
                              {category.type === 'regular' ? 'নিয়মিত' : 'অনিয়মিত'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(category.totalAmount || 0)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-1">কোন ক্যাটাগরি নেই</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              এই সদস্যের সাথে কোন খরচের ক্যাটাগরি যুক্ত নেই
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default FamilyMemberProfile;
