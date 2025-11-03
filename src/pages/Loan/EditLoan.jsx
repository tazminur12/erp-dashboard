import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoan, useUpdateLoan } from '../../hooks/useLoanQueries';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const EditLoan = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useLoan(id);
  const updateLoan = useUpdateLoan();

  const loan = data?.loan;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    contactPhone: '',
    contactEmail: '',
    businessName: '',
    businessType: '',
    presentAddress: '',
    permanentAddress: '',
    status: '',
    notes: ''
  });

  useEffect(() => {
    if (loan) {
      setForm(prev => ({
        ...prev,
        firstName: loan.firstName || '',
        lastName: loan.lastName || '',
        fatherName: loan.fatherName || '',
        motherName: loan.motherName || '',
        contactPhone: loan.contactPhone || '',
        contactEmail: loan.contactEmail || '',
        businessName: loan.businessName || '',
        businessType: loan.businessType || '',
        presentAddress: loan.presentAddress || '',
        permanentAddress: loan.permanentAddress || '',
        status: loan.status || '',
        notes: loan.notes || ''
      }));
    }
  }, [loan]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateLoan.mutate(
      { loanId: id, payload: form },
      {
        onSuccess: () => {
          navigate(`/loan/details/${id}`);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Loan</h1>
        </div>

        <form onSubmit={onSubmit} className={`rounded-xl p-4 sm:p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input name="firstName" value={form.firstName} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Father Name</label>
              <input name="fatherName" value={form.fatherName} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother Name</label>
              <input name="motherName" value={form.motherName} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input name="businessName" value={form.businessName} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Present Address</label>
              <input name="presentAddress" value={form.presentAddress} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Permanent Address</label>
              <input name="permanentAddress" value={form.permanentAddress} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <input name="status" value={form.status} onChange={onChange} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={onChange} rows={3} className={`w-full px-3 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={updateLoan.isPending} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg">
              {updateLoan.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoan;


