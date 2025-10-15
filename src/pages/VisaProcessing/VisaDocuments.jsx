import React, { useMemo, useRef, useState } from 'react';
import { FileText, Upload, Paperclip, Image, File, Download, Trash2, Eye, X, Search, CheckCircle2 } from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { formatDate, formatFileSize } from '../../lib/format';

const MOCK_DOCS = [
  { id: 'DOC-1001', applicationId: 'VP-2025-0001', applicantName: 'Md. Rahim Uddin', type: 'Passport', fileName: 'passport.jpg', size: 245678, uploadedAt: '2025-09-28', status: 'Verified' },
  { id: 'DOC-1002', applicationId: 'VP-2025-0002', applicantName: 'Shahida Akter', type: 'Photo', fileName: 'photo.png', size: 124568, uploadedAt: '2025-09-30', status: 'Pending' },
  { id: 'DOC-1003', applicationId: 'VP-2025-0003', applicantName: 'Nazmul Hasan', type: 'Application Form', fileName: 'application.pdf', size: 356789, uploadedAt: '2025-10-02', status: 'Verified' },
];

const typeIcon = (type) => {
  if (type === 'Passport') return FileText;
  if (type === 'Photo') return Image;
  if (type === 'Application Form') return File;
  return Paperclip;
};

