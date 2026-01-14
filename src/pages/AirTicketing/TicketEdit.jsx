import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Save, 
  ArrowLeft, 
  Calendar, 
  Receipt,
  Eye,
  ChevronDown,
  ChevronRight,
  Search,
  User,
  Building,
  Plane
} from 'lucide-react';
import Modal, { ModalFooter } from '../../components/common/Modal';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { useAirTicket, useUpdateAirTicket } from '../../hooks/useAirTicketQueries';

const TicketEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useAirTicket(id);
  const updateTicketMutation = useUpdateAirTicket();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    tripType: 'oneway',
    flightType: 'domestic', // International or Domestic
    date: '',
    ticketId: '', // Auto-generated unique ID (read-only)
    bookingId: '',
    gdsPnr: '',
    airlinePnr: '',
    airline: '',
    airlineId: '', // Airline ID for submission
    origin: '',
    destination: '',
    flightDate: '',
    returnDate: '',
    segments: [
      { origin: '', destination: '', date: '' },
      { origin: '', destination: '', date: '' }
    ],
    agent: '', // Agent Name / ID
    agentId: '', // Agent ID for submission
    purposeType: '',
    // Passenger types
    adultCount: 0,
    childCount: 0,
    infantCount: 0,
    customerDeal: 0,
    customerPaid: 0,
    customerDue: 0,
    // Vendor breakdown fields
    baseFare: 0,
    // Individual tax components
    taxBD: 0,
    e5: 0,
    e7: 0,
    g8: 0,
    ow: 0,
    p7: 0,
    p8: 0,
    ts: 0,
    ut: 0,
    yq: 0,
    // Consolidated taxes input (additional/other taxes)
    taxes: 0,
    // Computed
    totalTaxes: 0,
    // Tax on commission
    ait: 0,
    commissionRate: 0, // percentage
    plb: 0,
    salmaAirServiceCharge: 0, // Salma Air specific service charge
    vendorServiceCharge: 0, // Vendor service charge
    vendorAmount: 0,
    vendorPaidFh: 0,
    vendorDue: 0,
    profit: 0,
    dueDate: '',
    status: 'pending',
    segmentCount: 1,
    flownSegment: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showTaxes, setShowTaxes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Customer search state
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Agent search state
  const [agentQuery, setAgentQuery] = useState('');
  const [agentResults, setAgentResults] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Airline search state
  const [airlineQuery, setAirlineQuery] = useState('');
  const [airlineResults, setAirlineResults] = useState([]);
  const [airlineLoading, setAirlineLoading] = useState(false);
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [selectedAirlineId, setSelectedAirlineId] = useState('');

  // Populate form when ticket data loads
  useEffect(() => {
    if (!ticket) return;

    const toDateInput = (value) => {
      if (!value) return '';
      const dateObj = new Date(value);
      if (Number.isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    };

    const normalizedSegments =
      Array.isArray(ticket.segments) && ticket.segments.length > 0
        ? ticket.segments.map((s) => ({
            origin: s.origin || '',
            destination: s.destination || '',
            date: toDateInput(s.date || s.flightDate || s.departureDate),
          }))
        : [
            { origin: '', destination: '', date: '' },
            { origin: '', destination: '', date: '' },
          ];

    setFormData((prev) => ({
      ...prev,
      customerId: ticket.customerId || '',
      customerName: ticket.customerName || '',
      customerPhone: ticket.customerPhone || '',
      tripType: ticket.tripType || 'oneway',
      flightType: ticket.flightType || 'domestic',
      date: toDateInput(ticket.date),
      ticketId: ticket.ticketId || '', // Auto-generated unique ID (read-only, cannot be updated)
      bookingId: ticket.bookingId || '',
      gdsPnr: ticket.gdsPnr || '',
      airlinePnr: ticket.airlinePnr || '',
      airline: ticket.airline || '',
      airlineId: ticket.airlineId || '',
      origin: ticket.origin || '',
      destination: ticket.destination || '',
      flightDate: toDateInput(ticket.flightDate),
      returnDate: toDateInput(ticket.returnDate),
      segments: normalizedSegments,
      agent: ticket.agent || '',
      agentId: ticket.agentId || '',
      purposeType: ticket.purposeType || '',
      adultCount: Number(ticket.adultCount) || 0,
      childCount: Number(ticket.childCount) || 0,
      infantCount: Number(ticket.infantCount) || 0,
      customerDeal: Number(ticket.customerDeal) || 0,
      customerPaid: Number(ticket.customerPaid) || 0,
      customerDue: Number(ticket.customerDue) || 0,
      baseFare: Number(ticket.baseFare) || 0,
      taxBD: Number(ticket.taxBD) || 0,
      e5: Number(ticket.e5) || 0,
      e7: Number(ticket.e7) || 0,
      g8: Number(ticket.g8) || 0,
      ow: Number(ticket.ow) || 0,
      p7: Number(ticket.p7) || 0,
      p8: Number(ticket.p8) || 0,
      ts: Number(ticket.ts) || 0,
      ut: Number(ticket.ut) || 0,
      yq: Number(ticket.yq) || 0,
      taxes: Number(ticket.taxes) || 0,
      totalTaxes: Number(ticket.totalTaxes) || 0,
      ait: Number(ticket.ait) || 0,
      commissionRate: Number(ticket.commissionRate) || 0,
      plb: Number(ticket.plb) || 0,
      salmaAirServiceCharge: Number(ticket.salmaAirServiceCharge) || 0,
      vendorServiceCharge: Number(ticket.vendorServiceCharge) || 0,
      vendorAmount: Number(ticket.vendorAmount) || 0,
      vendorPaidFh: Number(ticket.vendorPaidFh) || 0,
      vendorDue: Number(ticket.vendorDue) || 0,
      profit: Number(ticket.profit) || 0,
      dueDate: toDateInput(ticket.dueDate),
      status: ticket.status || 'pending',
      segmentCount: Number(ticket.segmentCount) || normalizedSegments.length || 1,
      flownSegment: Boolean(ticket.flownSegment),
    }));

    // Pre-fill search boxes so dropdowns stay closed
    setCustomerQuery(ticket.customerName || ticket.customerId || '');
    setAgentQuery(ticket.agent || '');
    setAirlineQuery(ticket.airline || '');
  }, [ticket]);

  const markTouched = (name) => setTouched(prev => ({ ...prev, [name]: true }));

  // Debounced backend search for air customers by id/name/phone/email
  useEffect(() => {
    const q = customerQuery.trim();
    if (!q || q.length < 2) {
      setCustomerResults([]);
      return;
    }

    let active = true;
    setCustomerLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Query air customers API with search parameter
        const res = await axiosSecure.get('/api/airCustomers', { 
          params: { 
            search: q,
            page: 1,
            limit: 20,
            isActive: 'true'
          } 
        });
        const data = res?.data;
        
        // Extract customers list from response
        // API response structure: { success: true, customers: [...], pagination: {...} }
        let list = [];
        if (data?.success && Array.isArray(data.customers)) {
          list = data.customers;
        } else if (Array.isArray(data?.customers)) {
          list = data.customers;
        } else if (Array.isArray(data)) {
          list = data;
        }

        // Fallback: filter locally if backend returned full list without filtering
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((c) => {
          const id = String(c.id || c.customerId || c._id || '').toLowerCase();
          const name = String(c.name || '').toLowerCase();
          const phone = String(c.phone || c.mobile || '');
          const email = String(c.email || '').toLowerCase();
          const passportNumber = String(c.passportNumber || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ) ||
            passportNumber.includes(normalizedQ)
          );
        });

        if (active) setCustomerResults(filtered.slice(0, 10));
      } catch (err) {
        // Silent fail; keep results empty
        if (active) setCustomerResults([]);
      } finally {
        if (active) setCustomerLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerQuery, axiosSecure]);

  const handleSelectCustomer = (customer) => {
    const customerId = customer.customerId || customer.id || customer._id || '';
    const customerName = customer.name || '';
    const customerPhone = customer.mobile || customer.phone || '';
    
    setFormData(prev => ({
      ...prev,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone
    }));
    setCustomerQuery(customerName || customerId);
    setShowCustomerDropdown(false);
  };

  // Debounced backend search for agents by id/name/phone/email
  useEffect(() => {
    const q = agentQuery.trim();
    if (!q || q.length < 2) {
      setAgentResults([]);
      return;
    }

    let active = true;
    setAgentLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Query backend for air agents
        const res = await axiosSecure.get('/api/air-ticketing/agents', { 
          params: { q, limit: 20, page: 1 } 
        });
        const responseData = res?.data;
        
        // Extract agents list from response
        // API response structure: { success: true, data: [...], pagination: {...} }
        let list = [];
        if (responseData?.success && Array.isArray(responseData.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData?.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData)) {
          list = responseData;
        }

        // Fallback: filter locally if backend returned full list without filtering
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((a) => {
          const id = String(a.id || a.agentId || a.idCode || a._id || '').toLowerCase();
          const name = String(a.name || a.tradeName || a.companyName || a.personalName || '').toLowerCase();
          const phone = String(a.phone || a.contactNo || a.mobile || '');
          const email = String(a.email || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ)
          );
        });

        if (active) setAgentResults(filtered.slice(0, 10));
      } catch (err) {
        // Silent fail; keep results empty
        if (active) setAgentResults([]);
      } finally {
        if (active) setAgentLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [agentQuery, axiosSecure]);

  const handleSelectAgent = (agent) => {
    const agentId = agent.id || agent.agentId || agent.idCode || agent._id || '';
    const agentName = agent.name || agent.tradeName || agent.companyName || agent.personalName || agentId;
    setFormData(prev => ({
      ...prev,
      agent: agentName,
      agentId: agentId
    }));
    setSelectedAgentId(agentId);
    setAgentQuery(agentName);
    setShowAgentDropdown(false);
  };

  // Debounced backend search for airlines by id/name/code
  useEffect(() => {
    const q = airlineQuery.trim();
    if (!q || q.length < 2) {
      setAirlineResults([]);
      return;
    }

    let active = true;
    setAirlineLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Query backend for airlines
        const res = await axiosSecure.get('/api/air-ticketing/airlines', { 
          params: { q, limit: 20, page: 1 } 
        });
        const responseData = res?.data;
        
        // Extract airlines list from response
        // API response structure: { success: true, data: [...], pagination: {...} }
        let list = [];
        if (responseData?.success && Array.isArray(responseData.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData?.data)) {
          list = responseData.data;
        } else if (Array.isArray(responseData)) {
          list = responseData;
        }

        // Fallback: filter locally if backend returned full list without filtering
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((a) => {
          const id = String(a.id || a.airlineId || a._id || '').toLowerCase();
          const name = String(a.name || '').toLowerCase();
          const code = String(a.code || '').toLowerCase();
          const country = String(a.country || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            code.includes(normalizedQ) ||
            country.includes(normalizedQ)
          );
        });

        if (active) setAirlineResults(filtered.slice(0, 10));
      } catch (err) {
        // Silent fail; keep results empty
        if (active) setAirlineResults([]);
      } finally {
        if (active) setAirlineLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [airlineQuery, axiosSecure]);

  const handleSelectAirline = (airline) => {
    const airlineId = airline.id || airline.airlineId || airline._id || '';
    const airlineName = airline.name || airline.code || airlineId;
    setFormData(prev => ({
      ...prev,
      airline: airlineName,
      airlineId: airlineId
    }));
    setSelectedAirlineId(airlineId);
    setAirlineQuery(airlineName);
    setShowAirlineDropdown(false);
  };

  const validate = (values) => {
    const errs = {};
    if (!values.customerId) errs.customerId = 'Customer is required';
    if (!values.date) errs.date = 'Selling date is required';
    if (!values.bookingId) errs.bookingId = 'Booking ID is required';
    if (!values.airline) errs.airline = 'Airline is required';

    if (values.tripType === 'multicity') {
      if (!values.segments || values.segments.length < 2) {
        errs.segments = 'Add at least 2 segments';
      } else {
        values.segments.forEach((seg, idx) => {
          if (!seg.origin || !seg.destination || !seg.date) {
            errs[`segment_${idx}`] = 'Fill origin, destination and date';
          }
        });
      }
    } else {
      if (!values.origin) errs.origin = 'Origin is required';
      if (!values.destination) errs.destination = 'Destination is required';
      if (!values.flightDate) errs.flightDate = 'Flight date is required';
      if (values.tripType === 'roundtrip' && !values.returnDate) {
        errs.returnDate = 'Return date is required for round trip';
      }
    }
    return errs;
  };

  // Auto-calculate vendor amount when breakdown fields change
  React.useEffect(() => {
    const toNumber = (v) => Number(v) || 0;
    const baseFare = toNumber(formData.baseFare);
    const taxes = toNumber(formData.taxes);
    const taxBD = toNumber(formData.taxBD);
    const e5 = toNumber(formData.e5);
    const e7 = toNumber(formData.e7);
    const g8 = toNumber(formData.g8);
    const ow = toNumber(formData.ow);
    const p7 = toNumber(formData.p7);
    const p8 = toNumber(formData.p8);
    const ts = toNumber(formData.ts);
    const ut = toNumber(formData.ut);
    const yq = toNumber(formData.yq);
    const commissionRate = toNumber(formData.commissionRate);
    const plb = toNumber(formData.plb);
    const salmaAirServiceCharge = toNumber(formData.salmaAirServiceCharge);
    const vendorServiceCharge = toNumber(formData.vendorServiceCharge);

    const commissionAmount = (baseFare * commissionRate) / 100;
    const totalTaxes = taxes + taxBD + e5 + e7 + g8 + ow + p7 + p8 + ts + ut + yq;
    
    // Calculate AIT (Advance Income Tax) using BSP Bangladesh formula:
    // (Total Transaction Amount - Penalties - BD, UT, E5 tax) x 0.30%
    // Total Transaction Amount = baseFare + totalTaxes + salmaAirServiceCharge
    // Penalties = 0 (assuming no penalties in this context)
    // BD, UT, E5 tax = taxBD + ut + e5
    const totalTransactionAmount = baseFare + totalTaxes + salmaAirServiceCharge;
    const penalties = 0; // No penalties field currently
    const bdUtE5Tax = taxBD + ut + e5;
    const ait = Math.max(0, Math.round((totalTransactionAmount - penalties - bdUtE5Tax) * 0.003)); // 0.30% = 0.003
    
    // Vendor amount calculation includes all service charges
    const vendorAmount = baseFare + totalTaxes + ait + salmaAirServiceCharge + vendorServiceCharge - commissionAmount - plb;

    setFormData((prev) => ({
      ...prev,
      ait: ait,
      totalTaxes: Math.max(0, Math.round(totalTaxes)),
      vendorAmount: Math.max(0, Math.round(vendorAmount))
    }));
  }, [
    formData.baseFare,
    formData.taxes,
    formData.taxBD,
    formData.e5,
    formData.e7,
    formData.g8,
    formData.ow,
    formData.p7,
    formData.p8,
    formData.ts,
    formData.ut,
    formData.yq,
    formData.commissionRate,
    formData.plb,
    formData.salmaAirServiceCharge,
    formData.vendorServiceCharge
  ]);

  // Auto-calc vendorDue and profit when dependencies change
  React.useEffect(() => {
    const toNumber = (v) => Number(v) || 0;
    const vendorAmount = toNumber(formData.vendorAmount);
    const vendorPaidFh = toNumber(formData.vendorPaidFh);
    const customerDeal = toNumber(formData.customerDeal);

    const vendorDue = Math.max(0, Math.round(vendorAmount - vendorPaidFh));
    const profit = Math.round(customerDeal - vendorAmount);

    if (vendorDue !== formData.vendorDue || profit !== formData.profit) {
      setFormData(prev => ({ ...prev, vendorDue, profit }));
    }
  }, [formData.vendorAmount, formData.vendorPaidFh, formData.customerDeal]);

  // Auto-calculate customer due from deal and paid
  React.useEffect(() => {
    const deal = Number(formData.customerDeal) || 0;
    const paid = Number(formData.customerPaid) || 0;
    const due = Math.max(0, Math.round(deal - paid));
    if (due !== formData.customerDue) {
      setFormData(prev => ({ ...prev, customerDue: due }));
    }
  }, [formData.customerDeal, formData.customerPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const errs = validate(formData);
    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      setLoading(false);
      return;
    }

    try {
      // Prepare ticket data for submission
      const ticketData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        tripType: formData.tripType,
        flightType: formData.flightType,
        date: formData.date,
        bookingId: formData.bookingId,
        gdsPnr: formData.gdsPnr || '',
        airlinePnr: formData.airlinePnr || '',
        airline: formData.airline,
        airlineId: formData.airlineId || '',
        status: formData.status || 'pending',
        origin: formData.origin || '',
        destination: formData.destination || '',
        flightDate: formData.flightDate || '',
        returnDate: formData.returnDate || '',
        segments: formData.segments || [],
        agent: formData.agent || '',
        agentId: formData.agentId || '',
        purposeType: formData.purposeType || '',
        adultCount: formData.adultCount || 0,
        childCount: formData.childCount || 0,
        infantCount: formData.infantCount || 0,
        customerDeal: formData.customerDeal || 0,
        customerPaid: formData.customerPaid || 0,
        customerDue: formData.customerDue || 0,
        dueDate: formData.dueDate || '',
        baseFare: formData.baseFare || 0,
        taxBD: formData.taxBD || 0,
        e5: formData.e5 || 0,
        e7: formData.e7 || 0,
        g8: formData.g8 || 0,
        ow: formData.ow || 0,
        p7: formData.p7 || 0,
        p8: formData.p8 || 0,
        ts: formData.ts || 0,
        ut: formData.ut || 0,
        yq: formData.yq || 0,
        taxes: formData.taxes || 0,
        totalTaxes: formData.totalTaxes || 0,
        ait: formData.ait || 0,
        commissionRate: formData.commissionRate || 0,
        plb: formData.plb || 0,
        salmaAirServiceCharge: formData.salmaAirServiceCharge || 0,
        vendorServiceCharge: formData.vendorServiceCharge || 0,
        vendorAmount: formData.vendorAmount || 0,
        vendorPaidFh: formData.vendorPaidFh || 0,
        vendorDue: formData.vendorDue || 0,
        profit: formData.profit || 0,
        segmentCount: formData.segmentCount || 1,
        flownSegment: formData.flownSegment || false,
      };

      // Update ticket using mutation
      await updateTicketMutation.mutateAsync({
        // Use ticketId if available, otherwise fallback to id or bookingId
        ticketId: formData.ticketId || id || formData.bookingId,
        ticketData,
      });

      setSuccess('Ticket updated successfully!');
      setTouched({});
      setValidationErrors({});

      // Navigate to ticket list after successful update
      navigate('/air-ticketing/tickets');
    } catch (error) {
      setError(error.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = () => {
    // Simple fare calculation logic
    const baseFare = 5000 + (Math.random() * 15000);
    const tax = baseFare * 0.15;
    
    setFormData(prev => ({
      ...prev,
      baseFare: Math.round(baseFare),
      tax: Math.round(tax)
    }));
  };

  // Keep segment count in sync for multicity
  React.useEffect(() => {
    if (formData.tripType === 'multicity') {
      setFormData(prev => ({ ...prev, segmentCount: prev.segments?.length || 0 }));
    }
  }, [formData.tripType, formData.segments]);

  const handleSegmentChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.segments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, segments: updated };
    });
  };

  const addSegment = () => {
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, { origin: '', destination: '', date: '' }]
    }));
  };

  const removeSegment = (index) => {
    setFormData(prev => {
      if ((prev.segments?.length || 0) <= 2) return prev; // keep minimum 2 segments
      const updated = prev.segments.filter((_, i) => i !== index);
      return { ...prev, segments: updated };
    });
  };

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Ticket ID missing</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Please navigate from the ticket list to edit.</p>
        <button
          onClick={() => navigate('/air-ticketing/tickets')}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (ticketLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Loading ticket...</div>
      </div>
    );
  }

  if (ticketError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Failed to load ticket.</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{ticketError.message || 'Something went wrong'}</p>
        <button
          onClick={() => navigate('/air-ticketing/tickets')}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Edit Ticket - Air Ticketing</title>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/air-ticketing/tickets')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              টিকিট আপডেট করুন
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
              বিদ্যমান এয়ার টিকিটের তথ্য সংশোধন করুন
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Booking & Agent Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Booking Details
            </h2>
            
            {/* Customer Selection */}
            <div className="mb-6">
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer * <span className="text-gray-500">(Search by name, ID, phone, or email)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="customer"
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    setShowCustomerDropdown(true);
                    if (!e.target.value) {
                      setFormData(prev => ({
                        ...prev,
                        customerId: '',
                        customerName: '',
                        customerPhone: ''
                      }));
                    }
                  }}
                  onFocus={() => {
                    if (customerResults.length > 0 || customerQuery.length >= 2) {
                      setShowCustomerDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click event on dropdown items
                    setTimeout(() => {
                      setShowCustomerDropdown(false);
                      markTouched('customerId');
                      setValidationErrors(validate(formData));
                    }, 200);
                  }}
                  placeholder="Search customer by name, ID, phone, or email..."
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    touched.customerId && validationErrors.customerId
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  required
                />
                {touched.customerId && validationErrors.customerId && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.customerId}</p>
                )}
                {showCustomerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {customerLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                    ) : customerResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {customerQuery.length < 2 ? 'Type at least 2 characters to search' : 'No customers found'}
                      </div>
                    ) : (
                      customerResults.map((c) => (
                        <button
                          key={String(c.customerId || c.id || c._id)}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {c.customerId || c.id || c._id}
                                </div>
                                {c.passportNumber && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Passport: {c.passportNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{c.mobile || c.phone || ''}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {formData.customerId && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-medium text-gray-900 dark:text-white">{formData.customerName}</span>
                  {formData.customerPhone && (
                    <span className="ml-2 text-gray-500">({formData.customerPhone})</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Top row: Date, Ticket ID, Booking ID, Flight Type, Status */}
            {formData.ticketId && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ticket ID (Unique - Auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.ticketId}
                  readOnly
                  className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold font-mono cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This ID is auto-generated and cannot be changed</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => { handleChange(e); if (touched.date) setValidationErrors(validate({ ...formData, date: e.target.value })); }}
                    onBlur={() => { markTouched('date'); markTouched('customerId'); setValidationErrors(validate(formData)); }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {touched.date && validationErrors.date && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.date}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Booking ID *</label>
                <input
                  type="text"
                  name="bookingId"
                  id="bookingId"
                  value={formData.bookingId}
                    onChange={(e) => { handleChange(e); if (touched.bookingId) setValidationErrors(validate({ ...formData, bookingId: e.target.value })); }}
                    onBlur={() => { markTouched('bookingId'); markTouched('customerId'); setValidationErrors(validate(formData)); }}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Booking reference"
                  required
                />
                {touched.bookingId && validationErrors.bookingId && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.bookingId}</p>
                )}
              </div>
              <div>
                <label htmlFor="flightType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route Category</label>
                <select
                  name="flightType"
                  id="flightType"
                  value={formData.flightType}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                   <option value="domestic">Domestic</option>
                   <option value="international">International</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                   <option value="booked">Booked</option>
                   <option value="issued">Issued</option>
                   <option value="partial">Partial Due</option>
                   <option value="flown">Flown</option>
                   <option value="refund">Refund Submitted</option>
                   <option value="refund settled">Refund Settled</option>
                   <option value="refunded">Refunded</option>
                   <option value="void">Void</option>
                   <option value="unconfirmed">Unconfirmed</option>
                   <option value="in progress">In Progress</option>
                   
                </select>
              </div>
            </div>

            {/* PNRs and Airline */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GDS PNR</label>
                <input
                  type="text"
                  name="gdsPnr"
                  value={formData.gdsPnr}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ABC123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Airlines PNR</label>
                <input
                  type="text"
                  name="airlinePnr"
                  value={formData.airlinePnr}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="DEF456"
                />
              </div>
              <div>
                <label htmlFor="airline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Airlines * <span className="text-gray-500">(Search by name, ID, code, or country)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="airline"
                    value={airlineQuery}
                    onChange={(e) => {
                      setAirlineQuery(e.target.value);
                      setShowAirlineDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({
                          ...prev,
                          airline: '',
                          airlineId: ''
                        }));
                        setSelectedAirlineId('');
                      }
                    }}
                    onFocus={() => {
                      if (airlineResults.length > 0 || airlineQuery.length >= 2) {
                        setShowAirlineDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click event on dropdown items
                      setTimeout(() => {
                        setShowAirlineDropdown(false);
                        markTouched('airline');
                        setValidationErrors(validate(formData));
                      }, 200);
                    }}
                    placeholder="Search airline by name, ID, code, or country..."
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      touched.airline && validationErrors.airline
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    required
                  />
                  {touched.airline && validationErrors.airline && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.airline}</p>
                  )}
                  {showAirlineDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {airlineLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                      ) : airlineResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {airlineQuery.length < 2 ? 'Type at least 2 characters to search' : 'No airlines found'}
                        </div>
                      ) : (
                        airlineResults.map((a) => (
                          <button
                            key={String(a.id || a.airlineId || a._id)}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectAirline(a)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Plane className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {a.name || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {a.id || a.airlineId || a._id} | Code: {a.code || 'N/A'}
                                  </div>
                                  {a.country && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      {a.country}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedAirlineId && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected Airline ID: <span className="font-medium text-gray-900 dark:text-white">{selectedAirlineId}</span>
                  </div>
                )}
              </div>
            </div>


            {/* Passenger Types */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Passenger Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adult</label>
                  <input
                    type="number"
                    name="adultCount"
                    value={formData.adultCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Child</label>
                  <input
                    type="number"
                    name="childCount"
                    value={formData.childCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infant</label>
                  <input
                    type="number"
                    name="infantCount"
                    value={formData.infantCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Agent and Purpose */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name / ID <span className="text-gray-500">(Search by name, ID, phone, or email)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="agent"
                    value={agentQuery}
                    onChange={(e) => {
                      setAgentQuery(e.target.value);
                      setShowAgentDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({
                          ...prev,
                          agent: '',
                          agentId: ''
                        }));
                        setSelectedAgentId('');
                      }
                    }}
                    onFocus={() => {
                      if (agentResults.length > 0 || agentQuery.length >= 2) {
                        setShowAgentDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click event on dropdown items
                      setTimeout(() => {
                        setShowAgentDropdown(false);
                      }, 200);
                    }}
                    placeholder="Search agent by name, ID, phone, or email..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {showAgentDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {agentLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                      ) : agentResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {agentQuery.length < 2 ? 'Type at least 2 characters to search' : 'No agents found'}
                        </div>
                      ) : (
                        agentResults.map((a) => (
                          <button
                            key={String(a.id || a.agentId || a.idCode || a._id)}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectAgent(a)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Building className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {a.name || a.tradeName || a.companyName || a.personalName || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {a.agentId || a.idCode || a.id || a._id}
                                  </div>
                                  {a.personalName && a.name && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      {a.personalName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {a.mobile || a.phone || a.contactNo || ''}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedAgentId && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected Agent ID: <span className="font-medium text-gray-900 dark:text-white">{selectedAgentId}</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issued By</label>
                <input
                  type="text"
                  name="purposeType"
                  value={formData.purposeType}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter issuer name"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Flight Specifics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-green-600" />
              Flight Specifics
            </h2>

            {/* Flight Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'oneway' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'oneway' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    One Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'roundtrip' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'roundtrip' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    Round Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'multicity' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'multicity' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    Multi City
                  </button>
                </div>
              </div>
            </div>

            {/* Route and Dates */}
            {formData.tripType !== 'multicity' ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => { handleChange(e); if (touched.origin) setValidationErrors(validate({ ...formData, origin: e.target.value })); }}
                    onBlur={() => { markTouched('origin'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DAC"
                    required
                  />
                  {touched.origin && validationErrors.origin && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.origin}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => { handleChange(e); if (touched.destination) setValidationErrors(validate({ ...formData, destination: e.target.value })); }}
                    onBlur={() => { markTouched('destination'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DXB"
                    required
                  />
                  {touched.destination && validationErrors.destination && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.destination}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="flightDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                  <input
                    type="date"
                    name="flightDate"
                    id="flightDate"
                    value={formData.flightDate}
                    onChange={(e) => { handleChange(e); if (touched.flightDate) setValidationErrors(validate({ ...formData, flightDate: e.target.value })); }}
                    onBlur={() => { markTouched('flightDate'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {touched.flightDate && validationErrors.flightDate && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.flightDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Date{formData.tripType === 'roundtrip' ? ' *' : ''}</label>
                  <input
                    type="date"
                    name="returnDate"
                    id="returnDate"
                    value={formData.returnDate}
                    onChange={(e) => { handleChange(e); if (touched.returnDate) setValidationErrors(validate({ ...formData, returnDate: e.target.value })); }}
                    onBlur={() => { markTouched('returnDate'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.tripType === 'roundtrip'}
                  />
                  {touched.returnDate && validationErrors.returnDate && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.returnDate}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi City Segments</h3>
                  <button
                    type="button"
                    onClick={addSegment}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Segment
                  </button>
                </div>
                {formData.segments?.map((seg, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                      <input
                        type="text"
                        value={seg.origin}
                        onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DAC"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                      <input
                        type="text"
                        value={seg.destination}
                        onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DXB"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                      <input
                        type="date"
                        value={seg.date}
                        onChange={(e) => handleSegmentChange(idx, 'date', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removeSegment(idx)}
                        disabled={(formData.segments?.length || 0) <= 2}
                        className={`w-full md:w-auto px-3 py-2 rounded-lg border ${((formData.segments?.length || 0) <= 2) ? 'text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Financial Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-purple-600" />
              Financial Details
            </h2>

            {/* Customer finance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Deal</label>
                <input
                  type="number"
                  name="customerDeal"
                  value={formData.customerDeal}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Paid</label>
                <input
                  type="number"
                  name="customerPaid"
                  value={formData.customerPaid}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Due</label>
                <input
                  type="number"
                  name="customerDue"
                  value={formData.customerDue}
                  readOnly
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Vendor Amount Breakdown */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vendor Amount Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Fare</label>
                  <input type="number" name="baseFare" value={formData.baseFare} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxes</label>
                  <input type="number" name="taxes" value={formData.taxes} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                
                {/* Tax Details Section with Toggle */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowTaxes(!showTaxes)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2"
                  >
                    <span>Tax Details</span>
                    {showTaxes ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Collapsible Tax Fields */}
                  <div className={`transition-all duration-300 overflow-hidden ${showTaxes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          BD
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Embarkation Fee (Bangladesh)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="taxBD" value={formData.taxBD} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          E5
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            VAT on Embarkation Fee
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="e5" value={formData.e5} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          E7
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Advance Passenger Processing User Charge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="e7" value={formData.e7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          G8
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            International Arrival & Departure Fee
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="g8" value={formData.g8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          OW
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Excise Duty (Bangladesh)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ow" value={formData.ow} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          P7
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Additional Service Tax (if applicable)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="p7" value={formData.p7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          P8
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Airport Development Fee (if applicable)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="p8" value={formData.p8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          TS
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Passenger Service Charge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ts" value={formData.ts} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          UT
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Travel Tax (International)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ut" value={formData.ut} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          YQ
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Fuel Surcharge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="yq" value={formData.yq} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Taxes</label>
                  <input type="number" name="totalTaxes" value={formData.totalTaxes} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AIT (Advance Income Tax)
                  </label>
                  <input 
                    type="number" 
                    name="ait" 
                    value={formData.ait} 
                    readOnly 
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Rate (%)</label>
                  <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PLB</label>
                  <input type="number" name="plb" value={formData.plb} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salma Air Service Charge</label>
                  <input type="number" name="salmaAirServiceCharge" value={formData.salmaAirServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Service Charge</label>
                  <input type="number" name="vendorServiceCharge" value={formData.vendorServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Vendor finance */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Amount</label>
                <input type="number" name="vendorAmount" value={formData.vendorAmount} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Paid (FH)</label>
                <input
                  type="number"
                  name="vendorPaidFh"
                  value={formData.vendorPaidFh}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Due</label>
                <input
                  type="number"
                  name="vendorDue"
                  value={formData.vendorDue}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profit</label>
                <input
                  type="number"
                  name="profit"
                  value={formData.profit}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segment Count</label>
                <input
                  type="number"
                  name="segmentCount"
                  value={formData.segmentCount}
                  onChange={handleChange}
                  min="1"
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center mt-7">
                <input
                  id="flownSegment"
                  type="checkbox"
                  name="flownSegment"
                  checked={formData.flownSegment}
                  onChange={(e) => setFormData(prev => ({ ...prev, flownSegment: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flownSegment" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Flown Segment</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/air-ticketing/tickets')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              ফিরে যান
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  const errs = validate(formData);
                  setValidationErrors(errs);
                  if (Object.keys(errs).length === 0) setShowPreview(true);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                প্রিভিউ
              </button>

              <button
                type="submit"
                disabled={loading || updateTicketMutation.isPending}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {(loading || updateTicketMutation.isPending) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    টিকিট আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        {/* Preview Modal */}
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview Ticket" size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">Booking</div>
                  <div className="text-gray-700 dark:text-gray-300">Customer: {formData.customerName || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Date: {formData.date || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">
                Ticket ID: <span className="text-blue-600 dark:text-blue-400 font-semibold">{formData.ticketId || 'N/A'}</span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">Booking ID: {formData.bookingId || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Status: {formData.status}</div>
              <div className="text-gray-700 dark:text-gray-300">Airline: {formData.airline || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Trip: {formData.tripType}</div>
              {formData.tripType !== 'multicity' ? (
                <>
                  <div className="text-gray-700 dark:text-gray-300">Route: {formData.origin || '-'} → {formData.destination || '-'}</div>
                  <div className="text-gray-700 dark:text-gray-300">Flight: {formData.flightDate || '-'}</div>
                  {formData.tripType === 'roundtrip' && (
                    <div className="text-gray-700 dark:text-gray-300">Return: {formData.returnDate || '-'}</div>
                  )}
                </>
              ) : (
                <div className="text-gray-700 dark:text-gray-300">
                  Segments:
                  <ul className="list-disc ml-5 mt-1">
                    {formData.segments?.map((s, i) => (
                      <li key={i}>{s.origin || '-'} → {s.destination || '-'} on {s.date || '-'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">Finance</div>
              <div className="text-gray-700 dark:text-gray-300">Base Fare: {formData.baseFare}</div>
              <div className="text-gray-700 dark:text-gray-300">Taxes: {formData.totalTaxes}</div>
              <div className="text-gray-700 dark:text-gray-300">AIT: {formData.ait}</div>
              <div className="text-gray-700 dark:text-gray-300">Salma Air Service Charge: {formData.salmaAirServiceCharge}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Service Charge: {formData.vendorServiceCharge}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Amount: {formData.vendorAmount}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Paid: {formData.vendorPaidFh}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Due: {formData.vendorDue}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Deal: {formData.customerDeal}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Paid: {formData.customerPaid}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Due: {formData.customerDue}</div>
              <div className="text-gray-700 dark:text-gray-300">Profit: {formData.profit}</div>
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={async () => {
                setShowPreview(false);
                await new Promise(r => setTimeout(r, 50));
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                const form = document.querySelector('form');
                if (form) form.dispatchEvent(submitEvent);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirm & Update
            </button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default TicketEdit;
