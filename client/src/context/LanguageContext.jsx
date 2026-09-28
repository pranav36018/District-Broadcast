import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Dictionary for automatic phrase lookup and common translations
export const DICTIONARY = {
  // Navigation & Branding
  'ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ': { en: 'Connect Karnataka', kn: 'ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ' },
  'Connect Karnataka': { en: 'Connect Karnataka', kn: 'ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ' },
  'ಜಿಲ್ಲಾ ಸಂಪರ್ಕ ವೇದಿಕೆ': { en: 'District Contact Platform', kn: 'ಜಿಲ್ಲಾ ಸಂಪರ್ಕ ವೇದಿಕೆ' },
  'ಡ್ಯಾಶ್ಬೋರ್ಡ್': { en: 'Dashboard', kn: 'ಡ್ಯಾಶ್ಬೋರ್ಡ್' },
  'Dashboard': { en: 'Dashboard', kn: 'ಡ್ಯಾಶ್ಬೋರ್ಡ್' },
  'ಸಂಪರ್ಕಗಳು': { en: 'Contacts', kn: 'ಸಂಪರ್ಕಗಳು' },
  'Contacts': { en: 'Contacts', kn: 'ಸಂಪರ್ಕಗಳು' },
  'ನನ್ನ ಸಂಪರ್ಕಗಳು': { en: 'My Contacts', kn: 'ನನ್ನ ಸಂಪರ್ಕಗಳು' },
  'My Contacts': { en: 'My Contacts', kn: 'ನನ್ನ ಸಂಪರ್ಕಗಳು' },
  'ಜಿಲ್ಲೆಗಳು': { en: 'Districts', kn: 'ಜಿಲ್ಲೆಗಳು' },
  'Districts': { en: 'Districts', kn: 'ಜಿಲ್ಲೆಗಳು' },
  'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿಗಳು': { en: 'District In-Charges', kn: 'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿಗಳು' },
  'District In-Charges': { en: 'District In-Charges', kn: 'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿಗಳು' },
  'ಕರೆಗಳು': { en: 'Calls', kn: 'ಕರೆಗಳು' },
  'Calls': { en: 'Calls', kn: 'ಕರೆಗಳು' },
  'ಪ್ರಸಾರ & ಧ್ವನಿ': { en: 'Broadcast & Voice', kn: 'ಪ್ರಸಾರ & ಧ್ವನಿ' },
  'Broadcast & Voice': { en: 'Broadcast & Voice', kn: 'ಪ್ರಸಾರ & ಧ್ವನಿ' },
  'ವಿಶ್ಲೇಷಣೆ': { en: 'Analytics', kn: 'ವಿಶ್ಲೇಷಣೆ' },
  'Analytics': { en: 'Analytics', kn: 'ವಿಶ್ಲೇಷಣೆ' },
  'ವರದಿಗಳು': { en: 'Reports', kn: 'ವರದಿಗಳು' },
  'Reports': { en: 'Reports', kn: 'ವರದಿಗಳು' },
  'ಆಡಿಟ್ ದಾಖಲೆಗಳು': { en: 'Audit Logs', kn: 'ಆಡಿಟ್ ದಾಖಲೆಗಳು' },
  'Audit Logs': { en: 'Audit Logs', kn: 'ಆಡಿಟ್ ದಾಖಲೆಗಳು' },
  'ನಿರ್ಗಮನ': { en: 'Logout', kn: 'ನಿರ್ಗಮನ' },
  'Logout': { en: 'Logout', kn: 'ನಿರ್ಗಮನ' },

  // Roles
  'ಸೂಪರ್ ಆಡ್ಮಿನ್': { en: 'Super Admin', kn: 'ಸೂಪರ್ ಆಡ್ಮಿನ್' },
  'ಸೂಪರ್ ಆಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್': { en: 'Super Administrator', kn: 'ಸೂಪರ್ ಆಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್' },
  'Super Admin': { en: 'Super Admin', kn: 'ಸೂಪರ್ ಆಡ್ಮಿನ್' },
  'Super Administrator': { en: 'Super Administrator', kn: 'ಸೂಪರ್ ಆಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್' },
  'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ': { en: 'District In-Charge', kn: 'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ' },
  'District In-Charge': { en: 'District In-Charge', kn: 'ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ' },

  // Status & Traffic Light Responses
  'ಒಪ್ಪಿಗೆ': { en: 'Agree', kn: 'ಒಪ್ಪಿಗೆ' },
  'Agree': { en: 'Agree', kn: 'ಒಪ್ಪಿಗೆ' },
  'agree': { en: 'Agree', kn: 'ಒಪ್ಪಿಗೆ' },
  'ತಟಸ್ಥ': { en: 'Neutral', kn: 'ತಟಸ್ಥ' },
  'Neutral': { en: 'Neutral', kn: 'ತಟಸ್ಥ' },
  'neutral': { en: 'Neutral', kn: 'ತಟಸ್ಥ' },
  'ಅಸಮ್ಮತಿ': { en: 'Disagree', kn: 'ಅಸಮ್ಮತಿ' },
  'Disagree': { en: 'Disagree', kn: 'ಅಸಮ್ಮತಿ' },
  'disagree': { en: 'Disagree', kn: 'ಅಸಮ್ಮತಿ' },
  'ಸಂಪರ್ಕಿಸಿಲ್ಲ': { en: 'Not Contacted', kn: 'ಸಂಪರ್ಕಿಸಿಲ್ಲ' },
  'Not Contacted': { en: 'Not Contacted', kn: 'ಸಂಪರ್ಕಿಸಿಲ್ಲ' },
  'not_contacted': { en: 'Not Contacted', kn: 'ಸಂಪರ್ಕಿಸಿಲ್ಲ' },

  // Outcomes
  'ಸಂಪರ್ಕಿತ': { en: 'Connected', kn: 'ಸಂಪರ್ಕಿತ' },
  'Connected': { en: 'Connected', kn: 'ಸಂಪರ್ಕಿತ' },
  'connected': { en: 'Connected', kn: 'ಸಂಪರ್ಕಿತ' },
  'ಉತ್ತರವಿಲ್ಲ': { en: 'No Answer', kn: 'ಉತ್ತರವಿಲ್ಲ' },
  'No Answer': { en: 'No Answer', kn: 'ಉತ್ತರವಿಲ್ಲ' },
  'ಕಾರ್ಯನಿರತ': { en: 'Busy', kn: 'ಕಾರ್ಯನಿರತ' },
  'Busy': { en: 'Busy', kn: 'ಕಾರ್ಯನಿರತ' },
  'ವಿಫಲ': { en: 'Failed', kn: 'ವಿಫಲ' },
  'Failed': { en: 'Failed', kn: 'ವಿಫಲ' },
  'ನಂತರ ಕರೆ ಮಾಡಿ': { en: 'Call Back Later', kn: 'ನಂತರ ಕರೆ ಮಾಡಿ' },
  'Call Back Later': { en: 'Call Back Later', kn: 'ನಂತರ ಕರೆ ಮಾಡಿ' },

  // Common UI Actions
  'ಈಗ ಕರೆ ಮಾಡಿ': { en: 'Call Now', kn: 'ಈಗ ಕರೆ ಮಾಡಿ' },
  'ಕರೆ ಮಾಡಿ': { en: 'Call', kn: 'ಕರೆ ಮಾಡಿ' },
  'ಪ್ರೊಫೈಲ್': { en: 'Profile', kn: 'ಪ್ರೊಫೈಲ್' },
  'ಅಳಿಸಿ': { en: 'Delete', kn: 'ಅಳಿಸಿ' },
  'ರಿಫ್ರೆಶ್': { en: 'Refresh', kn: 'ರಿಫ್ರೆಶ್' },
  'ರದ್ದು': { en: 'Cancel', kn: 'ರದ್ದು' },
  'ರದ್ದು ಮಾಡಿ': { en: 'Cancel', kn: 'ರದ್ದು ಮಾಡಿ' },
  'ಉಳಿಸಿ': { en: 'Save', kn: 'ಉಳಿಸಿ' },
  'ಹುಡುಕಿ': { en: 'Search', kn: 'ಹುಡುಕಿ' },
  'ಆಮದು ಮಾಡಿ': { en: 'Import', kn: 'ಆಮದು ಮಾಡಿ' },
  'ರಫ್ತು ಮಾಡಿ': { en: 'Export', kn: 'ರಫ್ತು ಮಾಡಿ' },
  'ತೆರವುಗೊಳಿಸಿ': { en: 'Clear', kn: 'ತೆರವುಗೊಳಿಸಿ' },
  'ಪರಿಶೀಲಿಸಿ': { en: 'Inspect', kn: 'ಪರಿಶೀಲಿಸಿ' },
  'ಆಯ್ಕೆಯಾಗಿದೆ': { en: 'Selected', kn: 'ಆಯ್ಕೆಯಾಗಿದೆ' },

  // District Names in Kannada
  'Bengaluru': { en: 'Bengaluru', kn: 'ಬೆಂಗಳೂರು' },
  'Bengaluru Urban': { en: 'Bengaluru Urban', kn: 'ಬೆಂಗಳೂರು ನಗರ' },
  'Bengaluru Rural': { en: 'Bengaluru Rural', kn: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ' },
  'Mysuru': { en: 'Mysuru', kn: 'ಮೈಸೂರು' },
  'Belagavi': { en: 'Belagavi', kn: 'ಬೆಳಗಾವಿ' },
  'Kalaburagi': { en: 'Kalaburagi', kn: 'ಕಲಬುರಗಿ' },
  'Hubballi-Dharwad': { en: 'Hubballi-Dharwad', kn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ' },
  'Dharwad': { en: 'Dharwad', kn: 'ಧಾರವಾಡ' },
  'Mangaluru': { en: 'Mangaluru', kn: 'ಮಂಗಳೂರು' },
  'Dakshina Kannada': { en: 'Dakshina Kannada', kn: 'ದಕ್ಷಿಣ ಕನ್ನಡ' },
  'Shivamogga': { en: 'Shivamogga', kn: 'ಶಿವಮೊಗ್ಗ' },
  'Tumakuru': { en: 'Tumakuru', kn: 'ತುಮಕೂರು' },
  'Ballari': { en: 'Ballari', kn: 'ಬಳ್ಳಾರಿ' },
  'Vijayapura': { en: 'Vijayapura', kn: 'ವಿಜಯಪುರ' },
  'Bagalkote': { en: 'Bagalkote', kn: 'ಬಾಗಲಕೋಟೆ' },
  'Bagalkot': { en: 'Bagalkot', kn: 'ಬಾಗಲಕೋಟೆ' },
  'Bidar': { en: 'Bidar', kn: 'ಬೀದರ್' },
  'Chamarajanagar': { en: 'Chamarajanagar', kn: 'ಚಾಮರಾಜನಗರ' },
  'Chikkaballapura': { en: 'Chikkaballapura', kn: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ' },
  'Chikkamagaluru': { en: 'Chikkamagaluru', kn: 'ಚಿಕ್ಕಮಗಳೂರು' },
  'Chitradurga': { en: 'Chitradurga', kn: 'ಚಿತ್ರದುರ್ಗ' },
  'Davanagere': { en: 'Davanagere', kn: 'ದಾವಣಗೆರೆ' },
  'Gadag': { en: 'Gadag', kn: 'ಗದಗ' },
  'Hassan': { en: 'Hassan', kn: 'ಹಾಸನ' },
  'Haveri': { en: 'Haveri', kn: 'ಹಾವೇರಿ' },
  'Kodagu': { en: 'Kodagu', kn: 'ಕೊಡಗು' },
  'Kolar': { en: 'Kolar', kn: 'ಕೋಲಾರ' },
  'Koppal': { en: 'Koppal', kn: 'ಕೊಪ್ಪಳ' },
  'Mandya': { en: 'Mandya', kn: 'ಮಂಡ್ಯ' },
  'Raichur': { en: 'Raichur', kn: 'ರಾಯಚೂರು' },
  'Ramanagara': { en: 'Ramanagara', kn: 'ರಾಮನಗರ' },
  'Udupi': { en: 'Udupi', kn: 'ಉಡುಪಿ' },
  'Uttara Kannada': { en: 'Uttara Kannada', kn: 'ಉತ್ತರ ಕನ್ನಡ' },
  'Vijayanagara': { en: 'Vijayanagara', kn: 'ವಿಜಯನಗರ' },
  'Bengaluru 1': { en: 'Bengaluru 1', kn: 'ಬೆಂಗಳೂರು ೧' },
  'Bengaluru District': { en: 'Bengaluru District', kn: 'ಬೆಂಗಳೂರು ಜಿಲ್ಲೆ' },
  'Kannada Sahitya Sammelana': { en: 'Kannada Sahitya Sammelana', kn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ' },
  'Kannada Sahitya Sammelana Data': { en: 'Kannada Sahitya Sammelana Data', kn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ ಡೇಟಾ' },
  'KASP Master Directory': { en: 'KASP Master Directory', kn: 'ಕಸಾಪ ಮಾಸ್ಟರ್ ನಿರ್ದೇಶಿಕೆ' },
  'Karnataka State Directory': { en: 'Karnataka State Directory', kn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಿರ್ದೇಶಿಕೆ' },
  'Yadgir': { en: 'Yadgir', kn: 'ಯಾದಗಿರಿ' },
  'Yadgiri': { en: 'Yadgiri', kn: 'ಯಾದಗಿರಿ' },

  // Add District UI
  'ಹೊಸ ಜಿಲ್ಲೆ ಸೇರಿಸಿ': { en: 'Add District', kn: 'ಹೊಸ ಜಿಲ್ಲೆ ಸೇರಿಸಿ' },
  'ಹೊಸ ಜಿಲ್ಲೆ / ಉಸ್ತುವಾರಿ ಸೇರಿಸಿ': { en: 'Add District & In-Charge', kn: 'ಹೊಸ ಜಿಲ್ಲೆ / ಉಸ್ತುವಾರಿ ಸೇರಿಸಿ' },
  'ಜಿಲ್ಲೆಯ ಹೆಸರು': { en: 'District Name', kn: 'ಜಿಲ್ಲೆಯ ಹೆಸರು' },
  'ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು': { en: 'Name in Kannada', kn: 'ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು' },
  'ಆಡಳಿತ ವಿಭಾಗ': { en: 'Administrative Division', kn: 'ಆಡಳಿತ ವಿಭಾಗ' },
  'ಉಸ್ತುವಾರಿ ಅಧಿಕಾರಿ': { en: 'In-Charge Officer', kn: 'ಉಸ್ತುವಾರಿ ಅಧಿಕಾರಿ' }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('ck_language') || 'kn';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('ck_language', lang);
  };

  const toggleLanguage = () => {
    const next = language === 'kn' ? 'en' : 'kn';
    setLanguage(next);
  };

  /**
   * Dual-usage translation function:
   * 1. t(knText, enText) -> returns enText if language === 'en', else knText
   * 2. t(keyOrPhrase) -> looks up in DICTIONARY, returns language variant or fallback
   */
  const t = (knOrKey, enFallback) => {
    if (enFallback !== undefined && enFallback !== null) {
      return language === 'en' ? enFallback : knOrKey;
    }

    if (!knOrKey) return '';

    const entry = DICTIONARY[knOrKey];
    if (entry && entry[language]) {
      return entry[language];
    }

    return knOrKey;
  };

  // Helper to format district name: if language is Kannada, shows Kannada (or both)
  const formatDistrictName = (name, customKn) => {
    if (!name) return '';
    if (customKn && language === 'kn') return customKn;
    const entry = DICTIONARY[name];
    if (entry) {
      return language === 'kn' ? entry.kn : entry.en;
    }
    return name;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatDistrictName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Reusable Language Toggle component with polished design
 * Options:
 * - dark: true for dark headers/backgrounds (like Login card or dark banner)
 * - size: 'sm' | 'md'
 */
export function LanguageToggle({ className = '', dark = false, size = 'sm' }) {
  const { language, setLanguage } = useLanguage();

  const isDark = dark;
  const padding = size === 'sm' ? 'py-1 px-2.5 text-xs' : 'py-1.5 px-3 text-xs';

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={`inline-flex items-center rounded-xl p-0.5 select-none transition-all shadow-sm ${
        isDark
          ? 'bg-slate-800/90 border border-slate-700/80 shadow-slate-950/40'
          : 'bg-slate-100 border border-slate-200/90 shadow-inner'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('kn')}
        className={`${padding} rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
          language === 'kn'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
            : isDark
            ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
        }`}
        title="ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ"
      >
        <span>ಕನ್ನಡ</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`${padding} rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
            : isDark
            ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
        }`}
        title="Switch to English"
      >
        <span>English</span>
      </button>
    </div>
  );
}
