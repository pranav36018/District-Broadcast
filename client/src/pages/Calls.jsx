import React, { useState, useEffect } from 'react';
import { PhoneCall, Search, Filter, Calendar, Clock, ArrowUpDown, RefreshCw, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Calls({ refreshTrigger }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [calls, setCalls] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [responseFilter, setResponseFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDistrictsList(d); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [search, districtFilter, responseFilter, outcomeFilter, refreshTrigger]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        district: districtFilter,
        response: responseFilter,
        outcome: outcomeFilter
      });
      const res = await fetch(`/api/calls?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderResponseBadge = (response) => {
    switch (response) {
      case 'agree':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span>🟢</span> {t('ಒಪ್ಪಿಗೆ', 'Agree')}
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span>🟡</span> {t('ತಟಸ್ಥ', 'Neutral')}
          </span>
        );
      case 'disagree':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span>🔴</span> {t('ಅಸಮ್ಮತಿ', 'Disagree')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {t(response)}
          </span>
        );
    }
  };

  const formatOutcome = (outcome) => {
    return t(outcome);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-600" />
            <span>{t('ಕರೆ ದಾಖಲೆಗಳು & ದೂರವಾಣಿ ಇತಿಹಾಸ', 'Call Logs & Telephony History')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'ಸಂಭಾಷಣೆಗಳ, ಪ್ರತಿಕ್ರಿಯೆ ಅಭಿಪ್ರಾಯ ಮತ್ತು ಕರೆ ಮಾಡುವವರ ಟಿಪ್ಪಣಿಗಳ ಸಂಪೂರ್ಣ ಆಡಿಟ್ ದಾಖಲೆ',
              'Complete audit trail of conversations, sentiment feedback, and caller notes'
            )}
          </p>
        </div>

        <button
          onClick={fetchCalls}
          className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('ದಾಖಲೆಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ', 'Refresh Logs')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t('ನಾಗರಿಕ ಅಥವಾ ಟಿಪ್ಪಣಿ ಹುಡುಕಿ...', 'Search citizen or notes...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('ಜಿಲ್ಲೆ:', 'District:')}
          </span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">{t('ಎಲ್ಲಾ ಕರ್ನಾಟಕ (31)', 'All Karnataka (31)')}</option>
            {districtsList.map((d) => (
              <option key={d.id} value={d.name}>
                {formatDistrictName(d.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Response Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('ಪ್ರತಿಕ್ರಿಯೆ:', 'Response:')}
          </span>
          <select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value)}
            className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">{t('ಎಲ್ಲಾ ಪ್ರತಿಕ್ರಿಯೆಗಳು', 'All Responses')}</option>
            <option value="agree">🟢 {t('ಒಪ್ಪಿಗೆ', 'Agree')}</option>
            <option value="neutral">🟡 {t('ತಟಸ್ಥ', 'Neutral')}</option>
            <option value="disagree">🔴 {t('ಅಸಮ್ಮತಿ', 'Disagree')}</option>
          </select>
        </div>

        {/* Outcome Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('ಫಲಿತಾಂಶ:', 'Outcome:')}
          </span>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">{t('ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳು', 'All Outcomes')}</option>
            <option value="Connected">{t('ಸಂಪರ್ಕಿತ', 'Connected')}</option>
            <option value="No Answer">{t('ಉತ್ತರವಿಲ್ಲ', 'No Answer')}</option>
            <option value="Busy">{t('ಕಾರ್ಯನಿರತ', 'Busy')}</option>
            <option value="Call Back Later">{t('ನಂತರ ಕರೆ ಮಾಡಿ', 'Call Back Later')}</option>
          </select>
        </div>
      </div>

      {/* Calls Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-6">{t('ಸಂಪರ್ಕ', 'Contact')}</th>
                <th className="py-3.5 px-4">{t('ಕರೆ ಮಾಡಿದವರು', 'Caller')}</th>
                <th className="py-3.5 px-4">{t('ದಿನಾಂಕ & ಸಮಯ', 'Date & Time')}</th>
                <th className="py-3.5 px-4">{t('ಅವಧಿ', 'Duration')}</th>
                <th className="py-3.5 px-4">{t('ಫಲಿತಾಂಶ', 'Outcome')}</th>
                <th className="py-3.5 px-4">{t('ಪ್ರತಿಕ್ರಿಯೆ', 'Response')}</th>
                <th className="py-3.5 px-6">{t('ವಿವರಣೆ / ಟಿಪ್ಪಣಿಗಳು', 'Description / Notes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {loading 
                      ? t('ಕರೆ ದಾಖಲೆಗಳನ್ನು ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ...', 'Retrieving call logs...') 
                      : t('ಇನ್ನೂ ಯಾವುದೇ ಕರೆ ದಾಖಲೆಗಳಿಲ್ಲ.', 'No call logs recorded yet.')}
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Contact */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{call.contact_name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {call.contact_phone} • {formatDistrictName(call.district)}
                      </div>
                    </td>

                    {/* Caller */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {call.caller_name}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{call.date}</div>
                      <div className="text-[11px] text-slate-400">{call.time}</div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                      {call.duration}
                    </td>

                    {/* Outcome */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {formatOutcome(call.outcome)}
                      </span>
                    </td>

                    {/* Response */}
                    <td className="py-3.5 px-4">
                      {renderResponseBadge(call.response)}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-6 text-xs text-slate-600 max-w-xs truncate" title={call.description}>
                      “{call.description}”
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
