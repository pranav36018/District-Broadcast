import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, MapPin, Search, Lock, Mail, Building2, CheckCircle2, X, ChevronDown, Globe } from 'lucide-react';
import { useLanguage, LanguageToggle } from '../context/LanguageContext.jsx';

export default function Login({ onLoginSuccess }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [activePortal, setActivePortal] = useState('admin'); // 'admin' | 'incharge'
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru');
  const [districtSearch, setDistrictSearch] = useState('Bengaluru');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('admin@connectkarnataka.demo');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);

  // Fetch districts on mount
  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
          const bgl = data.find(d => d.name === 'Bengaluru') || data[0];
          if (bgl && activePortal === 'incharge') {
            setSelectedDistrict(bgl.name);
            setDistrictSearch(bgl.name);
            setEmail(bgl.incharge_email || 'bengaluru@connectkarnataka.demo');
            setPassword(bgl.incharge_password || 'incharge123');
          }
        }
      })
      .catch(err => console.error('Error fetching districts:', err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // District-to-credentials mapping
  const getDistrictCredentials = (distName) => {
    const d = districts.find(item => item.name.toLowerCase() === (distName || '').toLowerCase());
    if (d && d.incharge_email && d.incharge_password) {
      return {
        email: d.incharge_email,
        pass: d.incharge_password,
        name: d.incharge_name || 'District In-Charge'
      };
    }
    if (distName === 'Bengaluru' || distName === 'Bengaluru Urban') {
      return { email: 'bengaluru@connectkarnataka.demo', pass: 'incharge123', name: 'Suresh Gowda' };
    }
    if (distName === 'Hubballi-Dharwad') {
      return { email: 'dharwad@connectkarnataka.demo', pass: 'dharwad123', name: 'Prakash Rathod' };
    }
    const slug = (distName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      email: `${slug}@connectkarnataka.demo`,
      pass: `${slug}123`,
      name: d?.incharge_name || `${distName} Coordinator`
    };
  };

  const handleSelectPortal = (portal) => {
    setActivePortal(portal);
    setError('');
    if (portal === 'admin') {
      setEmail('admin@connectkarnataka.demo');
      setPassword('admin123');
    } else {
      const creds = getDistrictCredentials(selectedDistrict);
      setEmail(creds.email);
      setPassword(creds.pass);
      setDistrictSearch(selectedDistrict);
    }
  };

  const handleApplyDistrict = (distName) => {
    setSelectedDistrict(distName);
    setDistrictSearch(distName);
    setIsDropdownOpen(false);
    const creds = getDistrictCredentials(distName);
    setEmail(creds.email);
    setPassword(creds.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ರುಜುವಾತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.', 'Login failed. Please verify credentials.'));

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter districts based on search query
  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
    (d.incharge_name && d.incharge_name.toLowerCase().includes(districtSearch.toLowerCase()))
  );

  const selectedDistrictInfo = districts.find(d => d.name === selectedDistrict) || {
    name: selectedDistrict,
    incharge_name: getDistrictCredentials(selectedDistrict).name
  };

  const popularDistricts = [
    'Bengaluru',
    'Mysuru',
    'Belagavi',
    'Mangaluru',
    'Hubballi-Dharwad',
    'Tumakuru',
    'Kalaburagi',
    'Shivamogga'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex items-center justify-center p-4 relative">
      
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageToggle dark={true} size="sm" />
      </div>

      <div className="max-w-2xl w-full">
        
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 items-center justify-center shadow-2xl shadow-emerald-500/30 text-white font-black text-2xl mb-3 ring-4 ring-emerald-500/20">
            CK
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t('ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ', 'Connect Karnataka')}
          </h1>
          <p className="text-sm text-emerald-400 font-medium mt-1">
            {t('ಸಾಮೂಹಿಕ ಸಂವಹನ & ಜಿಲ್ಲಾ ಸಂಪರ್ಕ ನಿರ್ವಹಣಾ ವೇದಿಕೆ', 'Mass Communication & District Contact Management Platform')}
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
            <span>● {t('31 ಆಡಳಿತ ಜಿಲ್ಲೆಗಳು', '31 Administrative Districts')}</span>
            <span>•</span>
            <span>{t('ನೈಜ ದತ್ತಾಂಶ ಜಾಲ ಸಕ್ರಿಯ', 'Real-time Data Mesh Active')}</span>
          </div>
        </div>

        {/* Portal Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100/90 p-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => handleSelectPortal('admin')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('ರಾಜ್ಯ ಪ್ರಧಾನ ಕಚೇರಿ (ಸೂಪರ್ ಆಡ್ಮಿನ್)', 'State Headquarters (Super Admin)')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPortal('incharge')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePortal === 'incharge'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ ಪೋರ್ಟಲ್', 'District In-Charge Portal')}</span>
            </button>
          </div>

          <div className="p-6 lg:p-8">
            
            {/* ======================================================== */}
            {/* PORTAL 1: STATE HEADQUARTERS (SUPER ADMIN) */}
            {/* ======================================================== */}
            {activePortal === 'admin' && (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('ರಾಜ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಪ್ರವೇಶ', 'State Executive Access')}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t('ಸೂಪರ್ ಆಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್ ಸೈನ್ ಇನ್', 'Super Administrator Sign In')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'ರಾಜ್ಯ-ವ್ಯಾಪಿ ಪ್ರಸಾರ, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಜಿಲ್ಲಾ ಹಂಚಿಕೆಗಾಗಿ ಕೇಂದ್ರೀಕೃತ ಆಜ್ಞಾ ಪ್ರವೇಶ.',
                      'Centralized command access for state-wide broadcasting, analytics, and district allocation.'
                    )}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {t('ಇಮೇಲ್ ವಿಳಾಸ', 'Email Address')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        placeholder="admin@connectkarnataka.demo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {t('ಗುಪ್ತಪದ', 'Password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {loading 
                        ? t('ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...', 'Authenticating...') 
                        : t('ರಾಜ್ಯ ಪ್ರಧಾನ ಕಚೇರಿ ಪ್ರವೇಶಿಸಿ', 'Enter State Headquarters')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Pre-fill Helper */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {t('ಸೂಪರ್ ಆಡ್ಮಿನ್ ರುಜುವಾತುಗಳು:', 'Super Admin Credentials:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@connectkarnataka.demo');
                      setPassword('admin123');
                    }}
                    className="font-mono text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    admin@connectkarnataka.demo / admin123
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PORTAL 2: DISTRICT IN-CHARGE PORTAL (ALL 31 DISTRICTS) */}
            {/* ======================================================== */}
            {activePortal === 'incharge' && (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t('ಕ್ಷೇತ್ರ ಆಜ್ಞಾ ಪ್ರವೇಶ (31 ಜಿಲ್ಲೆಗಳು)', 'Field Command Access (31 Districts)')}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ ದೃಢೀಕರಣ', 'District In-Charge Authentication')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'ಉಸ್ತುವಾರಿ ರುಜುವಾತುಗಳನ್ನು ಸ್ವಯಂ-ಲೋಡ್ ಮಾಡಲು ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಒಂದನ್ನು ಹುಡುಕಿ ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಿ.',
                      'Search or select any of Karnataka’s 31 districts to auto-load in-charge credentials.'
                    )}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* STEP 1: DISTRICT SEARCH BAR & SELECTION */}
                <div className="space-y-2" ref={dropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t('1. ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ (ಹುಡುಕಿ ಮತ್ತು ಆರಿಸಿ)', '1. Select District (Search & Pick)')}
                    </label>
                    <span className="text-[11px] text-blue-700 font-bold">
                      {districts.length || 31} {t('ಜಿಲ್ಲೆಗಳು ಲಭ್ಯ', 'districts available')}
                    </span>
                  </div>

                  {/* Interactive Search Bar that Displays Selected District */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                      <input
                        type="text"
                        value={districtSearch}
                        onChange={(e) => {
                          setDistrictSearch(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={t('31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ...', 'Type to search any of 31 districts...')}
                        className="w-full pl-10 pr-16 py-3 bg-blue-50/50 border-2 border-blue-300 rounded-xl text-sm font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                      />
                      <div className="absolute right-2.5 flex items-center gap-1">
                        {districtSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setDistrictSearch('');
                              setIsDropdownOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                            title="Clear search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded-md cursor-pointer"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Search Results Dropdown Popover */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {filteredDistricts.length > 0 ? (
                          filteredDistricts.map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleApplyDistrict(d.name)}
                              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-blue-50/80 transition-colors cursor-pointer ${
                                selectedDistrict === d.name ? 'bg-blue-50/90 font-bold' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${selectedDistrict === d.name ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-slate-300'}`} />
                                <div>
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{d.name}</span>
                                    {d.name === 'Bengaluru' && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                        {t('ಪ್ರಾಥಮಿಕ ಡೆಮೋ', 'Primary Demo')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {t('ಉಸ್ತುವಾರಿ:', 'In-Charge:')} <strong className="text-slate-700">{d.incharge_name}</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-mono font-semibold text-slate-400 block">
                                  {d.total_contacts?.toLocaleString('en-IN')} {t('ಸಂಪರ್ಕಗಳು', 'contacts')}
                                </span>
                                {selectedDistrict === d.name && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{t('ಆಯ್ಕೆಯಾಗಿದೆ', 'Selected')}</span>
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            "{districtSearch}" {t('ಗೆ ಹೊಂದುವ ಯಾವುದೇ ಜಿಲ್ಲೆ ಕಂಡುಬಂದಿಲ್ಲ.', 'No matching district found.')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Popular District Quick Select Pills */}
                  <div className="pt-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                      {t('ಜನಪ್ರಿಯ ಜಿಲ್ಲೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:', 'Quick Select Popular Districts:')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularDistricts.map((pName) => (
                        <button
                          key={pName}
                          type="button"
                          onClick={() => handleApplyDistrict(pName)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            selectedDistrict === pName
                              ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {pName === 'Bengaluru' ? '★ Bengaluru' : pName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTIVE DISTRICT CARD */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('ಸಕ್ರಿಯ ವ್ಯಾಪ್ತಿ:', 'Active Jurisdiction:')} {selectedDistrict}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {t('ಉಸ್ತುವಾರಿ:', 'In-Charge:')} {selectedDistrictInfo.incharge_name || getDistrictCredentials(selectedDistrict).name}
                    </div>
                    <div className="text-xs text-blue-700 font-mono mt-0.5">
                      {getDistrictCredentials(selectedDistrict).email}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      {t('ರುಜುವಾತುಗಳು ಸಿದ್ಧ', 'Credentials Ready')}
                    </span>
                  </div>
                </div>

                {/* STEP 2: CREDENTIALS & SUBMIT */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {t('ಉಸ್ತುವಾರಿ ಇಮೇಲ್', 'In-Charge Email')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {t('ಗುಪ್ತಪದ', 'Password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {loading 
                        ? t('ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...', 'Authenticating...') 
                        : `${t('ಕಮಾಂಡ್ ಪ್ರವೇಶಿಸಿ', 'Enter Command')} (${selectedDistrict})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Bengaluru quick link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('ಡೆಮೋ ಉಸ್ತುವಾರಿ ಶಾರ್ಟ್ಕಟ್:', 'Demo In-Charge Shortcut:')}</span>
                  <button
                    type="button"
                    onClick={() => handleApplyDistrict('Bengaluru')}
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Bengaluru (Suresh Gowda)
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Security Watermark */}
        <p className="text-center text-xs text-slate-500 mt-6">
          {t(
            'ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ಆಡಳಿತ ಕಮಾಂಡ್ನ ಅಧಿಕೃತ ಸಿಬ್ಬಂದಿಗೆ ಮಾತ್ರ ಪ್ರವೇಶ.',
            'Authorized access only for Karnataka District Administration Command personnel.'
          )}
        </p>

      </div>
    </div>
  );
}
