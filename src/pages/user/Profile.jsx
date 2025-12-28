import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, CheckCircle, XCircle, Package, AlertCircle, MapPin, Calendar, Tag } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userName = localStorage.getItem('name');
  const userNim = localStorage.getItem('nim');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchMyClaims();
  }, [navigate]);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get('/claims/my');
      setClaims(response.data.data || []);
    } catch (err) {
      setError('Gagal memuat riwayat klaim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <Clock size={16} />,
        label: 'Pending',
      },
      verified: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle size={16} />,
        label: 'Disetujui',
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle size={16} />,
        label: 'Ditolak',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{userName || 'User'}</h1>
                <p className="text-blue-100 mt-1">NIM: {userNim || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-3" size={28} />
              Riwayat Klaim Saya
            </h2>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">Belum ada riwayat klaim</p>
                <p className="text-gray-400 mb-6">Ajukan klaim pertama Anda untuk barang yang hilang</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Lihat Barang Temuan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div
                    key={claim.claim_id || claim.id} // Prioritaskan claim_id
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {claim.item_name}
                        </h3>
                        {/* Menampilkan Kategori */}
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <Tag size={14} />
                            <span>{claim.category_name || 'Kategori tidak tersedia'}</span>
                        </div>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-gray-500 flex items-center gap-1 mb-1">
                            <Calendar size={14} /> Tanggal Klaim
                        </p>
                        <p className="text-gray-900 font-medium ml-5">
                          {/* Menggunakan create_at dari DB atau fallback ke created_at */}
                          {claim.create_at || claim.created_at ? new Date(claim.create_at || claim.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 flex items-center gap-1 mb-1">
                            <MapPin size={14} /> Lokasi Ditemukan
                        </p>
                        <p className="text-gray-900 font-medium ml-5">
                            {/* Menampilkan Lokasi Penemuan */}
                            {claim.found_location || 'Lokasi tidak tersedia'}
                        </p>
                      </div>
                    </div>

                    {claim.challange_answer && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Jawaban Verifikasi Anda</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 italic">
                          "{claim.challange_answer}"
                        </p>
                      </div>
                    )}

                    {claim.admin_notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Catatan Admin</p>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-100">
                          {claim.admin_notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Menampilkan Pesan Batas Waktu Pengambilan untuk Status Pending */}
                    {claim.status === 'pending' && (
                      <div className="mt-3 text-xs text-orange-700 bg-orange-50 p-2 rounded flex items-start border border-orange-100">
                        <AlertCircle size={14} className="mr-2 mt-0.5 shrink-0"/>
                        <span>
                            <b>Penting:</b> Barang yang telah disetujui (Verified) wajib diambil di pos satpam selambat-lambatnya <b>2 hari</b> setelah status berubah. Jika tidak, klaim akan otomatis dibatalkan.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;