// src/pages/admin/hooks/useItemActions.js
import { useState } from 'react';
import api from '../../../services/api';

export const useItemActions = () => {
  const [processing, setProcessing] = useState(false);

  // Secure & Blur (untuk pending items) -> set secured + is_sensitive=true
  const handleSecure = async (itemId) => {
    if (!window.confirm('Yakin ingin secure & blur item ini?')) return false;
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${itemId}/secure`, {
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
  const handleBlur = async (itemId) => {
    if (!window.confirm('Yakin ingin ubah ke sensitif (blur)?')) return false;
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${itemId}/secure`, {
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
  const handleUnblur = async (itemId) => {
    if (!window.confirm('Yakin ingin ubah ke umum (unblur)?')) return false;
    
    try {
      setProcessing(true);
      await api.put(`/admin/items/${itemId}/secure`, {
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