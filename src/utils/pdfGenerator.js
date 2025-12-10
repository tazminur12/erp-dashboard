import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- I. Constants and Local Data ---

// --- Updated Bangla Labels (সব বাংলায়) ---
const L = {
  transactionDetails: 'লেনদেনের বিবরণ',
  transactionId: 'লেনদেন আইডি',
  date: 'তারিখ',
  time: 'সময়',
  createdBy: 'তৈরি করেছেন',
  customerInfo: 'গ্রাহকের তথ্য',
  name: 'নাম',
  phone: 'মোবাইল নম্বর',
  email: 'ইমেইল',
  customerId: 'গ্রাহক আইডি',
  paymentInfo: 'পেমেন্ট তথ্য',
  paymentMethod: 'পেমেন্টের মাধ্যম',
  category: 'সেবার ধরন',
  notes: 'অতিরিক্ত মন্তব্য',
  invoiceId: 'ইনভয়েস নম্বর',
  branchId: 'শাখা',
  customerBank: 'গ্রাহকের ব্যাংক',
  customerAccNum: 'গ্রাহকের অ্যাকাউন্ট নম্বর',
  bankName: 'ব্যাংকের নাম',
  accountNumber: 'অ্যাকাউন্ট নম্বর',
  chequeNumber: 'চেক নম্বর',
  mobileProvider: 'মোবাইল ব্যাংকিং সেবা',
  transactionIdShort: 'লেনদেন আইডি',
  reference: 'রেফারেন্স',
  debitAccount: 'ডেবিট অ্যাকাউন্ট',
  creditAccount: 'ক্রেডিট অ্যাকাউন্ট',
  bank: 'ব্যাংক',
  accountNumberLong: 'অ্যাকাউন্ট নম্বর',
  footerMessage: 'এটি একটি অফিসিয়াল লেনদেনের রিসিপ্ট',
  systemName: 'সালমা এয়ার ট্রাভেলস এন্ড ট্যুরস',
  status: 'স্ট্যাটাস',
  amount: 'পরিমাণ',
  transactionType: 'লেনদেনের ধরন',
  receiptTitle: 'লেনদেনের রিসিপ্ট',
  officialCopy: 'অফিসিয়াল কপি',
  receiptNo: 'রিসিপ্ট নং',
  authorizedSignatory: 'অনুমোদিত স্বাক্ষর',
  thankYouMessage: 'আপনার ব্যবসার জন্য ধন্যবাদ',
  contactInfo: 'যেকোনো প্রশ্নের জন্য যোগাযোগ করুন: admin@salmaair.com | +880 1946 881177',
};

// Transaction Types and their colors
const TRANSACTION_TYPES = {
  credit: {
    text: 'CREDIT',
    subtitle: 'Payment Received',
    color: '#10B981', // Green
    bgColor: '#10B98115',
  },
  debit: {
    text: 'DEBIT',
    subtitle: 'Payment Made',
    color: '#EF4444', // Red
    bgColor: '#EF444415',
  },
  'account-transfer': {
    text: 'TRANSFER',
    subtitle: 'Account Transfer',
    color: '#3B82F6', // Blue
    bgColor: '#3B82F615',
  },
};

// Payment Method Map
const PAYMENT_METHODS = {
  bank: 'Bank Transfer',
  'bank-transfer': 'Bank Transfer',
  'ব্যাংক ট্রান্সফার': 'Bank Transfer',
  cheque: 'Cheque',
  'চেক': 'Cheque',
  'mobile-banking': 'Mobile Banking',
  'মোবাইল ব্যাংকিং': 'Mobile Banking',
  cash: 'Cash',
  'নগদ': 'Cash',
  card: 'Credit/Debit Card',
  'কার্ড': 'Credit/Debit Card',
};

// Category Map
const CATEGORIES = {
  hajj: 'Hajj & Umrah',
  'হাজ্জ প্যাকেজ': 'Hajj Package',
  'ওমরাহ প্যাকেজ': 'Umrah Package',
  'air-ticket': 'Air Ticket',
  'এয়ার টিকেট': 'Air Ticket',
  visa: 'Visa Service',
  'ভিসা সার্ভিস': 'Visa Service',
  hotel: 'Hotel Booking',
  'হোটেল বুকিং': 'Hotel Booking',
  insurance: 'Travel Insurance',
  'ইনসুরেন্স': 'Travel Insurance',
  other: 'Other Service',
  'অন্যান্য সেবা': 'Other Service',
};

