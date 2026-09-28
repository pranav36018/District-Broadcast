import React, { useEffect, useState } from 'react';
import { MapPin, Users, PhoneCall, Clock, CheckCircle2, Search, ArrowRight, BarChart2, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import AddDistrictModal from '../components/AddDistrictModal.jsx';

export default function Districts({ selectedDistrictName = 'Bengaluru', onSelectDistrict }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [districts, setDistricts] = useState([]);
  const [selected, setSelected] = useState(selectedDistrictName);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddDistrict, setShowAddDistrict] = useState(false);

  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
        if (selectedDistrictName) {
          setSelected(selectedDistrictName);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDistrictName]);

  const handleDistrictAdded = (newDist) => {
    setDistricts(prev => {
      const exists = prev.some(d => d.id === newDist.id);
      return exists ? prev : [newDist, ...prev];
    });
    setSelected(newDist.name);
    if (onSelectDistrict) onSelectDistrict(newDist.name);
  };

  const handleDeleteDistrict = async (distId, distName) => {
    if (!window.confirm(language === 'en' ? `Are you sure you want to delete district "${distName}"?` : `ನೀವು ಖಚಿತವಾಗಿ "${distName}" ಜಿಲ್ಲೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/districts/${distId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setDistricts(prev => prev.filter(d => d.id !== distId));
      setSelected('Bengaluru');
      if (onSelectDistrict) onSelectDistrict('Bengaluru');
    } catch (err) {
      alert(err.message);
    }
  };

  const current = districts.find(d => d.name.toLowerCase() === selected.toLowerCase()) || districts[0];

  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    formatDistrictName(d.name).toLowerCase().includes(search.toLowerCase())
  );

  if (loading || !current) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ಡೇಟಾಬೇಸ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...', 'Karnataka District Database loading...')}
      </div>
    );
  }

  // Calculate percentages for current district
  const total = current.total_contacts || 1;
  const called = current.called || 0;
  const agree = current.agree || 0;
  const neutral = current.neutral || 0;
  const disagree = current.disagree || 0;

  const agreePct = Math.round((agree / (called || 1)) * 100);
  const neutralPct = Math.round((neutral / (called || 1)) * 100);
  const disagreePct = 100 - agreePct - neutralPct;
  const progressPct = Math.round((called / total) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <span>{t('ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ಕಮಾಂಡ್', 'Karnataka District Command')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'ಜಿಲ್ಲಾವಾರು ಸಂಪರ್ಕ ನಿಯೋಜನೆ, ಕರೆ ಕೋಟಾ ಮತ್ತು ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ ವಿಭಜನೆ',
              'District-wise contact allocation, calling quota and citizen feedback breakdown'
            )}
          </p>
        </div>

        {/* Controls: Search and Add District */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('ಜಿಲ್ಲೆ ಹುಡುಕಿ...', 'Search district...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Add District Button */}
          <button
            type="button"
            onClick={() => setShowAddDistrict(true)}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 whitespace-nowrap cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('ಹೊಸ ಜಿಲ್ಲೆ ಸೇರಿಸಿ', 'Add District')}</span>
          </button>
        </div>
      </div>

      {/* SELECTED DISTRICT SPOTLIGHT BANNER */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
          {t('ಸಕ್ರಿಯ ಜಿಲ್ಲೆ ಆಯ್ಕೆಯಾಗಿದೆ', 'Active District Selected')}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {t('ಜಿಲ್ಲಾ ವಿಶ್ಲೇಷಣೆ', 'District Analytics')}
              </span>
              {current.is_custom === 1 && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  {t('ಕಸ್ಟಮ್ ಜಿಲ್ಲೆ', 'Custom District')}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-0.5 flex items-center gap-3">
              <span>{formatDistrictName(current.name, current.name_kn)}</span>
              {current.is_custom === 1 && current.total_contacts === 0 && (
                <button
                  onClick={() => handleDeleteDistrict(current.id, current.name)}
                  title={t('ಜಿಲ್ಲೆಯನ್ನು ಅಳಿಸಿ', 'Delete District')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('ನಿಯೋಜಿಸಿದ ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ:', 'Assigned District In-Charge:')} <strong className="text-slate-800">{current.incharge_name || t('ನಿಯೋಜಿಸಿಲ್ಲ', 'Unassigned')}</strong>
              {current.incharge_email && <span className="font-mono text-slate-400 ml-2">({current.incharge_email})</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                {t('ಕರೆ ಪ್ರಗತಿ', 'Call Progress')}
              </span>
              <span className="text-xl font-black text-emerald-700">{progressPct}%</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                {t('ಸ್ಥಿತಿ', 'Status')}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                ● {t('ಲೈವ್ ಅಭಿಯಾನ', 'Live Campaign')}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Key Stats Cards for the District */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {t('ಒಟ್ಟು ಸಂಪರ್ಕಗಳು', 'Total Contacts')}
            </span>
            <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
              {current.total_contacts.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              {t('ಪೂರ್ಣಗೊಂಡಿದೆ', 'Completed')}
            </span>
            <span className="text-lg font-black text-blue-800 font-mono mt-1 block">
              {current.called.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              {t('ಬಾಕಿ', 'Pending')}
            </span>
            <span className="text-lg font-black text-amber-800 font-mono mt-1 block">
              {current.pending.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">🟢 {t('ಒಪ್ಪಿಗೆ', 'Agree')}</span>
            <span className="text-lg font-black text-emerald-800 font-mono mt-1 block">
              {current.agree.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">{agreePct}%</span>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">🟡 {t('ತಟಸ್ಥ', 'Neutral')}</span>
            <span className="text-lg font-black text-amber-800 font-mono mt-1 block">
              {current.neutral.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">{neutralPct}%</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">🔴 {t('ಅಸಮ್ಮತಿ', 'Disagree')}</span>
            <span className="text-lg font-black text-rose-800 font-mono mt-1 block">
              {current.disagree.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">{disagreePct}%</span>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold mb-1.5">
            <span>{t('ನಾಗರಿಕ ಅಭಿಪ್ರಾಯ ವಿಭಜನೆ', 'Citizen Feedback Distribution')} ({formatDistrictName(current.name)})</span>
            <span>{agreePct}% {t('ಒಪ್ಪಿಗೆ', 'Agree')} • {neutralPct}% {t('ತಟಸ್ಥ', 'Neutral')} • {disagreePct}% {t('ಅಸಮ್ಮತಿ', 'Disagree')}</span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner bg-slate-200">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${agreePct}%` }} title={`Agree: ${agreePct}%`}></div>
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${neutralPct}%` }} title={`Neutral: ${neutralPct}%`}></div>
            <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${disagreePct}%` }} title={`Disagree: ${disagreePct}%`}></div>
          </div>
        </div>

      </div>

      {/* ALL KARNATAKA DISTRICTS GRID */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>{t('ಎಲ್ಲಾ ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಗಳು', 'All Karnataka Districts')} ({filteredDistricts.length})</span>
          <span className="text-xs text-slate-500 font-normal">
            {t('ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ', 'Click any district to inspect details')}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDistricts.map((d) => {
            const isSel = d.name.toLowerCase() === selected.toLowerCase();
            return (
              <div
                key={d.id}
                onClick={() => {
                  setSelected(d.name);
                  if (onSelectDistrict) onSelectDistrict(d.name);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-emerald-50/70 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{formatDistrictName(d.name)}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSel ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {Math.round((d.called / (d.total_contacts || 1)) * 100)}%
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>{t('ಒಟ್ಟು:', 'Total:')}</span>
                    <span className="font-mono font-medium text-slate-800">{d.total_contacts.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('ಕರೆ ಮಾಡಿದ:', 'Called:')}</span>
                    <span className="font-mono font-medium text-emerald-700">{d.called.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Mini traffic light bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-200 mt-3">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((d.agree / (d.called || 1)) * 100)}%` }}></div>
                  <div className="bg-amber-400 h-full" style={{ width: `${Math.round((d.neutral / (d.called || 1)) * 100)}%` }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: `${Math.round((d.disagree / (d.called || 1)) * 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD DISTRICT MODAL */}
      <AddDistrictModal
        isOpen={showAddDistrict}
        onClose={() => setShowAddDistrict(false)}
        onSuccess={handleDistrictAdded}
      />

    </div>
  );
}
