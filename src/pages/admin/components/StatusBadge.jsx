// src/pages/admin/components/StatusBadge.jsx

export default function StatusBadge({ status, type = 'default' }) {
  // Status styling configurations
  const styles = {
    // Claim statuses
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    verified: 'bg-blue-100 text-blue-800 border-blue-200',
    
    // Item statuses
    available: 'bg-green-100 text-green-800 border-green-200',
    claimed: 'bg-gray-100 text-gray-800 border-gray-200',
    
    // Security statuses
    secure: 'bg-purple-100 text-purple-800 border-purple-200',
    blurred: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    
    // Default
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  // Status text transformations
  const labels = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    verified: 'Terverifikasi',
    available: 'Tersedia',
    claimed: 'Diklaim',
    secure: 'Sensitif',
    blurred: 'Terblur'
  };

  const statusKey = status?.toLowerCase() || 'default';
  const styleClass = styles[statusKey] || styles.default;
  const label = labels[statusKey] || status || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}>
      {label}
    </span>
  );
}