// স্টাইল কনফিগারেশন ফাংশন (Professional Dark/Light Mode)
const getStyles = (isDark) => ({
  // Professional Color Palette
  primary: '#2A4365', // Deep Blue
  secondary: '#0C4A6E', // Dark Blue
  accent: '#1A56DB', // Bright Blue
  success: '#047857', // Professional Green
  danger: '#DC2626', // Professional Red
  warning: '#D97706', // Professional Amber
  
  // Background and Text
  bg: isDark ? '#111827' : '#FFFFFF',
  cardBg: isDark ? '#1F2937' : '#F8FAFC',
  paperBg: isDark ? '#1F2937' : '#FFFFFF',
  textPrimary: isDark ? '#F9FAFB' : '#1F2937',
  textSecondary: isDark ? '#D1D5DB' : '#4B5563',
  textMuted: isDark ? '#9CA3AF' : '#6B7280',
  divider: isDark ? '#374151' : '#E5E7EB',
  border: isDark ? '#4B5563' : '#E5E7EB',
  shadow: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.05)',
});


// --- II. Helper Functions ---

// Helper function to check if a value is valid
const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && trimmed.toLowerCase() !== 'n/a' && trimmed.toLowerCase() !== 'unknown';
  }
  return true;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return new Date().toLocaleTimeString('en-US');
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Function to convert amount to words
const amountToWords = (num) => {
  if (!num || num === 0) return 'Zero Taka Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const convert = (n) => {
    if (n === 0) return 'Zero';
    if (n < 1000) return convertLessThanThousand(n);
    
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    
    let result = '';
    if (thousands > 0) {
      result += convertLessThanThousand(thousands) + ' Thousand';
      if (remainder > 0) {
        result += ' ' + convertLessThanThousand(remainder);
      }
    }
    
    return result;
  };
  
  const taka = Math.floor(num);
  const paisa = Math.round((num - taka) * 100);
  
  let words = convert(taka) + ' Taka';
  if (paisa > 0) {
    words += ' and ' + convert(paisa) + ' Paisa';
  }
  words += ' Only';
  
  return words;
};

// Helper function to get payment method text
const getPaymentMethodText = (paymentMethod) => {
  if (!paymentMethod) return 'Not Specified';
  return PAYMENT_METHODS[paymentMethod] || paymentMethod;
};

// Helper function to get category text
const getCategoryText = (category) => {
  if (!category) return 'General';
  if (typeof category === 'object' && category !== null) {
    return category.name || category.label || category.title || 'General';
  }
  return CATEGORIES[category] || category;
};

// Helper function to get status text
const getStatusText = (status) => {
  if (!status) return 'Processed';
  const statusMap = {
    'submitted': 'Submitted',
    'pending': 'Pending',
    'completed': 'Completed',
    'confirmed': 'Confirmed',
    'approved': 'Approved',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
  };
  return statusMap[status.toLowerCase()] || status;
};

// Helper function to get status color
const getStatusColor = (status) => {
  if (!status) return '#10B981';
  const statusColors = {
    'completed': '#10B981',
    'confirmed': '#10B981',
    'approved': '#10B981',
    'pending': '#F59E0B',
    'submitted': '#3B82F6',
    'cancelled': '#EF4444',
    'refunded': '#8B5CF6',
  };
  return statusColors[status.toLowerCase()] || '#6B7280';
};

// --- III. Modular HTML Builders ---

