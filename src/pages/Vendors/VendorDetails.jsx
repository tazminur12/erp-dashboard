import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock } from 'lucide-react';

const DEMO_VENDOR_MAP = {
  'VND-0001': {
    id: 'VND-0001',
    tradeName: 'Miraj Traders',
    tradeLocation: 'Dhaka, Bangladesh',
    ownerName: 'Abdul Karim',
    contactNo: '+8801711223344',
    dob: '1984-05-12',
    nid: '197845623412',
    passport: 'BA1234567'
  },
  'VND-0002': {
    id: 'VND-0002',
    tradeName: 'Nazmul Enterprise',
    tradeLocation: 'Chattogram',
    ownerName: 'Nazmul Hasan',
    contactNo: '+8801911334455',
    dob: '1990-08-21',
    nid: '199045623411',
    passport: 'EC7654321'
  }
};

const DEMO_ACTIVITY = [
  { id: 'a1', type: 'invoice', title: 'Invoice #INV-1023 created', time: '2025-09-12 10:12 AM' },
  { id: 'a2', type: 'payment', title: 'Payment received ৳25,000', time: '2025-09-10 03:45 PM' },
  { id: 'a3', type: 'order', title: 'Purchase order #PO-557 placed', time: '2025-09-02 11:20 AM' }
];

const VendorDetails = () => {
  const { id } = useParams();
  const vendor = DEMO_VENDOR_MAP[id] || Object.values(DEMO_VENDOR_MAP)[0];

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
        <Link to="/vendors" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3.5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <ul className="space-y-4">
            {DEMO_ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