const statusBadge = (status) => {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
  if (status === 'Verified') return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`;
  if (status === 'Pending') return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`;
  if (status === 'Rejected') return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`;
  return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
};

export default function VisaDocuments() {
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ applicationId: '', applicantName: '', type: 'Passport', files: [] });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const stats = useMemo(() => {
    const total = MOCK_DOCS.length;
    const verified = MOCK_DOCS.filter(d => d.status === 'Verified').length;
    const pending = MOCK_DOCS.filter(d => d.status === 'Pending').length;
    return { total, verified, pending };
  }, []);

  const filteredDocs = useMemo(() => {
    let data = [...MOCK_DOCS];
    if (filters.type) data = data.filter(d => d.type === filters.type);
    if (filters.status) data = data.filter(d => d.status === filters.status);
    if (filters.dateFrom) data = data.filter(d => new Date(d.uploadedAt) >= new Date(filters.dateFrom));
    if (filters.dateTo) data = data.filter(d => new Date(d.uploadedAt) <= new Date(filters.dateTo));
    if (query) {
      const q = query.toLowerCase().trim();
      data = data.filter(d => d.id.toLowerCase().includes(q) || d.applicationId.toLowerCase().includes(q) || d.applicantName.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
    }
    return data;
  }, [filters, query]);

  const columns = useMemo(() => [
    { key: 'id', header: 'Doc ID', sortable: true },
    { key: 'applicationId', header: 'Application ID', sortable: true, render: (v) => (
      <span className="font-medium text-gray-900 dark:text-white">{v}</span>
    ) },
    { key: 'applicantName', header: 'Applicant', sortable: true },
    { key: 'type', header: 'Type', sortable: true, render: (v) => {
      const Icon = typeIcon(v);
      return <span className="inline-flex items-center"><Icon className="w-4 h-4 mr-1 text-gray-400" />{v}</span>;
    } },
    { key: 'fileName', header: 'File', sortable: true },
    { key: 'size', header: 'Size', sortable: true, render: (v) => formatFileSize(v) },
    { key: 'uploadedAt', header: 'Uploaded At', sortable: true, render: (v) => formatDate(v) },
    { key: 'status', header: 'Status', sortable: true, render: (v) => (
      <span className={statusBadge(v)}>{v}</span>
    ) },
  ], []);

  const filterDefs = [
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'Passport', label: 'Passport' },
      { value: 'Photo', label: 'Photo' },
      { value: 'Application Form', label: 'Application Form' },
      { value: 'Other', label: 'Other' },
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Verified', label: 'Verified' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Rejected', label: 'Rejected' },
    ]},
    { key: 'date', label: 'Upload Date', type: 'dateRange' },
  ];

  const validate = () => {
    const e = {};
    if (!form.applicationId) e.applicationId = 'Required';
    if (!form.applicantName) e.applicantName = 'Required';
    if (!form.files || form.files.length === 0) e.files = 'Select at least one file';
    return e;
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm({ ...form, files });
  };

  const handleUpload = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    // Normally submit to API; here open preview of first file
    const first = form.files[0];
    const url = first ? URL.createObjectURL(first) : null;
    setPreview({
      id: 'PREVIEW',
      applicationId: form.applicationId,
      applicantName: form.applicantName,
      type: form.type,
      fileName: first?.name || 'document',
      size: first?.size || 0,
      uploadedAt: new Date().toISOString(),
      status: 'Pending',
      url,
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Visa Documents</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload, preview, and manage application documents.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardWidget title="Total Documents" value={stats.total} icon={FileText} trend="in repository" trendValue={stats.total} trendType="up" />
        <CardWidget title="Verified" value={stats.verified} icon={CheckCircle2} trend="approved" trendValue={stats.verified} trendType="up" />
        <CardWidget title="Pending" value={stats.pending} icon={Paperclip} trend="awaiting review" trendValue={stats.pending} trendType="up" />
        <CardWidget title="Supported Types" value={'PDF / JPG / PNG'} icon={Upload} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Documents</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Attach files to an application</p>
        </div>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application ID</label>
            <input
              type="text"
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
              placeholder="e.g., VP-2025-0001"
              className={`w-full px-3 py-2 border ${errors.applicationId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
            {errors.applicationId && <p className="text-xs text-red-500 mt-1">{errors.applicationId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicant Name</label>
            <input
              type="text"
              value={form.applicantName}
              onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
              placeholder="Full name"
              className={`w-full px-3 py-2 border ${errors.applicantName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
            {errors.applicantName && <p className="text-xs text-red-500 mt-1">{errors.applicantName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option>Passport</option>
              <option>Photo</option>
              <option>Application Form</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Files</label>
            <div className={`border ${errors.files ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-3 flex items-center justify-between`}>
              <input ref={fileInputRef} onChange={onFileChange} multiple accept=".pdf,.jpg,.jpeg,.png" type="file" className="text-sm text-gray-600 dark:text-gray-300" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Upload className="w-4 h-4 mr-2" /> Choose
              </button>
            </div>
            {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setForm({ applicationId: '', applicantName: '', type: 'Passport', files: [] }); setErrors({}); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center">
              <X className="w-4 h-4 mr-2" /> Reset
            </button>
            <button type="submit" className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Upload
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search documents by ID, Application, Applicant, or Type..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button onClick={() => setQuery('')} className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
            <X className="w-4 h-4 mr-2" /> Clear
          </button>
        </div>

        <FilterBar filters={filterDefs} onFilterChange={(values) => setFilters(values)} />

        <div className="mt-4">
          <DataTable
            data={filteredDocs}
            columns={columns}
            customActions={(item) => (
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(item)} className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center"><Eye className="w-3 h-3 mr-1" /> Preview</button>
                <button onClick={() => alert('Downloading...')} className="px-2 py-1 text-xs rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 inline-flex items-center"><Download className="w-3 h-3 mr-1" /> Download</button>
                <button onClick={() => alert('Delete action')} className="px-2 py-1 text-xs rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 inline-flex items-center"><Trash2 className="w-3 h-3 mr-1" /> Delete</button>
              </div>
            )}
          />
        </div>
      </div>

      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview ? `${preview.type} - ${preview.fileName}` : ''} size="xl">
        {preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmallStat label="Application ID" value={preview.applicationId} />
              <SmallStat label="Applicant" value={preview.applicantName} />
              <SmallStat label="Type" value={preview.type} />
              <SmallStat label="File" value={preview.fileName} />
              <SmallStat label="Size" value={formatFileSize(preview.size)} />
              <SmallStat label="Uploaded At" value={formatDate(preview.uploadedAt)} />
              <SmallStat label="Status" value={preview.status} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
              {preview.url ? (
                preview.fileName?.toLowerCase().endsWith('.pdf') ? (
                  <iframe title="preview" src={preview.url} className="w-full h-96 rounded" />
                ) : (
                  <img alt="preview" src={preview.url} className="max-h-96 rounded" />
                )
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">Preview not available.</p>
              )}
            </div>
            <ModalFooter>
              <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
              <button onClick={() => alert('Downloading...')} className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-white bg-blue-600 hover:bg-blue-700">Download</button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}

