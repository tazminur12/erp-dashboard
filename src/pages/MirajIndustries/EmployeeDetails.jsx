import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Edit
} from 'lucide-react';
import useFarmEmployeesQueries from '../../hooks/useFarmEmployeesQueries';

const getStatusClass = (status) => {
  const statusMap = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    on_leave: 'text-yellow-600 bg-yellow-100',
    terminated: 'text-red-600 bg-red-100'
  };
  return statusMap[status] || 'text-gray-600 bg-gray-100';
};

const getStatusLabel = (status) => {
  const statusMap = {
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    on_leave: 'ছুটিতে',
    terminated: 'চাকরি ছাড়া'
  };
  return statusMap[status] || status;
};

const getAttendanceStatusClass = (status) => {
  const statusMap = {
    present: 'text-green-600 bg-green-100',
    absent: 'text-red-600 bg-red-100',
    late: 'text-yellow-600 bg-yellow-100',
    half_day: 'text-blue-600 bg-blue-100',
    leave: 'text-purple-600 bg-purple-100'
  };
  return statusMap[status] || 'text-gray-600 bg-gray-100';
};

const getAttendanceStatusLabel = (status) => {
  const statusMap = {
    present: 'উপস্থিত',
    absent: 'অনুপস্থিত',
    late: 'দেরিতে',
    half_day: 'আধা দিন',
    leave: 'ছুটি'
  };
  return statusMap[status] || status;
};

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useGetFarmEmployee } = useFarmEmployeesQueries();
  const { data: employee, isLoading, error } = useGetFarmEmployee(id);
  // Attendance functionality removed - use separate attendance API if needed
  const attendanceRecords = [];

  if (isLoading) {
    return <div className="p-6">লোড হচ্ছে...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">তথ্য লোড করতে সমস্যা হয়েছে</div>;
  }
  if (!employee) {
    return <div className="p-6">তথ্য পাওয়া যায়নি</div>;
  }

  // Calculate attendance stats
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const todayAttendance = attendanceRecords.find(att => att.date === today);
  const monthlyPresent = attendanceRecords.filter(
    att => att.date.startsWith(thisMonth) && att.status === 'present'
  ).length;
  const monthlyAbsent = attendanceRecords.filter(
    att => att.date.startsWith(thisMonth) && att.status === 'absent'
  ).length;
  const monthlyLate = attendanceRecords.filter(
    att => att.date.startsWith(thisMonth) && att.status === 'late'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        <button
          onClick={() => navigate(`/miraj-industries/employee/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          সম্পাদনা করুন
        </button>
      </div>

      {/* Employee Header Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {employee.image ? (
              <img
                src={employee.image}
                alt={employee.name || 'Employee'}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center ${employee.image ? 'hidden' : 'flex'}`}>
              <User className="w-12 h-12 text-gray-500" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(employee.status)}`}>
                {getStatusLabel(employee.status)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {employee.position}
              </span>
              <span className="inline-flex items-center gap-1">
                <Tag className="w-4 h-4" /> ID: {employee.id || employee._id || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 
                যোগদান: {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('bn-BD') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Employee Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" /> যোগাযোগের তথ্য
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{employee.phone || '—'}</span>
              </div>
              {employee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{employee.email}</span>
                </div>
              )}
              {employee.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{employee.address}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> কাজের তথ্য
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">বেতন:</span>
                <span className="font-medium text-gray-900">৳{Number(employee.salary || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">কাজের সময়:</span>
                <span className="font-medium text-gray-900">{employee.workHours || 0} ঘণ্টা/দিন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">যোগদান তারিখ:</span>
                <span className="font-medium text-gray-900">
                  {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('bn-BD') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" /> আর্থিক তথ্য
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">প্রদত্ত পরিমাণ:</span>
                <span className="font-semibold text-green-600">
                  ৳{Number(employee.paidAmount || 0).toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">বকেয়া পরিমাণ:</span>
                <span className={`font-semibold ${Number(employee.totalDue || 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  ৳{Number(employee.totalDue || 0).toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {employee.notes && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" /> নোট
            </h3>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{employee.notes}</p>
          </div>
        )}
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">আজকের অবস্থা</p>
              <p className={`text-xl font-bold mt-1 ${
                todayAttendance?.status === 'present' ? 'text-green-600' : 
                todayAttendance?.status === 'absent' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {todayAttendance ? getAttendanceStatusLabel(todayAttendance.status) : 'রেকর্ড নেই'}
              </p>
            </div>
            {todayAttendance?.status === 'present' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : todayAttendance?.status === 'absent' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-gray-400" />
            )}
          </div>
          {todayAttendance?.checkIn && todayAttendance?.checkOut && (
            <div className="mt-2 text-xs text-gray-500">
              {todayAttendance.checkIn} - {todayAttendance.checkOut}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক উপস্থিত</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{monthlyPresent}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক অনুপস্থিত</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{monthlyAbsent}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক দেরি</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{monthlyLate}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" /> উপস্থিতি রেকর্ড
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  আসার সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যাওয়ার সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  নোট
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={5}>
                    কোনো উপস্থিতি রেকর্ড নেই
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(attendance.date).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{attendance.checkIn || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{attendance.checkOut || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceStatusClass(attendance.status)}`}>
                        {getAttendanceStatusLabel(attendance.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{attendance.notes || '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;

