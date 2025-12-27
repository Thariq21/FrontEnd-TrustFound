  import { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { Package, MapPin, Calendar, Tag, AlertCircle, CheckCircle, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
  import api from '../../services/api.js';
  import { getImageUrl, formatDate } from '../../utils/helpers.js';

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
        
        // Handle response structure: data.data could be object or array
        const rawData = response.data.data || response.data;
        
        // Jika API mengembalikan array (seperti pada list), ambil elemen pertama
        const itemData = Array.isArray(rawData) ? rawData[0] : rawData;
        
        if (!itemData) {
          throw new Error('Data barang tidak ditemukan');
        }

        setItem(itemData);
        console.log("Detail Barang Loaded:", itemData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError('Gagal memuat detail barang. Pastikan barang masih tersedia.');
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Validasi kondisional berdasarkan sensitivitas barang
      if (item?.is_sensitive === 1) {
        if (!challengeAnswer.trim()) {
          setError('Jawaban verifikasi wajib diisi untuk barang sensitif.');
          return;
        }
        if (challengeAnswer.trim().length < 10) {
          setError('Untuk barang sensitif, mohon berikan deskripsi detail minimal 10 karakter.');
          return;
        }
      } 
      // Untuk barang non-sensitif, tidak ada validasi ketat (boleh kosong)

      setSubmitting(true);
      setError('');
      setSuccess('');

      try {
        // PENTING: Gunakan item_id dari objek item yang sudah di-load untuk kepastian
        // Fallback ke parseInt(itemId) dari URL jika terjadi sesuatu
        const payloadItemId = item?.item_id || parseInt(itemId);

        const payload = {
          item_id: payloadItemId,
          // Ejaan 'challange_answer' HARUS sama persis dengan backend controller
          // Backend: const { item_id, challange_answer } = req.body;
          challange_answer: challengeAnswer.trim() || '-',
        };

        console.log("Submitting Claim Payload:", payload);

        // Endpoint /claims menerima JSON. Axios otomatis set Content-Type: application/json
        await api.post('/claims', payload);

        setSuccess('Klaim berhasil diajukan! Redirecting...');

        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (err) {
        console.error("Claim Error Detail:", err);
        
        let msg = 'Gagal mengajukan klaim. Silakan coba lagi.';
        
        if (err.response) {
          console.error("Server Response Data:", err.response.data);
          console.error("Server Response Status:", err.response.status);

          // Respon dari server (selain 2xx)
          if (err.response.data && (err.response.data.message || err.response.data.error)) {
            msg = err.response.data.message || err.response.data.error;
          } else if (err.response.status === 400) {
            msg = 'Data klaim tidak valid (Bad Request). Cek input Anda.';
          } else if (err.response.status === 500) {
            msg = 'Terjadi kesalahan internal pada server (500). Mohon coba login ulang atau hubungi admin.';
          } else if (err.response.status === 404) {
            msg = 'Endpoint klaim tidak ditemukan (404).';
          }
        } else if (err.request) {
          // Request dibuat tapi tidak ada respon
          msg = 'Tidak dapat menghubungi server. Cek koneksi internet Anda.';
        } else {
          // Error lainnya
          msg = err.message;
        }
        
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      );
    }

    if (!item) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-4">Barang tidak ditemukan atau telah dihapus.</p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
            Kembali ke Beranda
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 md:px-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8 opacity-80" />
                Klaim Barang
              </h1>
              <p className="text-blue-100 mt-2 text-sm md:text-base">
                Verifikasi kepemilikan Anda untuk mengambil barang ini.
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Kolom Kiri: Gambar & Info Dasar */}
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-inner border border-gray-200 aspect-square group">
                    <img
                      src={getImageUrl(item.image_path || item.image_url)}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                          item.is_sensitive === 1 ? 'blur-xl scale-110 opacity-80' : ''
                      }`}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                    
                    {item.is_sensitive === 1 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px] text-center p-4">
                        <ShieldAlert className="w-12 h-12 text-red-500 mb-2 drop-shadow-md" />
                        <span className="font-bold text-gray-800 bg-white/90 px-4 py-2 rounded-full shadow-sm text-sm">
                          Foto Disensor Demi Privasi
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Tag size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kategori</p>
                        <p className="font-semibold text-gray-800">{item.category_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Lokasi Ditemukan</p>
                        <p className="font-semibold text-gray-800">{item.found_location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tanggal Ditemukan</p>
                        <p className="font-semibold text-gray-800">{formatDate(item.found_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Form Klaim */}
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
                      {item.is_sensitive === 1 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                          Sensitif
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                          Umum
                        </span>
                      )}
                    </div>
                    
                    {item.is_sensitive === 1 ? (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-start gap-3">
                          <ShieldAlert className="text-orange-600 shrink-0 mt-0.5" size={18} />
                          <div>
                              <p className="text-sm font-semibold text-orange-800 mb-1">Deskripsi Disembunyikan</p>
                              <p className="text-xs text-orange-700 leading-relaxed">
                                  Demi keamanan, deskripsi detail barang ini tidak ditampilkan. Silakan jelaskan ciri-ciri barang secara rinci di bawah untuk verifikasi.
                              </p>
                          </div>
                      </div>
                    ) : (
                      item.description && (
                          <p className="text-gray-600 leading-relaxed bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm">
                          "{item.description}"
                          </p>
                      )
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-6 mt-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-blue-600" size={20} />
                      Verifikasi Pemilik
                    </h3>

                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start text-sm">
                        <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start text-sm">
                        <CheckCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                        {success}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pertanyaan Keamanan: Ciri-ciri Spesifik {item.is_sensitive !== 1 && <span className="text-gray-400 font-normal">(Opsional)</span>}
                        </label>
                        <div className="relative">
                          <textarea
                            value={challengeAnswer}
                            onChange={(e) => setChallengeAnswer(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm leading-relaxed"
                            placeholder={
                              item.is_sensitive === 1
                                ? 'Wajib diisi: Jelaskan ciri unik yang hanya diketahui pemilik (isi dompet, wallpaper HP, nomor seri, dll)...'
                                : 'Opsional: Anda bisa menjelaskan ciri tambahan untuk mempercepat verifikasi...'
                            }
                            required={item.is_sensitive === 1}
                          />
                        </div>
                        
                        {item.is_sensitive === 1 ? (
                          <p className="mt-2 text-xs text-orange-600 flex items-start bg-orange-50 p-2 rounded-lg">
                            <ShieldAlert size={14} className="mr-1.5 mt-0.5 shrink-0" />
                            Barang ini sensitif. Wajib deskripsi detail (min. 10 karakter) untuk membuktikan kepemilikan.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-gray-500">
                            Untuk barang umum, deskripsi detail bersifat opsional namun membantu verifikasi.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => navigate('/')}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-[2] bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Mengirim...
                            </>
                          ) : 'Ajukan Klaim Sekarang'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ClaimItem;