import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==================== Bangla Labels ====================
const L_BN = {
  date: "তারিখ",
  customerId: "গ্রাহক আইডি",
  name: "নাম",
  contactNo: "যোগাযোগ নং",
  address: "ঠিকানা",
  paymentMethod: "পেমেন্টের মাধ্যম",
  bank: "ব্যাংক",
  receivingAcc: "গ্রহণকারী ব্যাংক হিসাব নং",
  accountManager: "একাউন্ট ম্যানেজার",
  purpose: "লেনদেনের পরিমাণ",
  clientCopy: "গ্রাহক কপি",
  officeCopy: "অফিস কপি",
  authorizedSignatory: "অনুমোদিত স্বাক্ষরকারী",
  customerSignatory: "গ্রাহকের স্বাক্ষর",
  forVerify: "যাচাই করুন",
  debitAccount: "ডেবিট একাউন্ট",
  creditAccount: "ক্রেডিট একাউন্ট",
};

// ==================== English Labels ====================
const L_EN = {
  date: "Date",
  customerId: "Customer ID",
  name: "Name",
  contactNo: "Contact No",
  address: "Address",
  paymentMethod: "Payment Method",
  bank: "Bank",
  receivingAcc: "Receiving Bank Acc",
  accountManager: "Account Manager",
  purpose: "Purpose",
  clientCopy: "Client Copy",
  officeCopy: "Office Copy",
  authorizedSignatory: "Authorised Signatory",
  customerSignatory: "Customer's Signatory",
  forVerify: "For Verify",
  debitAccount: "Debit Account",
  creditAccount: "Credit Account",
};

let L = L_BN;
const setLanguage = (lang) => {
  L = lang === 'en' ? L_EN : L_BN;
};

// Amount to Words (English)
const amountToWords = (num) => {
  if (!num || num === 0) return L === L_EN ? 'Zero Taka Only' : 'শূন্য টাকা মাত্র';

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
    if (n < 1000) return convertLessThanThousand(n);
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
  };

  return convert(Math.floor(num)) + ' Taka Only';
};

// ==================== A4 Single Page Receipt (Fixed Layout) ====================
const createSinglePageReceipt = (data, showHeader = true) => {
  setLanguage(data.language || 'bn');
  
  const isCashPayment = (data.paymentMethod || '').toLowerCase() === 'cash';
  const isBankTransfer = data.isBankTransfer || false;
  
  // Extract customer ID - prioritize uniqueId over MongoDB _id
  let displayCustomerId = data.uniqueId || '';
  
  // If no uniqueId, check if customerId is a MongoDB ObjectId (24 char hex)
  if (!displayCustomerId && data.customerId) {
    const customerIdStr = String(data.customerId);
    // Check if it's a MongoDB ObjectId (24 character hexadecimal string)
    if (customerIdStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(customerIdStr)) {
      // Don't show MongoDB ObjectId, use empty or formatted version
      displayCustomerId = '';
    } else {
      // It's not a MongoDB ObjectId, use it
      displayCustomerId = customerIdStr;
    }
  }

  // Extract charge and calculate total amount
  const baseAmount = data.amount || 0;
  const charge = parseFloat(data.charge || 0);
  const hasCharge = charge !== 0 && !isNaN(charge);
  const totalAmount = baseAmount + charge; // charge already has correct sign (negative for credit/transfer, positive for debit)

  const qrData = encodeURIComponent(JSON.stringify({
    id: data.transactionId || 'N/A',
    name: data.customerName || 'Customer',
    amount: totalAmount || 0,
    date: data.date || new Date().toISOString().split('T')[0],
  }));
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

  // Display total amount in purpose box (amount + charge)
  const amountText = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(totalAmount);
  const amountInWords = amountToWords(Math.abs(totalAmount));

  const container = document.createElement('div');

  container.style.cssText = `
    width: 794px;
    height: 1123px;
    margin: 0 auto;
    padding: 20px 40px;
    background: white;
    color: black;
    font-family: 'Kalpurush', Arial, sans-serif;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `;

  // Header for Customer Copy - Keep space even when showHeader is false
  const customerHeaderHTML = `
    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/public/invoice/Invoice Header.jpg" alt="Header" style="width: 100%; max-width: 100%; height: auto;" />` : ''}
    </div>
  `;

  // Header for Office Copy - Keep space even when showHeader is false
  const officeHeaderHTML = `
    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/public/invoice/Invoice Header.jpg" alt="Header" style="width: 100%; max-width: 100%; height: auto;" />` : ''}
    </div>
  `;

  // Footer for Customer Copy - Keep space even when showHeader is false
  const customerFooterHTML = `
    <div style="text-align: center; padding-top: 10px; margin-top: 10px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/public/invoice/Invoice Footer.jpg" alt="Footer" style="width: 100%; max-width: 100%; height: auto;" />` : ''}
    </div>
  `;

  // Footer for Office Copy - Keep space even when showHeader is false
  const officeFooterHTML = `
    <div style="text-align: center; padding-top: 10px; margin-top: 10px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/public/invoice/Invoice Footer.jpg" alt="Footer" style="width: 100%; max-width: 100%; height: auto;" />` : ''}
    </div>
  `;

  const createCopyHTML = (isClient) => `
    <div style="position: relative; padding: 10px 0; border: none !important; border-bottom: none !important;">
      <!-- Copy Label -->
      <div style="text-align: center; margin: 0 auto 8px; width: 100%; display: flex; justify-content: center;">
  <span style="display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 18px; border: 2px solid black; font-size: 15px; font-weight: bold; background: #f8f8f8; border-radius: 4px;">
    ${isClient ? L.clientCopy : L.officeCopy}
  </span>
