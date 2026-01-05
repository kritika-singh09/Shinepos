import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SettingsManagement = ({ activeCategory: initialCategory = 'SYSTEM' }) => {
  const [settings, setSettings] = useState({});
  const [planLimits, setPlanLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const categories = {
    SYSTEM: { name: 'System', icon: '⚙️' },
    EMAIL: { name: 'Email', icon: '📧' },
    PAYMENT: { name: 'Payment', icon: '💳' },
    SECURITY: { name: 'Security', icon: '🔒' },
    PLAN_LIMITS: { name: 'Plan Limits', icon: '📊' },
    GENERAL: { name: 'General', icon: '📋' }
  };

  useEffect(() => {
    fetchSettings();
    fetchPlanLimits();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanLimits = async () => {
    try {
      const response = await axios.get('/api/settings/plan-limits');
      setPlanLimits(response.data.limits);
    } catch (error) {
      console.error('Error fetching plan limits:', error);
    }
  };

  const updateSetting = async (key, value, category, description) => {
    setSaving(true);
    try {
      await axios.put('/api/settings', { key, value, category, description });
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePlanLimits = async (plan, limits) => {
    setSaving(true);
    try {
      await axios.put('/api/settings/plan-limits', { plan, limits });
      fetchPlanLimits();
    } catch (error) {
      console.error('Error updating plan limits:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (setting, newValue) => {
    const updatedSettings = { ...settings };
    const categorySettings = updatedSettings[setting.category] || [];
    const settingIndex = categorySettings.findIndex(s => s.key === setting.key);
    
    if (settingIndex !== -1) {
      categorySettings[settingIndex] = { ...setting, value: newValue };
      setSettings(updatedSettings);
    }
  };

  const handleSave = (setting) => {
    updateSetting(setting.key, setting.value, setting.category, setting.description);
  };

  const handlePlanLimitChange = (plan, limitType, value) => {
    setPlanLimits(prev => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [limitType]: parseInt(value) || 0
      }
    }));
  };

  const handlePlanLimitSave = (plan) => {
    updatePlanLimits(plan, planLimits[plan]);
  };

  const renderPlanLimitsSection = () => {
    const plans = ['trial', 'basic', 'premium', 'enterprise'];
    const planColors = {
      trial: 'bg-slate-50 border-slate-200',
      basic: 'bg-indigo-50 border-indigo-200',
      premium: 'bg-violet-50 border-violet-200',
      enterprise: 'bg-amber-50 border-amber-200'
    };

    return (
      <div className="space-y-6">
        {plans.map(plan => (
          <div key={plan} className={`p-6 rounded-lg border ${planColors[plan]}`}>
            <h3 className="text-lg font-semibold mb-4 capitalize text-slate-900">{plan} Plan Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Orders Limit</label>
                <input
                  type="number"
                  value={planLimits[plan]?.orders || 0}
                  onChange={(e) => handlePlanLimitChange(plan, 'orders', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Users Limit</label>
                <input
                  type="number"
                  value={planLimits[plan]?.users || 0}
                  onChange={(e) => handlePlanLimitChange(plan, 'users', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items Limit</label>
                <input
                  type="number"
                  value={planLimits[plan]?.menuItems || 0}
                  onChange={(e) => handlePlanLimitChange(plan, 'menuItems', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handlePlanLimitSave(plan)}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
              >
                {saving ? 'Saving...' : `Save ${plan.charAt(0).toUpperCase() + plan.slice(1)} Limits`}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettingInput = (setting) => {
    const inputProps = {
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
      onChange: (e) => {
        let value = e.target.value;
        if (typeof setting.value === 'number') {
          value = parseInt(value) || 0;
        } else if (typeof setting.value === 'boolean') {
          value = e.target.checked;
        }
        handleInputChange(setting, value);
      }
    };

    if (typeof setting.value === 'boolean') {
      return (
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={setting.value}
            {...inputProps}
            className="mr-2"
          />
          <span>{setting.value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    } else if (typeof setting.value === 'number') {
      return (
        <input
          type="number"
          value={setting.value}
          {...inputProps}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={setting.value}
          {...inputProps}
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-slate-900">System Settings</h2>
      
      {/* Settings Content */}
      <div className="space-y-6">
        {activeCategory === 'PLAN_LIMITS' ? (
          renderPlanLimitsSection()
        ) : (
          settings[activeCategory]?.map((setting) => (
            <div key={setting.key} className="bg-white p-4 lg:p-6 rounded-lg shadow border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="text-base lg:text-lg font-semibold text-slate-900">{setting.key}</h3>
                  {setting.description && (
                    <p className="text-xs lg:text-sm text-slate-600 mt-1">{setting.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  {renderSettingInput(setting)}
                </div>
                <button
                  onClick={() => handleSave(setting)}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors text-sm lg:text-base"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )) || (
            <div className="text-center py-12">
              <p className="text-slate-500">No settings found for this category.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SettingsManagement;