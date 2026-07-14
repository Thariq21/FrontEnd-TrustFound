// src/pages/admin/hooks/useItemActions.js
import { useState } from 'react';
import api from '../../../services/api';

export const useItemActions = () => {
  const [processing, setProcessing] = useState(false);

  const isSensitiveCategory = (categoryId) => {
    // Kategori 1 dan 2 direkomendasikan Blur (Sensitif)
    return categoryId === 1 || categoryId === 2;
  };

  // Secure & Blur (untuk pending items) -> set secured + is_sensitive=true
  const handleSecure = async (item) => {
    if (!isSensitiveCategory(item.category_id)) {
      // Tidak sensitif tapi mau di blur
      const confirm1 = window.confirm(`Peringatan: Kategori "${item.category_name}" direkomendasikan untuk UNBLUR (Tidak Sensitif).\n\nLangkah 1: Lanjutkan untuk BLUR?`);
      if (!confirm1) return false;
      const confirm2 = window.confirm(`Langkah 2: Apakah Anda benar-benar yakin ingin menyensor (BLUR) barang ini?`);
      if (!confirm2) return false;
    } else {
      if (!window.confirm('Yakin ingin mengamankan (Secure) & menyensor (Blur) item ini?')) return false;
    }
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${item.item_id}/secure`, {
        is_sensitive: true
      });
      alert('Item berhasil di-secure & blur');
      return true;
    } catch (error) {
      console.error('Error securing item:', error);
      alert(error.response?.data?.message || 'Gagal secure item');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Blur item (set is_sensitive = true)
  const handleBlur = async (item) => {
    if (!isSensitiveCategory(item.category_id)) {
      const confirm1 = window.confirm(`Peringatan: Kategori "${item.category_name}" direkomendasikan untuk UNBLUR (Tidak Sensitif).\n\nLangkah 1: Lanjutkan untuk BLUR?`);
      if (!confirm1) return false;
      const confirm2 = window.confirm(`Langkah 2: Apakah Anda benar-benar yakin ingin menyensor (BLUR) barang ini?`);
      if (!confirm2) return false;
    } else {
      if (!window.confirm('Yakin ingin ubah ke sensitif (blur)?')) return false;
    }
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${item.item_id}/secure`, {
        is_sensitive: true
      });
      alert('Item berhasil diubah ke sensitif (blur)');
      return true;
    } catch (error) {
      console.error('Error blurring item:', error);
      alert(error.response?.data?.message || 'Gagal blur gambar');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Unblur item (set is_sensitive = false)
  const handleUnblur = async (item) => {
    if (isSensitiveCategory(item.category_id)) {
      // Sensitif tapi mau di unblur
      const confirm1 = window.confirm(`Peringatan: Kategori "${item.category_name}" bersifat SENSITIF dan direkomendasikan untuk BLUR.\n\nLangkah 1: Lanjutkan untuk UNBLUR (Dilihat Publik)?`);
      if (!confirm1) return false;
      const confirm2 = window.confirm(`Langkah 2: Apakah Anda yakin barang ini aman untuk ditampilkan secara JELAS ke publik?`);
      if (!confirm2) return false;
    } else {
      if (!window.confirm('Yakin ingin ubah ke umum (unblur)?')) return false;
    }
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${item.item_id}/secure`, {
        is_sensitive: false
      });
      alert('Item berhasil diubah ke umum (unblur)');
      return true;
    } catch (error) {
      console.error('Error unblurring item:', error);
      alert(error.response?.data?.message || 'Gagal unblur gambar');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Delete item (optional - jika API mendukung)
  const handleDelete = async (itemId) => {
    if (!window.confirm('Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan!')) return false;
    
    try {
      setProcessing(true);
      await api.delete(`/admin/items/${itemId}`);
      alert('Item berhasil dihapus');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error.response?.data?.message || 'Gagal menghapus item');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    handleSecure,    // Untuk pending: Secure & Blur
    handleBlur,      // Untuk secured: Ubah ke Sensitif
    handleUnblur,    // Untuk pending: Secure & Unblur / Untuk secured: Ubah ke Umum
    handleDelete,
    processing
  };
};