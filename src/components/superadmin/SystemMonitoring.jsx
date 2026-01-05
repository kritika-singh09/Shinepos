import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    fetchHealthHistory();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await axios.get('/api/system/health');
      setSystemHealth(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system health:', error);
      setLoading(false);
    }
  };

  const fetchHealthHistory = async () => {
    try {
      const response = await axios.get('/api/system/health/history?hours=24');
      setHealthHistory(response.data.healthHistory);
    } catch (error) {
      console.error('Error fetching health history:', error);
    }
  };

  const formatBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading system health...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">System Monitoring</h2>
        <p className="text-slate-600 text-sm lg:text-base">Real-time system health and performance metrics</p>
      </div>
      
      {/* Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium">Server Status</p>
            <p className="text-2xl font-bold mb-1">Online</p>
            <p className="text-emerald-100 text-xs">Uptime: {formatUptime(systemHealth?.serverStatus?.uptime || 0)}</p>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 text-white ${
          systemHealth?.databaseStatus?.connected 
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
            : 'bg-gradient-to-br from-rose-500 to-rose-600'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`rounded-full p-3 ${
              systemHealth?.databaseStatus?.connected 
                ? 'bg-indigo-400 bg-opacity-30' 
                : 'bg-rose-400 bg-opacity-30'
            }`}>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              systemHealth?.databaseStatus?.connected 
                ? 'bg-indigo-300 animate-pulse' 
                : 'bg-rose-300'
            }`}></div>
          </div>
          <div>
            <p className={systemHealth?.databaseStatus?.connected ? 'text-indigo-100' : 'text-rose-100'} className="text-sm font-medium">Database</p>
            <p className="text-2xl font-bold mb-1">{systemHealth?.databaseStatus?.connected ? 'Connected' : 'Disconnected'}</p>
            <p className={systemHealth?.databaseStatus?.connected ? 'text-indigo-100' : 'text-rose-100'} className="text-xs">Response: {systemHealth?.databaseStatus?.responseTime || 0}ms</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-violet-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="w-8 bg-violet-300 bg-opacity-50 rounded-full h-2">
                <div className="bg-violet-200 h-2 rounded-full" style={{width: `${(systemHealth?.serverStatus?.memoryUsage?.heapUsed / systemHealth?.serverStatus?.memoryUsage?.heapTotal) * 100 || 0}%`}}></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-violet-100 text-sm font-medium">Memory Usage</p>
            <p className="text-2xl font-bold mb-1">{formatBytes(systemHealth?.serverStatus?.memoryUsage?.heapUsed || 0)}</p>
            <p className="text-violet-100 text-xs">/ {formatBytes(systemHealth?.serverStatus?.memoryUsage?.heapTotal || 0)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (systemHealth?.apiMetrics?.errorRate || 0) < 1 
                  ? 'bg-emerald-200 text-emerald-800' 
                  : 'bg-rose-200 text-rose-800'
              }`}>
                {systemHealth?.apiMetrics?.errorRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-amber-100 text-sm font-medium">API Performance</p>
            <p className="text-2xl font-bold mb-1">{systemHealth?.apiMetrics?.averageResponseTime?.toFixed(0) || 0}ms</p>
            <p className="text-amber-100 text-xs">Error Rate: {systemHealth?.apiMetrics?.errorRate?.toFixed(1) || 0}%</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Server Metrics</h3>
            <div className="bg-indigo-100 rounded-full p-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">RSS Memory</span>
              <span className="font-bold text-slate-900">{formatBytes(systemHealth?.serverStatus?.memoryUsage?.rss || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">External Memory</span>
              <span className="font-bold text-gray-900">{formatBytes(systemHealth?.serverStatus?.memoryUsage?.external || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">CPU Usage</span>
              <span className="font-bold text-gray-900">{(systemHealth?.serverStatus?.cpuUsage || 0).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Process ID</span>
              <span className="font-bold text-gray-900">Browser Environment</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">API Metrics</h3>
            <div className="bg-emerald-100 rounded-full p-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Total Requests</span>
              <span className="font-bold text-gray-900">{systemHealth?.apiMetrics?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Error Rate</span>
              <span className="font-bold text-gray-900">{systemHealth?.apiMetrics?.errorRate?.toFixed(2) || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Avg Response Time</span>
              <span className="font-bold text-gray-900">{systemHealth?.apiMetrics?.averageResponseTime?.toFixed(0) || 0}ms</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">DB Connections</span>
              <span className="font-bold text-gray-900">{systemHealth?.databaseStatus?.activeConnections || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health History Chart */}
      {healthHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">24-Hour Health Trend</h3>
              <p className="text-gray-600 text-sm mt-1">Showing {healthHistory.length} data points from the last 24 hours</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">📊</div>
            <p className="text-gray-600">Chart visualization would go here</p>
            <p className="text-gray-500 text-sm mt-1">(integrate with Chart.js or similar)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitoring;