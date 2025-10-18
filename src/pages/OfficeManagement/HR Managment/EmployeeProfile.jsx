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
  Globe
} from 'lucide-react';
import { useEmployee } from '../../../hooks/useHRQueries';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const [activeTab, setActiveTab] = useState('overview');

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
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'documents', name: 'Documents', icon: FileText }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900 capitalize">{employee.gender}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <p className="text-gray-900">{employee.emergencyContact || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
              <p className="text-gray-900">{employee.emergencyPhone || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-gray-900">{employee.address || 'Not specified'}</p>
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
          Employment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <p className="text-gray-900 font-mono">{employee.employerId || employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <p className="text-gray-900">{employee.designation || employee.position}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="text-gray-900">{employee.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <p className="text-gray-900">{employee.manager || 'Not specified'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <p className="text-gray-900">{new Date(employee.joiningDate || employee.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <p className="text-gray-900">{employee.employmentType || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Location</label>
              <p className="text-gray-900">{employee.workLocation || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <p className="text-gray-900">{employee.branch || employee.branchId || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (employee.status === 'active' || employee.status === 'Active')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status === 'active' ? 'Active' : employee.status === 'inactive' ? 'Inactive' : employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Salary Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Basic Salary</p>
            <p className="text-2xl font-bold text-gray-900">৳{(employee.salary || employee.basicSalary || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Allowances</p>
            <p className="text-2xl font-bold text-gray-900">৳{(employee.allowances || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="text-2xl font-bold text-blue-600">৳{((employee.basicSalary || 0) + (employee.allowances || 0)).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Benefits</label>
            <p className="text-gray-900">{employee.benefits || 'Not specified'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account</label>
              <p className="text-gray-900 font-mono">{employee.bankAccount || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <p className="text-gray-900">{employee.bankName || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderDocumentsTab = () => {
    // Get document URLs with fallback
    const profilePictureUrl = employee.profilePictureUrl || employee.profilePicture;
    const resumeUrl = employee.resumeUrl || employee.resume;
    const nidCopyUrl = employee.nidCopyUrl || employee.nidCopy;
    
    console.log('Employee Profile - Documents Debug:');
    console.log('Profile Picture URL:', profilePictureUrl);
    console.log('Resume URL:', resumeUrl);
    console.log('NID Copy URL:', nidCopyUrl);
    console.log('Employee object:', employee);
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Documents
          </h3>
          <div className="space-y-4">
            {/* Profile Picture */}
            {profilePictureUrl && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Profile Picture</p>
                    <p className="text-sm text-gray-500">Image • Profile photo</p>
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
                    Download
                  </button>
                </div>
              </div>
            )}
            
            {/* Resume */}
            {resumeUrl && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Resume/CV</p>
                    <p className="text-sm text-gray-500">Document • Resume file</p>
                    <p className="text-xs text-gray-400 mt-1">Click download to view or save the file</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      // Create a temporary link to download the file
                      const link = document.createElement('a');
                      link.href = resumeUrl;
                      link.target = '_blank';
                      link.download = `Resume_${employee.firstName}_${employee.lastName}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                  <button 
                    onClick={() => window.open(resumeUrl, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    <FileText className="w-4 h-4" />
                    View
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
                    <p className="font-medium text-gray-900">NID Copy</p>
                    <p className="text-sm text-gray-500">Document • National ID copy</p>
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
                    Download NID
                  </button>
                  <button 
                    onClick={() => window.open(nidCopyUrl, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    <FileText className="w-4 h-4" />
                    View
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
                    <p className="font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</p>
                    <p className="text-sm text-gray-500">{doc.type || 'Document'} • Additional document</p>
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
                    Download
                  </button>
                  <button 
                    onClick={() => window.open(doc.url || doc.link, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    <FileText className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))
          )}
          
          {!profilePictureUrl && !resumeUrl && !nidCopyUrl && (!employee.otherDocuments || employee.otherDocuments.length === 0) && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No documents uploaded</p>
              <p className="text-gray-400 text-sm mt-2">
                Documents will appear here once uploaded
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
              Edit Profile
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
                  {employee.status === 'active' ? 'Active' : employee.status === 'inactive' ? 'Inactive' : employee.status}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-1">{employee.position}</p>
              <p className="text-gray-500">{employee.department} • Employee ID: {employee.employeeId}</p>
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
                  Joined {new Date(employee.joinDate).toLocaleDateString()}
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
