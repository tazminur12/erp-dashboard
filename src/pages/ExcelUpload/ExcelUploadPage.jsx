import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Users,
  Building,
  Package,
  CreditCard,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import ExcelUploader from '../../components/common/ExcelUploader';
import { useTheme } from '../../contexts/ThemeContext';

const ExcelUploadPage = () => {
  const { isDark } = useTheme();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Define different data types and their configurations
  const dataTypes = {
    agents: {
      title: 'Agent Data',
      description: 'Upload agent information including personal details, contact info, and commission rates',
      icon: Users,
      color: 'blue',
      fields: ['name', 'email', 'phone', 'address', 'commission'],
      requiredFields: ['name', 'email', 'phone'],
      sampleData: [
        ['Name', 'Email', 'Phone', 'Address', 'Commission'],
        ['Ahmed Rahman', 'ahmed.rahman@example.com', '+8801712345678', 'Dhaka, Bangladesh', '5.5'],
        ['Fatima Begum', 'fatima.begum@example.com', '+8801712345679', 'Chittagong, Bangladesh', '5.0'],
        ['Karim Uddin', 'karim.uddin@example.com', '+8801712345680', 'Sylhet, Bangladesh', '4.8']
      ]
    },
    vendors: {
      title: 'Vendor Data',
      description: 'Upload vendor information including company details, contact info, and payment terms',
      icon: Building,
      color: 'green',
      fields: ['name', 'email', 'phone', 'address', 'company', 'paymentTerms'],
      requiredFields: ['name', 'email', 'phone'],
      sampleData: [
        ['Name', 'Email', 'Phone', 'Address', 'Company', 'Payment Terms'],
        ['ABC Suppliers', 'contact@abcsuppliers.com', '+8801712345681', 'Dhaka, Bangladesh', 'ABC Suppliers Ltd', 'Net 30'],
        ['XYZ Trading', 'info@xyztrading.com', '+8801712345682', 'Chittagong, Bangladesh', 'XYZ Trading Co', 'Net 15']
      ]
    },
    packages: {
      title: 'Package Data',
      description: 'Upload Hajj/Umrah package information including pricing, dates, and inclusions',
      icon: Package,
      color: 'purple',
      fields: ['name', 'description', 'price', 'duration', 'departureDate', 'inclusions'],
      requiredFields: ['name', 'price', 'duration'],
      sampleData: [
        ['Name', 'Description', 'Price', 'Duration', 'Departure Date', 'Inclusions'],
        ['Premium Hajj 2024', 'Full Hajj package with 5-star accommodation', '850000', '14 days', '2024-06-01', 'Hotel, Flight, Visa, Meals'],
        ['Economy Umrah', 'Basic Umrah package with 3-star accommodation', '125000', '7 days', '2024-03-15', 'Hotel, Flight, Visa']
      ]
    },
    haji: {
      title: 'Haji Data',
      description: 'Upload Haji information including personal details, passport, package, and payment status',
      icon: Users,
      color: 'orange',
      fields: ['name', 'passport', 'phone', 'email', 'address', 'package', 'agent', 'totalAmount', 'paidAmount', 'status', 'paymentStatus', 'registrationDate', 'departureDate'],
      requiredFields: ['name', 'passport', 'phone', 'email', 'package'],
      sampleData: [
        ['Name', 'Passport', 'Phone', 'Email', 'Address', 'Package', 'Agent', 'Total Amount', 'Paid Amount', 'Status', 'Payment Status', 'Registration Date', 'Departure Date'],
        ['Md. Abdul Rahman', 'A1234567', '+8801712345678', 'abdul.rahman@email.com', 'Dhaka, Bangladesh', 'Premium Hajj 2024', 'Al-Hijrah Travels', '450000', '450000', 'confirmed', 'paid', '2024-01-15', '2024-06-10'],
        ['Fatima Begum', 'B2345678', '+8801712345679', 'fatima.begum@email.com', 'Chittagong, Bangladesh', 'Standard Umrah 2024', 'Madina Tours', '180000', '90000', 'pending', 'partial', '2024-02-20', '2024-03-15']
      ]
    },
    hajjAgent: {
      title: 'Hajj & Umrah Agent Data',
      description: 'Upload Hajj & Umrah agent information including trade details, owner info, and contact details',
      icon: Building,
      color: 'indigo',
      fields: ['tradeName', 'tradeLocation', 'ownerName', 'contactNo', 'dob', 'nid', 'passport'],
      requiredFields: ['tradeName', 'tradeLocation', 'ownerName', 'contactNo'],
      sampleData: [
        ['Trade Name', 'Trade Location', 'Owner Name', 'Contact No', 'Date of Birth', 'NID', 'Passport'],
        ['Green Line Supplies', 'Sylhet', 'Shahadat Hossain', '+8801555667788', '1988-12-01', '188845623499', 'ZP1122334'],
        ['Nazmul Enterprise', 'Chattogram', 'Nazmul Hasan', '+8801911334455', '1990-08-21', '199045623411', 'EC7654321'],
        ['Miraj Traders', 'Dhaka, Bangladesh', 'Abdul Karim', '+8801711223344', '1984-05-12', '197845623412', 'BA1234567']
      ]
    },
    transactions: {
      title: 'Transaction Data',
      description: 'Upload financial transaction records including amounts, dates, and descriptions',
      icon: CreditCard,
      color: 'yellow',
      fields: ['date', 'amount', 'description', 'category', 'reference', 'status'],
      requiredFields: ['date', 'amount', 'description'],
      sampleData: [
        ['Date', 'Amount', 'Description', 'Category', 'Reference', 'Status'],
        ['2024-01-15', '50000', 'Agent Commission Payment', 'Commission', 'COM-001', 'Completed'],
        ['2024-01-16', '25000', 'Office Rent Payment', 'Rent', 'RENT-001', 'Completed']
      ]
    }
  };

  const handleDataTypeSelect = (dataType) => {
    setSelectedDataType(dataType);
    setShowUploader(true);
  };

  const handleDataProcessed = async (processedData) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call to save data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to upload history
      const uploadRecord = {
        id: Date.now(),
        dataType: selectedDataType,
        recordCount: processedData.length,
        uploadDate: new Date().toISOString(),
        status: 'success'
      };
      
      setUploadHistory(prev => [uploadRecord, ...prev]);
      
      // Show success message
      alert(`Successfully uploaded ${processedData.length} ${dataTypes[selectedDataType].title.toLowerCase()} records!`);
      
    } catch (error) {
      console.error('Error processing data:', error);
      alert('Error processing data. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowUploader(false);
      setSelectedDataType(null);
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/10'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/10'
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/10'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/20',
        icon: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Excel Data Upload
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and process data from Excel files
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              // Get all available fields from dataTypes
              const allFields = [];
              Object.values(dataTypes).forEach(dataType => {
                dataType.fields.forEach(field => {
                  if (!allFields.includes(field)) {
                    allFields.push(field);
                  }
                });
              });
              
              // Create headers from available fields
              const headers = allFields.map(field => {
                const fieldConfig = {
                  'name': 'Name',
                  'email': 'Email',
                  'phone': 'Phone',
                  'address': 'Address',
                  'passport': 'Passport',
                  'package': 'Package',
                  'agent': 'Agent',
                  'totalAmount': 'Total Amount',
                  'paidAmount': 'Paid Amount',
                  'status': 'Status',
                  'paymentStatus': 'Payment Status',
                  'registrationDate': 'Registration Date',
                  'departureDate': 'Departure Date',
                  'tradeName': 'Trade Name',
                  'tradeLocation': 'Trade Location',
                  'ownerName': 'Owner Name',
                  'contactNo': 'Contact No',
                  'dob': 'Date of Birth',
                  'nid': 'NID',
                  'commission': 'Commission'
                };
                return fieldConfig[field] || field;
              });
              
              // Create sample data
              const sampleData = [headers];
              
              // Add sample rows
              for (let i = 1; i <= 3; i++) {
                const row = allFields.map(field => {
                  switch (field) {
                    case 'name':
                      return `Sample Name ${i}`;
                    case 'email':
                      return `sample${i}@email.com`;
                    case 'phone':
                    case 'contactNo':
                      return `+880171234567${i}`;
                    case 'passport':
                      return `A${i.toString().padStart(6, '0')}`;
                    case 'package':
                      return 'Standard Package';
                    case 'agent':
                      return `Agent Name ${i}`;
                    case 'tradeName':
                      return `Business Name ${i}`;
                    case 'tradeLocation':
                      return 'Dhaka, Bangladesh';
                    case 'ownerName':
                      return `Owner Name ${i}`;
                    case 'address':
                      return 'Dhaka, Bangladesh';
                    case 'totalAmount':
                      return '100000';
                    case 'paidAmount':
                      return '50000';
                    case 'status':
                      return 'Active';
                    case 'paymentStatus':
                      return 'Paid';
                    case 'registrationDate':
                      return '2024-01-15';
                    case 'departureDate':
                      return '2024-06-10';
                    case 'dob':
                      return '1990-01-01';
                    case 'nid':
                      return `123456789${i}`;
                    case 'commission':
                      return '5.5';
                    default:
                      return `Sample Data ${i}`;
                  }
                });
                sampleData.push(row);
              }
              
              const ws = XLSX.utils.aoa_to_sheet(sampleData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Simple Data');
              XLSX.writeFile(wb, 'simple_sample_data.xlsx');
            }}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Simple Sample</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-400">
              How to use Excel Upload
            </h3>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Download the sample file for the data type you want to upload</li>
              <li>• Fill in your data following the sample format</li>
              <li>• Upload your Excel file and map the columns to the required fields</li>
              <li>• Preview and validate your data before processing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Object.entries(dataTypes).map(([key, config]) => {
          const Icon = config.icon;
          const colors = getColorClasses(config.color);
          
          return (
            <div
              key={key}
              onClick={() => handleDataTypeSelect(key)}
              className={`p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover}`}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {config.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {config.description}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Data
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload History
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {uploadHistory.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {dataTypes[record.dataType]?.title} Upload
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {record.recordCount} records uploaded
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(record.uploadDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(record.uploadDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Excel Uploader Modal */}
      {showUploader && selectedDataType && (
        <ExcelUploader
          isOpen={showUploader}
          onClose={() => {
            setShowUploader(false);
            setSelectedDataType(null);
          }}
          onDataProcessed={handleDataProcessed}
          title={`Upload ${dataTypes[selectedDataType].title}`}
          acceptedFields={dataTypes[selectedDataType].fields}
          requiredFields={dataTypes[selectedDataType].requiredFields}
          sampleData={dataTypes[selectedDataType].sampleData}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please wait while we process your uploaded data...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadPage;