// Common data row builder
const createInfoRow = (label, value, S, options = {}) => {
  const { isBoldValue = false, valueColor = S.textPrimary } = options;
  const displayValue = isValidValue(value) ? value : 'N/A';
  
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid ${S.divider}; flex-wrap: wrap; gap: 8px;">
      <span style="color: ${S.textSecondary}; font-size: clamp(10px, 2vw, 12px); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; flex: 1; min-width: 120px;">
        ${label}
      </span>
      <span style="color: ${valueColor}; font-size: clamp(11px, 2.2vw, 13px); font-weight: ${isBoldValue ? '600' : '500'}; text-align: right; flex: 1; min-width: 100px; word-break: break-word;">
        ${displayValue}
      </span>
    </div>
  `;
};

// 3.1. Header Section with Watermark
const buildHeaderHTML = (S, data) => {
  const logoSrc = '/All_Logo/Salma_Air_logo.jpg';
  const qrData = encodeURIComponent(JSON.stringify({
    t: data.transactionId || 'N/A',
    a: data.paymentDetails?.amount || data.amount || 0,
    d: data.date || new Date().toISOString().split('T')[0],
    c: data.customerName || data.customer?.name || 'Customer'
  }));
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}&margin=0`;

  return `
    <!-- Watermark Background -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.03; pointer-events: none; z-index: 0; font-size: 120px; color: ${S.primary}; font-weight: 900; display: flex; align-items: center; justify-content: center; transform: rotate(-45deg);">
      ${L.officialCopy}
    </div>
    
    <!-- Main Header -->
    <div style="position: relative; z-index: 1; margin-bottom: 25px; border-bottom: 2px solid ${S.primary}; padding-bottom: 20px;">
      <!-- Top Info Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px 15px; background: linear-gradient(135deg, ${S.primary}10 0%, ${S.secondary}10 100%); border-radius: 8px; border: 1px solid ${S.border}; flex-wrap: wrap; gap: 10px;">
        <div style="flex: 1; min-width: 200px;">
          <span style="color: ${S.textSecondary}; font-size: clamp(9px, 1.8vw, 10px); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ${L.receiptNo}
          </span>
          <span style="color: ${S.accent}; font-size: clamp(14px, 3vw, 16px); font-weight: 700; margin-left: 10px; letter-spacing: 1px;">
            ${data.transactionId || 'N/A'}
          </span>
        </div>
        <div style="text-align: right; flex: 1; min-width: 150px;">
          <span style="color: ${S.textSecondary}; font-size: clamp(9px, 1.8vw, 10px); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ইস্যু তারিখ
          </span>
          <span style="color: ${S.textPrimary}; font-size: clamp(12px, 2.5vw, 14px); font-weight: 600; margin-left: 10px;">
            ${formatDate(data.date)}
          </span>
        </div>
      </div>
      
      <!-- Company Header -->
      <div class="header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 250px;">
          <img src="${logoSrc}" alt="Company Logo" style="height: 60px; width: auto; max-width: 100%; object-fit: contain; border-radius: 8px; border: 2px solid ${S.border}; padding: 3px; background: ${S.paperBg};" />
          <div style="flex: 1; min-width: 200px;">
            <h1 style="color: ${S.primary}; font-size: clamp(20px, 4vw, 28px); margin: 0 0 4px 0; font-weight: 800; font-family: 'Inter', sans-serif; letter-spacing: -0.5px;">
              ${L.systemName}
            </h1>
            <p style="color: ${S.textMuted}; font-size: clamp(9px, 2vw, 11px); margin: 0; font-weight: 500; font-family: 'Inter', sans-serif; letter-spacing: 0.5px;">
              ট্রাভেল এজেন্সি ও ট্যুর অপারেটর
            </p>
            <p style="color: ${S.textMuted}; font-size: clamp(8px, 1.8vw, 10px); margin: 2px 0 0 0; font-weight: 400;">
              1/1 E Sat Masjid Road, Mohammadpur, Dhaka, Bangladesh | Phone: +880 1946 881177
            </p>
          </div>
        </div>
        
        <div style="text-align: center; flex-shrink: 0;">
          <img src="${qrSrc}" alt="QR Code" style="height: 80px; width: 80px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid ${S.border}; padding: 3px; background: ${S.paperBg};" />
          <p style="color: ${S.textMuted}; font-size: clamp(8px, 1.8vw, 9px); margin: 5px 0 0 0; font-weight: 500;">
            যাচাই করতে স্ক্যান করুন
          </p>
        </div>
      </div>
      
      <!-- Receipt Title -->
      <div style="text-align: center; margin: 10px 0; padding: 15px; background: linear-gradient(135deg, ${S.primary} 0%, ${S.secondary} 100%); border-radius: 8px;">
        <h2 style="color: white; font-size: clamp(18px, 4vw, 24px); margin: 0; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
          ${L.receiptTitle}
        </h2>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: clamp(10px, 2vw, 12px); margin: 5px 0 0 0; font-weight: 500; letter-spacing: 1px;">
          ${L.officialCopy}
        </p>
      </div>
    </div>
  `;
};

