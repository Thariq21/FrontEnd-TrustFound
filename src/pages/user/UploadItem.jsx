import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
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
    found_date: '',
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
      setError('Gagal memuat kategori');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
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
      setError('Foto barang wajib diupload');
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

      setSuccess('Barang berhasil dilaporkan! Redirecting...');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melaporkan barang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Upload className="mr-3" size={32} />
              Lapor Barang Temuan
            </h1>
            <p className="text-blue-100 mt-2">Laporkan barang yang Anda temukan di kampus</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Barang <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Hapus Foto
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-600">Klik untuk upload foto</span>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG hingga 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Catatan: Jika barang termasuk kategori sensitif, foto akan otomatis diblur oleh sistem
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Dompet Coklat"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Ditemukan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="found_location"
                value={formData.found_location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Gedung A Lantai 3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Ditemukan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="found_date"
                value={formData.found_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Detail
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ceritakan kondisi barang dan informasi tambahan lainnya..."
              />
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
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Laporkan Barang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadItem;
