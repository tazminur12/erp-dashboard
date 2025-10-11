import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Process

  // Define available field types
  const fieldTypes = {
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
    'passport': { label: 'Passport', icon: Users, type: 'text', required: false },
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

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      processExcelFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const processExcelFile = (file) => {
    setIsProcessing(true);
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
          setCurrentStep(2);
          
          // Simple auto-mapping
          const autoMapping = {};
          
          excelHeaders.forEach((header, index) => {
            if (!header) return;
            
            const headerLower = header.toString().toLowerCase().trim();
            
            // Simple direct matching
            Object.keys(fieldTypes).forEach(fieldKey => {
              const fieldLabel = fieldTypes[fieldKey].label.toLowerCase();
              
              // Direct match or contains match
              if (headerLower === fieldLabel || 
                  headerLower.includes(fieldLabel) || 
                  fieldLabel.includes(headerLower)) {
                autoMapping[fieldKey] = index;
              }
            });
          });
          
          setMappedFields(autoMapping);
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

    // Simple validation - only check if required fields are mapped
    requiredFields.forEach(field => {
      const columnIndex = mappedFields[field];
      if (columnIndex === undefined || columnIndex === null) {
        errors.push(`Required field "${fieldTypes[field]?.label}" is not mapped`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return { errors, processedData: [] };
    }

    // Process all rows without strict validation
    excelData.forEach((row, rowIndex) => {
      const rowData = {};
      
      Object.keys(mappedFields).forEach(field => {
        const columnIndex = mappedFields[field];
        if (columnIndex !== undefined && columnIndex !== null && row[columnIndex] !== undefined) {
          let value = row[columnIndex];
          
          // Simple formatting
          if (fieldTypes[field]?.type === 'number') {
            value = parseFloat(value) || 0;
          } else if (fieldTypes[field]?.type === 'date') {
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0];
            } else if (typeof value === 'number') {
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toISOString().split('T')[0];
            } else {
              value = value.toString();
            }
          } else {
            value = value.toString().trim();
          }
          
          rowData[field] = value;
        }
      });
      
      processedData.push(rowData);
    });

    setValidationErrors([]);
    return { errors: [], processedData };
  };

  const handlePreview = () => {
    const { errors, processedData } = validateData();
    if (errors.length === 0) {
      setShowPreview(true);
      setCurrentStep(3);
    }
  };

  const handleProcessData = () => {
    const { processedData } = validateData();
    if (processedData.length > 0) {
      onDataProcessed?.(processedData);
      onClose?.();
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
                Step {currentStep} of 4: {
                  currentStep === 1 ? 'Upload File' :
                  currentStep === 2 ? 'Map Fields' :
                  currentStep === 3 ? 'Preview Data' :
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
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
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
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragActive ? 'Drop the file here' : 'Upload Excel File'}
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
              </div>
            )}

            {/* Step 2: Field Mapping */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-blue-800 dark:text-blue-400">
                        Select which Excel column matches each field. Required fields are marked with *.
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {Object.keys(mappedFields).length} fields auto-mapped. 
                        Map the remaining fields manually if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Available Fields */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Available Fields
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(fieldTypes).map(([fieldKey, fieldConfig]) => {
                        const Icon = fieldConfig.icon;
                        return (
                          <div
                            key={fieldKey}
                            className={`p-3 rounded-lg border ${
                              mappedFields[fieldKey] !== undefined
                                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-gray-400" />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {fieldConfig.label}
                                </span>
                                {fieldConfig.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </div>
                              {mappedFields[fieldKey] !== undefined && (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Excel Headers */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Excel Columns
                    </h3>
                    <div className="space-y-3">
                      {headers.map((header, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {header}
                              </span>
                            </div>
                            <select
                              value={Object.keys(mappedFields).find(key => mappedFields[key] === index) || ''}
                              onChange={(e) => {
                                const fieldKey = e.target.value;
                                if (fieldKey) {
                                  setMappedFields(prev => ({
                                    ...prev,
                                    [fieldKey]: index
                                  }));
                                } else {
                                  // Remove mapping
                                  const currentField = Object.keys(mappedFields).find(key => mappedFields[key] === index);
                                  if (currentField) {
                                    setMappedFields(prev => {
                                      const newMapping = { ...prev };
                                      delete newMapping[currentField];
                                      return newMapping;
                                    });
                                  }
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                              <option value="">Select field</option>
                              {Object.entries(fieldTypes).map(([fieldKey, fieldConfig]) => (
                                <option key={fieldKey} value={fieldKey}>
                                  {fieldConfig.label} {fieldConfig.required ? '*' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-medium text-red-800 dark:text-red-400">
                        Mapping Issues
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

            {/* Step 3: Preview */}
            {currentStep === 3 && (
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
                  onClick={handlePreview}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              )}
              
              {currentStep === 3 && (
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
