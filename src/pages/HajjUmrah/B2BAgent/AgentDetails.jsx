import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowLeft, Pencil } from 'lucide-react';
import useAxiosSecure from '../../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosSecure.get(`/haj-umrah/agents/${id}`);
        if (ignore) return;
        if (res.data?.success) {
          setAgent(res.data.data || null);
        } else {
          setAgent(null);
        }
      } catch (error) {
        const msg = error?.response?.data?.message || 'Failed to fetch agent details';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
        setAgent(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetails();
    return () => { ignore = true; };
  }, [axiosSecure, id]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Agent Details</h1>
            <p className="text-gray-600 dark:text-gray-400">Hajj & Umrah</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/hajj-umrah/agent/${id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : !agent ? (
          <p className="text-red-600 dark:text-red-400">No data found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Name</label>
              <p className="text-gray-900 dark:text-white">{agent.tradeName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Location</label>
              <p className="text-gray-900 dark:text-white">{agent.tradeLocation || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name</label>
              <p className="text-gray-900 dark:text-white">{agent.ownerName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact No</label>
              <p className="text-gray-900 dark:text-white">{agent.contactNo || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <p className="text-gray-900 dark:text-white">{agent.dob || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NID</label>
              <p className="text-gray-900 dark:text-white">{agent.nid || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport</label>
              <p className="text-gray-900 dark:text-white">{agent.passport || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <p className="text-gray-900 dark:text-white">{agent.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created At</label>
                <p className="text-gray-900 dark:text-white">{agent.createdAt ? new Date(agent.createdAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Updated At</label>
                <p className="text-gray-900 dark:text-white">{agent.updatedAt ? new Date(agent.updatedAt).toLocaleString() : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetails;


