import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../../services/api';

const UploadItem = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    found_location: '',
    found_date: new Date().toISOString().split('T')[0], // Default hari ini
    description: '',
    image: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat kategori');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPG/PNG)');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setError('Foto barang wajib diupload sebagai bukti.');
      return;
    }

    if (!formData.category_id) {
      setError('Kategori wajib dipilih');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('image', formData.image);
      submitData.append('name', formData.name);
      submitData.append('category_id', formData.category_id);
      submitData.append('found_location', formData.found_location);
      submitData.append('found_date', formData.found_date);
      submitData.append('description', formData.description);

      await api.post('/items', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Laporan berhasil dikirim! Terima kasih atas kejujuran Anda.');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal melaporkan barang. Cek koneksi atau coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-600 px-8 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8 opacity-80" />
              Lapor Temuan
            </h1>
            <p className="text-blue-100 mt-2">
              Bantu teman Anda menemukan barangnya kembali.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Kiri: Upload Foto */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">
                        Foto Barang <span className="text-red-500">*</span>
                    </label>
                    
                    <div 
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all h-64 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${
                            imagePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                    >
                        {imagePreview ? (
                            <>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium">Ganti Foto</p>
                                </div>
                            </>
                        ) : (
                            <div className="pointer-events-none">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                                    <ImageIcon size={32} />
                                </div>
                                <p className="text-gray-600 font-medium">Klik untuk upload foto</p>
                                <p className="text-xs text-gray-400 mt-1">Maks. 5MB (JPG/PNG)</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                            <strong>Privasi Terjaga:</strong> Jika barang mengandung data pribadi (KTP, Dompet), sistem akan otomatis memburamkan foto di halaman publik.
                        </p>
                    </div>
                </div>

                {/* Kolom Kanan: Form Data */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Barang</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Contoh: Dompet Kulit Coklat"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Ditemukan</label>
                        <input
                            type="text"
                            name="found_location"
                            value={formData.found_location}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Contoh: Kantin Gedung B"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                        <input
                            type="date"
                            name="found_date"
                            value={formData.found_date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Tambahan</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ceritakan kondisi barang atau di mana tepatnya Anda menitipkannya (misal: di Pos Satpam Utama)..."
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadItem;