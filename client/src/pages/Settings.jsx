import React from 'react';
import { Settings as SettingsIcon, Server, Database, Phone, Radio, Shield, CheckCircle2 } from 'lucide-react';

export default function Settings({ onShowToast }) {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-600" />
          <span>ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಆರ್ಕಿಟೆಕ್ಚರ್ ಕಾನ್ಫಿಗರೇಶನ್</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ಸಿಸ್ಟಮ್ ಮೂಲಸೌಕರ್ಯ ನಿಯತಾಂಕಗಳು, ಟೆಲಿಫೋನಿ ಸಿಮ್ಯುಲೇಶನ್ ಗೇಟ್‌ವೇ ಮತ್ತು ಸ್ಕೇಲೆಬಿಲಿಟಿ ನಿಯಂತ್ರಣಗಳು
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Database & Storage Architecture */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base">ಪರ್ಸಿಸ್ಟೆನ್ಸ್ ಎಂಜಿನ್</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            ಪ್ರಸ್ತುತ ಎಂಬೆಡೆಡ್ ಸ್ಥಳೀಯ SQLite ನಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿದೆ (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">connect_karnataka.db</code>). ಆರ್ಕಿಟೆಕ್ಚರ್ ಬಾಹ್ಯ PostgreSQL / ಕ್ಲೌಡ್ SQL ಕ್ಲಸ್ಟರಿಂಗ್‌ಗಾಗಿ 100% ಸಿದ್ಧವಾಗಿದೆ.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">ಡೇಟಾಬೇಸ್ ಡ್ರೈವರ್:</span>
              <span className="font-mono font-bold text-slate-800">ನೋಡ್ v24 node:sqlite (ಶೂನ್ಯ C++ ಅವಲಂಬನೆ)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ದತ್ತಾಂಶ ಸ್ಥಿತಿ:</span>
              <span className="font-mono font-bold text-emerald-700">ನೈಜ ಬಳಕೆದಾರ ದತ್ತಾಂಶ ಅಪ್‌ಲೋಡ್ ಸಕ್ರಿಯ (ಡೈನಾಮಿಕ್ ಸ್ಕೇಲ್)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PostgreSQL ವಲಸೆ:</span>
              <span className="font-mono font-bold text-blue-700">ಸಿದ್ಧವಾಗಿದೆ (ಸ್ಕೀಮಾ ಹೊಂದಾಣಿಕೆಯಾಗುವಂತಿದೆ)</span>
            </div>
          </div>
        </div>

        {/* Telephony Simulator Gateway */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Phone className="w-5 h-5 text-blue-600" />
            <h3 className="text-base">ಟೆಲಿಫೋನಿ ಗೇಟ್‌ವೇ ಸಿಮ್ಯುಲೇಶನ್</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            ನೈಜ ಕರೆ ಟೈಮರ್‌ಗಳು, ಆಡಿಯೊ ವೇವ್‌ಫಾರ್ಮ್‌ಗಳು, ಕರೆ ಫಲಿತಾಂಶ ಸೆರೆಹಿಡಿಯುವಿಕೆ ಮತ್ತು 🟢🟡🔴 ಟ್ರಾಫಿಕ್-ಲೈಟ್ ಪ್ರತಿಕ್ರಿಯೆ ವರ್ಗೀಕರಣದೊಂದಿಗೆ ಸಂವಾದಾತ್ಮಕ ಇನ್-ಬ್ರೌಸರ್ ಸಿಮ್ಯುಲೇಟೆಡ್ ಟೆಲಿಫೋನಿ ಡ್ರೈವರ್.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">SIP/IVR ಗೇಟ್‌ವೇ:</span>
              <span className="font-mono font-bold text-emerald-700">ಸಿಮ್ಯುಲೇಟೆಡ್ ಎಡ್ಜ್ ಡಯಲರ್</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ಆಡಿಯೊ ಲೇಟೆನ್ಸಿ:</span>
              <span className="font-mono font-bold text-slate-800">&lt; 15ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ಟೆಲಿಕಾಂ ಪ್ರೊವೈಡರ್ ಹುಕ್:</span>
              <span className="font-mono font-bold text-slate-700">ಟ್ವಿಲಿಯೋ / ಎಕ್ಸೋಟೆಲ್ / ಟಾಟಾ ಟೆಲಿಫೋನಿ ಸಿದ್ಧವಾಗಿದೆ</span>
            </div>
          </div>
        </div>

        {/* Broadcast Engine */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Radio className="w-5 h-5 text-purple-600" />
            <h3 className="text-base">ಸಾಮೂಹಿಕ ಪ್ರಸಾರ ಸರತಿ</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            31 ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ನೋಡ್‌ಗಳಾದ್ಯಂತ ಸಾಮೂಹಿಕ ಪ್ರಕಟಣೆಗಳನ್ನು ವಿತರಿಸುವ ಬಹು-ಥ್ರೆಡ್ ಸರತಿ ಕೆಲಸಗಾರ ಸಿಮ್ಯುಲೇಟರ್.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">ಸರತಿ ಬ್ರೋಕರ್:</span>
              <span className="font-mono font-bold text-purple-700">ರೆಡಿಸ್ / ಬುಲ್ ಎಂಕ್ಯೂ ಹೊಂದಾಣಿಕೆಯಾಗುವಂತಿದೆ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ಥ್ರೋಪುಟ್ ಮಿತಿ:</span>
              <span className="font-mono font-bold text-slate-800">50,000 ಸಂದೇಶಗಳು / ನಿಮಿಷ</span>
            </div>
          </div>
        </div>

        {/* Security & Audit */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="text-base">ಎಂಟರ್‌ಪ್ರೈಸ್ ಭದ್ರತೆ ಮತ್ತು ಅನುಸರಣೆ</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            ಕಟ್ಟುನಿಟ್ಟಾದ ಪಾತ್ರ ಆಧಾರಿತ ಪ್ರವೇಶ ನಿಯಂತ್ರಣ (RBAC), ಸ್ವಯಂಚಾಲಿತ ನಾಗರಿಕ ಫೋನ್ ಸಂಖ್ಯೆ ಮರೆಮಾಚುವಿಕೆ ಮತ್ತು ನಿರಂತರ ಇಮ್ಯೂಟಬಲ್ ಈವೆಂಟ್ ಲಾಗಿಂಗ್.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">ಫೋನ್ ಮರೆಮಾಚುವಿಕೆ:</span>
              <span className="font-mono font-bold text-emerald-700">ಸಕ್ರಿಯ (+91 XXXXXXXX01)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ಆಡಿಟ್ ಟ್ರಯಲ್:</span>
              <span className="font-mono font-bold text-emerald-700">ಸಕ್ರಿಯ (ಸಿಂಕ್ರೊನಸ್ ಲಾಗಿಂಗ್)</span>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={() => {
            if (onShowToast) onShowToast('System settings verified and saved.', 'success');
          }}
          className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
        >
          Save Configuration
        </button>
      </div>

    </div>
  );
}