// 3.2. Summary Section with Amount Highlight
const buildSummaryHTML = (data, typeData, amount, S) => {
  const statusColor = getStatusColor(data.status);
  
  return `
    <div style="margin-bottom: 25px; padding: 0; width: 100%; box-sizing: border-box;">
      <div class="summary-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; width: 100%; box-sizing: border-box;">
        <!-- Left Column - Transaction Info -->
        <div style="padding: 1.25rem; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow}; width: 100%; box-sizing: border-box;">
          <h3 style="color: ${S.primary}; font-size: clamp(14px, 3vw, 16px); margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
            ${L.transactionDetails}
          </h3>
          
          <div class="info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
            <div>
              ${createInfoRow('লেনদেন আইডি', data.transactionId, S, { isBoldValue: true })}
              ${createInfoRow('তারিখ', formatDate(data.date), S)}
              ${createInfoRow('সময়', formatTime(data.date), S)}
            </div>
            <div>
              ${createInfoRow('লেনদেনের ধরন', typeData.text, S, { isBoldValue: true, valueColor: typeData.color })}
              ${createInfoRow('স্ট্যাটাস', getStatusText(data.status), S, { isBoldValue: true, valueColor: statusColor })}
              ${createInfoRow('তৈরি করেছেন', data.createdBy || 'সিস্টেম', S)}
            </div>
          </div>
        </div>
        
        <!-- Right Column - Amount Box -->
        <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
          <div style="flex: 1; padding: 1.25rem; background: linear-gradient(135deg, ${typeData.bgColor} 0%, ${typeData.color}10 100%); border-radius: 10px; border: 2px solid ${typeData.color}; text-align: center; box-shadow: 0 4px 12px ${typeData.color}20; width: 100%; box-sizing: border-box;">
            <p style="color: ${typeData.color}; font-size: clamp(10px, 2vw, 11px); margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              ${typeData.subtitle}
            </p>
            <p style="color: ${S.textPrimary}; font-size: clamp(24px, 5vw, 32px); margin: 0 0 5px 0; font-weight: 800; font-family: 'Inter', sans-serif;">
              ৳ ${formatCurrency(amount)}
            </p>
            <p style="color: ${typeData.color}; font-size: clamp(9px, 1.8vw, 10px); margin: 0; font-weight: 600; letter-spacing: 0.5px;">
              ${typeData.text} লেনদেন
            </p>
          </div>
          
        </div>
      </div>
    </div>
  `;
};

// 3.3. Customer Information Section
const buildCustomerInfoHTML = (data, S) => {
  const customerName = data.customerName || data.customer?.name || data.partyName || data.party?.name || 'Walk-in Customer';
  const customerPhone = data.customerPhone || data.customer?.phone || data.party?.phone || data.party?.mobileNumber || 'N/A';
  const customerEmail = data.customerEmail || data.customer?.email || data.party?.email || 'N/A';
  const customerId = data.customerId || data.customer?._id || data.customer?.id || 'N/A';

  return `
    <div style="padding: 1.25rem; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow}; width: 100%; height: 100%; box-sizing: border-box;">
      <h3 style="color: ${S.primary}; font-size: clamp(14px, 3vw, 16px); margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
        ${L.customerInfo}
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div style="grid-column: 1 / -1;">
          ${createInfoRow('পুরো নাম', customerName, S, { isBoldValue: true })}
        </div>
        ${createInfoRow('ফোন নাম্বার', customerPhone, S)}
        ${createInfoRow('ইমেইল ঠিকানা', customerEmail, S)}
        ${createInfoRow('গ্রাহক আইডি', customerId, S)}
        ${createInfoRow('গ্রাহকের ধরন', data.customerType || 'নিয়মিত', S)}
      </div>
      
      ${data.customer?.address ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
          <p style="color: ${S.textSecondary}; font-size: 11px; margin: 0 0 5px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ঠিকানা
          </p>
          <p style="color: ${S.textPrimary}; font-size: 12px; margin: 0; line-height: 1.4;">
            ${data.customer.address}
          </p>
        </div>
      ` : ''}
    </div>
  `;
};

// 3.4. Payment Information Section
const buildPaymentInfoHTML = (data, S) => {
  const paymentMethodText = getPaymentMethodText(data.paymentMethod);
  const categoryText = getCategoryText(data.category);
  
  let detailsHTML = '';
  
  if (data.paymentDetails) {
    const pd = data.paymentDetails;
    
    if (data.paymentMethod === 'bank' || data.paymentMethod === 'bank-transfer') {
      detailsHTML += createInfoRow('ব্যাংকের নাম', pd.bankName, S);
      detailsHTML += createInfoRow('একাউন্ট নম্বর', pd.accountNumber, S);
      detailsHTML += createInfoRow('শাখা', pd.branch || 'N/A', S);
      detailsHTML += createInfoRow('লেনদেনের রেফারেন্স', pd.reference, S);
    } else if (data.paymentMethod === 'cheque') {
      detailsHTML += createInfoRow('চেক নম্বর', pd.chequeNumber, S);
      detailsHTML += createInfoRow('ব্যাংকের নাম', pd.bankName, S);
      detailsHTML += createInfoRow('চেকের তারিখ', pd.chequeDate ? formatDate(pd.chequeDate) : 'N/A', S);
      detailsHTML += createInfoRow('রেফারেন্স', pd.reference, S);
    } else if (data.paymentMethod === 'mobile-banking') {
      detailsHTML += createInfoRow('সেবা প্রদানকারী', pd.mobileProvider, S);
      detailsHTML += createInfoRow('লেনদেন আইডি', pd.transactionId, S);
      detailsHTML += createInfoRow('ওয়ালেট নম্বর', pd.walletNumber || 'N/A', S);
      detailsHTML += createInfoRow('রেফারেন্স', pd.reference, S);
    } else if (data.paymentMethod === 'cash') {
      detailsHTML += createInfoRow('পেমেন্ট মাধ্যম', 'নগদ', S);
      detailsHTML += createInfoRow('গ্রহণ করেছেন', pd.receivedBy || data.createdBy || 'N/A', S);
      detailsHTML += createInfoRow('রেফারেন্স', pd.reference || 'N/A', S);
    } else if (data.paymentMethod === 'card') {
      detailsHTML += createInfoRow('কার্ডের ধরন', pd.cardType || 'ক্রেডিট/ডেবিট', S);
      detailsHTML += createInfoRow('শেষের ৪ ডিজিট', pd.lastFourDigits || 'N/A', S);
      detailsHTML += createInfoRow('অনুমোদন কোড', pd.authCode || 'N/A', S);
      detailsHTML += createInfoRow('লেনদেন আইডি', pd.transactionId || 'N/A', S);
    }
  }
  
  return `
    <div style="padding: 1.25rem; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow}; width: 100%; height: 100%; box-sizing: border-box;">
      <h3 style="color: ${S.primary}; font-size: clamp(14px, 3vw, 16px); margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
        ${L.paymentInfo}
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
        ${createInfoRow('পেমেন্ট পদ্ধতি', paymentMethodText, S, { isBoldValue: true })}
        ${createInfoRow('সেবার ধরন', categoryText, S, { isBoldValue: true })}
      </div>
      
      ${detailsHTML ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
          <p style="color: ${S.textSecondary}; font-size: 12px; margin: 0 0 10px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            পেমেন্টের বিস্তারিত
          </p>
          ${detailsHTML}
        </div>
      ` : ''}
      
      ${data.invoiceId ? `
        <div style="margin-top: 15px; padding: 10px; background: ${S.bg}; border-radius: 6px; border: 1px solid ${S.border};">
          ${createInfoRow('ইনভয়েস আইডি', data.invoiceId, S, { isBoldValue: true, valueColor: S.accent })}
        </div>
      ` : ''}
    </div>
  `;
};

