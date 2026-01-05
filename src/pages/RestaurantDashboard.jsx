import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import InventoryManagement from '../components/restaurant/InventoryManagement';
import StaffManagement from '../components/restaurant/StaffManagement';
import KitchenDisplay from '../components/restaurant/KitchenDisplay';
import NotificationCenter from '../components/restaurant/NotificationCenter';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [orderFormData, setOrderFormData] = useState({
    customerName: '',
    customerPhone: ''
  });
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchMenus();
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);



  const fetchMenus = async () => {
    try {
      const response = await axios.get('/api/menus');
      setMenus(response.data.menus);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingMenu) {
        await axios.put(`/api/menus/${editingMenu._id}`, menuFormData);
      } else {
        await axios.post('/api/menus', menuFormData);
      }
      
      setMenuFormData({ name: '', description: '', price: '', category: '' });
      setShowMenuForm(false);
      setEditingMenu(null);
      fetchMenus();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save menu item');
    }
    setLoading(false);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Please add items to the order');
      return;
    }

    console.log('User object:', user);
    console.log('Restaurant slug:', user.restaurantSlug);

    setLoading(true);
    setError('');

    try {
      const url = `/api/${user.restaurantSlug}/orders`;
      console.log('Making request to:', url);
      
      await axios.post(url, {
        items: cart.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity
        })),
        customerName: orderFormData.customerName,
        customerPhone: orderFormData.customerPhone
      });
      
      setOrderFormData({ customerName: '', customerPhone: '' });
      setCart([]);
      setShowOrderForm(false);
      fetchOrders();
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.response?.data?.error || 'Failed to create order');
    }
    setLoading(false);
  };

  const addToCart = (menu) => {
    const existingItem = cart.find(item => item.menuId === menu._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuId === menu._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        menuId: menu._id,
        name: menu.name,
        price: menu.price,
        quantity: 1
      }]);
    }
  };

  const updateCartQuantity = (menuId, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.menuId !== menuId));
    } else {
      setCart(cart.map(item =>
        item.menuId === menuId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleMenuEdit = (menu) => {
    setEditingMenu(menu);
    setMenuFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price.toString(),
      category: menu.category
    });
    setShowMenuForm(true);
  };

  const handleMenuDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`/api/menus/${menuId}`);
        fetchMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleMenuFormChange = (e) => {
    setMenuFormData({
      ...menuFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleOrderFormChange = (e) => {
    setOrderFormData({
      ...orderFormData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
              <p className="text-gray-600 mt-1 capitalize">{user.restaurantSlug?.replace('-', ' ')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('menus')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menus'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'staff'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setActiveTab('kitchen')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'kitchen'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kitchen
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowOrderForm(!showOrderForm);
                  setCart([]);
                  setOrderFormData({ customerName: '', customerPhone: '' });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{showOrderForm ? 'Cancel' : 'Create New Order'}</span>
              </button>
            </div>

            {/* Create Order Form */}
            {showOrderForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Order</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Menu Items */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Select Items</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {menus.filter(menu => menu.isAvailable).map((menu) => (
                        <div key={menu._id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{menu.name}</p>
                            <p className="text-sm text-gray-600">₹{menu.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => addToCart(menu)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                      <input
                        type="text"
                        name="customerName"
                        placeholder="Customer Name"
                        value={orderFormData.customerName}
                        onChange={handleOrderFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        name="customerPhone"
                        placeholder="Phone Number (Optional)"
                        value={orderFormData.customerPhone}
                        onChange={handleOrderFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {cart.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="space-y-2 mb-4">
                            {cart.map((item) => (
                              <div key={item.menuId} className="flex justify-between items-center">
                                <span className="text-sm">{item.name}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.menuId, item.quantity - 1)}
                                    className="w-6 h-6 bg-gray-200 rounded-full text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.menuId, item.quantity + 1)}
                                    className="w-6 h-6 bg-gray-200 rounded-full text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 font-bold">
                            Total: ₹{getTotalAmount().toFixed(2)}
                          </div>
                        </div>
                      )}
                      
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {error}
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={loading || cart.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        {loading ? 'Creating Order...' : 'Create Order'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Orders ({orders.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order._id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                        <p className="text-gray-600">{order.customerName} • {order.customerPhone}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'READY' ? 'bg-green-100 text-green-800' :
                            order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY">Ready</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menus' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowMenuForm(!showMenuForm);
                  setEditingMenu(null);
                  setMenuFormData({ name: '', description: '', price: '', category: '' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {showMenuForm ? 'Cancel' : 'Add Menu Item'}
              </button>
            </div>

            {showMenuForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Item Name"
                      value={menuFormData.name}
                      onChange={handleMenuFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={menuFormData.price}
                      onChange={handleMenuFormChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={menuFormData.category}
                    onChange={handleMenuFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={menuFormData.description}
                    onChange={handleMenuFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Saving...' : (editingMenu ? 'Update' : 'Add')} Item
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <div key={menu._id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{menu.name}</h3>
                  <p className="text-gray-600 mb-3">{menu.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">₹{menu.price.toFixed(2)}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      menu.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {menu.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Category: {menu.category}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMenuEdit(menu)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMenuDelete(menu._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'inventory' && (
          <InventoryManagement />
        )}

        {activeTab === 'staff' && (
          <StaffManagement />
        )}

        {activeTab === 'kitchen' && (
          <KitchenDisplay />
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;