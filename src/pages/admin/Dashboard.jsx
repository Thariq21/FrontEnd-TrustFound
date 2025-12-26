import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  Activity, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck,
  Loader2,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import api from '../../services/api';
import { getImageUrl, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Load data dengan timeout dan error handling yang robust
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    // Timeout promise untuk menghindari loading tak terbatas
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    try {
      let dataPromise;

      if (activeTab === 'items') {
        dataPromise = api.get('/admin/items');
      } else if (activeTab === 'claims') {
        dataPromise = api.get('/admin/claims?status=all');
      } else if (activeTab === 'logs') {
        dataPromise = api.get('/admin/logs');
      }

      const response = await Promise.race([dataPromise, timeoutPromise]);

      if (activeTab === 'items') {
        // Sort: Pending items di atas
        const sortedItems = response.data.data.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setItems(sortedItems);
      } else if (activeTab === 'claims') {
        const sortedClaims = response.data.data.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setClaims(sortedClaims);
      } else if (activeTab === 'logs') {
        setLogs(response.data.data || []);
      }
    } catch (err) {
      console.error('Load data error:', err);
      if (err.message === 'Request timeout') {
        setError('Koneksi timeout. Silakan coba lagi.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data. Silakan refresh halaman.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle secure item dengan pilihan blur/unblur
  const handleSecureItem = async (itemId, shouldBlur) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${shouldBlur ? 'BLUR' : 'UNBLUR'} dan secure item ini?`)) {
      return;
    }

    setProcessingId(itemId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: shouldBlur
      });

      setSuccess(`Item berhasil di-secure dan ${shouldBlur ? 'di-blur' : 'ditampilkan publik'}!`);
      
      // Reload data setelah 1 detik
      setTimeout(() => {
        loadData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Secure item error:', err);
      setError(err.response?.data?.message || 'Gagal memproses item.');
    } finally {
      setProcessingId(null);
    }
  };

  // Toggle blur status untuk item yang sudah secured
  const handleToggleBlur = async (itemId, currentBlurStatus) => {
    const action = currentBlurStatus ? 'UNBLUR' : 'BLUR';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} item ini?`)) {
      return;
    }

    setProcessingId(itemId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: !currentBlurStatus
      });

      setSuccess(`Item berhasil di-${action.toLowerCase()}!`);
      
      setTimeout(() => {
        loadData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Toggle blur error:', err);
      setError(err.response?.data?.message || 'Gagal mengubah status blur.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle process claim (approve/reject)
  const handleProcessClaim = async (claimId, action) => {
    const actionText = action === 'verified' ? 'MENYETUJUI' : 'MENOLAK';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} klaim ini?`)) {
      return;
    }

    setProcessingId(claimId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/claims/${claimId}/process`, {
        action: action
      });

      setSuccess(`Klaim berhasil ${action === 'verified' ? 'disetujui' : 'ditolak'}!`);
      
      setTimeout(() => {
        loadData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Process claim error:', err);
      setError(err.response?.data?.message || 'Gagal memproses klaim.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      navigate('/auth/login');
    }
  };

  // Render badge status
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      secured: { color: 'bg-green-100 text-green-800', icon: ShieldCheck, text: 'Secured' },
      verified: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">TrustFound - Kelola Barang & Klaim</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alert Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Berhasil</p>
              <p className="text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'items'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              Manage Items
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'claims'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              Manage Claims
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'logs'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-5 h-5" />
              Activity Logs
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <>
                {/* Tab: Manage Items */}
                {activeTab === 'items' && (
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada barang yang dilaporkan.</p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${
                            item.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : ''
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={getImageUrl(item.image_path)}
                                alt={item.item_name}
                                className="w-full md:w-32 h-32 object-cover rounded-lg"
                              />
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                                  <p className="text-sm text-gray-600">{item.category_name}</p>
                                </div>
                                {renderStatusBadge(item.status)}
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {item.found_location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(item.found_date)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  Pelapor: {item.reporter_name}
                                </div>
                              </div>

                              <p className="text-sm text-gray-700">{item.description}</p>

                              {/* Blur Status Badge */}
                              {item.status === 'secured' && (
                                <div className="flex items-center gap-2">
                                  {item.is_sensitive ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                      <EyeOff className="w-3 h-3" />
                                      Gambar Di-Blur
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                      <Eye className="w-3 h-3" />
                                      Gambar Publik
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              {item.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleSecureItem(item.id, true)}
                                    disabled={processingId === item.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                  >
                                    {processingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ShieldAlert className="w-4 h-4" />
                                    )}
                                    Secure & Blur
                                  </button>
                                  <button
                                    onClick={() => handleSecureItem(item.id, false)}
                                    disabled={processingId === item.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                  >
                                    {processingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ShieldCheck className="w-4 h-4" />
                                    )}
                                    Secure & Unblur
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleToggleBlur(item.id, item.is_sensitive)}
                                  disabled={processingId === item.id}
                                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    item.is_sensitive
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-orange-600 text-white hover:bg-orange-700'
                                  }`}
                                >
                                  {processingId === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : item.is_sensitive ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                  {item.is_sensitive ? 'Unblur' : 'Blur'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Manage Claims */}
                {activeTab === 'claims' && (
                  <div className="space-y-4">
                    {claims.length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada klaim yang masuk.</p>
                      </div>
                    ) : (
                      claims.map((claim) => (
                        <div
                          key={claim.id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${
                            claim.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : ''
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Item Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={getImageUrl(claim.image_path)}
                                alt={claim.item_name}
                                className="w-full md:w-32 h-32 object-cover rounded-lg"
                              />
                            </div>

                            {/* Claim Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{claim.item_name}</h3>
                                  <p className="text-sm text-gray-600">Klaim oleh: {claim.claimant_name}</p>
                                </div>
                                {renderStatusBadge(claim.status)}
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Jawaban Challenge:</p>
                                <p className="text-sm text-gray-800 font-medium">{claim.challange_answer}</p>
                              </div>

                              <div className="text-xs text-gray-500">
                                Diklaim pada: {formatDate(claim.claim_date)}
                              </div>
                            </div>

                            {/* Actions */}
                            {claim.status === 'pending' && (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleProcessClaim(claim.id, 'verified')}
                                  disabled={processingId === claim.id}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  {processingId === claim.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleProcessClaim(claim.id, 'rejected')}
                                  disabled={processingId === claim.id}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  {processingId === claim.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  Tolak
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Activity Logs */}
                {activeTab === 'logs' && (
                  <div className="space-y-3">
                    {logs.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada aktivitas yang tercatat.</p>
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div
                          key={log._id || index}
                          className="bg-white border rounded-lg p-4 hover:shadow-sm transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{log.action}</p>
                              <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                                <span>User: {log.user_name || 'System'}</span>
                                <span>{formatDate(log.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
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