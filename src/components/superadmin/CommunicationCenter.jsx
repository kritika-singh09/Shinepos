import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunicationCenter = () => {
  const [messages, setMessages] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
    priority: 'MEDIUM',
    recipients: 'ALL',
    specificRestaurants: []
  });

  useEffect(() => {
    fetchMessages();
    fetchRestaurants();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/communication');
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
    try {
      await axios.post('/api/communication', formData);
      setFormData({
        title: '',
        message: '',
        type: 'ANNOUNCEMENT',
        priority: 'MEDIUM',
        recipients: 'ALL',
        specificRestaurants: []
      });
      setShowCreateForm(false);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRestaurantSelect = (restaurantId) => {
    const selected = formData.specificRestaurants.includes(restaurantId)
      ? formData.specificRestaurants.filter(id => id !== restaurantId)
      : [...formData.specificRestaurants, restaurantId];
    
    setFormData({ ...formData, specificRestaurants: selected });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-rose-600 bg-rose-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-100';
      case 'LOW': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Communication Center</h2>
          <p className="text-slate-600 text-sm lg:text-base">Send messages and announcements to restaurants</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm lg:text-base"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{showCreateForm ? 'Cancel' : 'Send Message'}</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Send New Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter message title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="NOTIFICATION">Notification</option>
                  <option value="ALERT">Alert</option>
                  <option value="UPDATE">Update</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <select
                  name="recipients"
                  value={formData.recipients}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Restaurants</option>
                  <option value="ACTIVE">Active Restaurants</option>
                  <option value="TRIAL">Trial Restaurants</option>
                  <option value="SPECIFIC">Specific Restaurants</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message content"
              />
            </div>

            {formData.recipients === 'SPECIFIC' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Restaurants</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {restaurants.map((restaurant) => (
                    <label key={restaurant._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.specificRestaurants.includes(restaurant._id)}
                        onChange={() => handleRestaurantSelect(restaurant._id)}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{restaurant.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Sent Messages ({messages.length})</h3>
        </div>
        {messages.map((message) => (
          <div key={message._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{message.title}</h4>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {message.type}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {message.recipients}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {new Date(message.sentAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">{message.message}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Sent by: <span className="font-medium">{message.sentBy?.name || 'Super Admin'}</span>
              </div>
              <div className="text-sm text-gray-500">
                Read by: <span className="font-medium text-blue-600">{message.readBy?.length || 0} restaurants</span>
              </div>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-lg">No messages sent yet.</p>
              <p className="text-gray-400 text-sm mt-1">Start communicating with your restaurants</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCenter;