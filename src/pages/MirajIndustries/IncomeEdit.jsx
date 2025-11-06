import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useFarmIncome, useUpdateFarmIncome } from '../../hooks/useFinanceQueries';

const IncomeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: income, isLoading } = useFarmIncome(id);
  const { mutate: updateIncome, isLoading: saving } = useUpdateFarmIncome();

  const [form, setForm] = useState({
    source: '',
    description: '',
    amount: 0,
    date: '',
    paymentMethod: 'cash',
    customer: '',
    notes: '',
  });

  useEffect(() => {
    if (income) {
      setForm({
        source: income.source || '',
        description: income.description || '',
        amount: Number(income.amount || 0),
        date: (income.date || '').slice(0, 10),
        paymentMethod: income.paymentMethod || 'cash',
        customer: income.customer || '',
        notes: income.notes || '',
      });
    }
  }, [income]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateIncome(
      { id, data: { ...form, amount: Number(form.amount || 0) } },
      {
        onSuccess: async () => {
          await Swal.fire({ title: 'Updated', text: 'Income updated successfully.', icon: 'success', timer: 1200, showConfirmButton: false });
          navigate(`/miraj-industries/income/${id}`);
        },
        onError: (err) => {
          Swal.fire({ title: 'Failed', text: err?.message || 'Failed to update', icon: 'error' });
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Income</h1>
          <p className="text-gray-600">ID: {id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Source</label>
              <input name="source" value={form.source} onChange={onChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Customer</label>
              <input name="customer" value={form.customer} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input name="amount" value={form.amount} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={onChange} className="w-full border rounded-lg px-3 py-2">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <input name="notes" value={form.notes} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} className="w-full border rounded-lg px-3 py-2" rows={4} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IncomeEdit;


