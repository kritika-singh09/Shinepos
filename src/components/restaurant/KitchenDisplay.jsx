import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchKitchenOrders();
  }, []);



  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        orders.forEach(order => {
          if (order.status === 'PREPARING' && order.prepStartTime) {
            const elapsed = Math.floor((Date.now() - new Date(order.prepStartTime)) / 1000);
            newTimers[order._id] = elapsed;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const fetchKitchenOrders = async () => {
    try {
      const response = await axios.get('/api/kitchen/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/kitchen/orders/${orderId}/status`, { status });
      fetchKitchenOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const setPriority = async (orderId, priority) => {
    try {
      await axios.patch(`/api/kitchen/orders/${orderId}/priority`, { priority });
      fetchKitchenOrders();
    } catch (error) {
      console.error('Error setting priority:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOrderAge = (createdAt) => {
    const age = Math.floor((Date.now() - new Date(createdAt)) / 1000);
    return formatTime(age);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-500 bg-red-50',
      normal: 'border-gray-300 bg-white',
      low: 'border-blue-300 bg-blue-50'
    };
    return colors[priority] || colors.normal;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kitchen Display</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Active Orders: {orders.length}
          </div>
          <button
            onClick={fetchKitchenOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`border-2 rounded-lg p-4 ${getPriorityColor(order.priority)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold">#{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">{order.customerName}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  Age: {getOrderAge(order.createdAt)}
                </div>
                {order.status === 'PREPARING' && timers[order._id] && (
                  <div className="text-sm font-bold text-blue-600">
                    Prep: {formatTime(timers[order._id])}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'PREPARING')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                  >
                    Start Prep
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'READY')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setPriority(order._id, 'high')}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    order.priority === 'high' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setPriority(order._id, 'normal')}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    order.priority === 'normal' || !order.priority
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setPriority(order._id, 'low')}
                  className={`flex-1 px-2 py-1 rounded text-xs ${
                    order.priority === 'low' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  Low
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No orders in kitchen queue</div>
          <p className="text-gray-500 mt-2">New orders will appear here automatically</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;