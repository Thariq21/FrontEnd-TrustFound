import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardCheck, Activity, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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
        await fetchItems();
      } else if (activeTab === 'claims') {
        await fetchClaims();
      } else if (activeTab === 'logs') {
        await fetchLogs();
      }
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const response = await api.get('/admin/items');
    setItems(response.data.data || []);
  };

  const fetchClaims = async () => {
    const response = await api.get('/admin/claims?status=pending');
    setClaims(response.data.data || []);
  };

  const fetchLogs = async () => {
    const response = await api.get('/admin/logs');
    setLogs(response.data.data || []);
  };

  const handleToggleSensitivity = async (itemId, currentStatus) => {
    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: currentStatus === 1 ? false : true,
      });
      setSuccess('Status sensitifitas berhasil diubah');
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal mengubah status sensitifitas');
    }
  };

  const handleProcessClaim = async (claimId, status, notes = '') => {
    try {
      await api.put(`/admin/claims/${claimId}/process`, {
        status,
        admin_notes: notes,
      });
      setSuccess(`Klaim berhasil ${status === 'verified' ? 'disetujui' : 'ditolak'}`);
      fetchClaims();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal memproses klaim');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold flex items-center">
            <LayoutDashboard className="mr-3" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-blue-100 mt-2">Kelola sistem Lost & Found kampus</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition ${
                  activeTab === 'items'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package size={20} />
                <span>Manage Items</span>
              </button>

              <button
                onClick={() => setActiveTab('claims')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition ${
                  activeTab === 'claims'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ClipboardCheck size={20} />
                <span>Manage Claims</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition ${
                  activeTab === 'logs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity size={20} />
                <span>Activity Logs</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'items' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Kelola Barang ({items.length})
                    </h2>

                    {items.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Tidak ada barang</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Barang
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lokasi
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <img
                                      src={`https://api.thrqrhmn.my.id${item.image_url}`}
                                      alt={item.name}
                                      className="h-12 w-12 rounded object-cover"
                                    />
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(item.found_date).toLocaleDateString('id-ID')}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.category_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.found_location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {item.is_sensitive === 1 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <EyeOff size={12} className="mr-1" />
                                      Blur
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Eye size={12} className="mr-1" />
                                      Visible
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleToggleSensitivity(item.id, item.is_sensitive)}
                                    className={`px-3 py-1 rounded text-white font-medium ${
                                      item.is_sensitive === 1
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                  >
                                    {item.is_sensitive === 1 ? 'Unblur' : 'Blur'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'claims' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Pending Claims ({claims.length})
                    </h2>

                    {claims.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Tidak ada klaim pending</p>
                    ) : (
                      <div className="space-y-4">
                        {claims.map((claim) => (
                          <div
                            key={claim.id}
                            className="border border-gray-200 rounded-lg p-5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {claim.item_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Diminta oleh: {claim.user_name} ({claim.user_nim})
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                Pending
                              </span>
                            </div>

                            <div className="bg-gray-50 p-3 rounded mb-4">
                              <p className="text-sm text-gray-500 mb-1">Jawaban Verifikasi:</p>
                              <p className="text-sm text-gray-900">{claim.challange_answer}</p>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleProcessClaim(claim.id, 'verified', 'Klaim disetujui')}
                                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                              >
                                <CheckCircle size={18} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleProcessClaim(claim.id, 'rejected', 'Klaim tidak sesuai verifikasi')}
                                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                              >
                                <XCircle size={18} />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Activity Logs
                    </h2>

                    {logs.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Tidak ada log aktivitas</p>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log, index) => (
                          <div
                            key={index}
                            className="flex items-start border-l-4 border-blue-500 bg-gray-50 p-4 rounded"
                          >
                            <Activity size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{log.action}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {log.user_name} - {new Date(log.timestamp).toLocaleString('id-ID')}
                              </p>
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
