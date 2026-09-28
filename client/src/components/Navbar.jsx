import React from 'react';
import { Bell, Search, ShieldCheck, MapPin, Clock, Radio } from 'lucide-react';
import { useLanguage, LanguageToggle } from '../context/LanguageContext.jsx';

export default function Navbar({ currentTab, user, onCallNowDemo }) {
  const { t, language, formatDistrictName } = useLanguage();
  const isSuperAdmin = user?.role === 'super_admin';

  const userDistrictName = user?.district ? formatDistrictName(user.district) : (language === 'en' ? 'Field Operations' : 'ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ');

  const tabTitles = {
    dashboard: isSuperAdmin 
      ? t('ರಾಜ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್', 'State Executive Dashboard')
      : `${t('ಜಿಲ್ಲಾ ಕಮಾಂಡ್ ಸೆಂಟರ್', 'District Command Center')} — ${userDistrictName}`,
    contacts: t('ನಿರ್ದೇಶಿಕೆ — ಎಲ್ಲಾ ಸಂಪರ್ಕಗಳು (ಕರ್ನಾಟಕ 31 ಜಿಲ್ಲೆಗಳು)', 'Directory — All Contacts (Karnataka 31 Districts)'),
    'my-contacts': `${t('ಜಿಲ್ಲಾ ನಿರ್ದೇಶಿಕೆ', 'District Directory')} — ${userDistrictName}`,
    districts: t('ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಗಳು (31)', 'Karnataka Districts (31)'),
    incharges: t('ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ ನಿರ್ದೇಶನಾಲಯ (ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು)', 'Karnataka District In-Charge Directorate (All 31 Districts)'),
    calls: t('ಕರೆ ದಾಖಲೆಗಳು & ಸಂವಹನ ಇತಿಹಾಸ', 'Call Logs & Communication History'),
    broadcasts: t('ಸಾಮೂಹಿಕ ಪ್ರಸಾರ & ಧ್ವನಿ ಸಂವಹನ ಗೇಟ್ವೇ', 'Mass Broadcast & Voice Communication Gateway'),
    analytics: t('ರಾಜ್ಯ-ವ್ಯಾಪಿ ಅಭಿಪ್ರಾಯ & ಕರೆ ವಿಶ್ಲೇಷಣೆ', 'State-wide Sentiment & Call Analytics'),
    reports: t('ಎಂಟರ್ಪ್ರೈಸ್ ದತ್ತಾಂಶ ವರದಿಗಳು & CSV ರಫ್ತು', 'Enterprise Data Reports & CSV Export'),
    'audit-logs': t('ಬದಲಾಯಿಸಲಾಗದ ಆಡಿಟ್ ದಾಖಲೆಗಳು & ಘಟನೆ ಮಾರ್ಗ', 'Immutable Audit Logs & Event Trail')
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="truncate">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">
            {tabTitles[currentTab] || t('ಡ್ಯಾಶ್ಬೋರ್ಡ್', 'Dashboard')}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{t('ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ', 'Connect Karnataka')}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold truncate">
              {isSuperAdmin 
                ? t('ರಾಜ್ಯ ಮಟ್ಟದ ಮೇಲ್ವಿಚಾರಣೆ', 'State-Level Oversight') 
                : `${t('ಜಿಲ್ಲಾ ಮಟ್ಟ', 'District Level')} — ${userDistrictName}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher Component */}
        <LanguageToggle size="sm" />

        {/* State Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t('ಕರ್ನಾಟಕ ಸಂಪರ್ಕ ಜಾಲ ಸಕ್ರಿಯ', 'Karnataka Network Active')}</span>
        </div>

        {/* Current In-charge Badge */}
        {!isSuperAdmin && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{userDistrictName} {t('ಸಕ್ರಿಯ', 'Active')}</span>
          </div>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {user?.name?.slice(0, 2) || 'CK'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isSuperAdmin 
                ? t('ಸೂಪರ್ ಆಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್', 'Super Administrator') 
                : t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ', 'District In-Charge')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