// 3.5. Account Transfer Section
const buildAccountTransferHTML = (data, S) => {
  if (!data.debitAccount && !data.creditAccount && !data.sourceAccount && !data.destinationAccount) {
    return '';
  }
  
  const debitAccount = data.debitAccount || data.sourceAccount;
  const creditAccount = data.creditAccount || data.destinationAccount;
  
  if (debitAccount && creditAccount) {
    // Account to Account Transfer
    return `
      <div style="margin-bottom: 25px; padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
        <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
          একাউন্ট ট্রান্সফার বিবরণ
        </h3>
        
        <div class="transfer-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; align-items: center; margin: 20px 0;">
          <!-- From Account -->
          <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${S.danger};">
            <p style="color: ${S.danger}; font-size: clamp(11px, 2.2vw, 12px); margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
              একাউন্ট থেকে
            </p>
            ${createInfoRow('একাউন্টের নাম', debitAccount.name || 'N/A', S, { isBoldValue: true })}
            ${createInfoRow('ব্যাংকের নাম', debitAccount.bankName || 'N/A', S)}
            ${createInfoRow('একাউন্ট নম্বর', debitAccount.accountNumber || 'N/A', S)}
            ${createInfoRow('শাখা', debitAccount.branch || 'N/A', S)}
          </div>
          
          <!-- Transfer Arrow -->
          <div class="transfer-arrow" style="text-align: center; order: 2;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${S.primary} 0%, ${S.secondary} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 8px ${S.shadow};">
              <span style="color: white; font-size: 18px; font-weight: bold;">→</span>
            </div>
            <p style="color: ${S.textMuted}; font-size: clamp(9px, 1.8vw, 10px); margin: 5px 0 0 0; font-weight: 600; text-transform: uppercase;">
              স্থানান্তর
            </p>
          </div>
          
          <!-- To Account -->
          <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${S.success}; order: 3;">
            <p style="color: ${S.success}; font-size: clamp(11px, 2.2vw, 12px); margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
              একাউন্টে
            </p>
            ${createInfoRow('একাউন্টের নাম', creditAccount.name || 'N/A', S, { isBoldValue: true })}
            ${createInfoRow('ব্যাংকের নাম', creditAccount.bankName || 'N/A', S)}
            ${createInfoRow('একাউন্ট নম্বর', creditAccount.accountNumber || 'N/A', S)}
            ${createInfoRow('শাখা', creditAccount.branch || 'N/A', S)}
          </div>
        </div>
        
        ${data.paymentDetails?.reference ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
            ${createInfoRow('লেনদেনের রেফারেন্স', data.paymentDetails.reference, S)}
          </div>
        ` : ''}
      </div>
    `;
  } else if (debitAccount || creditAccount) {
    // Single Account (Debit or Credit)
    const account = debitAccount || creditAccount;
    const accountType = debitAccount ? 'Debit From' : 'Credit To';
    const borderColor = debitAccount ? S.danger : S.success;
    
    return `
      <div style="margin-bottom: 25px; padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
        <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
          ব্যাংক একাউন্টের বিবরণ
        </h3>
        
        <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${borderColor};">
          <p style="color: ${borderColor}; font-size: 12px; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
            ${accountType}
          </p>
          ${createInfoRow('একাউন্টের নাম', account.name || 'N/A', S, { isBoldValue: true })}
          ${createInfoRow('ব্যাংকের নাম', account.bankName || 'N/A', S)}
          ${createInfoRow('একাউন্ট নম্বর', account.accountNumber || 'N/A', S)}
          ${createInfoRow('একাউন্টের ধরন', account.accountType || 'সেভিংস/কারেন্ট', S)}
          ${createInfoRow('শাখা', account.branch || 'N/A', S)}
        </div>
      </div>
    `;
  }
  
  return '';
};

// 3.6. Notes and Additional Information
const buildNotesHTML = (data, S) => {
  const hasNotes = data.notes || data.remarks || data.additionalInfo;
  const hasServiceDetails = data.serviceDetails || data.packageDetails;
  
  if (!hasNotes && !hasServiceDetails) return '';
  
  return `
    <div style="margin-bottom: 25px; padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
      <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
        Additional Information
      </h3>
      
      ${hasServiceDetails ? `
        <div style="margin-bottom: 15px;">
          <p style="color: ${S.textSecondary}; font-size: 12px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Service Details
          </p>
          <p style="color: ${S.textPrimary}; font-size: 12px; margin: 0; line-height: 1.5; padding: 10px; background: ${S.bg}; border-radius: 6px; border: 1px solid ${S.border};">
            ${data.serviceDetails || data.packageDetails}
          </p>
        </div>
      ` : ''}
      
      ${hasNotes ? `
        <div>
          <p style="color: ${S.textSecondary}; font-size: 12px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ${L.notes}
          </p>
          <p style="color: ${S.textPrimary}; font-size: 12px; margin: 0; line-height: 1.5; padding: 10px; background: ${S.bg}; border-radius: 6px; border: 1px solid ${S.border};">
            ${data.notes || data.remarks || data.additionalInfo}
          </p>
        </div>
      ` : ''}
    </div>
  `;
};

// 3.7. Footer with Terms and Signatory
const buildFooterHTML = (S) => `
  <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid ${S.divider};">
    
    <!-- Signatory and Contact -->
    <div class="footer-flex" style="display: flex; justify-content: space-between; align-items: flex-end; padding: 15px 0; border-top: 1px solid ${S.divider}; flex-wrap: wrap; gap: 20px;">
      <!-- Signatory -->
      <div style="text-align: center; flex: 1; min-width: 150px;">
        <div style="margin-bottom: 30px; position: relative;">
          <div style="border-top: 1px solid ${S.textMuted}; width: 100%; max-width: 150px; margin: 0 auto;"></div>
        </div>
        <p style="color: ${S.textPrimary}; font-size: clamp(11px, 2.2vw, 12px); margin: 0; font-weight: 600;">
          ${L.authorizedSignatory}
        </p>
        <p style="color: ${S.textMuted}; font-size: clamp(9px, 1.8vw, 10px); margin: 5px 0 0 0;">
          সালমা এয়ার ট্রাভেলস অ্যান্ড ট্যুরস
        </p>
      </div>
      
      <!-- Thank You Message -->
      <div style="text-align: center; flex: 2; min-width: 200px;">
        <p style="color: ${S.primary}; font-size: clamp(12px, 2.5vw, 14px); margin: 0 0 10px 0; font-weight: 700; font-style: italic;">
          ${L.thankYouMessage}
        </p>
        <p style="color: ${S.textMuted}; font-size: clamp(8px, 1.6vw, 9px); margin: 0; line-height: 1.4;">
          ${L.contactInfo}
        </p>
      </div>
      
      <!-- Company Stamp -->
      <div style="text-align: center; flex: 1; min-width: 100px;">
        <div style="width: 80px; height: 80px; max-width: 100%; border: 2px solid ${S.danger}; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
          <span style="color: ${S.danger}; font-size: clamp(8px, 1.6vw, 9px); font-weight: 700; text-align: center; line-height: 1.2;">
            পরিশোধিত<br>স্ট্যাম্প
          </span>
        </div>
        <p style="color: ${S.textMuted}; font-size: clamp(8px, 1.6vw, 9px); margin: 0;">
          লেনদেন যাচাইকৃত
        </p>
      </div>
    </div>
    
    <!-- Final Footer -->
    <div style="text-align: center; padding: 8px; background: ${S.primary}10; border-radius: 4px; margin-top: 8px; margin-bottom: 0;">
      <p style="color: ${S.textMuted}; font-size: 8px; margin: 0; font-weight: 500;">
        ${L.footerMessage} | ${new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })} এ তৈরি হয়েছে | ডকুমেন্ট আইডি: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
      </p>
    </div>
  </div>
