// src/pages/admin/components/tabs/LogsTab.jsx
import { useState, useEffect } from 'react';
import { Activity, LogIn, Shield, FileText, CheckCircle, XCircle, Eye, Globe, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../../../../utils/helpers';

export default function LogsTab({ logs, loading, actionFilter, onFilterChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page to 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, logs.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get action icon
  const getActionIcon = (action) => {
    const iconClass = "h-5 w-5";
    
    switch (action?.toUpperCase()) {
      case 'LOGIN':
        return <LogIn className={`${iconClass} text-blue-600`} />;
      case 'SECURE_ITEM':
        return <Shield className={`${iconClass} text-green-600`} />;
      case 'UNSECURE_ITEM':
        return <Shield className={`${iconClass} text-orange-600`} />;
      case 'BLUR_ITEM':
        return <Eye className={`${iconClass} text-purple-600`} />;
      case 'UNBLUR_ITEM':
        return <Eye className={`${iconClass} text-blue-600`} />;
      case 'APPROVE_CLAIM':
      case 'VERIFY_CLAIM':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'REJECT_CLAIM':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'CREATE_ITEM':
      case 'UPLOAD_ITEM':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'CLAIM_ITEM':
        return <FileText className={`${iconClass} text-yellow-600`} />;
      default:
        return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };

  // Get action badge color
  const getActionBadge = (action) => {
    const classes = {
      LOGIN: 'bg-blue-100 text-blue-800',
      SECURE_ITEM: 'bg-green-100 text-green-800',
      UNSECURE_ITEM: 'bg-orange-100 text-orange-800',
      BLUR_ITEM: 'bg-purple-100 text-purple-800',
      UNBLUR_ITEM: 'bg-blue-100 text-blue-800',
      APPROVE_CLAIM: 'bg-green-100 text-green-800',
      VERIFY_CLAIM: 'bg-green-100 text-green-800',
      REJECT_CLAIM: 'bg-red-100 text-red-800',
      CREATE_ITEM: 'bg-blue-100 text-blue-800',
      UPLOAD_ITEM: 'bg-blue-100 text-blue-800',
      CLAIM_ITEM: 'bg-yellow-100 text-yellow-800'
    };
    
    return classes[action?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  // Calculate summary stats
  const stats = {
    total: logs.length,
    approved: logs.filter(log => ['APPROVE_CLAIM', 'VERIFY_CLAIM'].includes(log.action?.toUpperCase())).length,
    rejected: logs.filter(log => log.action?.toUpperCase() === 'REJECT_CLAIM').length,
    blurActions: logs.filter(log => ['BLUR_ITEM', 'UNBLUR_ITEM', 'SECURE_ITEM'].includes(log.action?.toUpperCase())).length
  };

  // Pagination logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Aktivitas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Activity className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disetujui</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ditolak</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Blur/Unblur</p>
              <p className="text-3xl font-bold text-orange-600">{stats.blurActions}</p>
            </div>
            <Eye className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label htmlFor="action-filter" className="text-sm font-medium text-gray-700">
              Filter Aksi:
            </label>
            <select
              id="action-filter"
              value={actionFilter || 'all'}
              onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
              className="block w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="LOGIN">Login</option>
              <option value="SECURE_ITEM">Secure Item</option>
              <option value="BLUR_ITEM">Blur/Unblur Item</option>
              <option value="CLAIM_ITEM">Claim Item</option>
              <option value="APPROVE_CLAIM">Approve Claim</option>
              <option value="REJECT_CLAIM">Reject Claim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Tidak ada aktivitas untuk filter ini</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {currentLogs.map((log, index) => (
                <div key={log._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-3 bg-gray-100 rounded-full">
                        {getActionIcon(log.action)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
                              {log.action || 'UNKNOWN'}
                            </span>
                            <span className="text-sm text-gray-600">
                              by <strong className="text-gray-900">{log.actor?.name || 'System'}</strong>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Role: {log.actor?.role || 'N/A'} • ID: {log.actor?.id || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="text-left sm:text-right mt-2 sm:mt-0">
                          <p className="text-sm text-gray-900 font-medium">
                            {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        {/* Target Info */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Target Info
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-start">
                              <span className="text-xs text-gray-600 w-16">Entity:</span>
                              <span className="text-xs font-medium text-gray-900">{log.target?.entity || '-'}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-xs text-gray-600 w-16">ID:</span>
                              <span className="text-xs font-medium text-gray-900">{log.target?.entityId || '-'}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-xs text-gray-600 w-16">Details:</span>
                              <span className="text-xs text-gray-700 italic">"{log.target?.details || '-'}"</span>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                            Metadata
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 text-blue-600 mr-2" />
                              <span className="text-xs text-gray-700">
                                {log.metadata?.ip_address || '-'}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <Monitor className="h-3 w-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700 line-clamp-2">
                                {log.metadata?.user_agent || '-'}
                              </span>
                            </div>
                            {log.metadata?.is_sensitive_change !== undefined && (
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 text-blue-600 mr-2" />
                                <span className="text-xs text-gray-700">
                                  Sensitive: {log.metadata.is_sensitive_change ? 'Yes' : 'No'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai <span className="font-medium">{Math.min(startIndex + itemsPerPage, logs.length)}</span> dari <span className="font-medium">{logs.length}</span> aktivitas
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
    </div>
  );
}