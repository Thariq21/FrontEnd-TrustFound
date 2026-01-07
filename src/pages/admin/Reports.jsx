// src/pages/admin/Reports.jsx
import { useState } from 'react';
import { Download, Calendar, FileText, TrendingUp, Package, Users, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Get current month as default
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  };

  // Handle download current month report
  const handleDownloadCurrentMonth = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching report from:', '/admin/reports/monthly');
      
      const response = await api.get('/admin/reports/monthly', {
        responseType: 'blob', // Important for file download
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ Response received:', response);
      console.log('📦 Response type:', response.headers['content-type']);

      // Check if response is actually a PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Response bukan PDF. Content-Type: ' + contentType);
      }

      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      link.setAttribute('download', `Laporan-Bulanan-${monthYear}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      alert('✅ Laporan berhasil didownload!');
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      console.error('📋 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      let errorMessage = 'Gagal mendownload laporan';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 404) {
          errorMessage = 'Endpoint tidak ditemukan. Pastikan backend sudah running.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Silakan login kembali.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Cek console backend untuk detail.';
        } else {
          // Try to read error message from blob
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            errorMessage = json.message || errorMessage;
          } catch (e) {
            errorMessage = `Error ${error.response.status}: ${error.message}`;
          }
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend sudah running.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle download with custom date range
  const handleDownloadCustomRange = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('⚠️ Mohon isi tanggal mulai dan tanggal akhir');
      return;
    }

    // Validate date range
    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      alert('⚠️ Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Fetching custom report:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await api.get('/admin/reports/monthly', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        responseType: 'blob',
        timeout: 30000
      });

      console.log('✅ Response received');

      // Check if response is actually a PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Response bukan PDF. Content-Type: ' + contentType);
      }

      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      link.setAttribute('download', `Laporan-${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      alert('✅ Laporan berhasil didownload!');
    } catch (error) {
      console.error('❌ Error downloading custom report:', error);
      
      let errorMessage = 'Gagal mendownload laporan';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Endpoint tidak ditemukan. Pastikan backend sudah running.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Silakan login kembali.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Cek console backend untuk detail.';
        } else {
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            errorMessage = json.message || errorMessage;
          } catch (e) {
            errorMessage = `Error ${error.response.status}: ${error.message}`;
          }
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend sudah running.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Page Title */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Laporan Bulanan
          </h1>
          <p className="text-gray-600">
            Download laporan Lost & Found dalam format PDF
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Format PDF</h3>
            </div>
            <p className="text-sm text-gray-600">
              Laporan otomatis dihasilkan dalam format PDF siap cetak
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Statistik Lengkap</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ringkasan barang masuk, diklaim, dan dikembalikan
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detail Aktivitas</h3>
            </div>
            <p className="text-sm text-gray-600">
              Daftar lengkap barang masuk dan klaim yang disetujui
            </p>
          </div>
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Download - Current Month */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                <Download className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Laporan Bulan Ini
              </h2>
              <p className="text-gray-600">
                Download laporan untuk bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Periode Default:</p>
                  <p>
                    {getCurrentMonthRange().startDate} s/d {getCurrentMonthRange().endDate}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCurrentMonth}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-3" />
                  Download Laporan Bulan Ini
                </>
              )}
            </button>
          </div>

          {/* Custom Date Range */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                <Calendar className="h-12 w-12 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Custom Date Range
              </h2>
              <p className="text-gray-600">
                Download laporan dengan periode tertentu
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadCustomRange}
              disabled={loading || !dateRange.startDate || !dateRange.endDate}
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent rounded-lg text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-3" />
                  Download Laporan Custom
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Contents Info */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Isi Laporan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">A. Ringkasan</h4>
                <p className="text-sm text-gray-600">
                  Total barang masuk, diklaim, dan donasi periode laporan
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">B. Detail Barang Masuk</h4>
                <p className="text-sm text-gray-600">
                  Daftar lengkap barang yang dilaporkan dengan status
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">C. Detail Klaim</h4>
                <p className="text-sm text-gray-600">
                  Daftar klaim yang disetujui beserta penerima
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}