import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Plane, User, ArrowLeft, Edit, Receipt, Phone, MapPin, RefreshCcw } from 'lucide-react';
import { useAirTicket } from '../../hooks/useAirTicketQueries';

const Field = ({ label, value }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '-'}</span>
  </div>
);

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: ticket, isLoading, error, refetch, isRefetching } = useAirTicket(id);

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center space-y-3">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">Ticket ID missing.</p>
        <p className="text-gray-600 dark:text-gray-300">Please open this page from the ticket list.</p>
        <button
          onClick={() => navigate('/air-ticketing/tickets')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center space-y-3">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">Unable to load ticket.</p>
        <p className="text-gray-600 dark:text-gray-300">{error?.message || 'Ticket not found.'}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/air-ticketing/tickets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to tickets
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Ticket Details - {ticket.bookingId || ticket._id}</title>
        <meta name="description" content={`Details and information for ticket booking ID: ${ticket.bookingId || ticket._id}.`} />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/air-ticketing/tickets')}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ticket Details</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Booking ID: {ticket.bookingId || ticket._id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to={`/air-ticketing/edit-ticket/${ticket._id || ticket.bookingId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <Link
              to="/air-ticketing/invoice"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Invoice</span>
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Route</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {(ticket.origin || 'N/A')} → {(ticket.destination || 'N/A')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Flight Date</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(ticket.flightDate)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Customer</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.customerName || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking & passenger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Passenger</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Name" value={ticket.customerName} />
                <Field label="Phone" value={ticket.customerPhone} />
                <Field label="Purpose" value={ticket.purposeType} />
                <Field label="Trip Type" value={ticket.tripType} />
                <Field label="Flight Type" value={ticket.flightType} />
                <Field label="Status" value={ticket.status} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itinerary</h2>
              </div>
              {ticket.tripType === 'multicity' ? (
                <div className="space-y-3">
                  {(ticket.segments || []).map((seg, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {seg.origin || '-'} → {seg.destination || '-'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(seg.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Origin" value={ticket.origin} />
                  <Field label="Destination" value={ticket.destination} />
                  <Field label="Return Date" value={formatDate(ticket.returnDate)} />
                </div>
              )}
            </div>
          </div>

          {/* Finance */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Finance</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Customer Deal" value={ticket.customerDeal} />
                <Field label="Customer Paid" value={ticket.customerPaid} />
                <Field label="Customer Due" value={ticket.customerDue} />
                <Field label="Vendor Amount" value={ticket.vendorAmount} />
                <Field label="Vendor Paid" value={ticket.vendorPaidFh} />
                <Field label="Vendor Due" value={ticket.vendorDue} />
                <Field label="Profit" value={ticket.profit} />
                <Field label="Due Date" value={formatDate(ticket.dueDate)} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent & Airline</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Agent" value={ticket.agent} />
                <Field label="Airline" value={ticket.airline} />
                <Field label="Booking Date" value={formatDate(ticket.date)} />
                <Field label="PNR (GDS)" value={ticket.gdsPnr} />
                <Field label="PNR (Airline)" value={ticket.airlinePnr} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
