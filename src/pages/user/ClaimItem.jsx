import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Tag, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const ClaimItem = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [challengeAnswer, setChallengeAnswer] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchItemDetail();
  }, [itemId, navigate]);

  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/items/${itemId}`);
      setItem(response.data.data);
    } catch (err) {
      setError('Gagal memuat detail barang');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!challengeAnswer.trim()) {
      setError('Jawaban verifikasi wajib diisi');
      return;
    }

    if (item?.is_sensitive === 1 && challengeAnswer.trim().length < 10) {
      setError('Untuk barang sensitif, mohon berikan deskripsi detail minimal 10 karakter');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/claims', {
        item_id: parseInt(itemId),
        challange_answer: challengeAnswer,
      });

      setSuccess('Klaim berhasil diajukan! Tim kami akan segera memverifikasi.');

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan klaim. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data barang...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Barang tidak ditemukan</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Package className="mr-3" size={32} />
              Klaim Barang
            </h1>
            <p className="text-blue-100 mt-2">Ajukan klaim untuk barang yang Anda kehilangan</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Barang</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={`https://api.thrqrhmn.my.id${item.image_url}`}
                    alt={item.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {item.is_sensitive === 1 && (
                    <div className="mt-2 flex items-center text-sm text-orange-600">
                      <ShieldAlert size={16} className="mr-1" />
                      <span>Gambar diblur untuk privasi</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                    {item.is_sensitive === 1 && (
                      <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                        Barang Sensitif
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start">
                      <Tag size={20} className="mr-3 mt-1 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Kategori</p>
                        <p className="font-medium">{item.category_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin size={20} className="mr-3 mt-1 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Lokasi Ditemukan</p>
                        <p className="font-medium">{item.found_location}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar size={20} className="mr-3 mt-1 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Ditemukan</p>
                        <p className="font-medium">
                          {new Date(item.found_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Form Verifikasi Klaim</h2>

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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelaskan ciri-ciri spesifik barang Anda <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      item.is_sensitive === 1
                        ? 'Contoh: Dompet kulit warna coklat tua, ada kartu mahasiswa a.n. Budi Santoso (NIM 12345678), KTP, dan foto keluarga di dalamnya.'
                        : 'Contoh: Tas ransel warna hitam merek XYZ, terdapat gantungan kunci boneka di resleting, di dalam ada buku catatan warna biru.'
                    }
                    required
                  />
                  {item.is_sensitive === 1 && (
                    <p className="mt-2 text-sm text-orange-600 flex items-start">
                      <ShieldAlert size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        Barang ini termasuk kategori sensitif. Mohon berikan deskripsi yang sangat detail
                        untuk membantu proses verifikasi (minimal 10 karakter).
                      </span>
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tips Verifikasi:</strong> Sebutkan ciri-ciri yang hanya Anda sebagai pemilik yang tahu,
                    seperti warna spesifik, merek, isi barang, kerusakan kecil, atau detail unik lainnya.
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Mengajukan Klaim...' : 'Ajukan Klaim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimItem;
