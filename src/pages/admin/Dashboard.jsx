// src/pages/admin/Dashboard.jsx
import { useState } from 'react';
import { Package, FileText, Activity } from 'lucide-react';

// Hooks
import { useAdminData } from './hooks/useAdminData';
import { useItemActions } from './hooks/useItemActions';
import { useClaimActions } from './hooks/useClaimActions';

// Components
import DashboardHeader from './components/DashboardHeader';
import ItemsTab from './components/tabs/ItemsTab';
import ClaimsTab from './components/tabs/ClaimsTab';
import LogsTab from './components/tabs/LogsTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('items');

  // Custom hooks untuk data & actions
  const {
    items,
    claims,
    logs,
    loading,
    error,
    claimStatus,
    logAction,
    setClaimFilter,
    setLogFilter,
    fetchItems,
    fetchClaims,
    fetchLogs,
    refreshAll
  } = useAdminData();

  const {
    handleBlur,
    handleUnblur,
    handleSecure,
    handleDelete,
    processing: itemProcessing
  } = useItemActions();

  const {
    handleApprove,
    handleReject,
    processing: claimProcessing
  } = useClaimActions();

  // Tab configuration
  const tabs = [
    {
      id: 'items',
      label: 'Manage Items',
      icon: Package,
      count: items.length
    },
    {
      id: 'claims',
      label: 'Manage Claims',
      icon: FileText,
      count: claims.filter(c => c.status === 'pending').length,
      badge: claims.filter(c => c.status === 'pending').length > 0
    },
    {
      id: 'logs',
      label: 'Activity Logs',
      icon: Activity,
      count: logs.length
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader onRefresh={refreshAll} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center
                      hover:bg-gray-50 focus:z-10 transition-colors
                      ${isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                      
                      {/* Count Badge */}
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {tab.count}
                      </span>

                      {/* Notification Badge */}
                      {tab.badge && (
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'items' && (
              <ItemsTab
                items={items}
                loading={loading.items}
                onBlur={handleBlur}
                onUnblur={handleUnblur}
                onSecure={handleSecure}
                onDelete={handleDelete}
                onRefresh={fetchItems}
              />
            )}

            {activeTab === 'claims' && (
              <ClaimsTab
                claims={claims}
                loading={loading.claims}
                onApprove={handleApprove}
                onReject={handleReject}
                onRefresh={fetchClaims}
                statusFilter={claimStatus}
                onFilterChange={setClaimFilter}
              />
            )}

            {activeTab === 'logs' && (
              <LogsTab
                logs={logs}
                loading={loading.logs}
                actionFilter={logAction}
                onFilterChange={setLogFilter}
              />
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {(itemProcessing || claimProcessing) && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}