</div>

      <!-- Purpose Box -->
      <div style="position: absolute; top: ${isClient ? '10px' : '40px'}; right: 0; width: 190px; border: 2px solid black; padding: 6px; text-align: center; background: white; border-radius: 4px; font-size: 13px;">
        <div style="font-weight: bold; margin-bottom: 3px; font-size: 12px;">${L.purpose}</div>
        <div style="font-size: 18px; font-weight: bold; color: #d00; margin: 3px 0;">৳ ${amountText.replace('BDT', '').trim()}</div>
        <div style="font-size: 10px; padding-top: 3px; line-height: 1.2;">
          ${amountInWords}
        </div>
      </div>

      <!-- Details Table -->
      <div style="margin-right: 210px; font-size: 14px; border: none;">
        <table style="width: 100%; line-height: 1.4; border-collapse: collapse; border: none; border-bottom: none;">
          <tbody>
            ${isBankTransfer ? `
            <!-- Bank Transfer Format: Only Date, Payment Method, Debit Account, Credit Account, Account Manager -->
            <tr><td style="padding: 2px 0; width: 35%; font-weight: bold; color: #444; border: none;">${L.date}:</td><td style="border: none;">${data.date || 'DD-MM-YYYY'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.paymentMethod}:</td><td style="border: none;">${data.paymentMethod || 'Bank Transfer'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.debitAccount}:</td><td style="border: none;">${data.debitAccountName || '[Debit Account]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.creditAccount}:</td><td style="border: none;">${data.creditAccountName || '[Credit Account]'}</td></tr>
            ${(data.accountManagerName && String(data.accountManagerName).trim() !== '') ? `<tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none; border-bottom: none !important;">${L.accountManager}:</td><td style="border: none; border-bottom: none !important;">${String(data.accountManagerName).trim()}</td></tr>` : ''}
            ` : `
            <!-- Regular Transaction Format -->
            <tr><td style="padding: 2px 0; width: 35%; font-weight: bold; color: #444; border: none;">${L.date}:</td><td style="border: none;">${data.date || 'DD-MM-YYYY'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.customerId}:</td><td style="border: none;">${displayCustomerId || ''}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.name}:</td><td style="border: none;">${data.customerName || '[Customer Name]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.contactNo}:</td><td style="border: none;">${data.customerPhone || '[Mobile No]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.address}:</td><td style="border: none;">${(data.customerAddress && data.customerAddress.trim() && data.customerAddress !== '[Full Address]') ? data.customerAddress : '[Full Address]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.paymentMethod}:</td><td style="border: none;">${data.paymentMethod || '[Cash/Etc]'}</td></tr>
            ${!isCashPayment ? `
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.bank}:</td><td style="border: none;">${data.bankName || '[Bank Name]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none;">${L.receivingAcc}:</td><td style="border: none;">${data.accountNumber || '[Acc No]'}</td></tr>
            ` : ''}
            ${(data.accountManagerName && String(data.accountManagerName).trim() !== '') ? `<tr><td style="padding: 2px 0; font-weight: bold; color: #444; border: none; border-bottom: none !important;">${L.accountManager}:</td><td style="border: none; border-bottom: none !important;">${String(data.accountManagerName).trim()}</td></tr>` : ''}
            `}
          </tbody>
        </table>
      </div>

      <!-- Signatures + QR -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: ${isClient ? '15px' : '25px'}; clear: both; border: none !important; border-bottom: none !important; border-top: none !important; outline: none;">
        <div style="text-align: center; border: none !important; border-bottom: none !important; border-top: none !important; outline: none; box-shadow: none; background: transparent;">
          <div style="width: 180px; height: 2px; background: black; margin-bottom: 4px; margin-left: auto; margin-right: auto;"></div>
          <p style="margin: 0; padding: 0; font-size: 12px; font-weight: bold; border: none !important; border-bottom: none !important; border-top: none !important; text-decoration: none !important; outline: none; box-shadow: none; background: transparent; line-height: 1.2;">
            ${isClient ? L.authorizedSignatory : L.customerSignatory}
          </p>
        </div>
        <div style="text-align: center;">
          <img src="${qrSrc}" alt="QR" style="width: 75px; height: 75px;" />
          <p style="margin: 3px 0 0; font-size: 10px;">${L.forVerify}</p>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    
    <!-- Customer Copy with Header and Footer -->
    ${customerHeaderHTML}
    ${createCopyHTML(true)}
    ${customerFooterHTML}
    
    <!-- Spacing between copies for equal cutting -->
    <div style="height: 20px;"></div>
    
    <!-- Office Copy with Header and Footer -->
    ${officeHeaderHTML}
    ${createCopyHTML(false)}
    ${officeFooterHTML}
  `;

  return container;
};

// ==================== PDF Generator ====================
export const generateSalmaReceiptPDF = async (transactionData, options = {}) => {
  const { language = 'bn', download = true, filename, showPreview = false, showHeader = true } = options;

  transactionData.language = language;

  try {
    const element = createSinglePageReceipt(transactionData, showHeader);

    if (showPreview) {
      element.style.position = 'relative';
      element.style.left = '0';
      element.style.top = '0';
      element.style.margin = '20px auto';
      element.style.transform = 'scale(0.8)';
      element.style.transformOrigin = 'top center';
      element.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
      document.body.appendChild(element);
      return { success: true, element, preview: true };
    }

    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      logging: false,
      removeContainer: true
    });

    document.body.removeChild(element);

    // Convert to JPEG with compression to reduce file size
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const finalFilename = filename || `Salma_Receipt_${transactionData.transactionId || 'TRX'}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (download) {
      pdf.save(finalFilename);
    }

    return { success: true, filename: finalFilename, pdf };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};