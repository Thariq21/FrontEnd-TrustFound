// src/utils/helpers.js

// Fungsi sentral untuk men-generate URL gambar
export const getImageUrl = (path, forceUnblur = false) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  
  // Jika path sudah berupa URL lengkap
  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://api.thrqrhmn.my.id';
  
  // 1. Bersihkan path dari 'public/' di awal string jika ada
  let cleanPath = path.replace(/^public\//, ''); // Menghapus 'public/' di awal
  
  // 2. Jika forceUnblur, hapus prefix 'blur-' jika ada
  if (forceUnblur) {
    cleanPath = cleanPath.replace(/\/blur-/g, '/');
  }
  
  // 3. Pastikan diawali dengan slash
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // 4. Gabungkan dengan Base URL
  return `${baseUrl}${cleanPath}`;
};

// Get blurred version URL
export const getBlurredImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://api.thrqrhmn.my.id';
  
  // Bersihkan path
  let cleanPath = path.replace(/^public\//, '');
  
  // Jika belum ada prefix 'blur-', tambahkan
  if (!cleanPath.includes('/blur-')) {
    // Pisahkan path dan filename
    const lastSlashIndex = cleanPath.lastIndexOf('/');
    const directory = cleanPath.substring(0, lastSlashIndex);
    const filename = cleanPath.substring(lastSlashIndex + 1);
    
    cleanPath = `${directory}/blur-${filename}`;
  }
  
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

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

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format status untuk display
export const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    secured: 'Secured',
    claimed: 'Claimed',
    verified: 'Verified',
    rejected: 'Rejected',
    approved: 'Approved'
  };
  
  return statusMap[status?.toLowerCase()] || status;
};

// Get status color class
export const getStatusColor = (status) => {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    secured: 'bg-green-100 text-green-800 border-green-200',
    claimed: 'bg-gray-100 text-gray-800 border-gray-200',
    verified: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    approved: 'bg-green-100 text-green-800 border-green-200'
  };
  
  return colorMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Truncate text
export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};