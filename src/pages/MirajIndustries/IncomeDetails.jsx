import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, FileText, User, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useFarmIncome, useDeleteFarmIncome } from '../../hooks/useFinanceQueries';

const IncomeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: income } = useFarmIncome(id);
  const { mutate: deleteIncome, isLoading: deleting } = useDeleteFarmIncome();

  const handleDelete = async () => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Delete income?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });
    if (!result.isConfirmed) return;
    deleteIncome(id, {
      onSuccess: async () => {
        await Swal.fire({ title: 'Deleted', text: 'Income deleted successfully.', icon: 'success', timer: 1200, showConfirmButton: false });
        navigate(-1);
      },
      onError: (e) => {
        Swal.fire({ title: 'Failed', text: e?.message || 'Failed to delete', icon: 'error' });
      }
    });
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
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Income Details</h1>
            <p className="text-gray-600">ID: {id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/miraj-industries/income/${id}/edit`)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center ring-1 bg-green-50 text-green-600 ring-green-100">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{income?.customer || 'Income'}</h2>
              <span className="text-sm text-gray-500">{income?.id}</span>
            </div>
            {income?.description && (
              <p className="mt-1 text-gray-600">{income.description}</p>
            )}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Source</p>
                  <p className="text-sm font-semibold text-gray-800">{income?.source || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-semibold text-gray-800">{income?.date || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm font-semibold text-gray-800">{income?.notes || '—'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-3xl font-extrabold text-green-600">৳{Number(income?.amount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetails;


