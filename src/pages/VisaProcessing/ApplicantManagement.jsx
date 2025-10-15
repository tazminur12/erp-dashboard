import React, { useMemo, useState } from 'react';
import { Plus, Upload, Users, Globe, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import Modal, { ModalFooter } from '../../components/common/Modal';
import ExcelUploader from '../../components/common/ExcelUploader';

const defaultApplicants = [
  { id: 'A-1001', name: 'Rahim Uddin', passport: 'A1234567', phone: '+8801712345678', country: 'Saudi Arabia', visaType: 'Umrah', status: 'Submitted', appliedOn: '2025-09-21' },
  { id: 'A-1002', name: 'Karim Mia', passport: 'B9876543', phone: '+8801812345678', country: 'UAE', visaType: 'Visit', status: 'Processing', appliedOn: '2025-09-25' },
  { id: 'A-1003', name: 'Nusrat Jahan', passport: 'C7654321', phone: '+8801912345678', country: 'Saudi Arabia', visaType: 'Hajj', status: 'Approved', appliedOn: '2025-10-01' },
  { id: 'A-1004', name: 'Sabbir Hossain', passport: 'D1122334', phone: '+8801612345678', country: 'Malaysia', visaType: 'Work', status: 'Rejected', appliedOn: '2025-10-05' }
];

const statusColors = {
  Submitted: 'bg-gray-100 text-gray-700 border-gray-200',
  Processing: 'bg-blue-100 text-blue-700 border-blue-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200'
};

export default function ApplicantManagement() {
  const [applicants, setApplicants] = useState(defaultApplicants);
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', passport: '', phone: '', country: '', visaType: '', status: 'Submitted', appliedOn: '' });

  const filteredApplicants = useMemo(() => {
    let rows = [...applicants];
    // filters
    if (filters.status) rows = rows.filter(r => r.status === filters.status);
    if (filters.country) rows = rows.filter(r => r.country === filters.country);
    if (filters.visaType) rows = rows.filter(r => r.visaType === filters.visaType);
    if (filters.appliedFrom) rows = rows.filter(r => r.appliedOn >= filters.appliedFrom);
    if (filters.appliedTo) rows = rows.filter(r => r.appliedOn <= filters.appliedTo);
    // search
    if (searchValue) {
      const s = searchValue.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)));
    }
    return rows;
  }, [applicants, filters, searchValue]);

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'passport', header: 'Passport', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'visaType', header: 'Visa Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (val) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[val] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {val === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : null}
        {val === 'Rejected' ? <XCircle className="w-3.5 h-3.5 mr-1" /> : null}
        {val === 'Processing' ? <Clock className="w-3.5 h-3.5 mr-1" /> : null}
        {val}
      </span>
    ) },
    { key: 'appliedOn', header: 'Applied On', sortable: true }
  ];

  const filterDefs = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'Saudi Arabia', label: 'Saudi Arabia' },
        { value: 'UAE', label: 'UAE' },
        { value: 'Malaysia', label: 'Malaysia' }
      ]
    },
    {
      key: 'visaType',
      label: 'Visa Type',
      type: 'select',
      options: [
        { value: 'Umrah', label: 'Umrah' },
        { value: 'Hajj', label: 'Hajj' },
        { value: 'Visit', label: 'Visit' },
        { value: 'Work', label: 'Work' }
      ]
    },
    { key: 'applied', label: 'Applied Date', type: 'dateRange' }
  ];

  const resetForm = () => {
    setFormData({ id: '', name: '', passport: '', phone: '', country: '', visaType: '', status: 'Submitted', appliedOn: '' });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleDelete = (item) => {
    if (confirm(`Delete applicant ${item.name}?`)) {
      setApplicants(prev => prev.filter(a => a.id !== item.id));
    }
  };

  const saveApplicant = (e) => {
    e?.preventDefault?.();
    // Simple required checks
    if (!formData.name || !formData.passport || !formData.country || !formData.visaType) return;
    setApplicants(prev => {
      const exists = prev.some(a => a.id === formData.id);
      if (exists) {
        return prev.map(a => (a.id === formData.id ? { ...formData } : a));
      }
      const newId = formData.id?.trim() ? formData.id : `A-${Math.floor(1000 + Math.random() * 9000)}`;
      return [{ ...formData, id: newId }, ...prev];
    });
    setIsFormOpen(false);
    resetForm();
  };

  const handleExcelProcessed = (rows) => {
    // Map uploader generic fields to our schema when available
    const mapped = rows.map((r, idx) => ({
      id: `A-${Date.now().toString().slice(-5)}${idx}`,
      name: r.name || r.customerName || 'Unknown',
      passport: r.passport || '-',
      phone: r.phone || r.contactNo || '-',
      country: r.country || r.tradeLocation || 'Saudi Arabia',
      visaType: r.package || r.productType || 'Visit',
      status: r.status || 'Submitted',
      appliedOn: r.registrationDate || r.joinDate || new Date().toISOString().split('T')[0]
    }));
    setApplicants(prev => [...mapped, ...prev]);
  };

  const StatCard = ({ icon: Icon, title, value, sub }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {sub ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p> : null}
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const total = applicants.length;
  const approved = applicants.filter(a => a.status === 'Approved').length;
  const processing = applicants.filter(a => a.status === 'Processing').length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applicant Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage visa applicants, profiles and statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsUploadOpen(true)} className="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            <Upload className="w-4 h-4 mr-2" /> Upload Excel
          </button>
          <button onClick={openCreate} className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Add Applicant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} title="Total Applicants" value={total} sub="All time" />
        <StatCard icon={CheckCircle2} title="Approved" value={approved} sub={`${((approved / Math.max(total,1)) * 100).toFixed(0)}% of total`} />
        <StatCard icon={Globe} title="In Processing" value={processing} sub="Awaiting decision" />
      </div>

      <div className="space-y-3">
        <FilterBar filters={filterDefs} onFilterChange={(f) => {
          const mapped = { ...f };
          if (f.appliedFrom || f.appliedTo) {
            mapped.appliedFrom = f.appliedFrom;
            mapped.appliedTo = f.appliedTo;
          }
          setFilters(mapped);
        }} />

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search applicants..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
          </div>
        </div>

        <DataTable 
          data={filteredApplicants}
          columns={columns}
          onEdit={openEdit}
          onDelete={handleDelete}
          pageSize={10}
          searchable={false}
        />
      </div>

      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); resetForm(); }} title={editing ? 'Edit Applicant' : 'Add Applicant'} size="xl">
        <form onSubmit={saveApplicant} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Name</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Passport</label>
              <input value={formData.passport} onChange={(e) => setFormData({ ...formData, passport: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Phone</label>
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Country</label>
              <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required>
                <option value="">Select country</option>
                <option>Saudi Arabia</option>
                <option>UAE</option>
                <option>Malaysia</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Visa Type</label>
              <select value={formData.visaType} onChange={(e) => setFormData({ ...formData, visaType: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required>
                <option value="">Select visa type</option>
                <option>Umrah</option>
                <option>Hajj</option>
                <option>Visit</option>
                <option>Work</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                <option>Submitted</option>
                <option>Processing</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Applied On</label>
              <input type="date" value={formData.appliedOn} onChange={(e) => setFormData({ ...formData, appliedOn: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Custom ID (optional)</label>
              <input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
          </div>

          <ModalFooter>
            <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save</button>
          </ModalFooter>
        </form>
      </Modal>

      <ExcelUploader 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataProcessed={handleExcelProcessed}
        title="Import Applicants from Excel"
        acceptedFields={['name','passport','phone','country','package','status','registrationDate']}
        requiredFields={['name']}
      />
    </div>
  );
}