`;

// --- IV. Main Receipt Generator ---

// Create HTML element for receipt
const createReceiptElement = (transactionData, isDark) => {
  const S = getStyles(isDark);
  
  const receiptDiv = document.createElement('div');
  receiptDiv.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    /* Responsive width - adapts to screen size */
    width: 1150px;
    padding: 1rem 2rem;
    background: ${S.paperBg};
    color: ${S.textPrimary};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.5;
    box-shadow: 0 0 20px ${S.shadow};
    box-sizing: border-box;
    margin: 0;
  `;

  const typeKey = transactionData.transactionType && TRANSACTION_TYPES[transactionData.transactionType] 
                    ? transactionData.transactionType 
                    : 'account-transfer';
  const typeData = TRANSACTION_TYPES[typeKey];
  const amount = transactionData.paymentDetails?.amount || transactionData.amount || 0;

  // Build modular HTML sections
  const headerHTML = buildHeaderHTML(S, transactionData);
  const summaryHTML = buildSummaryHTML(transactionData, typeData, amount, S);
  const customerInfoHTML = buildCustomerInfoHTML(transactionData, S);
  const paymentInfoHTML = buildPaymentInfoHTML(transactionData, S);
  const accountTransferHTML = buildAccountTransferHTML(transactionData, S);
  const notesHTML = buildNotesHTML(transactionData, S);
  const footerHTML = buildFooterHTML(S);

  receiptDiv.innerHTML = `
   <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    <style>
      @media (max-width: 768px) {
        .receipt-container {
          padding: 1rem !important;
        }
        .summary-grid {
          grid-template-columns: 1fr !important;
        }
        .info-grid {
          grid-template-columns: 1fr !important;
        }
        .customer-payment-grid {
          grid-template-columns: 1fr !important;
        }
        .transfer-grid {
          grid-template-columns: 1fr !important;
        }
        .transfer-arrow {
          transform: rotate(90deg) !important;
          margin: 10px auto !important;
        }
        .header-flex {
          flex-direction: column !important;
          gap: 15px !important;
        }
        .footer-flex {
          flex-direction: column !important;
          gap: 20px !important;
          align-items: center !important;
        }
      }
      @media (max-width: 480px) {
        .receipt-container {
          padding: 0.75rem !important;
        }
      }
    </style>
    
    <div class="receipt-container" style="width: 100%; margin: 0; padding: 0; box-sizing: border-box;">
      ${headerHTML}
      ${summaryHTML}
      
      <div class="customer-payment-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; width: 100%; box-sizing: border-box;">
        ${customerInfoHTML}
        ${paymentInfoHTML}
      </div>
      
      ${accountTransferHTML}
      ${notesHTML}
      ${footerHTML}
    </div>
  `;

  return receiptDiv;
};

