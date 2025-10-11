import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF for transaction receipt
export const generateTransactionPDF = async (transactionData, isDark = false) => {
  try {
    // Create a temporary element to render the receipt
    const receiptElement = createReceiptElement(transactionData, isDark);
    document.body.appendChild(receiptElement);

    // Generate canvas from HTML element
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF'
    });

    // Remove temporary element
    document.body.removeChild(receiptElement);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new page if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transaction_${transactionData.transactionId || 'receipt'}_${timestamp}.pdf`;

    // Download PDF
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

// Create HTML element for receipt
const createReceiptElement = (transactionData, isDark) => {
  const receiptDiv = document.createElement('div');
  receiptDiv.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 800px;
    padding: 40px;
    background: ${isDark ? '#1F2937' : '#FFFFFF'};
    color: ${isDark ? '#FFFFFF' : '#000000'};
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
  `;

  const transactionTypeText = transactionData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : 'ডেবিট (ব্যয়)';
  const transactionTypeColor = transactionData.transactionType === 'credit' ? '#10B981' : '#EF4444';
  
  const paymentMethodText = getPaymentMethodText(transactionData.paymentMethod);
  const categoryText = getCategoryText(transactionData.category);

  receiptDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px;">
      <h1 style="color: #3B82F6; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">
        🏢 ERP Dashboard
      </h1>
      <p style="color: #6B7280; font-size: 16px; margin: 0;">
        লেনদেন রিসিট / Transaction Receipt
      </p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">লেনদেনের বিবরণ</h3>
        <p style="margin: 5px 0; color: #6B7280;"><strong>লেনদেন আইডি:</strong> ${transactionData.transactionId || 'N/A'}</p>
        <p style="margin: 5px 0; color: #6B7280;"><strong>তারিখ:</strong> ${new Date(transactionData.date).toLocaleDateString('bn-BD')}</p>
        <p style="margin: 5px 0; color: #6B7280;"><strong>সময়:</strong> ${new Date().toLocaleTimeString('bn-BD')}</p>
      </div>
      <div style="text-align: right;">
        <div style="background: ${transactionTypeColor}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${transactionTypeColor};">
          <p style="margin: 0; color: ${transactionTypeColor}; font-weight: bold; font-size: 18px;">
            ${transactionTypeText}
          </p>
          <p style="margin: 5px 0 0 0; color: #374151; font-size: 24px; font-weight: bold;">
            ৳${transactionData.paymentDetails?.amount || 0}
          </p>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
      <div>
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
          কাস্টমার তথ্য
        </h3>
        <p style="margin: 8px 0; color: #6B7280;"><strong>নাম:</strong> ${transactionData.customerName || 'N/A'}</p>
        <p style="margin: 8px 0; color: #6B7280;"><strong>ফোন:</strong> ${transactionData.customerPhone || 'N/A'}</p>
        <p style="margin: 8px 0; color: #6B7280;"><strong>ইমেইল:</strong> ${transactionData.customerEmail || 'N/A'}</p>
        <p style="margin: 8px 0; color: #6B7280;"><strong>কাস্টমার আইডি:</strong> ${transactionData.customerId || 'N/A'}</p>
      </div>
      
      <div>
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
          পেমেন্ট তথ্য
        </h3>
        <p style="margin: 8px 0; color: #6B7280;"><strong>পেমেন্ট মেথড:</strong> ${paymentMethodText}</p>
        <p style="margin: 8px 0; color: #6B7280;"><strong>ক্যাটাগরি:</strong> ${categoryText}</p>
        ${getPaymentDetailsHTML(transactionData.paymentDetails, transactionData.paymentMethod)}
      </div>
    </div>

    ${transactionData.notes ? `
    <div style="margin-bottom: 30px;">
      <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
        অতিরিক্ত নোট
      </h3>
      <p style="color: #6B7280; background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 0;">
        ${transactionData.notes}
      </p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center;">
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
        এই রিসিটটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে
      </p>
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        Generated on ${new Date().toLocaleString('bn-BD')} | ERP Dashboard System
      </p>
    </div>
  `;

  return receiptDiv;
};

// Get payment method text in Bengali
const getPaymentMethodText = (paymentMethod) => {
  const methods = {
    'bank': 'ব্যাংক ট্রান্সফার',
    'cheque': 'চেক',
    'mobile-banking': 'মোবাইল ব্যাংকিং'
  };
  return methods[paymentMethod] || paymentMethod;
};

// Get category text in Bengali
const getCategoryText = (category) => {
  const categories = {
    'hajj': 'হাজ্জ & উমরাহ',
    'air-ticket': 'এয়ার টিকেট',
    'visa': 'ভিসা সার্ভিস',
    'hotel': 'হোটেল বুকিং',
    'insurance': 'ইনসুরেন্স',
    'other': 'অন্যান্য সেবা'
  };
  return categories[category] || category;
};

