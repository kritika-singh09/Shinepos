import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SystemMonitoring from '../components/superadmin/SystemMonitoring';
import AdvancedAnalytics from '../components/superadmin/AdvancedAnalytics';
import BillingManagement from '../components/superadmin/BillingManagement.jsx';
import SettingsManagement from '../components/superadmin/SettingsManagement.jsx';
import UserManagement from '../components/superadmin/UserManagement.jsx';
import CommunicationCenter from '../components/superadmin/CommunicationCenter.jsx';
import Sidebar from '../components/superadmin/Sidebar.jsx';
import Logo from '../components/Logo';

const SuperAdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cuisine: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchRestaurants();
    fetchAnalytics();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/restaurants/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingRestaurant) {
        await axios.put(`/api/restaurants/${editingRestaurant._id}`, { name: formData.name });
        setEditingRestaurant(null);
      } else {
        await axios.post('/api/restaurants', formData);
      }
      setFormData({ name: '', adminEmail: '', adminPassword: '', adminName: '', phone: '', address: '', city: '', state: '', zipCode: '', cuisine: '', description: '' });
      setShowCreateForm(false);
      fetchRestaurants();
      fetchAnalytics();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save restaurant');
    }
    setLoading(false);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({ name: restaurant.name, adminEmail: '', adminPassword: '', adminName: '', phone: '', address: '', city: '', state: '', zipCode: '', cuisine: '', description: '' });
    setShowCreateForm(true);
  };

  const handleDelete = async (restaurantId) => {
    if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/restaurants/${restaurantId}`);
        fetchRestaurants();
        fetchAnalytics();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  const toggleRestaurantStatus = async (restaurantId) => {
    try {
      await axios.patch(`/api/restaurants/${restaurantId}/toggle-status`);
      fetchRestaurants();
      fetchAnalytics();
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
    }
  };

  const handleBulkToggle = async () => {
    if (selectedRestaurants.length === 0) return;
    
    try {
      await Promise.all(
        selectedRestaurants.map(id => 
          axios.patch(`/api/restaurants/${id}/toggle-status`)
        )
      );
      setSelectedRestaurants([]);
      fetchRestaurants();
      fetchAnalytics();
    } catch (error) {
      console.error('Error in bulk toggle:', error);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-fill city and state when ZIP code is entered
    if (name === 'zipCode' && value.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            zipCode: value
          }));
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = analytics.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalOrders = analytics.reduce((sum, item) => sum + item.totalOrders, 0);

  return (
    <div className="min-h-screen bg-indigo-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-indigo-600 shadow-lg border-b border-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 lg:py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="mr-4 p-2 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-500 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-white">Super Admin Dashboard</h1>
                  <p className="text-indigo-100 mt-1 font-medium text-sm lg:text-base">Manage restaurants and system settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <span className="text-indigo-100 font-medium text-sm lg:text-base hidden sm:block">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-white hover:bg-indigo-50 text-indigo-600 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm lg:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="p-3 lg:p-4">
            {/* Header */}
            <div className="mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
              <p className="text-slate-600 text-sm lg:text-base">Monitor your restaurant network performance and key metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Restaurants</p>
                    <p className="text-3xl font-bold mt-2">{restaurants.length}</p>
                    <p className="text-indigo-100 text-xs mt-1">+2 this month</p>
                  </div>
                  <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Active Restaurants</p>
                    <p className="text-3xl font-bold mt-2">{restaurants.filter(r => r.isActive).length}</p>
                    <p className="text-emerald-100 text-xs mt-1">{((restaurants.filter(r => r.isActive).length / restaurants.length) * 100).toFixed(1)}% active</p>
                  </div>
                  <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">{totalOrders.toLocaleString()}</p>
                    <p className="text-violet-100 text-xs mt-1">+12% from last month</p>
                  </div>
                  <div className="bg-violet-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
                    <p className="text-amber-100 text-xs mt-1">+8% from last month</p>
                  </div>
                  <div className="bg-amber-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
                  <div className="flex justify-between items-center mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-bold text-slate-900">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    <button
                      onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        setEditingRestaurant(null);
                        setFormData({ name: '', adminEmail: '', adminPassword: '', adminName: '', phone: '', address: '', city: '', state: '', zipCode: '', cuisine: '', description: '' });
                      }}
                      className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <div className="bg-indigo-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Add Restaurant</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('users')}
                      className="flex flex-col items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <div className="bg-emerald-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Manage Users</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('monitoring')}
                      className="flex flex-col items-center p-4 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                    >
                      <div className="bg-violet-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-900">System Health</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="flex flex-col items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <div className="bg-amber-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
                <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-3">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Server Status</span>
                    <span className="flex items-center text-emerald-600">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Database</span>
                    <span className="flex items-center text-emerald-600">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">API Response</span>
                    <span className="text-slate-900 font-medium">~180ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Uptime</span>
                    <span className="text-slate-900 font-medium">99.9%</span>
                  </div>
                </div>
              </div>
            </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-3 lg:p-4 mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
              {editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter restaurant name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                  <input
                    type="text"
                    name="cuisine"
                    placeholder="e.g., Italian, Chinese, American"
                    value={formData.cuisine}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {!editingRestaurant && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
                      <input
                        type="text"
                        name="adminName"
                        placeholder="Enter admin name"
                        value={formData.adminName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                      <input
                        type="email"
                        name="adminEmail"
                        placeholder="Enter admin email"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                      <input
                        type="password"
                        name="adminPassword"
                        placeholder="Enter admin password"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter street address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Enter 6-digit PIN code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">City and state will auto-fill</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter restaurant description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? (editingRestaurant ? 'Updating...' : 'Creating...') : (editingRestaurant ? 'Update Restaurant' : 'Create Restaurant')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Restaurants List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 lg:px-4 py-3 border-b border-gray-200">
            <h2 className="text-base lg:text-lg font-bold text-gray-900">Restaurants ({filteredRestaurants.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRestaurants(filteredRestaurants.map(r => r._id));
                        } else {
                          setSelectedRestaurants([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => {
                  const restaurantAnalytics = analytics.find(a => a.restaurantId === restaurant._id) || {};
                  return (
                    <tr key={restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRestaurants.includes(restaurant._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRestaurants([...selectedRestaurants, restaurant._id]);
                            } else {
                              setSelectedRestaurants(selectedRestaurants.filter(id => id !== restaurant._id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          restaurant.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurantAnalytics.totalOrders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(restaurantAnalytics.totalRevenue || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEdit(restaurant)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => toggleRestaurantStatus(restaurant._id)}
                          className={`${restaurant.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {restaurant.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => handleDelete(restaurant._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants found</h3>
              <p className="mt-1 text-sm text-gray-500">{searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new restaurant.'}</p>
            </div>
          )}
        </div>
          </div>
        )}

        {activeTab === 'monitoring' && <SystemMonitoring />}
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'subscriptions' && <BillingManagement />}
        
        {activeTab === 'settings-system' && <SettingsManagement activeCategory="SYSTEM" />}
        {activeTab === 'settings-email' && <SettingsManagement activeCategory="EMAIL" />}
        {activeTab === 'settings-payment' && <SettingsManagement activeCategory="PAYMENT" />}
        {activeTab === 'settings-security' && <SettingsManagement activeCategory="SECURITY" />}
        {activeTab === 'settings-plan-limits' && <SettingsManagement activeCategory="PLAN_LIMITS" />}
        {activeTab === 'settings-general' && <SettingsManagement activeCategory="GENERAL" />}
        
        {activeTab === 'communication' && <CommunicationCenter />}
        
        {activeTab === 'users' && <UserManagement />}
        
        {activeTab === 'content' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Management</h3>
            <p className="text-gray-500">Help docs, tutorials, and system content</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;