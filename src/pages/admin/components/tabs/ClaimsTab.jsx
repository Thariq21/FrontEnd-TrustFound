// src/pages/admin/components/tabs/ClaimsTab.jsx
import { Check, X, Clock, User, Calendar, MessageSquare } from 'lucide-react';
import { getImageUrl, formatDate, formatDateTime } from '../../../../utils/helpers';

export default function ClaimsTab({ claims, loading, onApprove, onReject, onRefresh, statusFilter, onFilterChange }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      verified: 'bg-blue-100 text-blue-800 border-blue-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    const labels = {
      pending: 'Pending',
      verified: 'Verified',
      rejected: 'Rejected'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${styles[status] || styles.pending}`}>
        {status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
        {status === 'verified' && <Check className="h-4 w-4 mr-1" />}
        {status === 'rejected' && <X className="h-4 w-4 mr-1" />}
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter || 'all'}
            onChange={(e) => {
              console.log('🔄 Filter changed to:', e.target.value);
              onFilterChange && onFilterChange(e.target.value);
            }}
            className="block w-56 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All (Semua History)</option>
            <option value="pending">Pending (Perlu Diproses)</option>
            <option value="verified">Verified (Disetujui)</option>
            <option value="rejected">Rejected (Ditolak)</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{claims.length}</span> klaim
        </div>
      </div>

      {/* No Data */}
      {claims.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">
            {statusFilter === 'pending' && 'Belum ada klaim yang perlu diproses'}
            {statusFilter === 'verified' && 'Belum ada klaim yang disetujui'}
            {statusFilter === 'rejected' && 'Belum ada klaim yang ditolak'}
            {statusFilter === 'all' && 'Belum ada klaim yang masuk'}
          </p>
        </div>
      )}

      {/* Claims Cards */}
      {claims.map((claim) => (
        <div
          key={claim.claim_id}
          className={`
            bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md
            ${claim.status === 'pending' && 'border-yellow-200 bg-yellow-50'}
            ${claim.status === 'verified' && 'border-blue-200'}
            ${claim.status === 'rejected' && 'border-red-200 bg-red-50'}
          `}
        >
          <div className="flex items-start space-x-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(claim.image_path, true)}
                alt={claim.item_name}
                className="h-44 w-44 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x400?text=No+Image';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {claim.item_name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 space-x-3">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Klaim oleh: <strong className="ml-1">{claim.claimer_name}</strong>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>NIM: {claim.claimer_nim}</span>
                  </div>
                </div>
                
                <StatusBadge status={claim.status} />
              </div>

              {/* Challenge Answer */}
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  JAWABAN CHALLENGE
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {claim.challange_answer}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Diklaim pada: <strong>{formatDate(claim.create_at)}</strong></span>
                </div>
              </div>

              {/* Additional Info for Verified/Rejected */}
              {claim.status === 'verified' && claim.processed_at && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-blue-700 flex items-center">
                    <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      Diverifikasi oleh <strong>NIP {claim.validator_nip}</strong> pada {formatDateTime(claim.processed_at)}
                    </span>
                  </p>
                </div>
              )}

              {claim.status === 'rejected' && claim.processed_at && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-red-700 flex items-center">
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      Ditolak oleh <strong>NIP {claim.validator_nip}</strong> pada {formatDateTime(claim.processed_at)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 w-48">
              {claim.status === 'pending' && (
                <div className="flex flex-col space-y-3">
                  {/* Approve Button */}
                  <button
                    onClick={async () => {
                      const success = await onApprove(claim.claim_id);
                      if (success) onRefresh();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Setujui
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={async () => {
                      const success = await onReject(claim.claim_id);
                      if (success) onRefresh();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Tolak
                  </button>
                </div>
              )}

              {/* No action for verified/rejected */}
              {claim.status !== 'pending' && (
                <div className="text-center text-sm text-gray-500 italic">
                  Klaim sudah diproses
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}