import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- I. Constants and Local Data ---

// English Labels
const L = {
  transactionDetails: 'Transaction Details',
  transactionId: 'Transaction ID',
  date: 'Date',
  time: 'Time',
  createdBy: 'Created By',
  customerInfo: 'Customer Information',
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  customerId: 'Customer ID',
  paymentInfo: 'Payment Information',
  paymentMethod: 'Payment Method',
  category: 'Category',
  notes: 'Additional Notes',
  invoiceId: 'Invoice ID',
  branchId: 'Branch',
  customerBank: 'Customer Bank',
  customerAccNum: 'Customer Account Number',
  bankName: 'Bank Name',
  accountNumber: 'Account Number',
  chequeNumber: 'Cheque Number',
  mobileProvider: 'Provider',
  transactionIdShort: 'Transaction ID',
  reference: 'Reference',
  debitAccount: 'Debit Account',
  creditAccount: 'Credit Account',
  bank: 'Bank',
  accountNumberLong: 'Account Number',
  footerMessage: 'This is an official transaction receipt',
  systemName: 'Salma Air Travels & Tours',
  status: 'Status',
  amount: 'Amount',
  transactionType: 'Transaction Type',
  receiptTitle: 'TRANSACTION RECEIPT',
  officialCopy: 'OFFICIAL COPY',
  receiptNo: 'Receipt No.',
  amountInWords: 'Amount in Words',
  authorizedSignatory: 'Authorized Signatory',
  thankYouMessage: 'Thank you for your business',
  termsAndConditions: 'Terms & Conditions',
  contactInfo: 'For any queries, contact us at: admin@salmaair.com | +880 1946 881177',
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
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid ${S.divider};">
      <span style="color: ${S.textSecondary}; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; flex: 1;">
        ${label}
      </span>
      <span style="color: ${valueColor}; font-size: 13px; font-weight: ${isBoldValue ? '600' : '500'}; text-align: right; flex: 1;">
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px 15px; background: linear-gradient(135deg, ${S.primary}10 0%, ${S.secondary}10 100%); border-radius: 8px; border: 1px solid ${S.border};">
        <div>
          <span style="color: ${S.textSecondary}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ${L.receiptNo}
          </span>
          <span style="color: ${S.accent}; font-size: 16px; font-weight: 700; margin-left: 10px; letter-spacing: 1px;">
            ${data.transactionId || 'N/A'}
          </span>
        </div>
        <div style="text-align: right;">
          <span style="color: ${S.textSecondary}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Issue Date
          </span>
          <span style="color: ${S.textPrimary}; font-size: 14px; font-weight: 600; margin-left: 10px;">
            ${formatDate(data.date)}
          </span>
        </div>
      </div>
      
      <!-- Company Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logoSrc}" alt="Company Logo" style="height: 60px; width: auto; object-fit: contain; border-radius: 8px; border: 2px solid ${S.border}; padding: 3px; background: ${S.paperBg};" />
          <div>
            <h1 style="color: ${S.primary}; font-size: 28px; margin: 0 0 4px 0; font-weight: 800; font-family: 'Inter', sans-serif; letter-spacing: -0.5px;">
              ${L.systemName}
            </h1>
            <p style="color: ${S.textMuted}; font-size: 11px; margin: 0; font-weight: 500; font-family: 'Inter', sans-serif; letter-spacing: 0.5px;">
              Travel Agency & Tour Operator
            </p>
            <p style="color: ${S.textMuted}; font-size: 10px; margin: 2px 0 0 0; font-weight: 400;">
              1/1 E Sat Masjid Road, Mohammadpur, Dhaka, Bangladesh | Phone: +880 1946 881177
            </p>
          </div>
        </div>
        
        <div style="text-align: center;">
          <img src="${qrSrc}" alt="QR Code" style="height: 80px; width: 80px; object-fit: contain; border-radius: 6px; border: 1px solid ${S.border}; padding: 3px; background: ${S.paperBg};" />
          <p style="color: ${S.textMuted}; font-size: 9px; margin: 5px 0 0 0; font-weight: 500;">
            Scan to Verify
          </p>
        </div>
      </div>
      
      <!-- Receipt Title -->
      <div style="text-align: center; margin: 10px 0; padding: 15px; background: linear-gradient(135deg, ${S.primary} 0%, ${S.secondary} 100%); border-radius: 8px;">
        <h2 style="color: white; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
          ${L.receiptTitle}
        </h2>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 12px; margin: 5px 0 0 0; font-weight: 500; letter-spacing: 1px;">
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
    <div style="margin-bottom: 25px; padding: 0;">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
        <!-- Left Column - Transaction Info -->
        <div style="padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
          <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
            ${L.transactionDetails}
          </h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              ${createInfoRow('Transaction ID', data.transactionId, S, { isBoldValue: true })}
              ${createInfoRow('Date', formatDate(data.date), S)}
              ${createInfoRow('Time', formatTime(data.date), S)}
            </div>
            <div>
              ${createInfoRow('Transaction Type', typeData.text, S, { isBoldValue: true, valueColor: typeData.color })}
              ${createInfoRow('Status', getStatusText(data.status), S, { isBoldValue: true, valueColor: statusColor })}
              ${createInfoRow('Created By', data.createdBy || 'System', S)}
            </div>
          </div>
        </div>
        
        <!-- Right Column - Amount Box -->
        <div style="display: flex; flex-direction: column;">
          <div style="flex: 1; padding: 20px; background: linear-gradient(135deg, ${typeData.bgColor} 0%, ${typeData.color}10 100%); border-radius: 10px; border: 2px solid ${typeData.color}; text-align: center; box-shadow: 0 4px 12px ${typeData.color}20;">
            <p style="color: ${typeData.color}; font-size: 11px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              ${typeData.subtitle}
            </p>
            <p style="color: ${S.textPrimary}; font-size: 32px; margin: 0 0 5px 0; font-weight: 800; font-family: 'Inter', sans-serif;">
              ৳ ${formatCurrency(amount)}
            </p>
            <p style="color: ${typeData.color}; font-size: 10px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">
              ${typeData.text} TRANSACTION
            </p>
          </div>
          
          <!-- Amount in Words -->
          <div style="margin-top: 15px; padding: 15px; background: ${S.cardBg}; border-radius: 8px; border: 1px solid ${S.border};">
            <p style="color: ${S.textSecondary}; font-size: 10px; margin: 0 0 5px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${L.amountInWords}
            </p>
            <p style="color: ${S.textPrimary}; font-size: 12px; margin: 0; font-weight: 500; font-style: italic; line-height: 1.4;">
              ${amountToWords(amount)}
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
    <div style="padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
      <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
        ${L.customerInfo}
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div style="grid-column: span 2;">
          ${createInfoRow('Full Name', customerName, S, { isBoldValue: true })}
        </div>
        ${createInfoRow('Phone Number', customerPhone, S)}
        ${createInfoRow('Email Address', customerEmail, S)}
        ${createInfoRow('Customer ID', customerId, S)}
        ${createInfoRow('Customer Type', data.customerType || 'Regular', S)}
      </div>
      
      ${data.customer?.address ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
          <p style="color: ${S.textSecondary}; font-size: 11px; margin: 0 0 5px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Address
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
      detailsHTML += createInfoRow('Bank Name', pd.bankName, S);
      detailsHTML += createInfoRow('Account Number', pd.accountNumber, S);
      detailsHTML += createInfoRow('Branch', pd.branch || 'N/A', S);
      detailsHTML += createInfoRow('Transaction Reference', pd.reference, S);
    } else if (data.paymentMethod === 'cheque') {
      detailsHTML += createInfoRow('Cheque Number', pd.chequeNumber, S);
      detailsHTML += createInfoRow('Bank Name', pd.bankName, S);
      detailsHTML += createInfoRow('Cheque Date', pd.chequeDate ? formatDate(pd.chequeDate) : 'N/A', S);
      detailsHTML += createInfoRow('Reference', pd.reference, S);
    } else if (data.paymentMethod === 'mobile-banking') {
      detailsHTML += createInfoRow('Service Provider', pd.mobileProvider, S);
      detailsHTML += createInfoRow('Transaction ID', pd.transactionId, S);
      detailsHTML += createInfoRow('Wallet Number', pd.walletNumber || 'N/A', S);
      detailsHTML += createInfoRow('Reference', pd.reference, S);
    } else if (data.paymentMethod === 'cash') {
      detailsHTML += createInfoRow('Payment Mode', 'Cash', S);
      detailsHTML += createInfoRow('Received By', pd.receivedBy || data.createdBy || 'N/A', S);
      detailsHTML += createInfoRow('Reference', pd.reference || 'N/A', S);
    } else if (data.paymentMethod === 'card') {
      detailsHTML += createInfoRow('Card Type', pd.cardType || 'Credit/Debit', S);
      detailsHTML += createInfoRow('Last 4 Digits', pd.lastFourDigits || 'N/A', S);
      detailsHTML += createInfoRow('Authorization Code', pd.authCode || 'N/A', S);
      detailsHTML += createInfoRow('Transaction ID', pd.transactionId || 'N/A', S);
    }
  }
  
  return `
    <div style="padding: 20px; background: ${S.cardBg}; border-radius: 10px; border: 1px solid ${S.border}; box-shadow: 0 2px 8px ${S.shadow};">
      <h3 style="color: ${S.primary}; font-size: 16px; margin: 0 0 15px 0; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid ${S.primary}; text-transform: uppercase; letter-spacing: 1px;">
        ${L.paymentInfo}
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
        ${createInfoRow('Payment Method', paymentMethodText, S, { isBoldValue: true })}
        ${createInfoRow('Service Category', categoryText, S, { isBoldValue: true })}
      </div>
      
      ${detailsHTML ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
          <p style="color: ${S.textSecondary}; font-size: 12px; margin: 0 0 10px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Payment Details
          </p>
          ${detailsHTML}
        </div>
      ` : ''}
      
      ${data.invoiceId ? `
        <div style="margin-top: 15px; padding: 10px; background: ${S.bg}; border-radius: 6px; border: 1px solid ${S.border};">
          ${createInfoRow('Invoice ID', data.invoiceId, S, { isBoldValue: true, valueColor: S.accent })}
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
          Account Transfer Details
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center; margin: 20px 0;">
          <!-- From Account -->
          <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${S.danger};">
            <p style="color: ${S.danger}; font-size: 12px; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
              From Account
            </p>
            ${createInfoRow('Account Name', debitAccount.name || 'N/A', S, { isBoldValue: true })}
            ${createInfoRow('Bank Name', debitAccount.bankName || 'N/A', S)}
            ${createInfoRow('Account Number', debitAccount.accountNumber || 'N/A', S)}
            ${createInfoRow('Branch', debitAccount.branch || 'N/A', S)}
          </div>
          
          <!-- Transfer Arrow -->
          <div style="text-align: center;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${S.primary} 0%, ${S.secondary} 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 8px ${S.shadow};">
              <span style="color: white; font-size: 18px; font-weight: bold;">→</span>
            </div>
            <p style="color: ${S.textMuted}; font-size: 10px; margin: 5px 0 0 0; font-weight: 600; text-transform: uppercase;">
              Transfer
            </p>
          </div>
          
          <!-- To Account -->
          <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${S.success};">
            <p style="color: ${S.success}; font-size: 12px; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
              To Account
            </p>
            ${createInfoRow('Account Name', creditAccount.name || 'N/A', S, { isBoldValue: true })}
            ${createInfoRow('Bank Name', creditAccount.bankName || 'N/A', S)}
            ${createInfoRow('Account Number', creditAccount.accountNumber || 'N/A', S)}
            ${createInfoRow('Branch', creditAccount.branch || 'N/A', S)}
          </div>
        </div>
        
        ${data.paymentDetails?.reference ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${S.divider};">
            ${createInfoRow('Transaction Reference', data.paymentDetails.reference, S)}
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
          Bank Account Details
        </h3>
        
        <div style="padding: 15px; background: ${S.bg}; border-radius: 8px; border: 2px solid ${borderColor};">
          <p style="color: ${borderColor}; font-size: 12px; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
            ${accountType}
          </p>
          ${createInfoRow('Account Name', account.name || 'N/A', S, { isBoldValue: true })}
          ${createInfoRow('Bank Name', account.bankName || 'N/A', S)}
          ${createInfoRow('Account Number', account.accountNumber || 'N/A', S)}
          ${createInfoRow('Account Type', account.accountType || 'Savings/Current', S)}
          ${createInfoRow('Branch', account.branch || 'N/A', S)}
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
  <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid ${S.divider};">
    <!-- Terms and Conditions -->
    <div style="margin-bottom: 20px; padding: 15px; background: ${S.cardBg}; border-radius: 8px; border: 1px solid ${S.border};">
      <p style="color: ${S.textSecondary}; font-size: 10px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        ${L.termsAndConditions}
      </p>
      <ul style="color: ${S.textMuted}; font-size: 9px; margin: 0; padding-left: 15px; line-height: 1.4;">
        <li>This receipt is proof of transaction and should be retained for record purposes.</li>
        <li>Any discrepancies must be reported within 7 days of transaction date.</li>
        <li>Refunds are subject to company policy and may incur processing fees.</li>
        <li>For refunds, original receipt must be presented.</li>
      </ul>
    </div>
    
    <!-- Signatory and Contact -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 20px 0; border-top: 1px solid ${S.divider};">
      <!-- Signatory -->
      <div style="text-align: center; flex: 1;">
        <div style="margin-bottom: 40px; position: relative;">
          <div style="border-top: 1px solid ${S.textMuted}; width: 150px; margin: 0 auto;"></div>
        </div>
        <p style="color: ${S.textPrimary}; font-size: 12px; margin: 0; font-weight: 600;">
          ${L.authorizedSignatory}
        </p>
        <p style="color: ${S.textMuted}; font-size: 10px; margin: 5px 0 0 0;">
          Salma Air Travels & Tours
        </p>
      </div>
      
      <!-- Thank You Message -->
      <div style="text-align: center; flex: 2;">
        <p style="color: ${S.primary}; font-size: 14px; margin: 0 0 10px 0; font-weight: 700; font-style: italic;">
          ${L.thankYouMessage}
        </p>
        <p style="color: ${S.textMuted}; font-size: 9px; margin: 0; line-height: 1.4;">
          ${L.contactInfo}
        </p>
      </div>
      
      <!-- Company Stamp -->
      <div style="text-align: center; flex: 1;">
        <div style="width: 80px; height: 80px; border: 2px solid ${S.danger}; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; opacity: 0.7;">
          <span style="color: ${S.danger}; font-size: 9px; font-weight: 700; text-align: center; line-height: 1.2;">
            PAID<br>STAMP
          </span>
        </div>
        <p style="color: ${S.textMuted}; font-size: 9px; margin: 0;">
          Transaction Verified
        </p>
      </div>
    </div>
    
    <!-- Final Footer -->
    <div style="text-align: center; padding: 10px; background: ${S.primary}10; border-radius: 4px; margin-top: 10px;">
      <p style="color: ${S.textMuted}; font-size: 8px; margin: 0; font-weight: 500;">
        ${L.footerMessage} | Generated on ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} | Document ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
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
    /* একটু বেশি চওড়া রাখছি যেন PDF এ সাইডে বেশি ফাঁকা না থাকে */
    width: 1150px;
    padding: 24px 32px;
    background: ${S.paperBg};
    color: ${S.textPrimary};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.5;
    box-shadow: 0 0 20px ${S.shadow};
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <div style="max-width: 800px; margin: 0 auto;">
      ${headerHTML}
      ${summaryHTML}
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
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
export const generateTransactionPDF = async (transactionData, isDark = false) => {
  try {
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
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('div');
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.position = 'relative';
          clonedElement.style.top = '0';
          clonedElement.style.left = '0';
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

    // Try to use full page width first so that 2 পাশে ফাঁকা কম থাকে
    const ratioWidth = pdfWidth / canvas.width;
    const ratioHeight = pdfHeight / canvas.height;

    // If full-width scaling makes the height too large, fall back to full-height fit
    let ratio = ratioWidth;
    if (canvas.height * ratioWidth > pdfHeight) {
      ratio = Math.min(ratioWidth, ratioHeight);
    }

    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;

    // Left side 0 থেকে শুরু, ওপর-নিচ একটু balanced রাখি
    const x = 0;
    const y = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

    // Add single page with scaled image
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);

    // 5. Generate filename and Download PDF
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `Receipt_${transactionData.transactionId || 'TRX'}_${timestamp}.pdf`;

    pdf.save(filename);
    
    return { success: true, filename, size: pdf.getNumberOfPages() };
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Fallback to simple PDF
    try {
      return generateSimplePDF(transactionData);
    } catch (fallbackError) {
      console.error('Fallback PDF generation error:', fallbackError);
      return { success: false, error: error.message };
    }
  }
};

// Simple PDF generator as fallback (kept as backup)
export const generateSimplePDF = (transactionData) => {
  try {
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
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `Receipt_${transactionData.transactionId || 'TRX'}_${timestamp}.pdf`;
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Simple PDF generation error:', error);
    return { success: false, error: error.message };
  }
};