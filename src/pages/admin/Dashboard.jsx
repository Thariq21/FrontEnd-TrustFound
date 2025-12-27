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
// Corrected import paths (without .js extension for standard Vite resolution)
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

    // Timeout promise untuk menghindari loading tak terbatas (15 detik)
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
          return new Date(b.create_at || b.created_at) - new Date(a.create_at || a.created_at);
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

  // Helper untuk update path gambar secara lokal (optimistic update)
  const updateLocalImagePath = (currentPath, shouldBlur) => {
    if (!currentPath) return currentPath;
    
    const parts = currentPath.split('/');
    const fileName = parts.pop();
    const directory = parts.join('/');
    
    let newFileName = fileName;
    
    if (shouldBlur) {
      if (!fileName.startsWith('blur-')) {
        newFileName = `blur-${fileName}`;
      }
    } else {
      if (fileName.startsWith('blur-')) {
        newFileName = fileName.replace('blur-', '');
      }
    }
    
    return `${directory}/${newFileName}`;
  };

  // Helper khusus untuk menampilkan gambar di dashboard admin (selalu unblur)
  const getAdminDisplayImage = (path) => {
    if (!path) return null;
    return path.replace('blur-', '');
  };

  // Handle secure item dengan pilihan blur/unblur
  const handleSecureItem = async (itemId, shouldBlur) => {
    const actionText = shouldBlur ? 'BLUR' : 'UNBLUR';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} dan secure item ini?`)) {
      return;
    }

    setProcessingId(itemId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: shouldBlur
      });

      setItems(prevItems => prevItems.map(item => {
        if (item.item_id === itemId) {
          const updatedItem = {
            ...item,
            status: 'secured',
            is_sensitive: shouldBlur ? 1 : 0
          };
          updatedItem.image_path = updateLocalImagePath(item.image_path, shouldBlur);
          return updatedItem;
        }
        return item;
      }));

      setSuccess(`Item berhasil di-secure dan ${shouldBlur ? 'di-blur' : 'ditampilkan publik'}!`);
      
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
    const nextBlurStatus = !currentBlurStatus; 
    const action = nextBlurStatus ? 'BLUR' : 'UNBLUR';
    
    if (!window.confirm(`Apakah Anda yakin ingin ${action} item ini?`)) {
      return;
    }

    setProcessingId(itemId);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/items/${itemId}/secure`, {
        is_sensitive: nextBlurStatus
      });

      setItems(prevItems => prevItems.map(item => {
        if (item.item_id === itemId) {
          const updatedItem = {
            ...item,
            is_sensitive: nextBlurStatus ? 1 : 0
          };
          updatedItem.image_path = updateLocalImagePath(item.image_path, nextBlurStatus);
          return updatedItem;
        }
        return item;
      }));

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
  const handleProcessClaim = async (claimId, status) => { 
    const actionText = status === 'verified' ? 'MENYETUJUI' : 'MENOLAK';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} klaim ini?`)) {
      return;
    }

    setProcessingId(claimId);
    setError('');
    setSuccess('');

    // Cari klaim yang sedang diproses untuk mendapatkan item_id
    const currentClaim = claims.find(c => c.claim_id === claimId);

    try {
      await api.put(`/admin/claims/${claimId}/process`, {
        status: status 
      });

      let successMsg = `Klaim berhasil ${status === 'verified' ? 'disetujui' : 'ditolak'}!`;

      // LOGIKA AUTO-REJECT:
      // Jika klaim ini disetujui (verified), maka cari klaim lain untuk barang yang sama (item_id sama)
      // yang masih statusnya 'pending', lalu otomatis tolak mereka.
      if (status === 'verified' && currentClaim) {
        const conflictingClaims = claims.filter(c => 
          c.claim_id !== claimId &&           // Bukan klaim yang sedang diproses
          c.item_id === currentClaim.item_id && // Barang yang sama
          c.status === 'pending'              // Masih pending
        );

        if (conflictingClaims.length > 0) {
          try {
            // Proses reject untuk semua klaim konflik secara paralel
            await Promise.all(conflictingClaims.map(c => 
              api.put(`/admin/claims/${c.claim_id}/process`, { status: 'rejected' })
            ));
            successMsg += ` (${conflictingClaims.length} klaim lain otomatis ditolak)`;
          } catch (autoRejectErr) {
            console.error('Gagal auto-reject klaim lain:', autoRejectErr);
            // Tidak perlu throw error agar flow utama tetap sukses
          }
        }
      }

      setSuccess(successMsg);
      
      setTimeout(() => {
        loadData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Process claim error:', err);
      const errorMessage = err.response?.data?.message || 'Gagal memproses klaim.';
      setError(errorMessage);
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
      localStorage.removeItem('name');
      localStorage.removeItem('nim');
      localStorage.removeItem('nip');
      navigate('/auth/login');
    }
  };

  // Render badge status
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      secured: { color: 'bg-green-100 text-green-800', icon: ShieldCheck, text: 'Secured' },
      verified: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      claimed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Claimed' } 
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
                          key={item.item_id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${
                            item.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : ''
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Image */}
                            <div className="flex-shrink-0 relative group">
                              <img
                                src={getImageUrl(getAdminDisplayImage(item.image_path))}
                                alt={item.item_name}
                                className="w-full md:w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = 'https://placehold.co/400x400?text=No+Image';
                                }}
                              />
                              {item.is_sensitive === 1 && (
                                <div className="absolute top-0 right-0 m-1">
                                  <div className="bg-red-500/90 text-white p-1 rounded-full shadow-sm" title="Item ini ditampilkan BLUR ke publik">
                                    <EyeOff size={14} />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{item.item_name || item.name}</h3>
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
                                <div className="flex items-center gap-1 w-full sm:w-auto">
                                  <User className="w-4 h-4 text-blue-500" />
                                  <span className="font-medium text-gray-900">
                                    Pelapor: {item.finder_name || 'Anonymous'}
                                  </span>
                                  {item.finder_nim && (
                                    <span className="text-xs text-gray-500 ml-1">({item.finder_nim})</span>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>

                              {/* Blur Status Badge */}
                              {(item.status === 'secured' || item.status === 'claimed') && (
                                <div className="flex items-center gap-2">
                                  {item.is_sensitive === 1 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                      <EyeOff className="w-3 h-3" />
                                      Status: Sensitif (Publik: Blur)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                      <Eye className="w-3 h-3" />
                                      Status: Umum (Publik: Jelas)
                                    </span>
                                  )}
                                  
                                  {item.manage_admin_name && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs ml-auto">
                                      <ShieldCheck className="w-3 h-3" />
                                      Managed by: {item.manage_admin_name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              {item.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleSecureItem(item.item_id, true)}
                                    disabled={processingId === item.item_id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                                  >
                                    {processingId === item.item_id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ShieldAlert className="w-4 h-4" />
                                    )}
                                    Secure & Blur
                                  </button>
                                  <button
                                    onClick={() => handleSecureItem(item.item_id, false)}
                                    disabled={processingId === item.item_id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                                  >
                                    {processingId === item.item_id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ShieldCheck className="w-4 h-4" />
                                    )}
                                    Secure & Unblur
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleToggleBlur(item.item_id, item.is_sensitive)}
                                  disabled={processingId === item.item_id}
                                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                                    item.is_sensitive === 1
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-orange-600 text-white hover:bg-orange-700'
                                  }`}
                                >
                                  {processingId === item.item_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : item.is_sensitive === 1 ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                  {item.is_sensitive === 1 ? 'Ubah ke Umum (Unblur)' : 'Ubah ke Sensitif (Blur)'}
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
                          key={claim.claim_id || claim.id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${
                            claim.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : ''
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Item Image */}
                            <div className="flex-shrink-0 relative">
                              <img
                                src={getImageUrl(getAdminDisplayImage(claim.image_path))}
                                alt={claim.item_name}
                                className="w-full md:w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = 'https://placehold.co/400x400?text=No+Image';
                                }}
                              />
                              {claim.image_path && claim.image_path.includes('blur-') && (
                                <div className="absolute top-0 right-0 m-1">
                                  <div className="bg-red-500/90 text-white p-1 rounded-full shadow-sm" title="Item ini sensitif">
                                    <EyeOff size={14} />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Claim Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{claim.item_name}</h3>
                                  <p className="text-sm text-gray-600">
                                    Klaim oleh: <strong>{claim.claimer_name || claim.claimant_name}</strong>
                                    {claim.claimer_nim && <span className="block text-xs font-normal text-gray-500">NIM: {claim.claimer_nim}</span>}
                                  </p>
                                </div>
                                {renderStatusBadge(claim.status)}
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1 font-medium uppercase">Jawaban Challenge</p>
                                <p className="text-sm text-gray-800">{claim.challange_answer}</p>
                              </div>

                              <div className="space-y-1 pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock size={12} />
                                  Diklaim pada: {formatDate(claim.create_at || claim.created_at || claim.claim_date)}
                                </div>

                                {(claim.status === 'verified' || claim.status === 'rejected') && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <ShieldCheck size={12} />
                                    {claim.status === 'verified' ? 'Disetujui' : 'Ditolak'} oleh: 
                                    <span className="font-medium text-gray-700 ml-1">
                                      {claim.validator_nip ? `NIP ${claim.validator_nip}` : '-'}
                                    </span>
                                    {claim.processed_at && (
                                      <span className="text-gray-400 ml-1">
                                        ({formatDate(claim.processed_at)})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            {claim.status === 'pending' && (
                              <div className="flex flex-col gap-2 min-w-[140px]">
                                <button
                                  onClick={() => handleProcessClaim(claim.claim_id || claim.id, 'verified')}
                                  disabled={processingId === (claim.claim_id || claim.id)}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                                >
                                  {processingId === (claim.claim_id || claim.id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleProcessClaim(claim.claim_id || claim.id, 'rejected')}
                                  disabled={processingId === (claim.claim_id || claim.id)}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                                >
                                  {processingId === (claim.claim_id || claim.id) ? (
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
                          key={log._id?.$oid || index}
                          className="bg-white border rounded-lg p-4 hover:shadow-sm transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900 px-2 py-0.5 bg-gray-100 rounded">
                                      {log.action}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      by <span className="font-medium text-gray-900">{log.actor?.name || 'Unknown'}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 ml-1">
                                    Role: <span className="capitalize">{log.actor?.role}</span> • ID: <span className="font-mono">{log.actor?.id}</span>
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                  <Clock size={12} />
                                  {formatDate(log.timestamp?.$date || log.timestamp)} {new Date(log.timestamp?.$date || log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-xs text-gray-600 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Target Info */}
                                  <div>
                                    <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-2 border-b border-gray-200 pb-1">
                                      Target Info
                                    </h4>
                                    <div className="space-y-1.5">
                                      <div className="flex items-start">
                                        <span className="w-16 text-gray-400 shrink-0">Entity:</span>
                                        <span className="font-medium text-gray-700">{log.target?.entity}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="w-16 text-gray-400 shrink-0">ID:</span>
                                        <span className="font-mono bg-white px-1 rounded border border-gray-200">
                                          {log.target?.entityId}
                                        </span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="w-16 text-gray-400 shrink-0">Details:</span>
                                        <span className="text-gray-700 italic">"{log.target?.details}"</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  <div>
                                    <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-2 border-b border-gray-200 pb-1">
                                      Metadata
                                    </h4>
                                    <div className="space-y-1.5">
                                      <div className="flex items-start">
                                        <span className="w-20 text-gray-400 shrink-0">IP Address:</span>
                                        <span className="font-mono">{log.metadata?.ip_address}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="w-20 text-gray-400 shrink-0">User Agent:</span>
                                        <span className="truncate max-w-[200px] text-gray-500" title={log.metadata?.user_agent}>
                                          {log.metadata?.user_agent}
                                        </span>
                                      </div>
                                      {log.metadata?.is_sensitive_change && (
                                        <div className="flex items-start mt-1">
                                          <span className="w-20 text-gray-400 shrink-0">Change:</span>
                                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                            {log.metadata.is_sensitive_change}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
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