// Main PDF Generator Function
export const generateTransactionPDF = async (transactionData, isDark = false, options = {}) => {
  try {
    const { filename: customFilename, download = true } = options;
    
    // 1. Create a temporary element to render the receipt
    const receiptElement = createReceiptElement(transactionData, isDark);
    document.body.appendChild(receiptElement);

    // 2. Generate canvas from HTML element
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      logging: false,
      windowWidth: receiptElement.scrollWidth,
      windowHeight: receiptElement.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('div');
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.position = 'relative';
          clonedElement.style.top = '0';
          clonedElement.style.left = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '0';
        }
        // Remove extra padding from receipt-container
        const receiptContainer = clonedDoc.querySelector('.receipt-container');
        if (receiptContainer) {
          receiptContainer.style.margin = '0';
          receiptContainer.style.padding = '0';
        }
      }
    });

    // 3. Remove temporary element
    document.body.removeChild(receiptElement);

    // 4. Create PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Make the whole receipt fit into a **single** A4 page
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Minimal margins for top and bottom
    const topMargin = 2; // 2mm top margin
    const bottomMargin = 2; // 2mm bottom margin
    const availableHeight = pdfHeight - topMargin - bottomMargin;

    // Calculate scaling ratios
    const ratioWidth = pdfWidth / canvas.width;
    const ratioHeight = availableHeight / canvas.height;

    // Use the smaller ratio to ensure content fits within page bounds
    let ratio = Math.min(ratioWidth, ratioHeight);

    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;

    // Position: left aligned, top with minimal margin
    const x = 0;
    const y = topMargin;

    // Add single page with scaled image
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);

    // 5. Generate filename and Download PDF
    const filename = customFilename || (() => {
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return `Receipt_${transactionData.transactionId || 'TRX'}_${timestamp}.pdf`;
    })();

    if (download) {
      pdf.save(filename);
    }
    
    return { success: true, filename, size: pdf.getNumberOfPages() };
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Fallback to simple PDF
    try {
      return generateSimplePDF(transactionData, options);
    } catch (fallbackError) {
      console.error('Fallback PDF generation error:', fallbackError);
      return { success: false, error: error.message };
    }
  }
};

