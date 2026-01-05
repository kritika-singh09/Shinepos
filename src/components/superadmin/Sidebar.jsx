import React, { useState } from 'react';
import { 
  MdDashboard, 
  MdMonitorHeart, 
  MdAnalytics, 
  MdPayment, 
  MdAnnouncement, 
  MdPeople, 
  MdArticle, 
  MdSettings,
  MdEmail,
  MdSecurity,
  MdBarChart,
  MdDescription,
  MdClose,
  MdExpandMore
} from 'react-icons/md';
import Logo from '../Logo';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: MdDashboard },
    { id: 'monitoring', name: 'System Health', icon: MdMonitorHeart },
    { id: 'analytics', name: 'Analytics', icon: MdAnalytics },
    { id: 'subscriptions', name: 'Billing', icon: MdPayment },
    { id: 'communication', name: 'Communication', icon: MdAnnouncement },
    { id: 'users', name: 'User Management', icon: MdPeople },
    { id: 'content', name: 'Content', icon: MdArticle }
  ];

  const settingsItems = [
    { id: 'settings-system', name: 'System', icon: MdSettings },
    { id: 'settings-email', name: 'Email', icon: MdEmail },
    { id: 'settings-payment', name: 'Payment', icon: MdPayment },
    { id: 'settings-security', name: 'Security', icon: MdSecurity },
    { id: 'settings-plan-limits', name: 'Plan Limits', icon: MdBarChart },
    { id: 'settings-general', name: 'General', icon: MdDescription }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`w-64 bg-white shadow-xl border-r border-slate-200 min-h-screen fixed left-0 top-0 overflow-y-auto transition-transform z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-slate-900">ShinePos</h2>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded transition-all"
        >
        <MdClose className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-50 transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-700 border-r-3 border-indigo-500 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span className={`mr-3 text-lg transition-transform duration-300 group-hover:scale-105 ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-500'
            }`}><item.icon /></span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
        
        {/* Settings Dropdown */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-slate-50 transition-all duration-300 group ${
              activeTab.startsWith('settings')
                ? 'bg-indigo-50 text-indigo-700 border-r-3 border-indigo-500'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center">
              <span className={`mr-3 text-lg transition-transform duration-300 group-hover:scale-105 ${
                activeTab.startsWith('settings') ? 'text-indigo-600' : 'text-slate-500'
              }`}><MdSettings /></span>
              <span className="font-medium">Settings</span>
            </div>
            <MdExpandMore className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {settingsOpen && (
            <div className="bg-slate-50/80 backdrop-blur-sm">
              {settingsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-12 py-2.5 text-left hover:bg-slate-100 transition-all duration-300 group ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span className={`mr-3 text-sm transition-transform duration-300 group-hover:scale-105 ${
                    activeTab === item.id ? 'text-indigo-600' : 'text-slate-500'
                  }`}><item.icon /></span>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
    </>
  );
};

export default Sidebar;