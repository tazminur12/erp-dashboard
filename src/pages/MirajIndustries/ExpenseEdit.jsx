import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useFarmExpense, useUpdateFarmExpense } from '../../hooks/useFinanceQueries';

const ExpenseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: expense, isLoading } = useFarmExpense(id);
  const { mutate: updateExpense, isLoading: saving } = useUpdateFarmExpense();

  const [form, setForm] = useState({
    category: '',
    description: '',
    vendor: '',
    amount: 0,
    notes: '',
  });

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category || '',
        description: expense.description || '',
        vendor: expense.vendor || '',
        amount: Number(expense.amount || 0),
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateExpense(
      { id, data: { ...form, amount: Number(form.amount || 0) } },
      {
        onSuccess: async () => {
          await Swal.fire({ title: 'Updated', text: 'Expense updated successfully.', icon: 'success', timer: 1200, showConfirmButton: false });
          navigate(`/miraj-industries/expense/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600">ID: {id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <input name="category" value={form.category} onChange={onChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vendor</label>
              <input name="vendor" value={form.vendor} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input name="amount" value={form.amount} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
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

export default ExpenseEdit;


