import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'WAITER',
    shift: 'MORNING',
    permissions: []
  });

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/user-management');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      alert('Please select a restaurant');
      return;
    }

    try {
      const payload = {
        ...formData,
        restaurantId: selectedRestaurant
      };
      await axios.post(`/api/user-management/restaurant/${selectedRestaurant}`, payload);
      setFormData({ email: '', password: '', name: '', role: 'WAITER', shift: 'MORNING', permissions: [] });
      setShowCreateForm(false);
      setSelectedRestaurant('');
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await axios.put(`/api/user-management/restaurant/${user.restaurantId}/user/${user._id}`, {
        name: user.name,
        role: user.role,
        isActive: !user.isActive
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await axios.delete(`/api/user-management/restaurant/${user.restaurantId}/user/${user._id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRoleColor = (role) => {
    const colors = {
      RESTAURANT_ADMIN: 'bg-violet-100 text-violet-800',
      MANAGER: 'bg-indigo-100 text-indigo-800',
      CHEF: 'bg-orange-100 text-orange-800',
      WAITER: 'bg-emerald-100 text-emerald-800',
      CASHIER: 'bg-amber-100 text-amber-800'
    };
    return colors[role] || 'bg-slate-100 text-slate-800';
  };

  const filteredUsers = selectedRestaurant 
    ? users.filter(user => user.restaurantId === selectedRestaurant)
    : users;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">User Management</h2>
          <p className="text-slate-600 text-sm lg:text-base">Manage users across all restaurants</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm lg:text-base"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{showCreateForm ? 'Cancel' : 'Add User'}</span>
        </button>
      </div>

      {/* Filter by Restaurant */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Restaurant</label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Restaurants</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg mb-4 lg:mb-6 border border-slate-200">
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant</label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WAITER">Waiter</option>
                  <option value="CHEF">Chef</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={`${user.restaurantId}-${user._id}`} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.restaurantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.shift || 'Not Set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        user.isActive 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="px-3 py-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8 m-6">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-slate-500 text-lg">No users found</p>
              <p className="text-slate-400 text-sm mt-1">Add users to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;