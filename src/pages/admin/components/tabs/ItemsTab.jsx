// src/pages/admin/components/tabs/ItemsTab.jsx
import { Shield, Eye, MapPin, Calendar, User, UserCog, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl, getBlurredImageUrl, formatDate } from '../../../../utils/helpers';
import { useState, useEffect } from 'react';

export default function ItemsTab({ items, loading, onBlur, onUnblur, onSecure, onRefresh }) {
  const [previewBlurred, setPreviewBlurred] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const togglePreview = (itemId) => {
    setPreviewBlurred(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Render buttons based on status and is_sensitive
  const renderActionButtons = (item) => {
    // Jika status claimed, tidak ada button
    if (item.status === 'claimed') {
      return (
        <div className="text-sm text-gray-500 italic">
          Barang sudah diklaim
        </div>
      );
    }

    // Jika status pending, tampilkan 2 button: Secure & Blur + Secure & Unblur
    if (item.status === 'pending') {
      return (
        <div className="flex flex-col space-y-2">
          <button
            onClick={async () => {
              const success = await onSecure(item.item_id);
              if (success) onRefresh();
            }}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <Shield className="h-4 w-4 mr-2" />
            Secure & Blur
          </button>
          
          <button
            onClick={async () => {
              const success = await onUnblur(item.item_id);
              if (success) onRefresh();
            }}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Shield className="h-4 w-4 mr-2" />
            Secure & Unblur
          </button>
        </div>
      );
    }

    // Jika status secured
    if (item.status === 'secured') {
      // Jika is_sensitive = 1 (blur), tampilkan button "Ubah ke Umum (Unblur)"
      if (item.is_sensitive === 1) {
        return (
          <button
            onClick={async () => {
              const success = await onUnblur(item.item_id);
              if (success) onRefresh();
            }}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ubah ke Umum (Unblur)
          </button>
        );
      }
      
      // Jika is_sensitive = 0 (normal), tampilkan button "Ubah ke Sensitif (Blur)"
      return (
        <button
          onClick={async () => {
            const success = await onBlur(item.item_id);
            if (success) onRefresh();
          }}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <Shield className="h-4 w-4 mr-2" />
          Ubah ke Sensitif (Blur)
        </button>
      );
    }

    return null;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      secured: 'bg-green-100 text-green-800 border-green-200',
      claimed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      pending: 'Pending',
      secured: 'Secured',
      claimed: 'Claimed'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Sensitive badge component
  const SensitiveBadge = ({ isSensitive }) => {
    if (!isSensitive) return null;
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
        Sensitif
      </span>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-800">
          Total <span className="font-semibold">{items.length}</span> items terdaftar
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada item yang dilaporkan</p>
        </div>
      ) : (
        <>
          {/* Items Cards */}
          {currentItems.map((item) => (
            <div
              key={item.item_id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Image with Preview Toggle */}
                <div className="flex-shrink-0 relative mx-auto md:mx-0">
                  <div className="relative">
                    <img
                      src={
                        previewBlurred[item.item_id] 
                          ? getBlurredImageUrl(item.image_path) 
                          : getImageUrl(item.image_path, true) // Force unblur for admin
                      }
                      alt={item.name}
                      className="h-40 w-40 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                    
                    {/* Sensitive Badge Overlay */}
                    {item.is_sensitive === 1 && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Sensitif</span>
                      </div>
                    )}

                    {/* Preview Mode Badge */}
                    {previewBlurred[item.item_id] && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Publik View
                      </div>
                    )}
                  </div>

                  {/* Toggle Preview Button (only for sensitive items) */}
                  {item.is_sensitive === 1 && (
                    <button
                      onClick={() => togglePreview(item.item_id)}
                      className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1 py-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      {previewBlurred[item.item_id] ? (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Lihat Original</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Preview Blur</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3 sm:gap-0">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.category_name || 'Kategori tidak tersedia'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={item.status} />
                      <SensitiveBadge isSensitive={item.is_sensitive} />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{item.found_location || '-'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(item.found_date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        <strong>Pelapor:</strong> {item.finder_name || 'N/A'} 
                        {item.finder_nim && <span className="text-gray-500 ml-1">({item.finder_nim})</span>}
                      </span>
                    </div>

                    {item.manage_admin_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserCog className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          <strong>Managed by:</strong> {item.manage_admin_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Status Info */}
                  {item.status === 'secured' && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                      <p className="text-xs text-blue-700 flex items-center">
                        <Eye className="h-3 w-3 inline mr-1" />
                        <strong>Status:</strong>&nbsp;
                        {item.is_sensitive === 1 ? (
                          <>
                            Sensitif (Publik: <span className="font-semibold">Blur</span>)
                          </>
                        ) : (
                          <>
                            Umum (Publik: <span className="font-semibold">Jelas</span>)
                          </>
                        )}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Admin selalu melihat gambar asli untuk verifikasi
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 w-full md:w-64 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {renderActionButtons(item)}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border border-gray-200 flex items-center justify-between bg-white rounded-lg shadow-sm">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai <span className="font-medium">{Math.min(startIndex + itemsPerPage, items.length)}</span> dari <span className="font-medium">{items.length}</span> items
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                            ${currentPage === pageNum 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Mobile Pagination */}
              <div className="flex items-center justify-between w-full sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 font-medium">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}