import React, { useState, useCallback, useMemo } from 'react';
// import { useDropzone } from 'react-dropzone'; // Temporarily disabled due to attr-accept import issues
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  Eye,
  RefreshCw,
  MapPin,
  Users,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  Package,
  Building,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ExcelUploader = ({ 
  onDataProcessed, 
  onClose, 
  title = "Excel File Upload",
  acceptedFields = [],
  requiredFields = [],
  sampleData = [],
  isOpen = false 
}) => {
  const { isDark } = useTheme();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Preview, 3: Process

  // Define available field types
  const baseFieldTypes = {
    'name': { label: 'Name', icon: Users, type: 'text', required: true },
    'email': { label: 'Email', icon: Mail, type: 'email', required: true },
    'phone': { label: 'Phone', icon: Phone, type: 'text', required: true },
    'address': { label: 'Address', icon: MapPin, type: 'text', required: false },
    'joinDate': { label: 'Join Date', icon: Calendar, type: 'date', required: false },
    'commission': { label: 'Commission', icon: DollarSign, type: 'number', required: false },
    'status': { label: 'Status', icon: CheckCircle, type: 'text', required: false },
    'passport': { label: 'Passport', icon: Users, type: 'text', required: false },
    'package': { label: 'Package', icon: Package, type: 'text', required: false },
    'agent': { label: 'Agent', icon: Users, type: 'text', required: false },
    'totalAmount': { label: 'Total Amount', icon: DollarSign, type: 'number', required: false },
    'paidAmount': { label: 'Paid Amount', icon: DollarSign, type: 'number', required: false },
    'paymentStatus': { label: 'Payment Status', icon: CheckCircle, type: 'text', required: false },
    'registrationDate': { label: 'Registration Date', icon: Calendar, type: 'date', required: false },
    'departureDate': { label: 'Departure Date', icon: Calendar, type: 'date', required: false },
    'tradeName': { label: 'Trade Name', icon: Building, type: 'text', required: false },
    'tradeLocation': { label: 'Trade Location', icon: MapPin, type: 'text', required: false },
    'ownerName': { label: 'Owner Name', icon: Users, type: 'text', required: false },
    'contactNo': { label: 'Contact No', icon: Phone, type: 'text', required: false },
    'dob': { label: 'Date of Birth', icon: Calendar, type: 'date', required: false },
    'nid': { label: 'NID', icon: Users, type: 'text', required: false },
    'agentId': { label: 'Agent ID', icon: Users, type: 'text', required: true },
    'method': { label: 'Payment Method', icon: CreditCard, type: 'text', required: true },
    'bankName': { label: 'Bank Name', icon: Building, type: 'text', required: false },
    'referenceNumber': { label: 'Reference Number', icon: CreditCard, type: 'text', required: false },
    'time': { label: 'Time', icon: Calendar, type: 'text', required: false },
    'notes': { label: 'Notes', icon: Info, type: 'text', required: false },
    'customerName': { label: 'Customer Name', icon: Users, type: 'text', required: false },
    'customerPhone': { label: 'Customer Phone', icon: Phone, type: 'text', required: false },
    'productType': { label: 'Product Type', icon: Package, type: 'text', required: false },
    'productName': { label: 'Product Name', icon: Package, type: 'text', required: false },
    'quantity': { label: 'Quantity', icon: Package, type: 'number', required: false },
    'unitPrice': { label: 'Unit Price', icon: DollarSign, type: 'number', required: false },
    'netAmount': { label: 'Net Amount', icon: DollarSign, type: 'number', required: false }
  };

  // Create dynamic field types for acceptedFields that don't exist
  const fieldTypes = useMemo(() => {
    const dynamicTypes = { ...baseFieldTypes };
    
    acceptedFields.forEach(fieldKey => {
      if (!dynamicTypes[fieldKey]) {
        // Capitalize first letter of each word for label
        const label = fieldKey
          .replace(/'/g, '') // Remove apostrophes
          .split(/[\s-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        // Determine field type based on field name
        let type = 'text';
        let icon = Users;
        if (fieldKey.toLowerCase().includes('mobile') || fieldKey.toLowerCase().includes('phone')) {
          type = 'text';
          icon = Phone;
        } else if (fieldKey.toLowerCase().includes('email')) {
          type = 'email';
          icon = Mail;
        } else if (fieldKey.toLowerCase().includes('date')) {
          type = 'date';
          icon = Calendar;
        } else if (fieldKey.toLowerCase().includes('amount') || fieldKey.toLowerCase().includes('price')) {
          type = 'number';
          icon = DollarSign;
        } else if (fieldKey.toLowerCase().includes('address') || fieldKey.toLowerCase().includes('location') || fieldKey.toLowerCase().includes('district') || fieldKey.toLowerCase().includes('upazila')) {
          icon = MapPin;
        }
        
        dynamicTypes[fieldKey] = {
          label: label,
          icon: icon,
          type: type,
          required: requiredFields.includes(fieldKey)
        };
      }
    });
    
    return dynamicTypes;
  }, [acceptedFields, requiredFields]);

  // File validation function
  const isValidFileType = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls') || 
           file.name.endsWith('.csv');
  };

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (file && isValidFileType(file)) {
      setUploadedFile(file);
      processExcelFile(file);
    } else {
      setValidationErrors(['Please select a valid Excel file (.xlsx, .xls, or .csv)']);
    }
  }, []);

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const processExcelFile = (file) => {
    setIsProcessing(true);
    setValidationErrors([]);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const excelHeaders = jsonData[0];
          const excelRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
          
          setHeaders(excelHeaders);
          setExcelData(excelRows);
          
          // Bengali to English field mapping
          const bengaliFieldMapping = {
            // Name variations
            'নাম': 'name',
            'name': 'name',
            'Name': 'name',
            
            // Mobile variations
            'মোবাইল নং': 'mobile no',
            'মোবাইল': 'mobile no',
            'মোবাইল নাম্বার': 'mobile no',
            'mobile no': 'mobile no',
            'Mobile no': 'mobile no',
            'Mobile No': 'mobile no',
            'mobile': 'mobile no',
            'phone': 'mobile no',
            'Phone': 'mobile no',
            
            // Father's name variations
            'পিতার নাম': 'fathers name',
            'পিতা': 'fathers name',
            'fathers name': 'fathers name',
            'Fathers name': 'fathers name',
            "Father's name": 'fathers name',
            'father name': 'fathers name',
            'Father Name': 'fathers name',
            
            // Mother's name variations
            'মাতার নাম': 'mother\'s name',
            'মাতা': 'mother\'s name',
            "mother's name": 'mother\'s name',
            "Mother's name": 'mother\'s name',
            "Mother's Name": 'mother\'s name',
            'mother name': 'mother\'s name',
            'Mother Name': 'mother\'s name',
            'mothers name': 'mother\'s name',
            
            // Upazila variations
            'উপজেলা': 'upazila',
            'Upazila': 'upazila',
            'upazila': 'upazila',
            
            // District variations
            'জেলা': 'districts',
            'জেলার নাম': 'districts',
            'Districts': 'districts',
            'District': 'districts',
            'districts': 'districts',
            'district': 'districts',
          };
          
          // Auto-mapping based on acceptedFields and header names
          const autoMapping = {};
          
          excelHeaders.forEach((header, index) => {
            if (!header) return;
            
            const headerStr = header.toString().trim();
            const headerLower = headerStr.toLowerCase();
            
            // First, try to match with Bengali mapping
            let matchedFieldKey = null;
            
            // Direct Bengali match
            if (bengaliFieldMapping[headerStr]) {
              matchedFieldKey = bengaliFieldMapping[headerStr];
            }
            // Lowercase match
            else if (bengaliFieldMapping[headerLower]) {
              matchedFieldKey = bengaliFieldMapping[headerLower];
            }
            // Partial Bengali match (for merged cells or combined text)
            else {
              Object.keys(bengaliFieldMapping).forEach(bengaliKey => {
                if (headerStr.includes(bengaliKey) || bengaliKey.includes(headerStr)) {
                  matchedFieldKey = bengaliFieldMapping[bengaliKey];
                }
              });
            }
            
            // If matched with Bengali mapping, check if it's in acceptedFields
            if (matchedFieldKey && acceptedFields.includes(matchedFieldKey)) {
              if (autoMapping[matchedFieldKey] === undefined) {
                autoMapping[matchedFieldKey] = index;
                console.log(`Mapped Bengali "${header}" to field "${matchedFieldKey}"`);
              }
            }
            
            // Also try English matching if not already mapped
            acceptedFields.forEach(fieldKey => {
              // Skip if already mapped
              if (autoMapping[fieldKey] !== undefined) return;
              
              // Try to match field key or field label
              const fieldLabel = (fieldTypes[fieldKey]?.label || fieldKey).toLowerCase();
              const fieldKeyLower = fieldKey.toLowerCase();
              
              // Normalize strings for better matching
              // Remove special characters, normalize spaces, remove apostrophes
              const normalizeString = (str) => {
                return str
                  .toLowerCase()
                  .replace(/['".,]/g, '') // Remove quotes, apostrophes, dots, commas
                  .replace(/\s+/g, ' ')   // Normalize spaces
                  .trim();
              };
              
              const headerNormalized = normalizeString(headerLower);
              const fieldLabelNormalized = normalizeString(fieldLabel);
              const fieldKeyNormalized = normalizeString(fieldKeyLower);
              
              // Multiple matching strategies
              const matches = 
                // Exact match after normalization
                headerNormalized === fieldLabelNormalized ||
                headerNormalized === fieldKeyNormalized ||
                // Contains match
                headerNormalized.includes(fieldLabelNormalized) ||
                fieldLabelNormalized.includes(headerNormalized) ||
                headerNormalized.includes(fieldKeyNormalized) ||
                fieldKeyNormalized.includes(headerNormalized) ||
                // Direct comparison (case-insensitive)
                headerLower === fieldKeyLower ||
                headerLower === fieldLabel ||
                // Partial word matching (for "mobile no" vs "mobile", "fathers name" vs "father name")
                (fieldKeyNormalized.split(' ').some(word => word.length > 3 && headerNormalized.includes(word))) ||
                (headerNormalized.split(' ').some(word => word.length > 3 && fieldKeyNormalized.includes(word)));
              
              if (matches) {
                autoMapping[fieldKey] = index;
                console.log(`Mapped "${header}" to field "${fieldKey}"`);
              }
            });
            
            // Also check other field types for additional fields
            Object.keys(fieldTypes).forEach(fieldKey => {
              if (autoMapping[fieldKey] !== undefined) return; // Already mapped
              
              const fieldLabel = fieldTypes[fieldKey].label.toLowerCase();
              const normalizeString = (str) => {
                return str.toLowerCase().replace(/['".,]/g, '').replace(/\s+/g, ' ').trim();
              };
              
              const headerNormalized = normalizeString(headerLower);
              const fieldLabelNormalized = normalizeString(fieldLabel);
              
              // Direct match or contains match
              if (headerNormalized === fieldLabelNormalized || 
                  headerNormalized.includes(fieldLabelNormalized) || 
                  fieldLabelNormalized.includes(headerNormalized)) {
                autoMapping[fieldKey] = index;
                console.log(`Mapped "${header}" to field "${fieldKey}"`);
              }
            });
          });
          
          console.log('Final auto-mapping:', autoMapping);
          console.log('Excel headers:', excelHeaders);
          console.log('Accepted fields:', acceptedFields);
          
          setMappedFields(autoMapping);
          
          // Skip step 2 (mapping), go directly to step 2 (preview)
          setShowPreview(true);
          setCurrentStep(2);
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setValidationErrors(['Error processing Excel file. Please ensure it\'s a valid Excel file.']);
      }
      setIsProcessing(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const validateData = () => {
    const errors = [];
    const processedData = [];

    // Check if we have data to process
    if (!excelData || excelData.length === 0) {
      errors.push('No data found in Excel file');
      setValidationErrors(errors);
      return { errors, processedData: [] };
    }

    // Check if we have any mapped fields
    if (!mappedFields || Object.keys(mappedFields).length === 0) {
      const expectedFields = acceptedFields.map(f => {
        const label = fieldTypes[f]?.label || f;
        return `"${label}"`;
      }).join(', ');
      
      const currentHeaders = headers.length > 0 
        ? headers.map(h => `"${h}"`).join(', ')
        : 'কোনো header নেই';
      
      errors.push(`কোনো field map হয়নি। আপনার Excel file-এর column headers এই field গুলোর সাথে match করতে হবে: ${expectedFields}। বর্তমান headers: ${currentHeaders}`);
      setValidationErrors(errors);
      console.error('Mapping failed:', {
        headers: headers,
        acceptedFields: acceptedFields,
        mappedFields: mappedFields
      });
      return { errors, processedData: [] };
    }

    // Simple validation - only check if required fields are mapped
    requiredFields.forEach(field => {
      const columnIndex = mappedFields[field];
      if (columnIndex === undefined || columnIndex === null) {
        const fieldLabel = fieldTypes[field]?.label || field;
        errors.push(`Required field "${fieldLabel}" is not mapped`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return { errors, processedData: [] };
    }

    // Process all rows with validation
    excelData.forEach((row, rowIndex) => {
      const rowData = {};
      const rowErrors = [];
      
      // Check if row is completely empty (skip empty rows)
      const isRowEmpty = !row || row.every(cell => 
        cell === undefined || 
        cell === null || 
        cell === '' || 
        (typeof cell === 'string' && cell.trim() === '')
      );
      
      if (isRowEmpty) {
        console.log(`Skipping empty row ${rowIndex + 1}`);
        return; // Skip completely empty rows
      }
      
      Object.keys(mappedFields).forEach(field => {
        const columnIndex = mappedFields[field];
        if (columnIndex !== undefined && columnIndex !== null) {
          let value = row[columnIndex];
          
          // Handle undefined, null, or empty values
          if (value === undefined || value === null || value === '') {
            // Check if it's a required field
            if (requiredFields.includes(field)) {
              const fieldLabel = fieldTypes[field]?.label || field;
              rowErrors.push(`Row ${rowIndex + 1}: ${fieldLabel} is required but empty`);
            }
            return; // Skip this field
          }
          
          // Simple formatting
          const fieldType = fieldTypes[field]?.type || 'text';
          if (fieldType === 'number') {
            value = parseFloat(value) || 0;
          } else if (fieldType === 'date') {
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0];
            } else if (typeof value === 'number') {
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toISOString().split('T')[0];
            } else {
              value = value ? value.toString().trim() : '';
            }
          } else {
            value = value ? value.toString().trim() : '';
          }
          
          // Check if required field is empty after trimming
          if (requiredFields.includes(field) && (!value || value === '')) {
            const fieldLabel = fieldTypes[field]?.label || field;
            rowErrors.push(`Row ${rowIndex + 1}: ${fieldLabel} is required but empty`);
          }
          
          if (value !== undefined && value !== null && value !== '') {
            rowData[field] = value;
          }
        }
      });
      
      // Check if all required fields are present
      requiredFields.forEach(reqField => {
        if (!rowData[reqField] || String(rowData[reqField]).trim() === '') {
          const fieldLabel = fieldTypes[reqField]?.label || reqField;
          if (!rowErrors.some(err => err.includes(fieldLabel))) {
            rowErrors.push(`Row ${rowIndex + 1}: ${fieldLabel} is required`);
          }
        }
      });
      
      // If there are errors for this row, add them to errors array
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        console.warn(`Row ${rowIndex + 1} has errors:`, rowErrors, rowData);
      }
      
      // Only add row if it has all required fields
      const hasAllRequiredFields = requiredFields.every(reqField => 
        rowData[reqField] && String(rowData[reqField]).trim() !== ''
      );
      
      if (hasAllRequiredFields && Object.keys(rowData).length > 0) {
        processedData.push(rowData);
      } else if (!hasAllRequiredFields) {
        console.warn(`Skipping row ${rowIndex + 1} - missing required fields`, rowData);
      }
    });

    setValidationErrors([]);
    return { errors: [], processedData };
  };

  const handlePreview = () => {
    const { errors, processedData } = validateData();
    if (errors.length === 0) {
      setShowPreview(true);
      // Already on step 2 (preview), no need to change step
    }
  };

  const handleProcessData = () => {
    console.log('Process Data clicked');
    console.log('Mapped fields:', mappedFields);
    console.log('Headers:', headers);
    console.log('Excel data length:', excelData?.length);
    console.log('Required fields:', requiredFields);
    
    const { errors, processedData } = validateData();
    
    console.log('Validation errors:', errors);
    console.log('Processed data length:', processedData?.length);
    
    // Show validation errors if any
    if (errors.length > 0) {
      setValidationErrors(errors);
      Swal.fire({
        title: 'Validation Error',
        html: errors.map(err => `<p style="text-align: left;">• ${err}</p>`).join(''),
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (!processedData || processedData.length === 0) {
      setValidationErrors(['No data to process. Please check your Excel file.']);
      Swal.fire({
        title: 'No Data',
        text: 'No valid data found to process. Please check your Excel file.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    try {
      // Convert processed data to use expected backend field names (not original Excel headers)
      // Map field keys to backend-expected header names - ONLY these 6 fields
      const fieldToBackendHeader = {
        'name': 'Name',
        'mobile no': 'Mobile no',
        'fathers name': 'Fathers name',
        'mother\'s name': 'Mother\'s Name',
        'upazila': 'Upazila',
        'districts': 'Districts'
      };
      
      // Only process these specific fields - ignore all others
      const allowedFields = ['name', 'mobile no', 'fathers name', 'mother\'s name', 'upazila', 'districts'];
      
      const dataWithOriginalHeaders = processedData.map((row, rowIdx) => {
        const rowData = {};
        
        // Only include the 6 allowed fields
        allowedFields.forEach(fieldKey => {
          // Check if this field is in the mapped fields and has a value
          if (mappedFields[fieldKey] !== undefined && row[fieldKey] !== undefined) {
            const value = row[fieldKey];
            if (value !== undefined && value !== null && value !== '') {
              // Use backend-expected header name
              const backendHeader = fieldToBackendHeader[fieldKey];
              if (backendHeader) {
                rowData[backendHeader] = value;
              }
            }
          }
        });
        
        // Validate required fields for this row
        requiredFields.forEach(reqField => {
          if (allowedFields.includes(reqField)) {
            const backendHeader = fieldToBackendHeader[reqField];
            if (!rowData[backendHeader] || !String(rowData[backendHeader]).trim()) {
              console.warn(`Row ${rowIdx + 1}: Missing required field "${backendHeader}"`, rowData);
            }
          }
        });
        
        return rowData;
      });
      
      console.log('Final processed data:', dataWithOriginalHeaders);
      console.log('Final data count:', dataWithOriginalHeaders.length);
      
      // Call the callback with processed data
      if (onDataProcessed) {
        console.log('Calling onDataProcessed callback');
        onDataProcessed(dataWithOriginalHeaders);
      } else {
        console.warn('onDataProcessed callback is not defined');
      }
      
      // Close the modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error processing data:', error);
      setValidationErrors([`Error processing data: ${error.message}`]);
      Swal.fire({
        title: 'Processing Error',
        text: error.message || 'An error occurred while processing the data.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const downloadSampleFile = () => {
    let sample = [];
    
    if (sampleData.length === 0) {
      // Create simple sample data based on accepted fields
      const headers = acceptedFields.map(field => fieldTypes[field]?.label || field);
      sample = [headers];
      
      // Add simple sample rows
      for (let i = 1; i <= 3; i++) {
        const row = acceptedFields.map(field => {
          switch (field) {
            case 'name':
              return `Sample Name ${i}`;
            case 'email':
              return `sample${i}@email.com`;
            case 'phone':
              return `+880171234567${i}`;
            case 'passport':
              return `A${i.toString().padStart(6, '0')}`;
            case 'package':
              return 'Standard Package';
            case 'tradeName':
              return `Business Name ${i}`;
            case 'tradeLocation':
              return 'Dhaka, Bangladesh';
            case 'ownerName':
              return `Owner Name ${i}`;
            case 'contactNo':
              return `+880171234567${i}`;
            case 'totalAmount':
              return '100000';
            case 'paidAmount':
              return '50000';
            case 'status':
              return 'Active';
            case 'paymentStatus':
              return 'Paid';
            default:
              return `Sample Data ${i}`;
          }
        });
        sample.push(row);
      }
    } else {
      sample = sampleData;
    }
    
    const ws = XLSX.utils.aoa_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Data');
    XLSX.writeFile(wb, 'simple_sample_data.xlsx');
  };

  const resetUploader = () => {
    setUploadedFile(null);
    setExcelData([]);
    setHeaders([]);
    setMappedFields({});
    setValidationErrors([]);
    setShowPreview(false);
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep} of 3: {
                  currentStep === 1 ? 'Upload File' :
                  currentStep === 2 ? 'Preview Data' :
                  'Process Data'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadSampleFile}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Download className="w-4 h-4" />
                <span>Sample</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input 
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragOver ? 'Drop the file here' : 'Upload Excel File'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Drag and drop your Excel file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Supports .xlsx, .xls, and .csv files
                      </p>
                    </div>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-400">
                          File uploaded successfully
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Processing file...</span>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-medium text-red-800 dark:text-red-400">
                        Upload Error
                      </h4>
                    </div>
                    <ul className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 dark:text-red-500">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Preview */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-400">
                      Data validation successful! Preview the data before processing.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {Object.keys(mappedFields).map(fieldKey => (
                          <th
                            key={fieldKey}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {fieldTypes[fieldKey]?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {excelData.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.keys(mappedFields).map(fieldKey => {
                            const columnIndex = mappedFields[fieldKey];
                            const value = row[columnIndex];
                            return (
                              <td key={fieldKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {value ? value.toString() : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {excelData.length > 10 && (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Showing first 10 rows of {excelData.length} total rows
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
              )}
              <button
                onClick={resetUploader}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              
              {currentStep === 2 && (
                <button
                  onClick={handleProcessData}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Process Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
