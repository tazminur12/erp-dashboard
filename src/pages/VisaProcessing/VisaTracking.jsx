import React, { useMemo, useState } from 'react';
import { Search, FileText, CheckCircle2, Clock, PlaneTakeoff, X, MapPin } from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalFooter } from '../../components/common/Modal';

const MOCK_APPLICATIONS = [
  {
    id: 'VP-2025-0001',
    applicantName: 'Md. Rahim Uddin',
    passportNo: 'BX1234567',
    country: 'Saudi Arabia',
    visaType: 'Umrah',
    submissionDate: '2025-09-12',
    status: 'Processing',
    lastUpdate: '2025-10-01',
  },
  {
    id: 'VP-2025-0002',
    applicantName: 'Shahida Akter',
    passportNo: 'CX9876543',
    country: 'United Arab Emirates',
    visaType: 'Tourist',
    submissionDate: '2025-09-20',
    status: 'Biometrics',
    lastUpdate: '2025-10-03',
  },
  {
    id: 'VP-2025-0003',
    applicantName: 'Nazmul Hasan',
    passportNo: 'AB4567891',
    country: 'Saudi Arabia',
    visaType: 'Work',
    submissionDate: '2025-09-07',
    status: 'Approved',
    lastUpdate: '2025-09-29',
  },
  {
    id: 'VP-2025-0004',
    applicantName: 'Afsana Mim',
    passportNo: 'PA7654321',
    country: 'Malaysia',
    visaType: 'Student',
    submissionDate: '2025-09-25',
    status: 'Submitted',
    lastUpdate: '2025-09-25',
  },
];

const STATUS_STEPS = ['Submitted', 'Processing', 'Biometrics', 'Approved', 'Delivered'];

const statusBadgeClass = (status) => {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
  switch (status) {
    case 'Submitted':
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
    case 'Processing':
      return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`;
    case 'Biometrics':
      return `${base} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300`;
    case 'Approved':
      return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`;
    case 'Rejected':
      return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`;
    case 'Delivered':
      return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`;
    default:
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
  }
};

export default function VisaTracking() {
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const total = MOCK_APPLICATIONS.length;
    const approved = MOCK_APPLICATIONS.filter(a => a.status === 'Approved').length;
    const processing = MOCK_APPLICATIONS.filter(a => a.status === 'Processing' || a.status === 'Biometrics').length;
    const submitted = MOCK_APPLICATIONS.filter(a => a.status === 'Submitted').length;
    return { total, approved, processing, submitted };
  }, []);

  const filteredData = useMemo(() => {
    let data = [...MOCK_APPLICATIONS];

    if (filters.status) {
      data = data.filter(d => d.status === filters.status);
    }
    if (filters.country) {
      data = data.filter(d => d.country === filters.country);
    }
    if (filters.visaType) {
      data = data.filter(d => d.visaType === filters.visaType);
    }
    if (filters.dateFrom) {
      data = data.filter(d => new Date(d.submissionDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      data = data.filter(d => new Date(d.submissionDate) <= new Date(filters.dateTo));
    }
    if (filters.agent) {
      data = data.filter(d => (d.agent || '').toLowerCase().includes(filters.agent.toLowerCase()));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      data = data.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.passportNo.toLowerCase().includes(q) ||
        d.applicantName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [filters, query]);

  const columns = useMemo(() => [
    { key: 'id', header: 'Application ID', sortable: true, render: (v) => (
      <span className="font-medium text-gray-900 dark:text-white">{v}</span>
    )},
    { key: 'applicantName', header: 'Applicant', sortable: true },
    { key: 'passportNo', header: 'Passport No', sortable: true },
    { key: 'country', header: 'Country', sortable: true, render: (v) => (
      <span className="inline-flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" />{v}</span>
    ) },
    { key: 'visaType', header: 'Visa Type', sortable: true, render: (v) => (
      <span className="inline-flex items-center"><FileText className="w-4 h-4 mr-1 text-gray-400" />{v}</span>
    ) },
    { key: 'submissionDate', header: 'Submitted On', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (v) => (
      <span className={statusBadgeClass(v)}>{v}</span>
    ) },
    { key: 'lastUpdate', header: 'Last Update', sortable: true },
  ], []);

  const filterDefs = [
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Submitted', label: 'Submitted' },
      { value: 'Processing', label: 'Processing' },
      { value: 'Biometrics', label: 'Biometrics' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' },
      { value: 'Delivered', label: 'Delivered' },
    ]},
    { key: 'country', label: 'Country', type: 'select', options: [
      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'Malaysia', label: 'Malaysia' },
    ]},
    { key: 'visaType', label: 'Visa Type', type: 'select', options: [
      { value: 'Umrah', label: 'Umrah' },
      { value: 'Tourist', label: 'Tourist' },
      { value: 'Work', label: 'Work' },
      { value: 'Student', label: 'Student' },
    ]},
    { key: 'date', label: 'Submission Date', type: 'dateRange' },
    { key: 'agent', label: 'Agent', type: 'input', placeholder: 'Agent name' },
  ];

  const currentStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Visa Tracking</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track applications by ID, passport number, or applicant name.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardWidget title="Total Applications" value={stats.total} icon={FileText} trend="this month" trendValue="+12%" trendType="up" />
        <CardWidget title="Approved" value={stats.approved} icon={CheckCircle2} trend="vs last month" trendValue="+5%" trendType="up" />
        <CardWidget title="In Progress" value={stats.processing} icon={Clock} trend="currently processing" trendValue={stats.processing} trendType="up" />
        <CardWidget title="Submitted" value={stats.submitted} icon={PlaneTakeoff} trend="awaiting review" trendValue={stats.submitted} trendType="up" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search by Application ID, Passport No, or Applicant..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={() => setQuery('')}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      <FilterBar
        className=""
        filters={filterDefs}
        onFilterChange={(values) => {
          setFilters(values);
        }}
      />

      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={(item) => setSelected(item)}
        customActions={(item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(item)}
              className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View
            </button>
            <button
              onClick={() => setSelected(item)}
              className="px-2 py-1 text-xs rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Track
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Application ${selected.id}` : ''}
        size="xl"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmallStat label="Applicant" value={selected.applicantName} />
              <SmallStat label="Passport No" value={selected.passportNo} />
              <SmallStat label="Country" value={selected.country} />
              <SmallStat label="Visa Type" value={selected.visaType} />
              <SmallStat label="Submitted On" value={selected.submissionDate} />
              <SmallStat label="Last Update" value={selected.lastUpdate} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status Timeline</p>
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex(selected.status);
                  const isLast = idx === STATUS_STEPS.length - 1;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${done ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="ml-2 mr-4">
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{step}</div>
                      </div>
                      {!isLast && (
                        <div className={`h-0.5 flex-1 ${done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <ModalFooter>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-white bg-blue-600 hover:bg-blue-700"
              >
                Print Summary
              </button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}

