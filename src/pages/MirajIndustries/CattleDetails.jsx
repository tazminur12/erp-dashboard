import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Camera, CheckCircle, AlertTriangle, Clock, Scale, Tag, User, FileText, Heart, Baby } from 'lucide-react';
import useCattleQueries from '../../hooks/useCattleQueries.js';

const healthIcon = (status) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'sick':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'under_treatment':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-400" />;
  }
};

const CattleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useGetCattle } = useCattleQueries();
  const { data, isLoading, error } = useGetCattle(id);

  if (isLoading) {
    return <div className="p-6">লোড হচ্ছে...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">তথ্য লোড করতে সমস্যা হয়েছে</div>;
  }
  if (!data) {
    return <div className="p-6">তথ্য পাওয়া যায়নি</div>;
  }

  const cattle = data;
  const milkRecords = data.milkRecords || [];
  const healthRecords = data.healthRecords || [];
  const vaccinationRecords = data.vaccinationRecords || [];
  const vetVisitRecords = data.vetVisitRecords || [];
  const breedingRecords = data.breedingRecords || [];
  const calvingRecords = data.calvingRecords || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {cattle.image ? (
              <img className="h-24 w-24 rounded-full object-cover" src={cattle.image} alt={cattle.name} />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <Camera className="w-10 h-10 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{cattle.name}</h1>
              <span className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                <Tag className="w-4 h-4" /> {cattle.tagNumber || '—'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1"><User className="w-4 h-4" /> {cattle.gender === 'female' ? 'গাভী' : 'ষাঁড়'}</span>
              <span className="inline-flex items-center gap-1"><Scale className="w-4 h-4" /> {cattle.weight || 0} কেজি</span>
              <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {cattle.purchaseDate ? new Date(cattle.purchaseDate).toLocaleDateString('bn-BD') : '—'}</span>
              <span className="inline-flex items-center gap-2">{healthIcon(cattle.healthStatus)} {cattle.healthStatus}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">মৌলিক তথ্য</h3>
            <div className="text-sm text-gray-700">জাত: <span className="font-medium">{cattle.breed || '—'}</span></div>
            <div className="text-sm text-gray-700">বয়স: <span className="font-medium">{cattle.age || 0} বছর</span></div>
            <div className="text-sm text-gray-700">রং: <span className="font-medium">{cattle.color || '—'}</span></div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">ক্রয় তথ্য</h3>
            <div className="text-sm text-gray-700">ক্রয় মূল্য: <span className="font-medium">{cattle.purchasePrice ? `৳${Number(cattle.purchasePrice).toLocaleString()}` : '—'}</span></div>
            <div className="text-sm text-gray-700">বিক্রেতা: <span className="font-medium">{cattle.vendor || '—'}</span></div>
          </div>
        </div>

        {cattle.notes ? (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4" /> নোট</h3>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-md mt-2">{cattle.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b"><h2 className="text-lg font-semibold">দুধ উৎপাদন রেকর্ড</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সকাল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">দুপুর</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সন্ধ্যা</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মোট</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মান</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {milkRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={6}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                milkRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('bn-BD')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.morningQuantity} লি</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.afternoonQuantity} লি</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.eveningQuantity} লি</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{rec.totalQuantity} লি</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.quality}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b"><h2 className="text-lg font-semibold">স্বাস্থ্য রেকর্ড</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থা</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">লক্ষণ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">চিকিৎসক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {healthRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={5}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                healthRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('bn-BD')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.condition || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{rec.symptoms || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.vetName || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{rec.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vaccination Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b"><h2 className="text-lg font-semibold">টিকা রেকর্ড</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">টিকার নাম</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরবর্তী তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">চিকিৎসক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccinationRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={5}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                vaccinationRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('bn-BD')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.vaccineName || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.nextDueDate ? new Date(rec.nextDueDate).toLocaleDateString('bn-BD') : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.vetName || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{rec.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vet Visit Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b"><h2 className="text-lg font-semibold">চিকিৎসক পরিদর্শন</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্লিনিক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">উদ্দেশ্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">খরচ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vetVisitRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={5}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                vetVisitRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('bn-BD')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.visitType || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.clinic || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{rec.purpose || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{Number(rec.cost || 0).toLocaleString('bn-BD')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breeding Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          <h2 className="text-lg font-semibold">প্রজনন রেকর্ড</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ষাঁড়</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পদ্ধতি</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">প্রত্যাশিত প্রসব</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {breedingRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={5}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                breedingRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{rec.breedingDate ? new Date(rec.breedingDate).toLocaleDateString('bn-BD') : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.bullName || rec.bullId || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rec.method === 'natural' ? 'প্রাকৃতিক' : rec.method === 'artificial' ? 'কৃত্রিম' : rec.method === 'et' ? 'ভ্রূণ স্থানান্তর' : rec.method || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.success === 'successful' || rec.success === 'confirmed_pregnant' 
                          ? 'text-green-600 bg-green-100' 
                          : rec.success === 'failed' 
                          ? 'text-red-600 bg-red-100' 
                          : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {rec.success === 'pending' ? 'অপেক্ষমান' : 
                         rec.success === 'successful' ? 'সফল' : 
                         rec.success === 'failed' ? 'ব্যর্থ' : 
                         rec.success === 'confirmed_pregnant' ? 'গর্ভবতী নিশ্চিত' : rec.success || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rec.expectedCalvingDate ? new Date(rec.expectedCalvingDate).toLocaleDateString('bn-BD') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calving Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Baby className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold">বাচ্চা প্রসব রেকর্ড</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">লিঙ্গ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ওজন (কেজি)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্বাস্থ্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বাচ্চার ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calvingRecords.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600" colSpan={6}>কোনো রেকর্ড নেই</td>
                </tr>
              ) : (
                calvingRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{rec.calvingDate ? new Date(rec.calvingDate).toLocaleDateString('bn-BD') : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.calfGender === 'male' ? 'ষাঁড়' : rec.calfGender === 'female' ? 'গাভী' : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.calfWeight || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.calvingType || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.calfHealth === 'healthy' 
                          ? 'text-green-600 bg-green-100' 
                          : rec.calfHealth === 'sick' || rec.calfHealth === 'deceased'
                          ? 'text-red-600 bg-red-100' 
                          : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {rec.calfHealth === 'healthy' ? 'সুস্থ' : 
                         rec.calfHealth === 'weak' ? 'দুর্বল' : 
                         rec.calfHealth === 'sick' ? 'অসুস্থ' : 
                         rec.calfHealth === 'deceased' ? 'মৃত' : rec.calfHealth || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.calfId || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CattleDetails;


