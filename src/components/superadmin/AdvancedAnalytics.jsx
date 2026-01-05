import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/advanced');
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await axios.get(`/api/analytics/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'restaurant-analytics.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Advanced Analytics</h2>
          <p className="text-slate-600 text-sm lg:text-base">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => exportReport('json')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm lg:text-base"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm lg:text-base"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-right">
              <span className="bg-emerald-400 bg-opacity-30 px-2 py-1 rounded-full text-xs font-medium">30d</span>
            </div>
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold mb-1">${analytics?.totalRevenue?.toFixed(2) || 0}</p>
            <p className="text-emerald-100 text-xs">+15% from last month</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="text-right">
              <span className="bg-indigo-400 bg-opacity-30 px-2 py-1 rounded-full text-xs font-medium">30d</span>
            </div>
          </div>
          <div>
            <p className="text-indigo-100 text-sm font-medium">Total Orders</p>
            <p className="text-3xl font-bold mb-1">{analytics?.totalOrders || 0}</p>
            <p className="text-indigo-100 text-xs">+8% from last month</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-violet-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="w-8 bg-violet-300 bg-opacity-50 rounded-full h-2">
                <div className="bg-violet-200 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-violet-100 text-sm font-medium">Avg Order Value</p>
            <p className="text-3xl font-bold mb-1">
              ${analytics?.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2) : 0}
            </p>
            <p className="text-violet-100 text-xs">Target: $150.00</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <p className="text-amber-100 text-sm font-medium">Peak Hour</p>
            <p className="text-3xl font-bold mb-1">
              {Object.keys(analytics?.peakHours || {}).reduce((a, b) => 
                (analytics.peakHours[a] || 0) > (analytics.peakHours[b] || 0) ? a : b, '12'
              )}:00
            </p>
            <p className="text-amber-100 text-xs">Most active time</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">7-Day Revenue Trend</h3>
            <p className="text-slate-600 text-sm mt-1">Daily revenue performance over the last week</p>
          </div>
          <div className="bg-indigo-100 rounded-full p-2">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          {analytics?.revenueByDay?.map((day, index) => {
            const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue));
            const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900 w-24">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 w-48">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${percentage}%`}}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-slate-900">${day.revenue.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Restaurants */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Top Performing Restaurants</h3>
            <p className="text-gray-600 text-sm mt-1">Ranked by revenue performance</p>
          </div>
          <div className="bg-green-100 rounded-full p-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peak Hour</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.topPerformingRestaurants?.map((restaurant, index) => (
                <tr key={restaurant.restaurantId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{index + 1}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">${restaurant.revenue.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{restaurant.orders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">${restaurant.averageOrderValue.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {restaurant.peakHour}:00
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Peak Hours Analysis</h3>
            <p className="text-gray-600 text-sm mt-1">Order distribution across 24 hours for all restaurants</p>
          </div>
          <div className="bg-purple-100 rounded-full p-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 lg:gap-3">
          {Array.from({ length: 24 }, (_, hour) => {
            const orderCount = analytics?.peakHours?.[hour] || 0;
            const maxOrders = Math.max(...Object.values(analytics?.peakHours || {}));
            const intensity = maxOrders > 0 ? (orderCount / maxOrders) * 100 : 0;
            
            return (
              <div key={hour} className="text-center">
                <div 
                  className="h-20 bg-gradient-to-t from-blue-200 to-blue-500 rounded-lg mb-2 flex items-end justify-center transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    background: `linear-gradient(to top, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, ${intensity / 100}))` 
                  }}
                >
                  <span className="text-xs font-bold text-gray-700 mb-1">{orderCount}</span>
                </div>
                <div className="text-xs text-gray-600 font-medium">{hour}:00</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;