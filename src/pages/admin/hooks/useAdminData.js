// src/pages/admin/hooks/useAdminData.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

export const useAdminData = () => {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [logs, setLogs] = useState([]);
  const [claimStatus, setClaimStatus] = useState('all'); // Default: all untuk melihat semua
  const [logAction, setLogAction] = useState('all'); // Filter for logs
  const [loading, setLoading] = useState({
    items: true,
    claims: true,
    logs: true
  });
  const [error, setError] = useState(null);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, items: true }));
      setError(null);
      const response = await api.get('/admin/items');
      setItems(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Gagal memuat data items');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  }, []);

  // Fetch Claims with filter
  const fetchClaims = useCallback(async (status = claimStatus) => {
    try {
      setLoading(prev => ({ ...prev, claims: true }));
      setError(null);
      
      // Build query params - ALWAYS send status parameter
      const params = `?status=${status || 'all'}`;
      
      console.log('🔍 Fetching claims with params:', params);
      
      const response = await api.get(`/admin/claims${params}`);
      const claimsData = response.data.data || response.data;
      
      console.log('✅ Claims received:', claimsData.length, 'items');
      console.log('📋 Claims data:', claimsData);
      
      setClaims(claimsData);
    } catch (err) {
      console.error('❌ Error fetching claims:', err);
      setError('Gagal memuat data claims');
    } finally {
      setLoading(prev => ({ ...prev, claims: false }));
    }
  }, [claimStatus]);

  // Fetch Activity Logs with filter
  const fetchLogs = useCallback(async (action = logAction) => {
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      setError(null);
      
      // Build query params - send action filter if not 'all'
      const params = action && action !== 'all' ? `?action=${action}` : '';
      
      console.log('🔍 Fetching logs with params:', params);
      
      const response = await api.get(`/admin/logs${params}`);
      const logsData = response.data.data || response.data;
      
      console.log('✅ Logs received:', logsData.length, 'items');
      
      setLogs(logsData);
    } catch (err) {
      console.error('❌ Error fetching logs:', err);
      setError('Gagal memuat activity logs');
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  }, [logAction]);

  // Fetch all data on mount
  useEffect(() => {
    fetchItems();
    fetchClaims();
    fetchLogs();
  }, [fetchItems, fetchClaims, fetchLogs]);

  // Re-fetch claims when filter changes
  useEffect(() => {
    fetchClaims(claimStatus);
  }, [claimStatus, fetchClaims]);

  // Re-fetch logs when filter changes
  useEffect(() => {
    fetchLogs(logAction);
  }, [logAction, fetchLogs]);

  // Refresh all data
  const refreshAll = useCallback(() => {
    fetchItems();
    fetchClaims();
    fetchLogs();
  }, [fetchItems, fetchClaims, fetchLogs]);

  // Change claim filter
  const setClaimFilter = useCallback((status) => {
    setClaimStatus(status);
  }, []);

  // Change log filter
  const setLogFilter = useCallback((action) => {
    setLogAction(action);
  }, []);

  return {
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
  };
};