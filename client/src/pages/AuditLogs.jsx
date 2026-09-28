import React, { useState, useEffect } from 'react';
import { History, Search, Shield, RefreshCw, Clock, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AuditLogs() {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>{t('ಬದಲಾಯಿಸಲಾಗದ ಪ್ಲಾಟ್ಫಾರ್ಮ್ ಆಡಿಟ್ ದಾಖಲೆಗಳು', 'Immutable Platform Audit Logs')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'ದೃಢೀಕರಣ, ಸ್ಥಿತಿ ಬದಲಾವಣೆಗಳು, ಕರೆ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಪ್ರಸಾರಗಳನ್ನು ದಾಖಲಿಸುವ ಕಾಲಾನುಕ್ರಮ ಆಡಿಟ್ ಮಾರ್ಗ',
              'Chronological audit trail recording authentication, status changes, calling milestones, and broadcasts'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('ಮಾರ್ಗ ರಿಫ್ರೆಶ್ ಮಾಡಿ', 'Refresh Trail')}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('ಕ್ರಿಯೆ, ಬಳಕೆದಾರ ಅಥವಾ ಮೈಲಿಗಲ್ಲು ಹುಡುಕಿ...', 'Search action, user, or milestone...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-6">{t('ಬಳಕೆದಾರ / ಕರ್ತೃ', 'User / Actor')}</th>
                <th className="py-3.5 px-6">{t('ಕ್ರಿಯೆ / ಘಟನೆ', 'Action / Event')}</th>
                <th className="py-3.5 px-4">{t('ದಿನಾಂಕ', 'Date')}</th>
                <th className="py-3.5 px-4">{t('ಸಮಯ', 'Time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    {loading 
                      ? t('ಆಡಿಟ್ ಘಟನೆಗಳನ್ನು ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ...', 'Retrieving audit events...') 
                      : t('ಯಾವುದೇ ಆಡಿಟ್ ದಾಖಲೆಗಳು ಪ್ರಶ್ನೆಗೆ ಹೊಂದುತ್ತಿಲ್ಲ.', 'No audit records match query.')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* User */}
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                        {log.user_name?.slice(0, 2) || 'AD'}
                      </div>
                      <div>
                        <div>{log.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.user_email}</div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-6 text-xs text-slate-700 font-medium">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                        {log.action}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {log.date}
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono font-bold">
                      {log.time}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
