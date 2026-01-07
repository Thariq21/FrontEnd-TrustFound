// src/pages/admin/hooks/useClaimActions.js
import { useState } from 'react';
import api from '../../../services/api';

export const useClaimActions = () => {
  const [processing, setProcessing] = useState(false);

  // Approve claim (setujui)
  const handleApprove = async (claimId) => {
    if (!window.confirm('Yakin ingin menyetujui klaim ini?')) return false;
    
    try {
      setProcessing(true);
      await api.put(`/admin/claims/${claimId}/process`, {
        status: 'verified',  // atau 'approved' sesuai backend
        notes: 'Klaim disetujui oleh admin'
      });
      alert('Klaim berhasil disetujui! User akan diberitahu.');
      return true;
    } catch (error) {
      console.error('Error approving claim:', error);
      alert(error.response?.data?.message || 'Gagal menyetujui klaim');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Reject claim (tolak)
  const handleReject = async (claimId, reason = '') => {
    const rejectReason = reason || window.prompt('Alasan penolakan (opsional):');
    
    if (!window.confirm('Yakin ingin menolak klaim ini?')) return false;
    
    try {
      setProcessing(true);
      await api.put(`/admin/claims/${claimId}/process`, {
        status: 'rejected',
        notes: rejectReason || 'Tidak sesuai dengan kriteria verifikasi'
      });
      alert('Klaim berhasil ditolak');
      return true;
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert(error.response?.data?.message || 'Gagal menolak klaim');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Review claim details (optional - untuk modal)
  const handleReview = async (claimId) => {
    try {
      const response = await api.get(`/admin/claims/${claimId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching claim details:', error);
      alert('Gagal memuat detail klaim');
      return null;
    }
  };

  return {
    handleApprove,
    handleReject,
    handleReview,
    processing
  };
};