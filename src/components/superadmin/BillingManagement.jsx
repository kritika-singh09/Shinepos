import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillingManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const plans = {
    trial: { price: 0, name: 'Trial' },
    basic: { price: 29, name: 'Basic' },
    premium: { price: 79, name: 'Premium' },
    enterprise: { price: 199, name: 'Enterprise' }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurant data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (restaurantId, plan) => {
    try {
      await axios.put(`/api/subscriptions/restaurant/${restaurantId}/plan`, { plan });
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating plan:', error);
      setError('Failed to update subscription plan.');
    }
  };

  const getStatusColor = (plan) => {
    switch (plan) {
      case 'trial': return 'bg-slate-100 text-slate-800';
      case 'basic': return 'bg-emerald-100 text-emerald-800';
      case 'premium': return 'bg-violet-100 text-violet-800';
      case 'enterprise': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) return (
    <div className="p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading billing data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
        <button 
          onClick={fetchRestaurants}
          className="mt-3 bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Billing Management</h2>
        <p className="text-slate-600 text-sm lg:text-base">Manage subscription plans and billing for all restaurants</p>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
            </svg>
            <p className="text-gray-500 text-lg">No restaurants found.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 lg:mb-6 space-y-4 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center mr-3 lg:mr-4">
                      <span className="text-white font-bold text-sm lg:text-lg">{restaurant.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-slate-900">{restaurant.name}</h3>
                      <p className="text-slate-600 text-sm lg:text-base">Slug: {restaurant.slug}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(restaurant.subscriptionPlan)}`}>
                    {plans[restaurant.subscriptionPlan]?.name || restaurant.subscriptionPlan?.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Current Plan</p>
                    <p className="text-base lg:text-lg font-bold text-slate-900">{plans[restaurant.subscriptionPlan]?.name || 'Unknown'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Monthly Price</p>
                    <p className="text-base lg:text-lg font-bold text-emerald-600">${plans[restaurant.subscriptionPlan]?.price || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Status</p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${restaurant.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <p className="text-base lg:text-lg font-bold text-slate-900">{restaurant.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 lg:p-4">
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Created</p>
                    <p className="text-base lg:text-lg font-bold text-slate-900">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 lg:pt-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3 lg:mb-4">Change Plan</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    {Object.entries(plans).map(([planKey, planData]) => (
                      <button
                        key={planKey}
                        onClick={() => updatePlan(restaurant._id, planKey)}
                        className={`p-3 lg:p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                          restaurant.subscriptionPlan === planKey
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-sm lg:text-lg">{planData.name}</div>
                        <div className="text-xs lg:text-sm text-slate-600">${planData.price}/month</div>
                        {restaurant.subscriptionPlan === planKey && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Current
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingManagement;