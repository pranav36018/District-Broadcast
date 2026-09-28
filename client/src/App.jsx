import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import CallModal from './components/CallModal.jsx';
import ContactDetailModal from './components/ContactDetailModal.jsx';
import Toast from './components/Toast.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Contacts from './pages/Contacts.jsx';
import Districts from './pages/Districts.jsx';
import DistrictIncharges from './pages/DistrictIncharges.jsx';
import Calls from './pages/Calls.jsx';
import Broadcasts from './pages/Broadcasts.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import AuditLogs from './pages/AuditLogs.jsx';

export default function App() {
  const { t, language } = useLanguage();

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ck_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ck_token'));

  // Active Tab
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Bengaluru Urban');

  // Call Modal State
  const [callingContact, setCallingContact] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Detail Modal State
  const [detailContactId, setDetailContactId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Toast System
  const [toast, setToast] = useState(null);

  // Global Refresh Trigger (increments when a call is saved so all components re-fetch fresh SQLite data)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ck_user', JSON.stringify(userData));
    localStorage.setItem('ck_token', userToken);
    setCurrentTab('dashboard');
    const roleText = userData.role === 'super_admin' 
      ? t('ಸೂಪರ್ ಆಡ್ಮಿನ್', 'Super Admin') 
      : t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ', 'District In-Charge');
    const welcomeMsg = language === 'en'
      ? `Welcome, ${userData.name}! Logged in as ${roleText}.`
      : `ಸ್ವಾಗತ, ${userData.name}! ಲಾಗಿನ್ ಆಗಿದ್ದಾರೆ ${roleText}.`;
    showToast(welcomeMsg, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ck_user');
    localStorage.removeItem('ck_token');
    showToast(t('ಯಶಸ್ವಿಯಾಗಿ ನಿರ್ಗಮಿಸಲಾಗಿದೆ.', 'Successfully logged out.'), 'info');
  };

  const handleOpenCallModal = (contact) => {
    setCallingContact(contact);
    setIsCallModalOpen(true);
  };

  const handleOpenDetailModal = (contactId) => {
    setDetailContactId(contactId);
    setIsDetailModalOpen(true);
  };

  const handleCallSaved = (data) => {
    setRefreshTrigger((prev) => prev + 1);
    const statusText = t(data.contact?.status, data.contact?.status?.toUpperCase());
    const msg = language === 'en'
      ? `Call saved for ${data.contact?.name}! Status updated: ${statusText}.`
      : `${data.contact?.name} ಗೆ ಕರೆ ದಾಖಲಿಸಲಾಗಿದೆ! ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${statusText}.`;
    showToast(msg, 'success');
  };

  const handleSelectDistrictFromDashboard = (distName) => {
    setSelectedDistrictName(distName);
    setCurrentTab('districts');
  };

  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Navbar */}
        <Navbar
          currentTab={currentTab}
          user={user}
          onCallNowDemo={() => {
            handleOpenCallModal({
              id: 1,
              name: 'Rahul Kumar',
              phone: '+91 XXXXXXXX01',
              district: 'Bengaluru Urban',
              status: 'not_contacted'
            });
          }}
        />

        {/* Dynamic Page Routing */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-16">
          {currentTab === 'dashboard' && (
            <Dashboard
              user={user}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onSelectDistrict={handleSelectDistrictFromDashboard}
            />
          )}

          {currentTab === 'contacts' && (
            <Contacts
              user={user}
              isMyContacts={false}
              onOpenCallModal={handleOpenCallModal}
              onOpenDetailModal={handleOpenDetailModal}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'my-contacts' && (
            <Contacts
              user={user}
              isMyContacts={true}
              onOpenCallModal={handleOpenCallModal}
              onOpenDetailModal={handleOpenDetailModal}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'districts' && (
            <Districts
              selectedDistrictName={selectedDistrictName}
              onSelectDistrict={(name) => setSelectedDistrictName(name)}
            />
          )}

          {currentTab === 'incharges' && (
            <DistrictIncharges
              onSelectDistrict={handleSelectDistrictFromDashboard}
            />
          )}

          {currentTab === 'calls' && (
            <Calls refreshTrigger={refreshTrigger} />
          )}

          {currentTab === 'broadcasts' && (
            <Broadcasts user={user} onShowToast={showToast} />
          )}

          {currentTab === 'analytics' && (
            <Analytics refreshTrigger={refreshTrigger} />
          )}

          {currentTab === 'reports' && (
            <Reports onShowToast={showToast} />
          )}

          {currentTab === 'audit-logs' && <AuditLogs />}
        </main>
      </div>

      {/* Global Call Modal */}
      <CallModal
        contact={callingContact}
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onCallSaved={handleCallSaved}
        callerUser={user}
      />

      {/* Global Contact Detail Modal */}
      <ContactDetailModal
        contactId={detailContactId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCallNow={handleOpenCallModal}
      />

      {/* Floating System Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
