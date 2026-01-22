import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Building,
  DollarSign,
  FileText,
  Download,
  Upload,
  Award,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Camera,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  CreditCard,
  Globe,
  Plane,
  Package,
  Loader2
} from 'lucide-react';
import { useEmployee } from '../../../hooks/useHRQueries';
import { useAirTickets } from '../../../hooks/useAirTicketQueries';
import { useHajiList } from '../../../hooks/UseHajiQueries';
import { useUmrahList } from '../../../hooks/UseUmrahQuries';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const [activeTab, setActiveTab] = useState('overview');

  const empId = employee?.id ?? employee?.employeeId ?? id;
  const empEmail = employee?.email ?? '';
  const empName = employee?.name ?? [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') ?? '';

  const { data: ticketsData } = useAirTickets({
    issuedById: empId ?? undefined,
    limit: 5000,
    page: 1
  });
  const allTickets = ticketsData?.data ?? [];
  const myTickets = allTickets.filter(
    (t) => String(t.issuedById ?? '') === String(empId ?? '')
  );
  const ticketCount = myTickets.length;
  const ticketSellTotal = myTickets.reduce(
    (sum, t) => sum + (Number(t.customerDeal) || 0),
    0
  );

  const { data: hajiResp } = useHajiList({ limit: 5000, page: 1 });
  const hajiList = hajiResp?.data ?? hajiResp?.hajis ?? [];
  const hajiCount = hajiList.filter((h) => {
    const by = h?.createdBy ?? h?.createdByUser;
    if (!by) return false;
    const idMatch = String(by?.id ?? by?.userId ?? '') === String(empId ?? '');
    const emailMatch = !!empEmail && (String(by?.email ?? '') === String(empEmail));
    const nameMatch = !!empName && (String(by?.name ?? '') === String(empName));
    return idMatch || emailMatch || nameMatch;
  }).length;

  const { data: umrahResp } = useUmrahList({ limit: 5000, page: 1 });
  const umrahList = umrahResp?.data ?? umrahResp?.umrah ?? umrahResp?.pilgrims ?? umrahResp?.list ?? [];
  const umrahCount = umrahList.filter((u) => {
    const by = u?.createdBy ?? u?.createdByUser;
    if (!by) return false;
    const idMatch = String(by?.id ?? by?.userId ?? '') === String(empId ?? '');
    const emailMatch = !!empEmail && (String(by?.email ?? '') === String(empEmail));
    const nameMatch = !!empName && (String(by?.name ?? '') === String(empName));
    return idMatch || emailMatch || nameMatch;
  }).length;

  const additionalServiceCount = 0;

  const formatCurrency = (n) => `৳${Number(n || 0).toLocaleString('bn-BD')}`;

  const handleGoBack = () => {
    navigate('/office-management/hr/employee/list');
  };

  const handleEdit = () => {
    navigate(`/office-management/hr/employee/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">কর্মচারী প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">কর্মচারী পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-4">আপনি যে কর্মচারী খুঁজছেন তিনি বিদ্যমান নেই।</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            কর্মচারী তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'সারসংক্ষেপ', icon: User },
    { id: 'employment', name: 'কর্মসংস্থান', icon: Briefcase },
    { id: 'tickets-services', name: 'টিকেট, হজ্ব, উমরাহ ও সেবা', icon: BarChart3 },
    { id: 'documents', name: 'নথিপত্র', icon: FileText }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          ব্যক্তিগত তথ্য
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">পূর্ণ নাম</label>
              <p className="text-gray-900">{employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">জন্ম তারিখ</label>
              <p className="text-gray-900">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('bn-BD') : 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">লিঙ্গ</label>
              <p className="text-gray-900 capitalize">{employee.gender || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">জরুরি যোগাযোগ</label>
              <p className="text-gray-900">{employee.emergencyContact || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">জরুরি ফোন</label>
              <p className="text-gray-900">{employee.emergencyPhone || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          যোগাযোগের তথ্য
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">ইমেইল</p>
                <p className="text-gray-900">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">ফোন</p>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700">ঠিকানা</p>
                <p className="text-gray-900">{employee.address || 'নির্দিষ্ট করা হয়নি'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderEmploymentTab = () => (
    <div className="space-y-6">
      {/* Employment Details */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          কর্মসংস্থান বিবরণ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">কর্মচারী ID</label>
              <p className="text-gray-900 font-mono">{employee.employerId || employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">পদ</label>
              <p className="text-gray-900">{employee.designation || employee.position}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">বিভাগ</label>
              <p className="text-gray-900">{employee.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ম্যানেজার</label>
              <p className="text-gray-900">{employee.manager || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">যোগদানের তারিখ</label>
              <p className="text-gray-900">{new Date(employee.joiningDate || employee.joinDate).toLocaleDateString('bn-BD')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">কর্মসংস্থানের ধরন</label>
              <p className="text-gray-900">{employee.employmentType || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">কর্মস্থল</label>
              <p className="text-gray-900">{employee.workLocation || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">শাখা</label>
              <p className="text-gray-900">{employee.branch || employee.branchId || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">স্ট্যাটাস</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (employee.status === 'active' || employee.status === 'Active')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status === 'active' || employee.status === 'Active' ? 'সক্রিয়' : employee.status === 'inactive' || employee.status === 'Inactive' ? 'নিষ্ক্রিয়' : employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          বেতন তথ্য
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">মূল বেতন</p>
            <p className="text-2xl font-bold text-gray-900">৳{(employee.salary || employee.basicSalary || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">ভাতা</p>
            <p className="text-2xl font-bold text-gray-900">৳{(employee.allowances || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">মোট</p>
            <p className="text-2xl font-bold text-blue-600">৳{((employee.basicSalary || 0) + (employee.allowances || 0)).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">সুবিধা</label>
            <p className="text-gray-900">{employee.benefits || 'নির্দিষ্ট করা হয়নি'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ব্যাংক একাউন্ট</label>
              <p className="text-gray-900 font-mono">{employee.bankAccount || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ব্যাংকের নাম</label>
              <p className="text-gray-900">{employee.bankName || 'নির্দিষ্ট করা হয়নি'}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderTicketsServicesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          টিকেট, হজ্ব, উমরাহ ও সেবা পরিসংখ্যান
        </h3>
        <p className="text-gray-600 mb-6">
          এই কর্মচারীর টিকেট বিক্রয়, হজ্ব, উমরাহ ও অতিরিক্ত সেবার সংক্ষিপ্ত তথ্য
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plane className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">টিকেট সংখ্যা</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{ticketCount}</p>
            <p className="text-xs text-gray-500 mt-1">মোট টিকেট বিক্রয়</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">টিকেট বিক্রয় (৳)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(ticketSellTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">মোট বিক্রয়</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🕋</span>
            </div>
            <p className="text-sm font-medium text-gray-700">হজ্ব</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{hajiCount}</p>
            <p className="text-xs text-gray-500 mt-1">হজ্ব যাত্রী সংখ্যা</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🕋</span>
            </div>
            <p className="text-sm font-medium text-gray-700">উমরাহ</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{umrahCount}</p>
            <p className="text-xs text-gray-500 mt-1">উমরাহ যাত্রী সংখ্যা</p>
          </div>
          <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">অতিরিক্ত সেবা</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{additionalServiceCount}</p>
            <p className="text-xs text-gray-500 mt-1">পাসপোর্ট, ভিসা, ম্যানপাওয়ার ইত্যাদি</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => {
    // Get document URLs with fallback
    const profilePictureUrl = employee.profilePictureUrl || employee.profilePicture;
    const nidCopyUrl = employee.nidCopyUrl || employee.nidCopy;
    
   
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            নথিপত্র
          </h3>
          <div className="space-y-4">
            {/* Profile Picture */}
            {profilePictureUrl && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">প্রোফাইল ছবি</p>
                    <p className="text-sm text-gray-500">ছবি • প্রোফাইল ফটো</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img src={profilePictureUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = profilePictureUrl;
                      link.target = '_blank';
                      link.download = `Profile_${employee.firstName}_${employee.lastName}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ডাউনলোড
                  </button>
                </div>
              </div>
            )}
            
            
            {/* NID Copy */}
            {nidCopyUrl && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">জাতীয় পরিচয়পত্র (NID) কপি</p>
                    <p className="text-sm text-gray-500">নথি • জাতীয় পরিচয়পত্রের কপি</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = nidCopyUrl;
                      link.target = '_blank';
                      link.download = `NID_${employee.firstName}_${employee.lastName}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    NID ডাউনলোড
                  </button>
                  <button 
                    onClick={() => window.open(nidCopyUrl, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    <FileText className="w-4 h-4" />
                    দেখুন
                  </button>
                </div>
              </div>
            )}
          
          {/* Other Documents */}
          {employee.otherDocuments && employee.otherDocuments.length > 0 && (
            employee.otherDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name || `নথি ${index + 1}`}</p>
                    <p className="text-sm text-gray-500">{doc.type || 'নথি'} • অতিরিক্ত নথি</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = doc.url || doc.link;
                      link.target = '_blank';
                      link.download = `${doc.name || `Document_${index + 1}`}_${employee.firstName}_${employee.lastName}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ডাউনলোড
                  </button>
                  <button 
                    onClick={() => window.open(doc.url || doc.link, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    <FileText className="w-4 h-4" />
                    দেখুন
                  </button>
                </div>
              </div>
            ))
          )}
          
          {!profilePictureUrl && !nidCopyUrl && (!employee.otherDocuments || employee.otherDocuments.length === 0) && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">কোন নথি আপলোড করা হয়নি</p>
              <p className="text-gray-400 text-sm mt-2">
                নথি আপলোড করার পর এখানে দেখা যাবে
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'employment':
        return renderEmploymentTab();
      case 'tickets-services':
        return renderTicketsServicesTab();
      case 'documents':
        return renderDocumentsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-600 mt-2">{employee.position} • {employee.department}</p>
            </div>
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit className="w-5 h-5" />
              প্রোফাইল সম্পাদনা করুন
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {employee.profilePictureUrl || employee.profilePicture ? (
                  <img
                    src={employee.profilePictureUrl || employee.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (employee.status === 'active' || employee.status === 'Active')
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'active' || employee.status === 'Active' ? 'সক্রিয়' : employee.status === 'inactive' || employee.status === 'Inactive' ? 'নিষ্ক্রিয়' : employee.status}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-1">{employee.position}</p>
              <p className="text-gray-500">{employee.department} • কর্মচারী ID: {employee.employeeId}</p>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {employee.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  যোগদান {new Date(employee.joinDate).toLocaleDateString('bn-BD')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
