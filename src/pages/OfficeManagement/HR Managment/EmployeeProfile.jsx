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

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock employee data - in real app, this would come from API
  const mockEmployeeData = {
    1: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+8801234567890',
      address: 'House 123, Road 45, Dhanmondi, Dhaka-1205, Bangladesh',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '+8801234567891',
      employeeId: 'EMP001',
      position: 'Senior Software Engineer',
      department: 'Information Technology',
      manager: 'Sarah Wilson',
      joinDate: '2023-01-15',
      employmentType: 'Full-time',
      workLocation: 'Dhaka Office',
      basicSalary: 50000,
      allowances: 5000,
      benefits: 'Health Insurance, Provident Fund',
      bankAccount: '1234567890123456',
      bankName: 'Dutch Bangla Bank',
      status: 'Active',
      profilePicture: null,
      skills: ['React', 'Node.js', 'Python', 'JavaScript', 'SQL'],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Dhaka',
          year: '2012',
          grade: '3.8/4.0'
        }
      ],
      experience: [
        {
          company: 'Tech Solutions Ltd',
          position: 'Software Developer',
          duration: '2012-2018',
          description: 'Developed web applications using React and Node.js'
        },
        {
          company: 'Digital Innovations',
          position: 'Senior Developer',
          duration: '2018-2022',
          description: 'Led development team and mentored junior developers'
        }
      ],
      achievements: [
        'Employee of the Month - March 2023',
        'Best Innovation Award - 2022',
        'Team Leadership Excellence - 2021'
      ],
      documents: [
        { name: 'Resume', type: 'PDF', uploaded: '2023-01-10' },
        { name: 'NID Copy', type: 'Image', uploaded: '2023-01-10' },
        { name: 'Educational Certificate', type: 'PDF', uploaded: '2023-01-10' }
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const employeeData = mockEmployeeData[id];
      if (employeeData) {
        setEmployee(employeeData);
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleGoBack = () => {
    navigate('/office-management/hr/employee/list');
  };

  const handleEdit = () => {
    navigate(`/office-management/hr/employee/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
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
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'performance', name: 'Performance', icon: TrendingUp }
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
              <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900 capitalize">{employee.gender}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <p className="text-gray-900">{employee.emergencyContact}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
              <p className="text-gray-900">{employee.emergencyPhone}</p>
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
                <p className="text-gray-900">{employee.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {employee.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {skill}
            </span>
          ))}
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
              <p className="text-gray-900 font-mono">{employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <p className="text-gray-900">{employee.position}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="text-gray-900">{employee.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <p className="text-gray-900">{employee.manager}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <p className="text-gray-900">{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <p className="text-gray-900">{employee.employmentType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Location</label>
              <p className="text-gray-900">{employee.workLocation}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                employee.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status}
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
            <p className="text-2xl font-bold text-gray-900">৳{employee.basicSalary.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Allowances</p>
            <p className="text-2xl font-bold text-gray-900">৳{employee.allowances.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="text-2xl font-bold text-blue-600">৳{(employee.basicSalary + employee.allowances).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Benefits</label>
            <p className="text-gray-900">{employee.benefits}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account</label>
              <p className="text-gray-900 font-mono">{employee.bankAccount}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <p className="text-gray-900">{employee.bankName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-600" />
          Education
        </h3>
        <div className="space-y-4">
          {employee.education.map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                </div>
                <span className="text-sm text-gray-500">{edu.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-orange-600" />
          Work Experience
        </h3>
        <div className="space-y-4">
          {employee.experience.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{exp.position}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-500">{exp.duration}</span>
              </div>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Achievements
        </h3>
        <div className="space-y-3">
          {employee.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-gray-700">{achievement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Documents
        </h3>
        <div className="space-y-4">
          {employee.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • Uploaded {new Date(doc.uploaded).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Rating</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">4.8/5</p>
          <p className="text-sm text-gray-500 mt-1">Excellent</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">98%</p>
          <p className="text-sm text-gray-500 mt-1">This Month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Projects Completed</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">12</p>
          <p className="text-sm text-gray-500 mt-1">This Year</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Reviews</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">Q4 2023 Review</h4>
              <span className="text-sm text-gray-500">December 2023</span>
            </div>
            <p className="text-gray-700">Excellent work on the customer portal project. Demonstrated strong leadership skills and technical expertise.</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-gray-700">Rating:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}>★</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'employment':
        return renderEmploymentTab();
      case 'documents':
        return renderDocumentsTab();
      case 'performance':
        return renderPerformanceTab();
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
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                {employee.profilePicture ? (
                  <img
                    src={employee.profilePicture}
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
                  {employee.firstName} {employee.lastName}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  employee.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status}
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
