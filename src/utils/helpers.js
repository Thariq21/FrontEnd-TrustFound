// Fungsi sentral untuk men-generate URL gambar
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  
  // Jika path sudah berupa URL lengkap
  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://api.thrqrhmn.my.id';
  
  // 1. Bersihkan path dari 'public/' di awal string jika ada
  let cleanPath = path.replace(/^public\//, ''); // Menghapus 'public/' di awal
  
  // 2. Pastikan diawali dengan slash
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // 3. Gabungkan dengan Base URL
  return `${baseUrl}${cleanPath}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};