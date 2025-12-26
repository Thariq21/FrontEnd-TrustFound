import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardCheck, Activity, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    if (userRole !== 'admin' && userRole !== 'satpam') {
      navigate('/');
      return;
    }

    loadData();
  }, [navigate, userRole, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'items') {
        const res = await api.get('/admin/items');
        setItems(res.data.data || []);
      } else if (activeTab === 'claims') {
        const res = await api.get('/admin/claims?status=pending');
        setClaims(res.data.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/logs');
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Pastikan Anda memiliki akses.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSensitivity = async (itemId, currentStatus) => {
    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: currentStatus === 1 ? false : true,
      });
      setSuccess('Status sensitivitas berhasil diubah');
      loadData(); // Reload current tab
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal mengubah status sensitivitas');
    }
  };

  const handleProcessClaim = async (claimId, status, notes = '') => {
    try {
      await api.put(`/admin/claims/${claimId}/process`, {
        status,
        admin_notes: notes,
      });
      setSuccess(`Klaim berhasil ${status === 'verified' ? 'disetujui' : 'ditolak'}`);
      loadData(); // Reload
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal memproses klaim');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">TrustFound Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 px-3 py-1 bg-gray-100 rounded-full capitalize">
                Role: {userRole}
            </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
            <CheckCircle size={20} className="mr-2" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex">
              {[
                { id: 'items', label: 'Manage Items', icon: Package },
                { id: 'claims', label: 'Verifikasi Klaim', icon: ClipboardCheck },
                { id: 'logs', label: 'Audit Logs', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  {tab.id === 'claims' && claims.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {claims.length}
                      </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                <p>Memuat data...</p>
              </div>
            ) : (
              <>
                {/* ITEMS TAB */}
                {activeTab === 'items' && (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Privasi</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">Data kosong</td></tr>
                        ) : items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                    <img src={getImageUrl(item.image_url)} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500">{formatDate(item.found_date)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.found_location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.is_sensitive === 1 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <EyeOff size={12} className="mr-1" /> Blur
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <Eye size={12} className="mr-1" /> Public
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleToggleSensitivity(item.id, item.is_sensitive)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                  item.is_sensitive === 1
                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                              >
                                {item.is_sensitive === 1 ? 'Matikan Blur' : 'Aktifkan Blur'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* CLAIMS TAB */}
                {activeTab === 'claims' && (
                  <div className="space-y-6">
                    {claims.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                        <p className="text-gray-500">Tidak ada klaim pending. Kerja bagus!</p>
                      </div>
                    ) : (
                        claims.map((claim) => (
                          <div key={claim.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Info Barang */}
                                <div className="w-full md:w-1/4">
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3">
                                        {/* Disini kita bisa fetch detail item kalau API claims belum include image_url */}
                                        {/* Asumsi API claims return item_image atau sejenisnya, kalau tidak ada ganti placeholder */}
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                            <Package size={24} />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{claim.item_name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">ID Barang: #{claim.item_id}</p>
                                </div>

                                {/* Info Klaim */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Pemohon:</p>
                                            <p className="font-semibold text-gray-900 text-lg">{claim.user_name}</p>
                                            <p className="text-sm text-gray-600 font-mono">{claim.user_nim}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide border border-yellow-200">
                                            Menunggu Verifikasi
                                        </span>
                                    </div>

                                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Jawaban Verifikasi (Challenge):</p>
                                        <p className="text-gray-800 text-sm leading-relaxed">{claim.challange_answer}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleProcessClaim(claim.id, 'rejected', 'Jawaban tidak cocok dengan ciri fisik barang.')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition font-medium"
                                        >
                                            <XCircle size={18} />
                                            Tolak Klaim
                                        </button>
                                        <button
                                            onClick={() => handleProcessClaim(claim.id, 'verified', 'Verifikasi berhasil. Silakan ambil barang.')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                                        >
                                            <CheckCircle size={18} />
                                            Setujui Klaim
                                        </button>
                                    </div>
                                </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {logs.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">Log kosong</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {logs.map((log, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 flex items-start gap-4 transition">
                                <div className="mt-1">
                                    <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                        <Activity size={16} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{log.user_name}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;