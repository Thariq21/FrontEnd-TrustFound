import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, FileText, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const UploadItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    found_location: '',
    found_date: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cek role user
  const userRole = localStorage.getItem('role');
  // Pastikan role lowercase untuk konsistensi
  const isAdmin = userRole === 'admin' || userRole === 'satpam';

  // Load categories saat component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Load categories error:', err);
      setError('Gagal memuat kategori. Silakan refresh halaman.');
    }
  };

  // Handle input text change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format gambar tidak valid. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Ukuran gambar maksimal 5MB.');
      return;
    }

    setImageFile(file);
    
    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi form
    if (!formData.item_name.trim()) {
      setError('Nama barang harus diisi.');
      return;
    }
    if (!formData.category_id) {
      setError('Kategori harus dipilih.');
      return;
    }
    if (!formData.found_location.trim()) {
      setError('Lokasi penemuan harus diisi.');
      return;
    }
    if (!formData.found_date) {
      setError('Tanggal penemuan harus diisi.');
      return;
    }
    if (!imageFile) {
      setError('Foto barang harus diupload.');
      return;
    }

    // Validasi deskripsi untuk kategori sensitif (Skip validasi ini untuk Admin)
    if (!isAdmin) {
      const sensitiveCategories = ['Dompet / Tas / Identitas Pribadi', 'Elektronik (HP, Laptop, Tab, Earphone)'];
      const selectedCategory = categories.find(cat => cat.category_id === parseInt(formData.category_id));
      
      if (selectedCategory && sensitiveCategories.includes(selectedCategory.name)) {
        if (!formData.description || formData.description.trim().length < 10) {
          setError('Untuk barang sensitif, deskripsi minimal 10 karakter.');
          return;
        }
      }
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.item_name.trim());
      submitData.append('description', formData.description.trim() || '-');
      submitData.append('found_location', formData.found_location.trim());
      submitData.append('found_date', formData.found_date);
      
      const categoryId = parseInt(formData.category_id);
      if (isNaN(categoryId)) {
        setError('Category ID tidak valid.');
        setLoading(false);
        return;
      }
      submitData.append('category_id', categoryId.toString());
      
      submitData.append('image', imageFile, imageFile.name);

      // --- LOGIKA UTAMA: Tentukan Endpoint berdasarkan Role ---
      // Jika Admin/Satpam -> /admin/items (Otomatis Secured)
      // Jika User Biasa -> /items (Status Pending)
      const endpoint = isAdmin ? '/admin/items' : '/items';

      // Kirim ke backend
      await api.post(endpoint, submitData, {
        headers: {
          'Content-Type': undefined // Biarkan browser set multipart/form-data boundary
        }
      });

      const successMsg = isAdmin 
        ? 'Barang berhasil diamankan (Secured) di sistem.' 
        : 'Barang berhasil dilaporkan! Terima kasih atas kejujuran Anda.';
      
      setSuccess(`${successMsg} Mengalihkan...`);
      
      // Reset form
      setFormData({
        item_name: '',
        category_id: '',
        found_location: '',
        found_date: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview('');

      // Redirect Logic
      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMsg = 'Gagal upload barang.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
        // Handle validation errors array dari express-validator
        if (err.response.data.errors) {
          const errorDetails = err.response.data.errors;
          if (Array.isArray(errorDetails)) {
             const details = errorDetails.map(e => e.msg).join(', ');
             if (details) errorMsg += `: ${details}`;
          }
        }
      } else if (err.response?.status === 400) {
        errorMsg = 'Data yang dikirim tidak valid. Periksa kembali input Anda.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Sesi habis. Silakan login kembali.';
      } else if (err.response?.status === 403) {
        errorMsg = 'Anda tidak memiliki izin untuk melakukan aksi ini.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Terjadi kesalahan di server. Mohon coba lagi nanti.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Lapor & Amankan Barang' : 'Lapor Barang Temuan'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isAdmin 
              ? 'Input barang yang ditemukan dan langsung diamankan di pos (Status: Secured).' 
              : 'Bantu teman Anda menemukan barangnya kembali.'}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Catatan Sistem:</p>
              {isAdmin ? (
                <p>Sebagai Admin/Satpam, barang ini akan otomatis ditandai <strong>Secured</strong>. Foto barang sensitif tetap akan di-blur untuk publik.</p>
              ) : (
                <p>Jika barang mengandung data pribadi (KTP, Dompet), sistem akan otomatis memblur foto di halaman publik demi privasi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Berhasil!</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Barang <span className="text-red-500">*</span>
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP (Max. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="item_name"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              placeholder="Contoh: Dompet Kulit Coklat"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
              {/* Fallback jika kategori kosong (opsional, jika API belum siap) */}
              {categories.length === 0 && (
                <>
                  <option value="1">Elektronik (HP, Laptop, Tab, Earphone)</option>
                  <option value="2">Dompet / Tas / Identitas Pribadi</option>
                  <option value="3">Umum (Tumbler, Buku, Jaket, dll)</option>
                  <option value="4">Charger Elektronik</option>
                </>
              )}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="found_location" className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Ditemukan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="found_location"
                name="found_location"
                value={formData.found_location}
                onChange={handleChange}
                placeholder="Contoh: Perpustakaan Lantai 2"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="found_date" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Ditemukan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                id="found_date"
                name="found_date"
                value={formData.found_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Tambahan
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder={isAdmin ? "Catatan internal atau deskripsi tambahan (Opsional)" : "Deskripsi barang (wajib untuk barang sensitif, minimal 10 karakter)"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            {!isAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                *Wajib diisi minimal 10 karakter untuk barang sensitif (Dompet, HP, dll)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => isAdmin ? navigate('/admin/dashboard') : navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {isAdmin ? 'Simpan & Amankan' : 'Lapor Barang'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadItem;