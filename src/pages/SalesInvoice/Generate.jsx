import React, { useEffect, useMemo, useState } from 'react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

const formatBDT = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(n || 0);

const Generate = () => {
  const axiosSecure = useAxiosSecure();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    customerId: '',
    customerPhone: '',
    serviceId: '',
    bookingId: '',
    vendor: '',
    vendorId: '',
    // Common billing fields
    bill: '',
    commission: '',
    discount: '',
    paid: '',
    dueCommitmentDate: '',
    // Air Ticket specific fields
    baseFare: '',
    tax: '',
    sellerDetails: '',
    gdsPnr: '',
    airlinePnr: '',
    ticketNo: '',
    passengerType: 'adult',
    airlineName: '',
    // Flight Details
    flightType: 'oneway',
    origin: '',
    destination: '',
    flightDate: '',
    originOutbound: '',
    destinationOutbound: '',
    outboundFlightDate: '',
    originInbound: '',
    destinationInbound: '',
    inboundFlightDate: '',
    // Multi City segments
    originSegment1: '',
    destinationSegment1: '',
    flightDateSegment1: '',
    originSegment2: '',
    destinationSegment2: '',
    flightDateSegment2: '',
    // Customer Fare fields
    customerBaseFare: '',
    customerTax: '',
    customerCommission: '',
    ait: '',
    serviceCharge: '',
    // Vendor Fare fields
    vendorName: '',
    vendorBaseFare: '',
    vendorTax: '',
    vendorCommission: '',
    vendorAit: '',
    vendorServiceCharge: ''
  });

  // Load service types from backend so Service options reflect current management types
  const [serviceOptions, setServiceOptions] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    let active = true;
    const loadServices = async () => {
      try {
        setServiceLoading(true);
        setServiceError('');

        // Use the provided /customer-types contract
        const res = await axiosSecure.get('/customer-types');
        const list = res?.data?.customerTypes || [];
        const options = list.map((s) => ({
          id: String(s?.value),
          name: String(s?.label)
        })).filter((o) => o.id && o.name);

        if (active) {
          setServiceOptions(options);
          if (!options.length) {
            setServiceError('No services found from backend');
          }
          // If no service selected or current is invalid, default to first option
          if (options.length && (!form.serviceId || !options.some((o) => o.id === form.serviceId))) {
            setForm((f) => ({ ...f, serviceId: options[0].id }));
          }
        }
      } catch (error) {
        if (active) {
          setServiceError('Failed to load services');
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to load service types. Please refresh the page.',
            confirmButtonColor: '#dc2626'
          });
        }
      } finally {
        if (active) setServiceLoading(false);
      }
    };
    loadServices();
    return () => { active = false; };
  }, [axiosSecure]);

  const selectedService = useMemo(() => {
    return serviceOptions.find((s) => s.id === form.serviceId);
  }, [serviceOptions, form.serviceId]);

  const isAirTicket = useMemo(() => {
    const id = String(selectedService?.id || '').toLowerCase(); // value
    const name = String(selectedService?.name || '').toLowerCase(); // label
    return id.includes('air') || id.includes('ticket') || name.includes('air') || name.includes('ticket');
  }, [selectedService]);

  const computedBill = useMemo(() => {
    // If service is Air Ticket, compute bill from base fare + tax when provided
    if (isAirTicket) {
      const baseFare = Number(form.baseFare) || 0;
      const tax = Number(form.tax) || 0;
      return Math.max(0, baseFare + tax);
    }
    return Number(form.bill) || 0;
  }, [isAirTicket, form.baseFare, form.tax, form.bill]);

  const amount = useMemo(() => {
    const bill = computedBill;
    const commission = Number(form.commission) || 0;
    const discount = Number(form.discount) || 0;
    return Math.max(0, bill + commission - discount);
  }, [computedBill, form.commission, form.discount]);

  const due = useMemo(() => {
    const paid = Number(form.paid) || 0;
    return Math.max(0, amount - paid);
  }, [amount, form.paid]);

  const customerTotalFare = useMemo(() => {
    const baseFare = Number(form.customerBaseFare) || 0;
    const tax = Number(form.customerTax) || 0;
    const commission = Number(form.customerCommission) || 0;
    const ait = Number(form.ait) || 0;
    const serviceCharge = Number(form.serviceCharge) || 0;
    
    // Commission is deducted from (Base Fare + Tax)
    const subtotal = baseFare + tax - commission;
    return Math.max(0, subtotal + ait + serviceCharge);
  }, [form.customerBaseFare, form.customerTax, form.customerCommission, form.ait, form.serviceCharge]);

  const vendorTotalFare = useMemo(() => {
    const baseFare = Number(form.vendorBaseFare) || 0;
    const tax = Number(form.vendorTax) || 0;
    const commission = Number(form.vendorCommission) || 0;
    const ait = Number(form.vendorAit) || 0;
    const serviceCharge = Number(form.vendorServiceCharge) || 0;
    
    // Commission is deducted from (Base Fare + Tax)
    const subtotal = baseFare + tax - commission;
    return Math.max(0, subtotal + ait + serviceCharge);
  }, [form.vendorBaseFare, form.vendorTax, form.vendorCommission, form.vendorAit, form.vendorServiceCharge]);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Customer search state
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Vendor search state
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorResults, setVendorResults] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  // Debounced backend search for customers by id/name/phone/email
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
        // Primary: query backend with a generic q param
        const res = await axiosSecure.get('/customers', { params: { q } });
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : (data?.customers || []);

        // Fallback: filter locally if backend returned full list without filtering
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((c) => {
          const id = String(c.id || c.customerId || '').toLowerCase();
          const name = String(c.name || '').toLowerCase();
          const phone = String(c.phone || c.mobile || '');
          const email = String(c.email || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ)
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

  // Debounced backend search for vendors by trade name/owner name/contact no
  useEffect(() => {
    const q = vendorQuery.trim();
    if (!q || q.length < 2) {
      setVendorResults([]);
      return;
    }

    let active = true;
    setVendorLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Primary: query backend with a generic q param
        const res = await axiosSecure.get('/vendors', { params: { q } });
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : (data?.vendors || []);

        // Fallback: filter locally if backend returned full list without filtering
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((v) => {
          const id = String(v.id || v._id || '').toLowerCase();
          const tradeName = String(v.tradeName || '').toLowerCase();
          const ownerName = String(v.ownerName || '').toLowerCase();
          const contactNo = String(v.contactNo || '');
          const tradeLocation = String(v.tradeLocation || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            tradeName.includes(normalizedQ) ||
            ownerName.includes(normalizedQ) ||
            contactNo.includes(q) ||
            tradeLocation.includes(normalizedQ)
          );
        });
        if (active) setVendorResults(filtered.slice(0, 10));
      } catch (err) {
        // Silent fail; keep results empty
        if (active) setVendorResults([]);
      } finally {
        if (active) setVendorLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [vendorQuery, axiosSecure]);

  const handleSelectCustomer = (c) => {
    change('customer', c.name || '');
    change('customerId', c.id || c.customerId || '');
    change('customerPhone', c.phone || c.mobile || '');
    setCustomerQuery(c.name || c.id || '');
    setShowCustomerDropdown(false);
  };

  const handleSelectVendor = (v) => {
    change('vendorName', v.tradeName || '');
    change('vendorId', v.id || v._id || '');
    setVendorQuery(v.tradeName || v.id || '');
    setShowVendorDropdown(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.customerId) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please select a customer',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    if (!form.serviceId) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please select a service type',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to create this invoice?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Show loading
        Swal.fire({
          title: 'Creating Invoice...',
          text: 'Please wait while we create your invoice',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // TODO: Replace with actual API call
        // const response = await axiosSecure.post('/invoices', form);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Invoice created successfully!',
          confirmButtonColor: '#059669',
          showCancelButton: true,
          cancelButtonText: 'Close',
          confirmButtonText: 'Print Invoice'
        }).then((result) => {
          if (result.isConfirmed) {
            window.print();
          }
        });

      } catch (error) {
        // Error message
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to create invoice. Please try again.',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sale Generate</h1>
          <p className="text-sm text-gray-600">Create invoice, then submit & print</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Print Invoice',
                text: 'Do you want to print this invoice?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#059669',
                cancelButtonColor: '#dc2626',
                confirmButtonText: 'Yes, Print!',
                cancelButtonText: 'Cancel'
              });
              
              if (result.isConfirmed) {
                window.print();
              }
            }} 
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
          >
            Print
          </button>
        </div>
      </header>

      {/* Sales Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Details</h3>
        <form id="sale-form" onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" className="mt-1 w-full border rounded-md px-3 py-2" value={form.date} onChange={(e) => change('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer (search)</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, phone, or ID..."
                  className="w-full border rounded-md px-3 py-2"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                />
                {showCustomerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {customerLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                    ) : customerResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No customers found</div>
                    ) : (
                      customerResults.map((c) => (
                        <button
                          key={String(c.id || c.customerId)}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{c.name}</div>
                              <div className="text-xs text-gray-500">ID: {c.id || c.customerId}</div>
                            </div>
                            <div className="text-sm text-gray-600">{c.phone || c.mobile}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {form.customerId && (
                <div className="mt-2 text-xs text-gray-500">Selected: {form.customer} ({form.customerId})</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={form.serviceId}
                onChange={(e) => change('serviceId', e.target.value)}
                disabled={!serviceOptions.length}
              >
                {serviceOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {serviceLoading && (
                <div className="mt-1 text-xs text-gray-500">Loading services...</div>
              )}
              {!serviceLoading && serviceError && (
                <div className="mt-1 text-xs text-red-600">{serviceError}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking ID</label>
              <input type="text" className="mt-1 w-full border rounded-md px-3 py-2" value={form.bookingId} onChange={(e) => change('bookingId', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GDS</label>
              <input type="text" className="mt-1 w-full border rounded-md px-3 py-2" value={form.gdsPnr} onChange={(e) => change('gdsPnr', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Airline PNR</label>
              <input type="text" className="mt-1 w-full border rounded-md px-3 py-2" value={form.airlinePnr} onChange={(e) => change('airlinePnr', e.target.value)} />
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Airline Name</label>
                  <input type="text" className="mt-1 w-full border rounded-md px-3 py-2" value={form.airlineName} onChange={(e) => change('airlineName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passenger Type</label>
                  <select className="mt-1 w-full border rounded-md px-3 py-2" value={form.passengerType} onChange={(e) => change('passengerType', e.target.value)}>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant">Infant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ticket No</label>
                  <input type="text" className="mt-1 w-full border rounded-md px-3 py-2" value={form.ticketNo} onChange={(e) => change('ticketNo', e.target.value)} />
                </div>
              </div>

          {/* Flight Details Section */}
          {isAirTicket && (
            <div className="border-t pt-6 mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Flight Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Flight Type</label>
                  <select 
                    className="mt-1 w-full border rounded-md px-3 py-2" 
                    value={form.flightType} 
                    onChange={(e) => change('flightType', e.target.value)}
                  >
                    <option value="oneway">One Way</option>
                    <option value="round">Round Trip</option>
                    <option value="multicity">Multi City</option>
                  </select>
                </div>
              </div>

              {/* One Way Flight Fields */}
              {form.flightType === 'oneway' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Origin</label>
                    <input 
                      type="text" 
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      value={form.origin} 
                      onChange={(e) => change('origin', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <input 
                      type="text" 
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      value={form.destination} 
                      onChange={(e) => change('destination', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Flight Date</label>
                    <input 
                      type="date" 
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      value={form.flightDate} 
                      onChange={(e) => change('flightDate', e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {/* Round Trip Flight Fields */}
              {form.flightType === 'round' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-3">Outbound Flight</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origin (Outbound)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.originOutbound} 
                          onChange={(e) => change('originOutbound', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destination (Outbound)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.destinationOutbound} 
                          onChange={(e) => change('destinationOutbound', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Outbound Flight Date</label>
                        <input 
                          type="date" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.outboundFlightDate} 
                          onChange={(e) => change('outboundFlightDate', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-3">Inbound Flight</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origin (Inbound)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.originInbound} 
                          onChange={(e) => change('originInbound', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destination (Inbound)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.destinationInbound} 
                          onChange={(e) => change('destinationInbound', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Inbound Flight Date</label>
                        <input 
                          type="date" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.inboundFlightDate} 
                          onChange={(e) => change('inboundFlightDate', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi City Flight Fields */}
              {form.flightType === 'multicity' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-3">Segment 1</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origin (Segment 1)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.originSegment1} 
                          onChange={(e) => change('originSegment1', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destination (Segment 1)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.destinationSegment1} 
                          onChange={(e) => change('destinationSegment1', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Flight Date (Segment 1)</label>
                        <input 
                          type="date" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.flightDateSegment1} 
                          onChange={(e) => change('flightDateSegment1', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-3">Segment 2</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origin (Segment 2)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.originSegment2} 
                          onChange={(e) => change('originSegment2', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destination (Segment 2)</label>
                        <input 
                          type="text" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.destinationSegment2} 
                          onChange={(e) => change('destinationSegment2', e.target.value)} 
                        />
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700">Flight Date (Segment 2)</label>
                        <input 
                          type="date" 
                          className="mt-1 w-full border rounded-md px-3 py-2" 
                          value={form.flightDateSegment2} 
                          onChange={(e) => change('flightDateSegment2', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
              </div>

      
      {/* Customer Fare Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Fare</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Fare</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.customerBaseFare} 
              onChange={(e) => change('customerBaseFare', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.customerTax} 
              onChange={(e) => change('customerTax', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.customerCommission} 
              onChange={(e) => change('customerCommission', e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">AIT</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.ait} 
              onChange={(e) => change('ait', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Charge</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.serviceCharge} 
              onChange={(e) => change('serviceCharge', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Fare</label>
            <div className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50">{formatBDT(customerTotalFare)}</div>
          </div>
        </div>
      </div>

      {/* Vendor Fare Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Fare</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor Name (search)</label>
            <div className="mt-1 relative">
              <input
                type="text"
                placeholder="Search by trade name, owner name, or contact no..."
                className="w-full border rounded-md px-3 py-2"
                value={vendorQuery}
                onChange={(e) => setVendorQuery(e.target.value)}
                onFocus={() => setShowVendorDropdown(true)}
                onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
              />
              {showVendorDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {vendorLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                  ) : vendorResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No vendors found</div>
                  ) : (
                    vendorResults.map((v) => (
                      <button
                        key={String(v.id || v._id)}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectVendor(v)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{v.tradeName}</div>
                            <div className="text-xs text-gray-500">Owner: {v.ownerName}</div>
                          </div>
                          <div className="text-sm text-gray-600">{v.contactNo}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {form.vendorId && (
              <div className="mt-2 text-xs text-gray-500">Selected: {form.vendorName} ({form.vendorId})</div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Fare</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.vendorBaseFare} 
              onChange={(e) => change('vendorBaseFare', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.vendorTax} 
              onChange={(e) => change('vendorTax', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.vendorCommission} 
              onChange={(e) => change('vendorCommission', e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">AIT</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.vendorAit} 
              onChange={(e) => change('vendorAit', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Charge</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              className="mt-1 w-full border rounded-md px-3 py-2" 
              value={form.vendorServiceCharge} 
              onChange={(e) => change('vendorServiceCharge', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Fare</label>
            <div className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50">{formatBDT(vendorTotalFare)}</div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button type="submit" form="sale-form" className="px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">
          Submit
        </button>
      </div>
    </div>
    
  );
};

export default Generate;


