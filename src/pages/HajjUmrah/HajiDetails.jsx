import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Download,
  Share,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Plane,
  Hotel,
  FileCheck,
  MessageCircle
} from 'lucide-react';

const HajiDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [haji, setHaji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Enhanced mock data with comprehensive information
  useEffect(() => {
    const mockHajiData = {
      H001: {
        id: 'H001',
        personalInfo: {
          name: 'Md. Abdul Rahman',
          fatherName: 'Md. Karim Uddin',
          motherName: 'Fatima Begum',
          spouseName: 'Ayesha Begum',
          passport: 'A1234567',
          passportIssueDate: '2023-05-15',
          passportExpiryDate: '2033-05-15',
          nid: '1234567890123',
          birthDate: '1985-03-20',
          gender: 'Male',
          maritalStatus: 'Married',
          occupation: 'Business',
          religion: 'Islam',
          nationality: 'Bangladeshi',
          photo: '/api/placeholder/150/150'
        },
        contactInfo: {
          phone: '+8801712345678',
          alternatePhone: '+8801812345678',
          email: 'abdul.rahman@email.com',
          emergencyContact: 'Md. Hasan Ali',
          emergencyPhone: '+8801912345678',
          address: {
            present: 'House 15, Road 7, Dhanmondi, Dhaka-1205',
            permanent: 'Village: Bhola, Post: Bhola Sadar, District: Bhola'
          }
        },
        familyInfo: {
          totalMembers: 4,
          children: [
            { name: 'Ahmad Rahman', age: 12, gender: 'Male' },
            { name: 'Fatima Rahman', age: 8, gender: 'Female' }
          ],
          accompanyingPersons: [
            { name: 'Ayesha Begum', relation: 'Wife', passport: 'A1234568' }
          ]
        },
        packageInfo: {
          packageName: 'Premium Hajj 2024',
          packageType: 'Hajj',
          duration: '45 Days',
          agent: 'Al-Hijrah Travels',
          agentContact: '+8801612345678',
          groupLeader: 'Md. Ibrahim Ali',
          groupSize: 25,
          roomType: 'Double Bedroom',
          mealPlan: 'Full Board',
          transportMode: 'Air',
          airline: 'Saudi Airlines',
          flightNumber: 'SV1234',
          departureAirport: 'Hazrat Shahjalal International Airport',
          arrivalAirport: 'King Abdulaziz International Airport'
        },
        statusInfo: {
          status: 'confirmed',
          paymentStatus: 'paid',
          visaStatus: 'approved',
          medicalStatus: 'cleared',
          registrationDate: '2024-01-15',
          departureDate: '2024-06-10',
          returnDate: '2024-07-25',
          lastUpdated: '2024-05-15'
        },
        financialInfo: {
          totalAmount: 450000,
          paidAmount: 450000,
          dueAmount: 0,
          paymentHistory: [
            { date: '2024-01-15', amount: 100000, method: 'Bank Transfer', status: 'completed' },
            { date: '2024-02-15', amount: 150000, method: 'Cash', status: 'completed' },
            { date: '2024-03-15', amount: 200000, method: 'Bank Transfer', status: 'completed' }
          ],
          refundPolicy: 'Non-refundable after 30 days of departure'
        },
        documents: {
          passport: { uploaded: true, verified: true, expiry: '2033-05-15' },
          visa: { uploaded: true, verified: true, status: 'approved' },
          medicalCertificate: { uploaded: true, verified: true, expiry: '2024-08-15' },
          vaccinationRecord: { uploaded: true, verified: true },
          travelInsurance: { uploaded: true, verified: true },
          nid: { uploaded: true, verified: true },
          birthCertificate: { uploaded: true, verified: true },
          marriageCertificate: { uploaded: true, verified: true },
          bankStatement: { uploaded: true, verified: true },
          employmentLetter: { uploaded: true, verified: true }
        },
        accommodation: {
          makkah: {
            hotel: 'Al-Hijrah Hotel Makkah',
            address: 'Near Masjid al-Haram, Makkah',
            roomNumber: '205',
            checkIn: '2024-06-11',
            checkOut: '2024-07-20',
            amenities: ['WiFi', 'AC', 'TV', 'Refrigerator', 'Prayer Mat', 'Quran']
          },
          madinah: {
            hotel: 'Al-Hijrah Hotel Madinah',
            address: 'Near Masjid an-Nabawi, Madinah',
            roomNumber: '156',
            checkIn: '2024-07-21',
            checkOut: '2024-07-25',
            amenities: ['WiFi', 'AC', 'TV', 'Refrigerator', 'Prayer Mat', 'Quran']
          }
        },
        itinerary: [
          { date: '2024-06-10', activity: 'Departure from Dhaka', time: '22:00', location: 'Hazrat Shahjalal Airport' },
          { date: '2024-06-11', activity: 'Arrival in Jeddah', time: '06:00', location: 'King Abdulaziz Airport' },
          { date: '2024-06-11', activity: 'Transfer to Makkah', time: '08:00', location: 'Al-Hijrah Hotel' },
          { date: '2024-06-12', activity: 'Umrah Performance', time: '06:00', location: 'Masjid al-Haram' },
          { date: '2024-07-08', activity: 'Hajj Journey Begins', time: '05:00', location: 'Mina' },
          { date: '2024-07-09', activity: 'Day of Arafat', time: '06:00', location: 'Mount Arafat' },
          { date: '2024-07-10', activity: 'Eid al-Adha', time: '06:00', location: 'Muzdalifah' },
          { date: '2024-07-11', activity: 'Stoning of Jamarat', time: '06:00', location: 'Jamarat' },
          { date: '2024-07-20', activity: 'Transfer to Madinah', time: '14:00', location: 'Al-Hijrah Hotel Madinah' },
          { date: '2024-07-25', activity: 'Return to Dhaka', time: '18:00', location: 'Hazrat Shahjalal Airport' }
        ],
        emergencyContacts: [
          { name: 'Embassy of Bangladesh, Riyadh', phone: '+966112488800', type: 'Embassy' },
          { name: 'Consulate General, Jeddah', phone: '+966126617777', type: 'Consulate' },
          { name: 'Emergency Helpline', phone: '+966112488999', type: 'Emergency' },
          { name: 'Group Leader', phone: '+8801712345679', type: 'Group Leader' }
        ],
        notes: [
          { date: '2024-01-15', note: 'Initial registration completed', author: 'Admin' },
          { date: '2024-02-20', note: 'Documents submitted for verification', author: 'Staff' },
          { date: '2024-03-10', note: 'Visa application submitted', author: 'Staff' },
          { date: '2024-04-15', note: 'Visa approved and received', author: 'Staff' },
          { date: '2024-05-10', note: 'Final payment completed', author: 'Staff' }
        ]
      }
    };

    setTimeout(() => {
      setHaji(mockHajiData[id] || mockHajiData.H001);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  const getDocumentStatus = (doc) => {
    if (doc.uploaded && doc.verified) {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />;
    } else if (doc.uploaded && !doc.verified) {
      return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Details', icon: Plane },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'notes', label: 'Notes', icon: MessageCircle }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!haji) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Haji Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The requested Haji information could not be found.</p>
        <button
          onClick={() => navigate('/hajj-umrah/haji-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Haji List
        </button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-4 sm:block">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 sm:hidden">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {haji.personalInfo.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{haji.personalInfo.occupation}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {haji.personalInfo.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{haji.personalInfo.occupation}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{haji.contactInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{haji.contactInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(haji.statusInfo.status)}
            {getPaymentBadge(haji.statusInfo.paymentStatus)}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Haji ID</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{haji.id}</p>
            </div>
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{haji.packageInfo.packageName}</p>
            </div>
            <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">৳{haji.financialInfo.totalAmount.toLocaleString()}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Departure</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{haji.statusInfo.departureDate}</p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
            <Edit className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Edit Information</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base">
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Download Documents</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Print Details</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base">
            <Share className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Share Information</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.personalInfo.name}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Father's Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.personalInfo.fatherName}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mother's Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.personalInfo.motherName}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Spouse Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.personalInfo.spouseName}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.personalInfo.birthDate}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gender</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.personalInfo.gender}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Marital Status</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.personalInfo.maritalStatus}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Occupation</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.personalInfo.occupation}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Religion</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.personalInfo.religion}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Nationality</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.personalInfo.nationality}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">NID</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.personalInfo.nid}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.personalInfo.passport}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Primary Phone</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.contactInfo.phone}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Alternate Phone</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.contactInfo.alternatePhone}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.contactInfo.email}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Emergency Contact</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.contactInfo.emergencyContact}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Emergency Phone</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.contactInfo.emergencyPhone}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Present Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.contactInfo.address.present}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Permanent Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.contactInfo.address.permanent}</p>
        </div>
      </div>

      {/* Family Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Family Information</h3>
        <div className="mb-3 sm:mb-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Family Members</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.familyInfo.totalMembers}</p>
        </div>
        <div className="mb-3 sm:mb-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Children</label>
          <div className="mt-2 space-y-2">
            {haji.familyInfo.children.map((child, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-900 dark:text-white flex-1 min-w-0">{child.name}</span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">({child.age} years, {child.gender})</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Accompanying Persons</label>
          <div className="mt-2 space-y-2">
            {haji.familyInfo.accompanyingPersons.map((person, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-900 dark:text-white flex-1 min-w-0">{person.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">({person.relation})</span>
                  <span className="text-gray-500 dark:text-gray-500 break-all">Passport: {person.passport}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageDetails = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Package Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Package Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.packageInfo.packageName}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.packageType}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Duration</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.duration}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Travel Agent</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo.agent}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent Contact</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.packageInfo.agentContact}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Group Leader</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo.groupLeader}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Group Size</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.groupSize} people</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.roomType}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Meal Plan</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.mealPlan}</p>
          </div>
        </div>
      </div>

      {/* Flight Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Flight Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Airline</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo.airline}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Flight Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo.flightNumber}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Departure Airport</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo.departureAirport}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Arrival Airport</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo.arrivalAirport}</p>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Status Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Registration Status</label>
            <div className="mt-1">{getStatusBadge(haji.statusInfo.status)}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment Status</label>
            <div className="mt-1">{getPaymentBadge(haji.statusInfo.paymentStatus)}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visa Status</label>
            <div className="mt-1">{getStatusBadge(haji.statusInfo.visaStatus)}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Medical Status</label>
            <div className="mt-1">{getStatusBadge(haji.statusInfo.medicalStatus)}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Registration Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.statusInfo.registrationDate}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Updated</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.statusInfo.lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">৳{haji.financialInfo.totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">৳{haji.financialInfo.paidAmount.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">৳{haji.financialInfo.dueAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Method</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {haji.financialInfo.paymentHistory.map((payment, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-white">{payment.date}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-white">৳{payment.amount.toLocaleString()}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-white">{payment.method}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Refund Policy</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{haji.financialInfo.refundPolicy}</p>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Document Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Passport</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {haji.documents.passport.expiry ? `Expires: ${haji.documents.passport.expiry}` : ''}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.passport)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Visa</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Status: {haji.documents.visa.status}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.visa)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Medical Certificate</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {haji.documents.medicalCertificate.expiry ? `Expires: ${haji.documents.medicalCertificate.expiry}` : ''}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.medicalCertificate)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Vaccination Record</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.vaccinationRecord)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Travel Insurance</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.travelInsurance)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">NID</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.nid)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Birth Certificate</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.birthCertificate)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Marriage Certificate</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.marriageCertificate)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Bank Statement</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.bankStatement)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Employment Letter</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.employmentLetter)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccommodation = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Makkah Accommodation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Makkah Accommodation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hotel Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.accommodation.makkah.hotel}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.makkah.roomNumber}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.makkah.checkIn}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.makkah.checkOut}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.accommodation.makkah.address}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amenities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {haji.accommodation.makkah.amenities.map((amenity, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs sm:text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Madinah Accommodation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Madinah Accommodation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hotel Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.accommodation.madinah.hotel}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.madinah.roomNumber}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.madinah.checkIn}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation.madinah.checkOut}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.accommodation.madinah.address}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amenities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {haji.accommodation.madinah.amenities.map((amenity, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs sm:text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderItinerary = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Travel Itinerary</h3>
      <div className="space-y-3 sm:space-y-4">
        {haji.itinerary.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">{item.activity}</h4>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{item.location}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Emergency Contacts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {haji.emergencyContacts.map((contact, index) => (
          <div key={index} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">{contact.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">{contact.phone}</p>
                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs mt-1">
                  {contact.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Notes & Updates</h3>
      <div className="space-y-3 sm:space-y-4">
        {haji.notes.map((note, index) => (
          <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{note.author}</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{note.date}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1 break-words">{note.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'package':
        return renderPackageDetails();
      case 'financial':
        return renderFinancial();
      case 'documents':
        return renderDocuments();
      case 'accommodation':
        return renderAccommodation();
      case 'itinerary':
        return renderItinerary();
      case 'contacts':
        return renderEmergencyContacts();
      case 'notes':
        return renderNotes();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/hajj-umrah/haji-list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Haji Details - {haji.personalInfo.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">Complete information about the Haji</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] sm:min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default HajiDetails;
