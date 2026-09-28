import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  ClipboardList,
  PhoneCall,
  Radio,
  Mic,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }) {
  const { t, language, formatDistrictName } = useLanguage();
  const isSuperAdmin = user?.role === 'super_admin';

  const userDistrictName = user?.district ? formatDistrictName(user.district) : (language === 'en' ? 'Bengaluru' : 'ಬೆಂಗಳೂರು');

  const navItems = [
    { id: 'dashboard', label: t('ಡ್ಯಾಶ್ಬೋರ್ಡ್', 'Dashboard'), icon: LayoutDashboard, show: true },
    { id: 'contacts', label: t('ಸಂಪರ್ಕಗಳು (ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು)', 'Contacts (All 31 Districts)'), icon: Users, show: isSuperAdmin },
    { id: 'my-contacts', label: t('ನನ್ನ ಸಂಪರ್ಕಗಳು', 'My Contacts'), icon: UserCheck, show: !isSuperAdmin, badge: user?.district ? user.district.split(' ')[0] : 'Local' },
    { id: 'districts', label: t('ಜಿಲ್ಲೆಗಳು', 'Districts'), icon: MapPin, show: isSuperAdmin, badge: '31' },
    { id: 'incharges', label: t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿಗಳು', 'District In-Charges'), icon: ShieldCheck, show: isSuperAdmin, badge: '31' },
    { id: 'calls', label: t('ಕರೆಗಳು', 'Calls'), icon: PhoneCall, show: true },
    { id: 'broadcasts', label: t('ಪ್ರಸಾರ & ಧ್ವನಿ', 'Broadcast & Voice'), icon: Radio, show: true, highlight: true },
    { id: 'analytics', label: t('ವಿಶ್ಲೇಷಣೆ', 'Analytics'), icon: BarChart3, show: true },
    { id: 'reports', label: t('ವರದಿಗಳು', 'Reports'), icon: FileSpreadsheet, show: true },
    { id: 'audit-logs', label: t('ಆಡಿಟ್ ದಾಖಲೆಗಳು', 'Audit Logs'), icon: History, show: isSuperAdmin },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
            CK
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              {t('ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ', 'Connect Karnataka')}
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
              {t('ಜಿಲ್ಲಾ ಸಂಪರ್ಕ ವೇದಿಕೆ', 'District Contact Platform')}
            </p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 bg-slate-800/60 mx-3 mt-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            {isSuperAdmin ? t('ಸೂಪರ್ ಆಡ್ಮಿನ್', 'Super Admin') : t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ', 'District In-Charge')}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-xs font-semibold text-white mt-0.5 truncate">{user?.name}</p>
        <p className="text-[11px] text-slate-400 truncate">
          {isSuperAdmin 
            ? t('ರಾಜ್ಯ-ವ್ಯಾಪಿ ಪ್ರವೇಶ (31 ಜಿಲ್ಲೆಗಳು)', 'State-wide Access (31 Districts)')
            : `${t('ನಿಯೋಜಿತ:', 'Assigned:')} ${userDistrictName}`}
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.filter(item => item.show).map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('ನಿರ್ಗಮನ', 'Logout')} ({user?.name?.split(' ')[0]})</span>
        </button>
      </div>
    </aside>
  );
}
