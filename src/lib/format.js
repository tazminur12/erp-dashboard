import { useSettingsStore } from '../store/settings';

// Currency formatting
export const formatCurrency = (amount, currency = null) => {
  const settings = useSettingsStore.getState();
  const curr = currency || settings.currency;
  
  if (curr.position === 'left') {
    return `${curr.symbol}${amount.toLocaleString('bn-BD')}`;
  } else {
    return `${amount.toLocaleString('bn-BD')}${curr.symbol}`;
  }
};

// Date formatting
export const formatDate = (date, format = null) => {
  const settings = useSettingsStore.getState();
  const fmt = format || settings.dateFormat;
  
  const d = new Date(date);
  
  if (fmt === 'DD/MM/YYYY') {
    // Day/Month/Year in English (UK)
    return d.toLocaleDateString('en-GB');
  } else if (fmt === 'MM/DD/YYYY') {
    return d.toLocaleDateString('en-US');
  } else if (fmt === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  
  // Default to English (UK)
  return d.toLocaleDateString('en-GB');
};

// Time formatting
export const formatTime = (date, format = null) => {
  const settings = useSettingsStore.getState();
  const fmt = format || settings.timeFormat;
  
  const d = new Date(date);
  
  if (fmt === '12h') {
    // 12-hour clock in English (US)
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } else {
    // 24-hour clock in English (UK)
    return d.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
};

// Number formatting
export const formatNumber = (num) => {
  return num.toLocaleString('bn-BD');
};

// Percentage formatting
export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

// Phone number formatting
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('880')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status formatting
export const formatStatus = (status) => {
  const statusMap = {
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    pending: 'অপেক্ষমান',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল',
    draft: 'খসড়া',
    published: 'প্রকাশিত'
  };
  
  return statusMap[status] || status;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