// Get payment details HTML based on payment method
const getPaymentDetailsHTML = (paymentDetails, paymentMethod) => {
  if (!paymentDetails) return '';

  let detailsHTML = '';
  
  if (paymentMethod === 'bank') {
    if (paymentDetails.bankName) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>ব্যাংকের নাম:</strong> ${paymentDetails.bankName}</p>`;
    if (paymentDetails.accountNumber) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>অ্যাকাউন্ট নম্বর:</strong> ${paymentDetails.accountNumber}</p>`;
    if (paymentDetails.reference) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>রেফারেন্স:</strong> ${paymentDetails.reference}</p>`;
  } else if (paymentMethod === 'cheque') {
    if (paymentDetails.chequeNumber) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>চেক নম্বর:</strong> ${paymentDetails.chequeNumber}</p>`;
    if (paymentDetails.bankName) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>ব্যাংকের নাম:</strong> ${paymentDetails.bankName}</p>`;
    if (paymentDetails.reference) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>রেফারেন্স:</strong> ${paymentDetails.reference}</p>`;
  } else if (paymentMethod === 'mobile-banking') {
    if (paymentDetails.mobileProvider) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>প্রোভাইডার:</strong> ${paymentDetails.mobileProvider}</p>`;
    if (paymentDetails.transactionId) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>ট্রানজেকশন আইডি:</strong> ${paymentDetails.transactionId}</p>`;
    if (paymentDetails.reference) detailsHTML += `<p style="margin: 8px 0; color: #6B7280;"><strong>রেফারেন্স:</strong> ${paymentDetails.reference}</p>`;
  }

  return detailsHTML;
};

// Generate simple PDF without HTML rendering (fallback method)
export const generateSimplePDF = (transactionData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    pdf.setFont('helvetica');
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text('🏢 ERP Dashboard', 105, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(107, 114, 128);
    pdf.text('লেনদেন রিসিট / Transaction Receipt', 105, 30, { align: 'center' });
    
    // Transaction details
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    let y = 50;
    const lineHeight = 8;
    
    // Transaction ID and Date
    pdf.text(`লেনদেন আইডি: ${transactionData.transactionId || 'N/A'}`, 20, y);
    y += lineHeight;
    pdf.text(`তারিখ: ${new Date(transactionData.date).toLocaleDateString('bn-BD')}`, 20, y);
    y += lineHeight;
    pdf.text(`সময়: ${new Date().toLocaleTimeString('bn-BD')}`, 20, y);
    y += lineHeight * 2;
    
    // Transaction type and amount
    const transactionTypeText = transactionData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : 'ডেবিট (ব্যয়)';
    const transactionTypeColor = transactionData.transactionType === 'credit' ? [16, 185, 129] : [239, 68, 68];
    
    pdf.setTextColor(transactionTypeColor[0], transactionTypeColor[1], transactionTypeColor[2]);
    pdf.setFontSize(16);
    pdf.text(transactionTypeText, 20, y);
    y += lineHeight;
    pdf.setFontSize(20);
    pdf.text(`৳${transactionData.paymentDetails?.amount || 0}`, 20, y);
    y += lineHeight * 2;
    
    // Customer information
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text('কাস্টমার তথ্য:', 20, y);
    y += lineHeight;
    
    pdf.setFontSize(12);
    pdf.text(`নাম: ${transactionData.customerName || 'N/A'}`, 20, y);
    y += lineHeight;
    pdf.text(`ফোন: ${transactionData.customerPhone || 'N/A'}`, 20, y);
    y += lineHeight;
    pdf.text(`ইমেইল: ${transactionData.customerEmail || 'N/A'}`, 20, y);
    y += lineHeight;
    pdf.text(`কাস্টমার আইডি: ${transactionData.customerId || 'N/A'}`, 20, y);
    y += lineHeight * 2;
    
    // Payment information
    pdf.setFontSize(14);
    pdf.text('পেমেন্ট তথ্য:', 20, y);
    y += lineHeight;
    
    pdf.setFontSize(12);
    const paymentMethodText = getPaymentMethodText(transactionData.paymentMethod);
    const categoryText = getCategoryText(transactionData.category);
    
    pdf.text(`পেমেন্ট মেথড: ${paymentMethodText}`, 20, y);
    y += lineHeight;
    pdf.text(`ক্যাটাগরি: ${categoryText}`, 20, y);
    y += lineHeight;
    
    // Payment details
    if (transactionData.paymentDetails) {
      const details = transactionData.paymentDetails;
      if (details.bankName) {
        pdf.text(`ব্যাংকের নাম: ${details.bankName}`, 20, y);
        y += lineHeight;
      }
      if (details.accountNumber) {
        pdf.text(`অ্যাকাউন্ট নম্বর: ${details.accountNumber}`, 20, y);
        y += lineHeight;
      }
      if (details.chequeNumber) {
        pdf.text(`চেক নম্বর: ${details.chequeNumber}`, 20, y);
        y += lineHeight;
      }
      if (details.mobileProvider) {
        pdf.text(`প্রোভাইডার: ${details.mobileProvider}`, 20, y);
        y += lineHeight;
      }
      if (details.transactionId) {
        pdf.text(`ট্রানজেকশন আইডি: ${details.transactionId}`, 20, y);
        y += lineHeight;
      }
      if (details.reference) {
        pdf.text(`রেফারেন্স: ${details.reference}`, 20, y);
        y += lineHeight;
      }
    }
    
    y += lineHeight;
    
    // Notes
    if (transactionData.notes) {
      pdf.setFontSize(14);
      pdf.text('অতিরিক্ত নোট:', 20, y);
      y += lineHeight;
      
      pdf.setFontSize(12);
      const splitNotes = pdf.splitTextToSize(transactionData.notes, 170);
      pdf.text(splitNotes, 20, y);
    }
    
    // Footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text('এই রিসিটটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে', 105, pageHeight - 20, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleString('bn-BD')} | ERP Dashboard System`, 105, pageHeight - 10, { align: 'center' });
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transaction_${transactionData.transactionId || 'receipt'}_${timestamp}.pdf`;
    
    // Download PDF
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Simple PDF generation error:', error);
    return { success: false, error: error.message };
  }
};