// Simple PDF generator as fallback (kept as backup)
export const generateSimplePDF = (transactionData, options = {}) => {
  try {
    const { filename: customFilename, download = true } = options;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add content similar to professional version
    pdf.setFontSize(20);
    pdf.setTextColor(42, 67, 101);
    pdf.text(L.systemName, 105, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(12, 74, 110);
    pdf.text('TRANSACTION RECEIPT', 105, 30, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Receipt No: ${transactionData.transactionId || 'N/A'}`, 20, 45);
    pdf.text(`Date: ${formatDate(transactionData.date)}`, 180, 45, { align: 'right' });
    
    // Add horizontal line
    pdf.setDrawColor(42, 67, 101);
    pdf.setLineWidth(0.5);
    pdf.line(20, 50, 190, 50);
    
    let yPos = 60;
    
    // Transaction Details
    pdf.setFontSize(12);
    pdf.setTextColor(42, 67, 101);
    pdf.setFont(undefined, 'bold');
    pdf.text('Transaction Details', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');
    
    const details = [
      ['Transaction ID:', transactionData.transactionId || 'N/A'],
      ['Date & Time:', `${formatDate(transactionData.date)} ${formatTime(transactionData.date)}`],
      ['Transaction Type:', transactionData.transactionType ? transactionData.transactionType.toUpperCase() : 'N/A'],
      ['Status:', getStatusText(transactionData.status)],
      ['Amount:', `BDT ${formatCurrency(transactionData.paymentDetails?.amount || transactionData.amount || 0)}`],
      ['Created By:', transactionData.createdBy || 'System']
    ];
    
    details.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 80, yPos);
      yPos += 7;
    });
    
    yPos += 5;
    
    // Customer Information
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(42, 67, 101);
    pdf.text('Customer Information', 20, yPos);
    yPos += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const customerName = transactionData.customerName || transactionData.customer?.name || 'Walk-in Customer';
    pdf.text(`Name: ${customerName}`, 25, yPos);
    yPos += 7;
    
    const customerPhone = transactionData.customerPhone || transactionData.customer?.phone || 'N/A';
    pdf.text(`Phone: ${customerPhone}`, 25, yPos);
    yPos += 7;
    
    const customerEmail = transactionData.customerEmail || transactionData.customer?.email || 'N/A';
    pdf.text(`Email: ${customerEmail}`, 25, yPos);
    yPos += 10;
    
    // Payment Information
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(42, 67, 101);
    pdf.text('Payment Information', 20, yPos);
    yPos += 10;
    
    pdf.setFont(undefined, 'normal');
    
    const paymentMethod = getPaymentMethodText(transactionData.paymentMethod);
    pdf.text(`Payment Method: ${paymentMethod}`, 25, yPos);
    yPos += 7;
    
    const category = getCategoryText(transactionData.category);
    pdf.text(`Service Category: ${category}`, 25, yPos);
    yPos += 10;
    
    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text(L.footerMessage, 105, 270, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleString('en-US')}`, 105, 275, { align: 'center' });
    pdf.text(L.contactInfo, 105, 280, { align: 'center' });
    
    // Generate filename and save
    const filename = customFilename || (() => {
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return `Receipt_${transactionData.transactionId || 'TRX'}_${timestamp}.pdf`;
    })();
    
    if (download) {
      pdf.save(filename);
    }
    
    return { success: true, filename };
  } catch (error) {
    console.error('Simple PDF generation error:', error);
    return { success: false, error: error.message };
  }
};